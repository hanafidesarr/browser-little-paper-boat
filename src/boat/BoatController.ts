import * as pc from 'playcanvas';
import { RiverSystem } from '../river/RiverSystem';
import { GameConfig } from '../core/Config';
import { PaperBoatMesh } from './PaperBoatMesh';
import { VirtualJoystick } from './VirtualJoystick';

export interface BoatInputState {
  keyboardAxis: number;  // -1 to +1 from A/D or Arrow keys
  mouseDragAxis: number; // -1 to +1 from mouse drag
  joystickAxis: number;  // -1 to +1 from touch joystick
}

export class BoatController {
  private app: pc.AppBase;
  private river: RiverSystem;

  // Hierarchical Nodes: Logical navigation parent vs Visual animation child
  private logicalNode: pc.Entity;  // Placed at true river coordinates (s, u)
  private visualRoot: pc.Entity;   // Child node holding buoyancy bobbing, wave rocking, banking

  // Navigation State
  private distance: number = 0;
  private lateralOffset: number = 0;
  private lateralVelocity: number = 0;
  private baseSpeed: number = GameConfig.BOAT.DEFAULT_SPEED;
  private currentForwardSpeed: number = GameConfig.BOAT.DEFAULT_SPEED;

  // Animation Timing
  private animTimer: number = 0;
  private bankBounceCooldown: number = 0;
  private isAtBoundary: boolean = false;

  // Inputs
  private inputState: BoatInputState = { keyboardAxis: 0, mouseDragAxis: 0, joystickAxis: 0 };
  private virtualJoystick: VirtualJoystick | null = null;
  private mouseDragging: boolean = false;
  private mouseStartX: number = 0;

  // Wake & Ripples
  private rippleEntity: pc.Entity;

  // Collision Callback
  public onBankBump: ((side: 'left' | 'right', velocity: number) => void) | null = null;

  constructor(app: pc.AppBase, river: RiverSystem) {
    this.app = app;
    this.river = river;

    // 1. Create origami boat mesh entity hierarchy
    this.logicalNode = PaperBoatMesh.create(this.app.graphicsDevice);
    this.visualRoot = this.logicalNode.findByName('VisualRoot') as pc.Entity;
    this.app.root.addChild(this.logicalNode);

    // 2. Create water wake ripple ring under boat (attached to visual root)
    this.rippleEntity = this.createRippleDisc();
    this.visualRoot.addChild(this.rippleEntity);

    // 3. Initialize Input Systems
    this.bindKeyboardInputs();
    this.bindMouseDragInputs();
    this.initVirtualJoystick();
  }

  private createRippleDisc(): pc.Entity {
    const ring = new pc.Entity('BoatWakeRing');
    ring.addComponent('render', {
      type: 'plane'
    });
    ring.setLocalScale(2.2, 1.0, 3.2);
    ring.setLocalPosition(0, 0.02, 0);

    // Create a circular ripple alpha texture on an offscreen canvas
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const center = size / 2;
    const grad = ctx.createRadialGradient(center, center, size * 0.15, center, center, size * 0.48);
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 0.0)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.55)');
    grad.addColorStop(0.85, 'rgba(255, 255, 255, 0.2)');
    grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(center, center, size * 0.48, 0, Math.PI * 2);
    ctx.fill();

    const texture = new pc.Texture(this.app.graphicsDevice, {
      width: size,
      height: size,
      format: pc.PIXELFORMAT_RGBA8,
      mipmaps: false
    });
    texture.setSource(canvas);

    const ringMat = new pc.StandardMaterial();
    ringMat.diffuse = new pc.Color(1.0, 1.0, 1.0);
    ringMat.opacityMap = texture;
    ringMat.opacityMapChannel = 'a';
    ringMat.opacity = 0.5;
    ringMat.blendType = pc.BLEND_NORMAL;
    ringMat.cull = pc.CULLFACE_NONE;
    ringMat.update();

    if (ring.render?.meshInstances[0]) {
      ring.render.meshInstances[0].material = ringMat;
    }

    return ring;
  }

  private bindKeyboardInputs(): void {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        this.inputState.keyboardAxis = -1;
      } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        this.inputState.keyboardAxis = 1;
      }
    });

    window.addEventListener('keyup', (e) => {
      if (
        (e.code === 'KeyA' || e.code === 'ArrowLeft') && this.inputState.keyboardAxis < 0 ||
        (e.code === 'KeyD' || e.code === 'ArrowRight') && this.inputState.keyboardAxis > 0
      ) {
        this.inputState.keyboardAxis = 0;
      }
    });
  }

  private bindMouseDragInputs(): void {
    const canvas = this.app.graphicsDevice.canvas;

    canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // Left click
        this.mouseDragging = true;
        this.mouseStartX = e.clientX;
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.mouseDragging) return;
      const deltaX = (e.clientX - this.mouseStartX) / (window.innerWidth * 0.25);
      this.inputState.mouseDragAxis = Math.max(-1.0, Math.min(1.0, deltaX * 1.5));
    });

    const stopMouseDrag = () => {
      this.mouseDragging = false;
      this.inputState.mouseDragAxis = 0;
    };

    window.addEventListener('mouseup', stopMouseDrag);
  }

  private initVirtualJoystick(): void {
    this.virtualJoystick = new VirtualJoystick();
    this.virtualJoystick.onAxisChange = (axis: number) => {
      this.inputState.joystickAxis = axis;
    };
  }

  /**
   * Evaluates combined steer axis from all inputs (-1 to +1).
   */
  public getEffectiveSteerAxis(): number {
    let axis = this.inputState.keyboardAxis;
    if (Math.abs(this.inputState.joystickAxis) > 0.05) {
      axis = this.inputState.joystickAxis;
    } else if (Math.abs(this.inputState.mouseDragAxis) > 0.05) {
      axis = this.inputState.mouseDragAxis;
    }
    return Math.max(-1.0, Math.min(1.0, axis));
  }

  public setPosition(distance: number, lateral: number = 0): void {
    this.distance = distance;
    this.lateralOffset = lateral;
    this.lateralVelocity = 0;
    this.updateTransform(0);
  }

  public update(dt: number): void {
    if (dt <= 0) return;
    this.animTimer += dt;

    // 1. Spline sample at current distance
    const frame = this.river.getFrameAtDistance(this.distance);

    // 2. Current assistance & forward speed
    const currentMultiplier = frame.current > 0 ? (frame.current / 5.0) : 1.0;
    this.currentForwardSpeed = this.baseSpeed * currentMultiplier;
    this.distance += this.currentForwardSpeed * dt;

    const totalLength = this.river.getTotalLength();
    if (this.distance > totalLength) {
      this.distance = totalLength;
    }

    // 3. Smooth lateral acceleration & damping
    const steerInput = this.getEffectiveSteerAxis();
    const targetAccel = steerInput * GameConfig.BOAT.STEER_ACCEL;
    this.lateralVelocity += targetAccel * dt;

    // Damping / drag
    this.lateralVelocity -= this.lateralVelocity * GameConfig.BOAT.STEER_DAMPING * dt;
    this.lateralOffset += this.lateralVelocity * dt;

    // 4. Collision-ready river boundaries & soft rebound
    const maxHalfWidth = (frame.width * 0.5) - GameConfig.BOAT.SAFETY_MARGIN;
    this.isAtBoundary = false;

    if (this.bankBounceCooldown > 0) {
      this.bankBounceCooldown -= dt;
    }

    if (this.lateralOffset < -maxHalfWidth) {
      this.lateralOffset = -maxHalfWidth;
      this.isAtBoundary = true;
      if (this.lateralVelocity < 0) {
        const impactVel = Math.abs(this.lateralVelocity);
        this.lateralVelocity = -this.lateralVelocity * GameConfig.BOAT.BOUNCE_DAMPING;
        this.triggerBankBump('left', impactVel);
      }
    } else if (this.lateralOffset > maxHalfWidth) {
      this.lateralOffset = maxHalfWidth;
      this.isAtBoundary = true;
      if (this.lateralVelocity > 0) {
        const impactVel = Math.abs(this.lateralVelocity);
        this.lateralVelocity = -this.lateralVelocity * GameConfig.BOAT.BOUNCE_DAMPING;
        this.triggerBankBump('right', impactVel);
      }
    }

    // 5. Update Logical Node and Visual Child Node
    this.updateTransform(dt);
  }

  private triggerBankBump(side: 'left' | 'right', velocity: number): void {
    if (this.bankBounceCooldown <= 0) {
      this.bankBounceCooldown = 0.28;

      // Soft visual jiggle on visual node
      const jiggleRoll = (side === 'left' ? 6 : -6) * Math.min(1.0, velocity / 3.0);
      this.visualRoot.setLocalEulerAngles(2, 0, jiggleRoll);

      if (this.onBankBump) {
        this.onBankBump(side, velocity);
      }
    }
  }

  private updateTransform(dt: number): void {
    const frame = this.river.getFrameAtDistance(this.distance);

    // ==========================================
    // LOGICAL NAVIGATION NODE (Exact water surface)
    // ==========================================
    const logicalPos = new pc.Vec3(
      frame.position.x + frame.normal.x * this.lateralOffset,
      frame.position.y,
      frame.position.z + frame.normal.z * this.lateralOffset
    );
    this.logicalNode.setPosition(logicalPos);

    // Logical Orientation: Tangent + steering yaw bias
    const forward = frame.tangent.clone();
    if (Math.abs(this.lateralVelocity) > 0.05) {
      const turnBias = (this.lateralVelocity / GameConfig.BOAT.STEER_SPEED) * 0.22;
      forward.add(frame.normal.clone().mulScalar(turnBias)).normalize();
    }

    const rotMat = new pc.Mat4();
    rotMat.setLookAt(pc.Vec3.ZERO, forward, pc.Vec3.UP);
    const quat = new pc.Quat().setFromMat4(rotMat);
    this.logicalNode.setRotation(quat);

    // ==========================================
    // VISUAL ANIMATION CHILD (Separated from physics)
    // ==========================================
    // 1. Water buoyancy vertical oscillation
    const bob = Math.sin(this.animTimer * GameConfig.BOAT.FLOAT_BOB_FREQ) * GameConfig.BOAT.FLOAT_BOB_AMP;
    this.visualRoot.setLocalPosition(0, bob, 0);

    // 2. Dynamic Banking roll into turns + wave rocking (pitch & roll)
    const bankAngle = -(this.lateralVelocity / GameConfig.BOAT.STEER_SPEED) * GameConfig.BOAT.BANK_ANGLE_MAX;
    const waveRoll = Math.sin(this.animTimer * GameConfig.BOAT.FLOAT_ROLL_FREQ) * GameConfig.BOAT.FLOAT_ROLL_AMP;
    const wavePitch = Math.cos(this.animTimer * GameConfig.BOAT.FLOAT_PITCH_FREQ) * GameConfig.BOAT.FLOAT_PITCH_AMP;

    this.visualRoot.setLocalEulerAngles(
      wavePitch,
      0,
      bankAngle + waveRoll
    );

    // 3. Water wake ripple ring pulse
    if (this.rippleEntity) {
      const pulse = 1.0 + Math.sin(this.animTimer * 4.2) * 0.12;
      this.rippleEntity.setLocalScale(1.8 * pulse, 1.0, 2.5 * pulse);
    }
  }

  // ==========================================
  // GETTERS & PUBLIC API
  // ==========================================

  public getEntity(): pc.Entity {
    return this.logicalNode;
  }

  public getVisualRoot(): pc.Entity {
    return this.visualRoot;
  }

  public getDistance(): number {
    return this.distance;
  }

  public getLateralOffset(): number {
    return this.lateralOffset;
  }

  public getLateralVelocity(): number {
    return this.lateralVelocity;
  }

  public getForwardSpeed(): number {
    return this.currentForwardSpeed;
  }

  public getLogicalPosition(): pc.Vec3 {
    return this.logicalNode.getPosition();
  }

  public getPosition(): pc.Vec3 {
    return this.logicalNode.getPosition();
  }

  public isCollidingBoundary(): boolean {
    return this.isAtBoundary;
  }

  public setBaseSpeed(speed: number): void {
    this.baseSpeed = speed;
  }

  public nudgeLateral(amount: number): void {
    this.lateralVelocity += amount;
  }

  public setJoystickVisible(visible: boolean): void {
    this.virtualJoystick?.setVisible(visible);
  }

  public destroy(): void {
    this.virtualJoystick?.destroy();
    this.logicalNode.destroy();
  }
}

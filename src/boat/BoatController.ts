import * as pc from 'playcanvas';
import { RiverSystem } from '../river/RiverSystem';
import { GameConfig } from '../core/Config';
import { PaperBoatMesh } from './PaperBoatMesh';

export interface BoatInputState {
  steerAxis: number; // -1 (left) to +1 (right)
  targetLateralRatio?: number; // Pointer or touch direct positioning [-1, 1]
}

export class BoatController {
  private app: pc.AppBase;
  private river: RiverSystem;
  private boatEntity: pc.Entity;
  private visualRoot: pc.Entity;

  // River position state
  private distance: number = 0;
  private lateralOffset: number = 0;
  private lateralVelocity: number = 0;
  private baseSpeed: number = GameConfig.BOAT.DEFAULT_SPEED;

  // Animation timing
  private animTimer: number = 0;
  private isCollidingBank: boolean = false;
  private bankBounceCooldown: number = 0;

  // Input state
  private inputState: BoatInputState = { steerAxis: 0 };
  private touchDragging: boolean = false;
  private touchStartX: number = 0;
  private touchCurrentX: number = 0;

  // Wake and splash emitter entities
  private rippleEntity: pc.Entity;

  constructor(app: pc.AppBase, river: RiverSystem) {
    this.app = app;
    this.river = river;

    // Create origami boat mesh entity
    this.boatEntity = PaperBoatMesh.create(this.app.graphicsDevice);
    this.visualRoot = this.boatEntity.findByName('VisualRoot') as pc.Entity;
    this.app.root.addChild(this.boatEntity);

    // Create subtle water wake ripple ring under boat
    this.rippleEntity = this.createRippleDisc();
    this.boatEntity.addChild(this.rippleEntity);

    this.bindInputs();
  }

  private createRippleDisc(): pc.Entity {
    const ring = new pc.Entity('BoatWakeRing');
    ring.addComponent('render', {
      type: 'plane'
    });
    ring.setLocalScale(1.8, 1.0, 2.6);
    ring.setLocalPosition(0, 0.02, 0);

    const ringMat = new pc.StandardMaterial();
    ringMat.diffuse = new pc.Color(1.0, 1.0, 1.0);
    ringMat.opacity = 0.35;
    ringMat.blendType = pc.BLEND_ADDITIVE;
    ringMat.cull = pc.CULLFACE_NONE;
    ringMat.update();

    if (ring.render?.meshInstances[0]) {
      ring.render.meshInstances[0].material = ringMat;
    }

    return ring;
  }

  private bindInputs(): void {
    // Keyboard inputs
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        this.inputState.steerAxis = -1;
      } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        this.inputState.steerAxis = 1;
      }
    });

    window.addEventListener('keyup', (e) => {
      if (
        (e.code === 'KeyA' || e.code === 'ArrowLeft') && this.inputState.steerAxis < 0 ||
        (e.code === 'KeyD' || e.code === 'ArrowRight') && this.inputState.steerAxis > 0
      ) {
        this.inputState.steerAxis = 0;
      }
    });

    // Pointer / Touch inputs
    const canvas = this.app.graphicsDevice.canvas;

    const onPointerDown = (clientX: number) => {
      this.touchDragging = true;
      this.touchStartX = clientX;
      this.touchCurrentX = clientX;
    };

    const onPointerMove = (clientX: number) => {
      if (!this.touchDragging) return;
      this.touchCurrentX = clientX;
      const deltaX = (this.touchCurrentX - this.touchStartX) / (window.innerWidth * 0.35);
      this.inputState.steerAxis = Math.max(-1, Math.min(1, deltaX * 1.5));
    };

    const onPointerUp = () => {
      this.touchDragging = false;
      this.inputState.steerAxis = 0;
    };

    canvas.addEventListener('mousedown', (e) => onPointerDown(e.clientX));
    window.addEventListener('mousemove', (e) => onPointerMove(e.clientX));
    window.addEventListener('mouseup', () => onPointerUp());

    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) onPointerDown(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) onPointerMove(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchend', () => onPointerUp());
    window.addEventListener('touchcancel', () => onPointerUp());
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

    // 1. Spline sampling at current distance
    const sample = this.river.sampleAtDistance(this.distance);

    // 2. Forward river current movement
    const currentSpeed = (sample.current > 0 ? sample.current : this.baseSpeed);
    this.distance += currentSpeed * dt;

    // Check end of river
    const totalLength = this.river.getTotalLength();
    if (this.distance > totalLength) {
      this.distance = totalLength;
    }

    // 3. Lateral steering physics
    const targetAccel = this.inputState.steerAxis * GameConfig.BOAT.STEER_ACCEL;
    this.lateralVelocity += targetAccel * dt;
    // Damping / Drag
    this.lateralVelocity -= this.lateralVelocity * GameConfig.BOAT.STEER_DAMPING * dt;
    this.lateralOffset += this.lateralVelocity * dt;

    // 4. River boundary collision and soft bounce
    const maxHalfWidth = (sample.width * 0.5) - GameConfig.BOAT.SAFETY_MARGIN;
    if (this.bankBounceCooldown > 0) {
      this.bankBounceCooldown -= dt;
    }

    if (this.lateralOffset < -maxHalfWidth) {
      this.lateralOffset = -maxHalfWidth;
      if (this.lateralVelocity < 0) {
        this.lateralVelocity = -this.lateralVelocity * GameConfig.BOAT.BOUNCE_DAMPING;
        this.onBankBump();
      }
    } else if (this.lateralOffset > maxHalfWidth) {
      this.lateralOffset = maxHalfWidth;
      if (this.lateralVelocity > 0) {
        this.lateralVelocity = -this.lateralVelocity * GameConfig.BOAT.BOUNCE_DAMPING;
        this.onBankBump();
      }
    }

    // 5. Update Boat Entity in 3D Space
    this.updateTransform(dt);
  }

  private onBankBump(): void {
    if (this.bankBounceCooldown <= 0) {
      this.bankBounceCooldown = 0.3;
      // Visual small jiggle
      this.visualRoot.setLocalEulerAngles(
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6
      );
    }
  }

  private updateTransform(dt: number): void {
    const sample = this.river.sampleAtDistance(this.distance);

    // World position: center + normal * lateralOffset
    const worldPos = new pc.Vec3(
      sample.position.x + sample.normal.x * this.lateralOffset,
      sample.position.y,
      sample.position.z + sample.normal.z * this.lateralOffset
    );

    // Natural water buoyancy bobbing
    const bob = Math.sin(this.animTimer * GameConfig.BOAT.FLOAT_BOB_FREQ) * GameConfig.BOAT.FLOAT_BOB_AMP;
    worldPos.y += bob;
    this.boatEntity.setPosition(worldPos);

    // Orientation along river spline
    // Forward direction: tangent + subtle lateral angle from steering
    const forward = sample.tangent.clone();
    if (Math.abs(this.lateralVelocity) > 0.05) {
      const turnAngle = (this.lateralVelocity / GameConfig.BOAT.STEER_SPEED) * 0.25;
      forward.add(sample.normal.clone().mulScalar(turnAngle)).normalize();
    }

    const rotMat = new pc.Mat4();
    rotMat.setLookAt(pc.Vec3.ZERO, forward, pc.Vec3.UP);
    const quat = new pc.Quat().setFromMat4(rotMat);
    this.boatEntity.setRotation(quat);

    // Visual child node animation: Banking roll into turn + gentle wave rocking
    const bankAngle = -(this.lateralVelocity / GameConfig.BOAT.STEER_SPEED) * GameConfig.BOAT.BANK_ANGLE_MAX;
    const waveRoll = Math.sin(this.animTimer * GameConfig.BOAT.FLOAT_ROLL_FREQ) * GameConfig.BOAT.FLOAT_ROLL_AMP;
    const wavePitch = Math.cos(this.animTimer * GameConfig.BOAT.FLOAT_PITCH_FREQ) * GameConfig.BOAT.FLOAT_PITCH_AMP;

    this.visualRoot.setLocalEulerAngles(
      wavePitch,
      0,
      bankAngle + waveRoll
    );

    // Pulse wake ripple ring
    if (this.rippleEntity) {
      const rippleScale = 1.0 + Math.sin(this.animTimer * 4.0) * 0.12;
      this.rippleEntity.setLocalScale(1.8 * rippleScale, 1.0, 2.5 * rippleScale);
    }
  }

  public getEntity(): pc.Entity {
    return this.boatEntity;
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

  public getPosition(): pc.Vec3 {
    return this.boatEntity.getPosition();
  }

  public setBaseSpeed(speed: number): void {
    this.baseSpeed = speed;
  }

  public nudgeLateral(amount: number): void {
    this.lateralVelocity += amount;
  }
}

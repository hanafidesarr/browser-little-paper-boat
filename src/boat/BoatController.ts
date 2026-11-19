import * as pc from 'playcanvas';
import { RiverSystem } from '../river/RiverSystem';
import { GameConfig } from '../core/Config';
import { PaperBoatMesh } from './PaperBoatMesh';
import { VirtualJoystick } from './VirtualJoystick';

export interface BoatInputState {
  keyboardAxis: number;  // -1 to +1 from A/D or Arrow keys
  mouseDragAxis: number; // -1 to +1 from mouse drag
  joystickAxis: number;  // Legacy touch joystick
  touchpadAxis: number;  // -1 to +1 from smooth screen touchpad drag
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
  private speedModifier: number = 1.0;
  private speedModifierTimer: number = 0;
  private externalSpinTorque: number = 0;
  private externalSpinYaw: number = 0;

  // Paper Integrity & Health State
  public readonly maxIntegrity: number = 3;
  private currentIntegrity: number = 3;
  private invulnerabilityTimer: number = 0;
  private isSunk: boolean = false;
  private isFullSinking: boolean = false;
  private fullSinkProgress: number = 0;
  private crashSinkTimer: number = 0;
  private movementEnabled: boolean = false;

  // Animation Timing
  private animTimer: number = 0;
  private bankBounceCooldown: number = 0;
  private isAtBoundary: boolean = false;

  // Inputs
  private inputState: BoatInputState = { keyboardAxis: 0, mouseDragAxis: 0, joystickAxis: 0, touchpadAxis: 0 };
  private virtualJoystick: VirtualJoystick | null = null;
  private mouseDragging: boolean = false;
  private mouseStartX: number = 0;

  // Wake & Ripples
  private rippleEntity: pc.Entity;

  // Callbacks
  public onBankBump: ((side: 'left' | 'right', velocity: number) => void) | null = null;
  public onIntegrityChange: ((current: number, max: number) => void) | null = null;
  public onBoatSink: (() => void) | null = null;

  constructor(app: pc.AppBase, river: RiverSystem) {
    this.app = app;
    this.river = river;

    // 1. Create origami boat mesh entity hierarchy
    this.logicalNode = PaperBoatMesh.create(this.app.graphicsDevice);
    this.visualRoot = this.logicalNode.findByName('VisualRoot') as pc.Entity;
    this.app.root.addChild(this.logicalNode);

    // 2. Create water wake ripple ring under boat (attached flat to logical node, not tilting child)
    this.rippleEntity = this.createRippleDisc();
    this.logicalNode.addChild(this.rippleEntity);

    // 3. Initialize Input Systems
    this.bindKeyboardInputs();
    this.bindMouseDragInputs();
    this.bindTouchpadInputs();
    this.initVirtualJoystick();
  }

  private touchpadPointerId: number = -1;
  private touchpadStartX: number = 0;

  private bindTouchpadInputs(): void {
    const canvas = this.app.graphicsDevice.canvas;

    canvas.addEventListener('pointerdown', (e: PointerEvent) => {
      // Direct screen touch / touchpad drag
      if (this.touchpadPointerId === -1) {
        this.touchpadPointerId = e.pointerId;
        this.touchpadStartX = e.clientX;
        try {
          canvas.setPointerCapture(e.pointerId);
        } catch (_) {}
      }
    });

    window.addEventListener('pointermove', (e: PointerEvent) => {
      if (e.pointerId !== this.touchpadPointerId) return;
      // Relative responsive touchpad displacement
      const range = Math.max(120, window.innerWidth * 0.20);
      let deltaX = e.clientX - this.touchpadStartX;
      let axis = deltaX / range;

      // Soft anchor drift so player can smoothly steer without running out of screen width
      if (axis > 1.0) {
        this.touchpadStartX = e.clientX - range;
        axis = 1.0;
      } else if (axis < -1.0) {
        this.touchpadStartX = e.clientX + range;
        axis = -1.0;
      }

      this.inputState.touchpadAxis = Math.max(-1.0, Math.min(1.0, axis));
    });

    const endTouchpad = (e: PointerEvent) => {
      if (e.pointerId === this.touchpadPointerId) {
        this.touchpadPointerId = -1;
        this.inputState.touchpadAxis = 0;
        try {
          canvas.releasePointerCapture(e.pointerId);
        } catch (_) {}
      }
    };

    window.addEventListener('pointerup', endTouchpad);
    window.addEventListener('pointercancel', endTouchpad);
  }

  private createRippleDisc(): pc.Entity {
    const ring = new pc.Entity('BoatWakeRing');
    ring.addComponent('render', {
      type: 'plane'
    });
    ring.setLocalScale(2.0, 1.0, 2.8);
    ring.setLocalPosition(0, 0.015, 0);

    // Create a circular ripple alpha texture on an offscreen canvas
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const center = size / 2;
    const grad = ctx.createRadialGradient(center, center, size * 0.15, center, center, size * 0.48);
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 0.0)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.45)');
    grad.addColorStop(0.85, 'rgba(255, 255, 255, 0.15)');
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
    ringMat.opacity = 0.42;
    ringMat.blendType = pc.BLEND_NORMAL;
    ringMat.depthWrite = false; // Prevent Z-fighting and flickering with hull
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
    this.virtualJoystick.setVisible(false); // Initially hidden until gameplay starts
    this.virtualJoystick.onAxisChange = (axis: number) => {
      this.inputState.joystickAxis = axis;
    };
  }

  public setMovementEnabled(enabled: boolean): void {
    this.movementEnabled = enabled;
    if (!enabled) {
      this.lateralVelocity = 0;
      this.inputState.keyboardAxis = 0;
      this.inputState.mouseDragAxis = 0;
      this.inputState.joystickAxis = 0;
    }
  }

  public isMovementEnabled(): boolean {
    return this.movementEnabled;
  }

  /**
   * Evaluates combined steer axis from all inputs (-1 to +1).
   */
  public getEffectiveSteerAxis(): number {
    if (!this.movementEnabled) return 0;
    let axis = this.inputState.keyboardAxis;
    if (Math.abs(this.inputState.touchpadAxis) > 0.02) {
      axis = this.inputState.touchpadAxis;
    } else if (Math.abs(this.inputState.joystickAxis) > 0.05) {
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
    this.externalSpinTorque = 0;
    this.speedModifier = 1.0;
    this.speedModifierTimer = 0;
    this.updateTransform(0);
  }

  public update(dt: number): void {
    if (dt <= 0) return;
    this.animTimer += dt;

    if (this.isSunk) {
      // Boat has completely sunk, waiting for respawn
      return;
    }

    if (this.isFullSinking) {
      // Animate dramatic terminal sinking into river depth
      this.fullSinkProgress += dt * 1.25;
      const progress = Math.min(1.0, this.fullSinkProgress);

      const sinkY = -progress * 1.6;
      const sinkPitch = progress * 32;
      const sinkRoll = progress * 24;
      this.visualRoot.setLocalPosition(0, sinkY, 0);
      this.visualRoot.setLocalEulerAngles(sinkPitch, this.externalSpinYaw, sinkRoll);

      // Decelerating forward drift while going under
      this.distance += this.currentForwardSpeed * 0.25 * dt;
      this.updateLogicalNodePosition();

      if (this.fullSinkProgress >= 1.0) {
        this.isFullSinking = false;
        this.isSunk = true;
        this.visualRoot.enabled = false;
        if (this.onBoatSink) {
          this.onBoatSink();
        }
      }
      return;
    }

    // 0. Timers & Blinking / Invulnerability Flashing
    if (this.crashSinkTimer > 0) {
      this.crashSinkTimer -= dt;
      if (this.crashSinkTimer < 0) this.crashSinkTimer = 0;
    }

    if (this.invulnerabilityTimer > 0) {
      this.invulnerabilityTimer -= dt;
      // Classic arcade blinking / invulnerability flicker (10 Hz)
      const blinkVisible = (Math.floor(this.invulnerabilityTimer * 12) % 2) === 0;
      this.visualRoot.enabled = blinkVisible;
      if (this.rippleEntity) {
        this.rippleEntity.enabled = blinkVisible;
      }

      if (this.invulnerabilityTimer <= 0) {
        this.invulnerabilityTimer = 0;
        this.visualRoot.enabled = true;
        if (this.rippleEntity) {
          this.rippleEntity.enabled = true;
        }
      }
    } else {
      this.visualRoot.enabled = true;
      if (this.rippleEntity) {
        this.rippleEntity.enabled = true;
      }
    }

    if (this.speedModifierTimer > 0) {
      this.speedModifierTimer -= dt;
      if (this.speedModifierTimer <= 0) {
        this.speedModifier = 1.0;
      }
    }

    if (Math.abs(this.externalSpinTorque) > 0.01) {
      this.externalSpinYaw += this.externalSpinTorque * dt * 420;
      this.externalSpinTorque -= this.externalSpinTorque * 2.5 * dt;
    } else if (Math.abs(this.externalSpinYaw) > 0.5) {
      // Smoothly re-align boat toward forward heading when clear of whirlpool
      this.externalSpinYaw = this.externalSpinYaw * Math.exp(-4.0 * dt);
      if (Math.abs(this.externalSpinYaw) <= 0.5) {
        this.externalSpinYaw = 0;
      }
    }

    if (!this.movementEnabled) {
      // Gentle floating bob & rocking while waiting in menu or tutorial
      this.currentForwardSpeed = 0;
      this.lateralVelocity = 0;
      this.updateTransform(dt);
      return;
    }

    // 1. Spline sample at current distance
    const frame = this.river.getFrameAtDistance(this.distance);

    // 2. Current assistance & forward speed (boosted/slowed by speedModifier)
    const currentMultiplier = frame.current > 0 ? (frame.current / 5.0) : 1.0;
    this.currentForwardSpeed = this.baseSpeed * currentMultiplier * this.speedModifier;
    this.distance += this.currentForwardSpeed * dt;

    const totalLength = this.river.getTotalLength();
    if (this.distance > totalLength) {
      this.distance = totalLength;
    }

    // 3. Smooth lateral acceleration & damping
    const steerInput = this.getEffectiveSteerAxis();
    const targetAccel = steerInput * GameConfig.BOAT.STEER_ACCEL;
    this.lateralVelocity += targetAccel * dt;

    // Upstream Island Bifurcation Current (gentle natural water split current near island tip)
    const upcomingIsland = this.river.getUpcomingIsland(this.distance, 7.5);
    if (upcomingIsland) {
      const approachDist = this.distance - (upcomingIsland.getStartDistance() - 7.5);
      const approachT = approachDist / 7.5;
      if (Math.abs(this.lateralOffset) < 1.4) {
        const deflectDir = this.lateralOffset >= 0 ? 1 : -1;
        this.lateralVelocity += deflectDir * (1.8 + approachT * 2.4) * dt;
      }
    }

    // Damping / drag
    this.lateralVelocity -= this.lateralVelocity * GameConfig.BOAT.STEER_DAMPING * dt;
    this.lateralOffset += this.lateralVelocity * dt;

    // 4. Collision-ready river boundaries & island fork channel split
    const maxHalfWidth = (frame.width * 0.5) - GameConfig.BOAT.SAFETY_MARGIN;
    this.isAtBoundary = false;

    if (this.bankBounceCooldown > 0) {
      this.bankBounceCooldown -= dt;
    }

    const currentIsland = this.river.getIslandAt(this.distance);
    const islandHalfW = currentIsland ? currentIsland.getHalfWidthAt(this.distance) : 0;

    if (islandHalfW > 0.35) {
      // Landmass divides the river into 2 distinct channels (Left & Right)!
      const islandMargin = GameConfig.BOAT.SAFETY_MARGIN;

      if (this.lateralOffset < 0) {
        // --- LEFT CHANNEL ---
        const innerBound = -islandHalfW - islandMargin;
        if (this.lateralOffset < -maxHalfWidth) {
          this.lateralOffset = -maxHalfWidth;
          this.isAtBoundary = true;
          if (this.lateralVelocity < 0) {
            const impactVel = Math.abs(this.lateralVelocity);
            this.lateralVelocity = -this.lateralVelocity * GameConfig.BOAT.BOUNCE_DAMPING;
            this.triggerBankBump('left', impactVel);
          }
        } else if (this.lateralOffset > innerBound) {
          // Hit the left bank of the island
          this.lateralOffset = innerBound;
          this.isAtBoundary = true;
          if (this.lateralVelocity > 0) {
            const impactVel = Math.abs(this.lateralVelocity);
            this.lateralVelocity = -this.lateralVelocity * GameConfig.BOAT.BOUNCE_DAMPING;
            this.triggerBankBump('right', impactVel);
          }
        }
      } else {
        // --- RIGHT CHANNEL ---
        const innerBound = islandHalfW + islandMargin;
        if (this.lateralOffset > maxHalfWidth) {
          this.lateralOffset = maxHalfWidth;
          this.isAtBoundary = true;
          if (this.lateralVelocity > 0) {
            const impactVel = Math.abs(this.lateralVelocity);
            this.lateralVelocity = -this.lateralVelocity * GameConfig.BOAT.BOUNCE_DAMPING;
            this.triggerBankBump('right', impactVel);
          }
        } else if (this.lateralOffset < innerBound) {
          // Hit the right bank of the island
          this.lateralOffset = innerBound;
          this.isAtBoundary = true;
          if (this.lateralVelocity < 0) {
            const impactVel = Math.abs(this.lateralVelocity);
            this.lateralVelocity = -this.lateralVelocity * GameConfig.BOAT.BOUNCE_DAMPING;
            this.triggerBankBump('left', impactVel);
          }
        }
      }
    } else {
      // Standard single continuous channel
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

    // Logical Orientation: Tangent + steering yaw bias + external spin torque
    const forward = frame.tangent.clone();
    if (Math.abs(this.lateralVelocity) > 0.05 || Math.abs(this.externalSpinTorque) > 0.05) {
      const turnBias = (this.lateralVelocity / GameConfig.BOAT.STEER_SPEED) * 0.22 + this.externalSpinTorque * 0.3;
      forward.add(frame.normal.clone().mulScalar(turnBias)).normalize();
    }

    const rotMat = new pc.Mat4();
    rotMat.setLookAt(pc.Vec3.ZERO, forward, pc.Vec3.UP);
    const quat = new pc.Quat().setFromMat4(rotMat);
    this.logicalNode.setRotation(quat);

    // ==========================================
    // VISUAL ANIMATION CHILD (Separated from physics)
    // ==========================================
    // 1. Water buoyancy vertical oscillation + Crash Sink & Resurface Dip
    let sinkOffset = 0;
    let crashPitch = 0;
    let crashRoll = 0;

    if (this.crashSinkTimer > 0) {
      const crashDuration = 0.75;
      const crashT = 1.0 - (this.crashSinkTimer / crashDuration); // 0 to 1
      const dipFactor = Math.sin(crashT * Math.PI); // smooth arc (peaks at 0.5)
      sinkOffset = -dipFactor * 0.65; // dips 0.65m into water and smoothly resurfaces
      crashPitch = dipFactor * 22;    // bow tilts down into water
      crashRoll = Math.sin(crashT * Math.PI * 4) * (1.0 - crashT) * 14; // water impact tremor
    }

    const bob = Math.sin(this.animTimer * GameConfig.BOAT.FLOAT_BOB_FREQ) * GameConfig.BOAT.FLOAT_BOB_AMP;
    this.visualRoot.setLocalPosition(0, bob + sinkOffset, 0);

    // 2. Dynamic Banking roll into turns + wave rocking (pitch & roll) + crash dynamics + spin
    const bankAngle = -(this.lateralVelocity / GameConfig.BOAT.STEER_SPEED) * GameConfig.BOAT.BANK_ANGLE_MAX;
    const waveRoll = Math.sin(this.animTimer * GameConfig.BOAT.FLOAT_ROLL_FREQ) * GameConfig.BOAT.FLOAT_ROLL_AMP;
    const wavePitch = Math.cos(this.animTimer * GameConfig.BOAT.FLOAT_PITCH_FREQ) * GameConfig.BOAT.FLOAT_PITCH_AMP;

    this.visualRoot.setLocalEulerAngles(
      wavePitch + crashPitch,
      this.externalSpinYaw,
      bankAngle + waveRoll + crashRoll
    );

    // 3. Water wake ripple ring pulse
    if (this.rippleEntity) {
      const pulse = 1.0 + Math.sin(this.animTimer * 4.2) * 0.12;
      this.rippleEntity.setLocalScale(1.8 * pulse, 1.0, 2.5 * pulse);
    }
  }

  private updateLogicalNodePosition(): void {
    const frame = this.river.getFrameAtDistance(this.distance);
    const logicalPos = new pc.Vec3(
      frame.position.x + frame.normal.x * this.lateralOffset,
      frame.position.y,
      frame.position.z + frame.normal.z * this.lateralOffset
    );
    this.logicalNode.setPosition(logicalPos);
  }

  // ==========================================
  // PAPER BOAT INTEGRITY & DAMAGE SYSTEM
  // ==========================================

  public getIntegrity(): number {
    return this.currentIntegrity;
  }

  public clearInvulnerability(): void {
    this.invulnerabilityTimer = 0;
    this.crashSinkTimer = 0;
    this.visualRoot.enabled = true;
    if (this.rippleEntity) {
      this.rippleEntity.enabled = true;
    }
  }

  public isInvulnerable(): boolean {
    return this.invulnerabilityTimer > 0;
  }

  public takeDamage(amount: number = 1): boolean {
    if (this.invulnerabilityTimer > 0 || this.isSunk || this.isFullSinking) {
      return false; // Safely protected by invulnerability frames
    }

    this.currentIntegrity = Math.max(0, this.currentIntegrity - amount);
    this.invulnerabilityTimer = 2.4; // 2.4s invulnerability cooldown with blinking!
    this.crashSinkTimer = 0.75;      // 0.75s crash sink dip into water & resurface!

    // Momentary deceleration
    this.speedModifier = 0.45;
    this.speedModifierTimer = 0.75;

    // Soft jiggle tremor
    this.visualRoot.setLocalEulerAngles(6, 0, -8);

    if (this.onIntegrityChange) {
      this.onIntegrityChange(this.currentIntegrity, this.maxIntegrity);
    }

    if (this.currentIntegrity <= 0) {
      this.isFullSinking = true;
      this.fullSinkProgress = 0;
    }

    return true;
  }

  public heal(amount: number = 1): void {
    this.currentIntegrity = Math.min(this.maxIntegrity, this.currentIntegrity + amount);
    if (this.onIntegrityChange) {
      this.onIntegrityChange(this.currentIntegrity, this.maxIntegrity);
    }
  }

  private handleBoatSink(): void {
    this.isFullSinking = true;
    this.fullSinkProgress = 0;
  }

  public respawnAt(distance: number, lateral: number = 0): void {
    this.isSunk = false;
    this.isFullSinking = false;
    this.fullSinkProgress = 0;
    this.crashSinkTimer = 0;
    this.currentIntegrity = this.maxIntegrity;
    this.invulnerabilityTimer = 2.4; // Reappears blinking with invulnerability grace period!
    this.visualRoot.enabled = true;
    this.visualRoot.setLocalPosition(0, 0, 0);
    this.visualRoot.setLocalEulerAngles(0, 0, 0);
    if (this.rippleEntity) {
      this.rippleEntity.enabled = true;
    }
    this.setPosition(distance, lateral);

    if (this.onIntegrityChange) {
      this.onIntegrityChange(this.currentIntegrity, this.maxIntegrity);
    }
  }

  /**
   * Complete clean reset for level restart or new level launch.
   * Guarantees the boat is afloat, visible, full health, with zero leftover sinking states.
   */
  public resetBoat(distance: number = 2, lateral: number = 0): void {
    this.isSunk = false;
    this.isFullSinking = false;
    this.fullSinkProgress = 0;
    this.crashSinkTimer = 0;
    this.invulnerabilityTimer = 0;
    this.currentIntegrity = this.maxIntegrity;
    this.externalSpinTorque = 0;
    this.externalSpinYaw = 0;
    this.speedModifier = 1.0;
    this.speedModifierTimer = 0;
    this.lateralVelocity = 0;
    this.visualRoot.enabled = true;
    this.visualRoot.setLocalPosition(0, 0, 0);
    this.visualRoot.setLocalEulerAngles(0, 0, 0);
    if (this.rippleEntity) {
      this.rippleEntity.enabled = true;
    }
    this.setPosition(distance, lateral);

    if (this.onIntegrityChange) {
      this.onIntegrityChange(this.currentIntegrity, this.maxIntegrity);
    }
  }

  // ==========================================
  // EXTERNAL CURRENT & WHIRLPOOL FORCES
  // ==========================================

  public applyExternalSpeedMultiplier(mult: number, duration: number = 0.4): void {
    this.speedModifier = mult;
    this.speedModifierTimer = duration;
  }

  public applySpinTorque(torque: number): void {
    this.externalSpinTorque = torque;
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

  public getForwardVector(): pc.Vec3 {
    const frame = this.river.getFrameAtDistance(this.distance);
    return frame.tangent;
  }

  public getNormalVector(): pc.Vec3 {
    const frame = this.river.getFrameAtDistance(this.distance);
    return frame.normal;
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

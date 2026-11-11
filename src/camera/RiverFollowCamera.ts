import * as pc from 'playcanvas';
import { RiverSystem } from '../river/RiverSystem';
import { BoatController } from '../boat/BoatController';
import { GameConfig } from '../core/Config';

export class RiverFollowCamera {
  private app: pc.AppBase;
  private river: RiverSystem;
  private boat: BoatController;
  private cameraEntity: pc.Entity;

  // Smoothing states
  private currentPos: pc.Vec3 = new pc.Vec3();
  private currentLookTarget: pc.Vec3 = new pc.Vec3();
  private isInitialized: boolean = false;

  constructor(app: pc.AppBase, river: RiverSystem, boat: BoatController) {
    this.app = app;
    this.river = river;
    this.boat = boat;

    this.cameraEntity = new pc.Entity('MainRiverCamera');
    this.cameraEntity.addComponent('camera', {
      clearColor: new pc.Color(0.72, 0.88, 0.95), // Soft pastel sky
      fov: GameConfig.CAMERA.FOV,
      nearClip: 0.1,
      farClip: 450
    });
    this.app.root.addChild(this.cameraEntity);
  }

  public reset(): void {
    this.isInitialized = false;
  }

  public update(dt: number): void {
    if (dt <= 0) return;

    const boatDist = this.boat.getDistance();
    const boatLat = this.boat.getLateralOffset();

    // 1. Calculate camera position behind the boat along river spline
    const camSplineDist = Math.max(0, boatDist - GameConfig.CAMERA.FOLLOW_DISTANCE);
    const camFrame = this.river.getFrameAtDistance(camSplineDist);

    // Camera slightly tracks lateral boat movement (dampened to preserve smooth framing)
    const dampenedLateral = boatLat * 0.40;

    const targetPos = new pc.Vec3(
      camFrame.position.x + camFrame.normal.x * dampenedLateral,
      camFrame.position.y + GameConfig.CAMERA.ELEVATION,
      camFrame.position.z + camFrame.normal.z * dampenedLateral
    );

    // 2. Calculate ideal lookahead target along the river spline
    const lookDist = Math.min(this.river.getTotalLength(), boatDist + GameConfig.CAMERA.LOOKAHEAD);
    const lookFrame = this.river.getFrameAtDistance(lookDist);

    const targetLook = new pc.Vec3(
      lookFrame.position.x + lookFrame.normal.x * (boatLat * 0.20),
      lookFrame.position.y + 0.65,
      lookFrame.position.z + lookFrame.normal.z * (boatLat * 0.20)
    );

    // 3. Smooth dampening / lerp
    if (!this.isInitialized) {
      this.currentPos.copy(targetPos);
      this.currentLookTarget.copy(targetLook);
      this.isInitialized = true;
    } else {
      const posLerpRate = Math.min(1.0, dt * GameConfig.CAMERA.POS_SMOOTHING);
      const lookLerpRate = Math.min(1.0, dt * GameConfig.CAMERA.ROT_SMOOTHING);

      this.currentPos.lerp(this.currentPos, targetPos, posLerpRate);
      this.currentLookTarget.lerp(this.currentLookTarget, targetLook, lookLerpRate);
    }

    this.cameraEntity.setPosition(this.currentPos);
    this.cameraEntity.lookAt(this.currentLookTarget, pc.Vec3.UP);

    // 4. Subtle camera roll banking into turns
    const latVel = this.boat.getLateralVelocity();
    const bankRoll = -(latVel / GameConfig.BOAT.STEER_SPEED) * (GameConfig.BOAT.BANK_ANGLE_MAX * GameConfig.CAMERA.BANK_INFLUENCE);
    const angles = this.cameraEntity.getEulerAngles();
    this.cameraEntity.setEulerAngles(angles.x, angles.y, bankRoll);
  }

  public getEntity(): pc.Entity {
    return this.cameraEntity;
  }
}

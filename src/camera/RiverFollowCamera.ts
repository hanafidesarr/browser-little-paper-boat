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
      farClip: 350
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

    // 1. Calculate ideal camera position behind the boat along river spline
    const camSplineDist = Math.max(0, boatDist - GameConfig.CAMERA.FOLLOW_DISTANCE);
    const camSample = this.river.sampleAtDistance(camSplineDist);

    // Camera slightly tracks lateral boat movement (dampened to prevent motion sickness)
    const dampenedLateral = boatLat * 0.45;

    const targetPos = new pc.Vec3(
      camSample.position.x + camSample.normal.x * dampenedLateral,
      camSample.position.y + GameConfig.CAMERA.ELEVATION,
      camSample.position.z + camSample.normal.z * dampenedLateral
    );

    // 2. Calculate ideal lookahead target along the river spline
    const lookDist = Math.min(this.river.getTotalLength(), boatDist + GameConfig.CAMERA.LOOKAHEAD);
    const lookSample = this.river.sampleAtDistance(lookDist);

    const targetLook = new pc.Vec3(
      lookSample.position.x + lookSample.normal.x * (boatLat * 0.25),
      lookSample.position.y + 0.6,
      lookSample.position.z + lookSample.normal.z * (boatLat * 0.25)
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

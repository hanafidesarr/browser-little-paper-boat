import * as pc from 'playcanvas';
import { RiverSystem } from '../river/RiverSystem';
import { BoatController } from '../boat/BoatController';
import { GameConfig } from '../core/Config';

export interface CameraTelemetry {
  worldPosition: pc.Vec3;
  lookTarget: pc.Vec3;
  forwardVector: pc.Vec3;
  upVector: pc.Vec3;
  pitchDeg: number;
  yawDeg: number;
  distanceToBoat: number;
  heightAboveWater: number;
}

export class RiverFollowCamera {
  private app: pc.AppBase;
  private river: RiverSystem;
  private boat: BoatController;
  private cameraEntity: pc.Entity;

  // Smoothing states
  private currentPos: pc.Vec3 = new pc.Vec3();
  private currentLookTarget: pc.Vec3 = new pc.Vec3();
  private isInitialized: boolean = false;

  // Cached telemetry
  private telemetry: CameraTelemetry = {
    worldPosition: new pc.Vec3(),
    lookTarget: new pc.Vec3(),
    forwardVector: new pc.Vec3(0, 0, 1),
    upVector: new pc.Vec3(0, 1, 0),
    pitchDeg: 0,
    yawDeg: 0,
    distanceToBoat: 0,
    heightAboveWater: 0
  };

  constructor(app: pc.AppBase, river: RiverSystem, boat: BoatController) {
    this.app = app;
    this.river = river;
    this.boat = boat;

    this.cameraEntity = new pc.Entity('MainRiverCamera');
    this.cameraEntity.addComponent('camera', {
      clearColor: new pc.Color(0.68, 0.86, 0.94),
      fov: GameConfig.CAMERA.FOV,
      nearClip: 0.1,
      farClip: 220
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
    const boatPos = this.boat.getLogicalPosition();

    // 1. Calculate camera position behind the boat along river spline
    const camSplineDist = Math.max(0, boatDist - GameConfig.CAMERA.FOLLOW_DISTANCE);
    const camFrame = this.river.getFrameAtDistance(camSplineDist);

    // Camera slightly tracks lateral boat movement (dampened to preserve smooth framing)
    const dampenedLateral = boatLat * 0.35;

    const targetPos = new pc.Vec3(
      camFrame.position.x + camFrame.normal.x * dampenedLateral,
      camFrame.position.y + GameConfig.CAMERA.ELEVATION,
      camFrame.position.z + camFrame.normal.z * dampenedLateral
    );

    // 2. Calculate lookahead target along the river spline
    const lookDist = Math.min(this.river.getTotalLength(), boatDist + GameConfig.CAMERA.LOOKAHEAD);
    const lookFrame = this.river.getFrameAtDistance(lookDist);

    const targetLook = new pc.Vec3(
      lookFrame.position.x + lookFrame.normal.x * (boatLat * 0.20),
      lookFrame.position.y + GameConfig.CAMERA.LOOK_TARGET_Y,
      lookFrame.position.z + lookFrame.normal.z * (boatLat * 0.20)
    );

    // 3. Smooth interpolation
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

    // 4. Set position & look-at target with stable world UP (0, 1, 0)
    this.cameraEntity.setPosition(this.currentPos);
    this.cameraEntity.lookAt(this.currentLookTarget, pc.Vec3.UP);

    // 5. Subtle camera roll banking into turns (applied locally around forward axis)
    const latVel = this.boat.getLateralVelocity();
    const bankRoll = -(latVel / GameConfig.BOAT.STEER_SPEED) * (GameConfig.BOAT.BANK_ANGLE_MAX * GameConfig.CAMERA.BANK_INFLUENCE);
    if (Math.abs(bankRoll) > 0.01) {
      this.cameraEntity.rotateLocal(0, 0, bankRoll);
    }

    // 6. Update Telemetry
    this.updateTelemetry(boatPos);
  }

  private updateTelemetry(boatPos: pc.Vec3): void {
    this.telemetry.worldPosition.copy(this.currentPos);
    this.telemetry.lookTarget.copy(this.currentLookTarget);

    // In PlayCanvas, camera looks along -Z in local space
    const fwd = this.cameraEntity.forward;
    this.telemetry.forwardVector.copy(fwd);
    this.telemetry.upVector.copy(this.cameraEntity.up);

    // Calculate pitch angle: downward angle below horizontal
    const hDist = Math.sqrt(fwd.x * fwd.x + fwd.z * fwd.z);
    this.telemetry.pitchDeg = Math.atan2(-fwd.y, hDist) * (180 / Math.PI);
    this.telemetry.yawDeg = Math.atan2(fwd.x, fwd.z) * (180 / Math.PI);

    this.telemetry.distanceToBoat = this.currentPos.distance(boatPos);
    this.telemetry.heightAboveWater = this.currentPos.y;
  }

  public getTelemetry(): CameraTelemetry {
    return this.telemetry;
  }

  public getEntity(): pc.Entity {
    return this.cameraEntity;
  }
}

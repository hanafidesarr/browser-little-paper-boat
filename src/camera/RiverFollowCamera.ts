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
  orientationMode: 'desktop_landscape' | 'mobile_landscape' | 'mobile_portrait';
}

interface CameraProfile {
  followDistance: number;
  elevation: number;
  lookahead: number;
  lookTargetY: number;
  fov: number;
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

  // Responsive camera profiles
  private readonly PROFILES: Record<'desktopLandscape' | 'mobileLandscape' | 'mobilePortrait', CameraProfile> = {
    desktopLandscape: {
      followDistance: 12.0,
      elevation: 10.0,
      lookahead: 3.8,
      lookTargetY: 0.35,
      fov: 58
    },
    mobileLandscape: {
      followDistance: 9.5, // Closer to boat on mobile widescreen
      elevation: 8.2,
      lookahead: 3.5,
      lookTargetY: 0.35,
      fov: 62
    },
    mobilePortrait: {
      followDistance: 8.2, // Closer and vertically composed
      elevation: 8.8,      // Elevated enough to look down river corridor
      lookahead: 5.2,      // Extended lookahead so upcoming turns are visible down phone screen
      lookTargetY: 0.40,
      fov: 66              // Wider vertical aperture preventing lateral clipping
    }
  };

  // Dynamic active lerped parameters
  private activeFollowDist: number = 12.0;
  private activeElevation: number = 10.0;
  private activeLookahead: number = 3.8;
  private activeLookTargetY: number = 0.35;
  private activeFov: number = 58;
  private activeMode: 'desktop_landscape' | 'mobile_landscape' | 'mobile_portrait' = 'desktop_landscape';

  // Cached telemetry
  private telemetry: CameraTelemetry = {
    worldPosition: new pc.Vec3(),
    lookTarget: new pc.Vec3(),
    forwardVector: new pc.Vec3(0, 0, 1),
    upVector: new pc.Vec3(0, 1, 0),
    pitchDeg: 0,
    yawDeg: 0,
    distanceToBoat: 0,
    heightAboveWater: 0,
    orientationMode: 'desktop_landscape'
  };

  constructor(app: pc.AppBase, river: RiverSystem, boat: BoatController) {
    this.app = app;
    this.river = river;
    this.boat = boat;

    this.cameraEntity = new pc.Entity('MainRiverCamera');
    this.cameraEntity.addComponent('camera', {
      clearColor: new pc.Color(0.68, 0.86, 0.94),
      fov: this.activeFov,
      nearClip: 0.1,
      farClip: 220
    });
    this.app.root.addChild(this.cameraEntity);
  }

  public reset(): void {
    this.isInitialized = false;
  }

  /**
   * Evaluates current responsive camera profile based on viewport aspect ratio and device input.
   */
  private getTargetProfile(): { profile: CameraProfile; mode: 'desktop_landscape' | 'mobile_landscape' | 'mobile_portrait' } {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const isPortrait = h > w;
    const isMobile = ('ontouchstart' in window) || w <= 1024 || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);

    if (isPortrait) {
      return { profile: this.PROFILES.mobilePortrait, mode: 'mobile_portrait' };
    } else if (isMobile) {
      return { profile: this.PROFILES.mobileLandscape, mode: 'mobile_landscape' };
    } else {
      return { profile: this.PROFILES.desktopLandscape, mode: 'desktop_landscape' };
    }
  }

  public update(dt: number): void {
    if (dt <= 0) return;

    // 1. Smoothly interpolate responsive profile settings (no sudden jumps on orientation change)
    const { profile: targetProfile, mode } = this.getTargetProfile();
    this.activeMode = mode;
    const profileLerp = Math.min(1.0, dt * 3.5);

    this.activeFollowDist += (targetProfile.followDistance - this.activeFollowDist) * profileLerp;
    this.activeElevation += (targetProfile.elevation - this.activeElevation) * profileLerp;
    this.activeLookahead += (targetProfile.lookahead - this.activeLookahead) * profileLerp;
    this.activeLookTargetY += (targetProfile.lookTargetY - this.activeLookTargetY) * profileLerp;
    this.activeFov += (targetProfile.fov - this.activeFov) * profileLerp;

    if (this.cameraEntity.camera) {
      this.cameraEntity.camera.fov = this.activeFov;
    }

    const boatDist = this.boat.getDistance();
    const boatLat = this.boat.getLateralOffset();
    const boatPos = this.boat.getLogicalPosition();

    // 2. Calculate camera position behind the boat along river spline
    const camSplineDist = Math.max(0, boatDist - this.activeFollowDist);
    const camFrame = this.river.getFrameAtDistance(camSplineDist);

    // Camera slightly tracks lateral boat movement (dampened to preserve smooth framing)
    const dampenedLateral = boatLat * 0.32;

    const targetPos = new pc.Vec3(
      camFrame.position.x + camFrame.normal.x * dampenedLateral,
      camFrame.position.y + this.activeElevation,
      camFrame.position.z + camFrame.normal.z * dampenedLateral
    );

    // 3. Calculate lookahead target along the river spline
    const lookDist = Math.min(this.river.getTotalLength(), boatDist + this.activeLookahead);
    const lookFrame = this.river.getFrameAtDistance(lookDist);

    const targetLook = new pc.Vec3(
      lookFrame.position.x + lookFrame.normal.x * (boatLat * 0.18),
      lookFrame.position.y + this.activeLookTargetY,
      lookFrame.position.z + lookFrame.normal.z * (boatLat * 0.18)
    );

    // 4. Smooth interpolation
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

    // 5. Set position & look-at target with stable world UP (0, 1, 0)
    this.cameraEntity.setPosition(this.currentPos);
    this.cameraEntity.lookAt(this.currentLookTarget, pc.Vec3.UP);

    // 6. Subtle camera roll banking into turns (applied locally around forward axis)
    const latVel = this.boat.getLateralVelocity();
    const bankRoll = -(latVel / GameConfig.BOAT.STEER_SPEED) * (GameConfig.BOAT.BANK_ANGLE_MAX * GameConfig.CAMERA.BANK_INFLUENCE);
    if (Math.abs(bankRoll) > 0.01) {
      this.cameraEntity.rotateLocal(0, 0, bankRoll);
    }

    // 7. Update Telemetry
    this.updateTelemetry(boatPos);
  }

  private updateTelemetry(boatPos: pc.Vec3): void {
    this.telemetry.worldPosition.copy(this.currentPos);
    this.telemetry.lookTarget.copy(this.currentLookTarget);

    const fwd = this.cameraEntity.forward;
    this.telemetry.forwardVector.copy(fwd);
    this.telemetry.upVector.copy(this.cameraEntity.up);

    const hDist = Math.sqrt(fwd.x * fwd.x + fwd.z * fwd.z);
    this.telemetry.pitchDeg = Math.atan2(-fwd.y, hDist) * (180 / Math.PI);
    this.telemetry.yawDeg = Math.atan2(fwd.x, fwd.z) * (180 / Math.PI);

    this.telemetry.distanceToBoat = this.currentPos.distance(boatPos);
    this.telemetry.heightAboveWater = this.currentPos.y;
    this.telemetry.orientationMode = this.activeMode;
  }

  public getTelemetry(): CameraTelemetry {
    return this.telemetry;
  }

  public getEntity(): pc.Entity {
    return this.cameraEntity;
  }
}

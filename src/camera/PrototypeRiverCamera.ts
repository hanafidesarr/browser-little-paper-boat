import * as pc from 'playcanvas';
import { RiverSystem } from '../river/RiverSystem';

export class PrototypeRiverCamera {
  private app: pc.AppBase;
  private river: RiverSystem;
  private cameraEntity: pc.Entity;

  // Camera settings
  private distanceBehind: number = 9.0;
  private heightElevation: number = 5.2;
  private lookaheadDistance: number = 10.0;
  private smoothPosRate: number = 5.0;
  private smoothLookRate: number = 6.0;

  // Smoothing states
  private currentPos: pc.Vec3 = new pc.Vec3();
  private currentLook: pc.Vec3 = new pc.Vec3();
  private isInitialized: boolean = false;

  constructor(app: pc.AppBase, river: RiverSystem) {
    this.app = app;
    this.river = river;

    this.cameraEntity = new pc.Entity('PrototypeRiverCamera');
    this.cameraEntity.addComponent('camera', {
      clearColor: new pc.Color(0.70, 0.88, 0.95),
      fov: 55,
      nearClip: 0.1,
      farClip: 500
    });
    this.app.root.addChild(this.cameraEntity);
  }

  public reset(): void {
    this.isInitialized = false;
  }

  /**
   * Updates camera following probe distance along the river spline.
   */
  public update(dt: number, probeDistance: number): void {
    if (dt <= 0) return;

    const totalLength = this.river.getTotalLength();
    if (totalLength <= 0) return;

    // 1. Target camera spline sample (behind probe)
    const camDist = Math.max(0, probeDistance - this.distanceBehind);
    const camFrame = this.river.getFrameAtDistance(camDist);

    const targetPos = new pc.Vec3(
      camFrame.position.x,
      camFrame.position.y + this.heightElevation,
      camFrame.position.z
    );

    // 2. Target lookahead point (ahead of probe)
    const lookDist = Math.min(totalLength, probeDistance + this.lookaheadDistance);
    const lookFrame = this.river.getFrameAtDistance(lookDist);

    const targetLook = new pc.Vec3(
      lookFrame.position.x,
      lookFrame.position.y + 0.8,
      lookFrame.position.z
    );

    // 3. Smooth interpolation
    if (!this.isInitialized) {
      this.currentPos.copy(targetPos);
      this.currentLook.copy(targetLook);
      this.isInitialized = true;
    } else {
      const posFactor = Math.min(1.0, dt * this.smoothPosRate);
      const lookFactor = Math.min(1.0, dt * this.smoothLookRate);

      this.currentPos.lerp(this.currentPos, targetPos, posFactor);
      this.currentLook.lerp(this.currentLook, targetLook, lookFactor);
    }

    this.cameraEntity.setPosition(this.currentPos);
    this.cameraEntity.lookAt(this.currentLook, pc.Vec3.UP);
  }

  public getEntity(): pc.Entity {
    return this.cameraEntity;
  }

  public setElevation(h: number): void {
    this.heightElevation = h;
  }

  public setDistanceBehind(d: number): void {
    this.distanceBehind = d;
  }
}

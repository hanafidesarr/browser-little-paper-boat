import * as pc from 'playcanvas';
import { CatmullRomSpline } from '../spline/CatmullRomSpline';
import { SplineControlPoint, RiverFrame } from '../spline/RiverFrame';
import { RiverMeshBuilder, RiverMeshOptions, RiverMeshResult } from './RiverMeshBuilder';

export class RiverSystem {
  private app: pc.AppBase;
  private spline: CatmullRomSpline;
  private riverResult: RiverMeshResult | null = null;
  private rootEntity: pc.Entity;

  constructor(app: pc.AppBase) {
    this.app = app;
    this.spline = new CatmullRomSpline();
    this.rootEntity = new pc.Entity('RiverSystemRoot');
    this.app.root.addChild(this.rootEntity);
  }

  public initFromPoints(points: SplineControlPoint[], options?: RiverMeshOptions): void {
    this.clear();
    this.spline.setPoints(points);
    this.riverResult = RiverMeshBuilder.buildRiver(this.app, this.spline, options);
    this.rootEntity.addChild(this.riverResult.waterEntity);
    this.rootEntity.addChild(this.riverResult.banksEntity);
  }

  public getSpline(): CatmullRomSpline {
    return this.spline;
  }

  public getTotalLength(): number {
    return this.spline.getTotalLength();
  }

  // ==========================================
  // REQUIRED RIVER COORDINATE SYSTEM METHODS
  // ==========================================

  public getPositionAtDistance(distance: number): pc.Vec3 {
    return this.spline.sampleAtDistance(distance).position;
  }

  public getTangentAtDistance(distance: number): pc.Vec3 {
    return this.spline.sampleAtDistance(distance).tangent;
  }

  public getNormalAtDistance(distance: number): pc.Vec3 {
    return this.spline.sampleAtDistance(distance).normal;
  }

  public getWidthAtDistance(distance: number): number {
    return this.spline.sampleAtDistance(distance).width;
  }

  public getFrameAtDistance(distance: number): RiverFrame {
    return this.spline.sampleAtDistance(distance);
  }

  public sampleAtDistance(distance: number): RiverFrame {
    return this.spline.sampleAtDistance(distance);
  }

  public getDistanceAtNormalizedProgress(progress: number): number {
    const clamped = Math.max(0, Math.min(1, progress));
    return clamped * this.spline.getTotalLength();
  }

  /**
   * Evaluates world position from river coordinates (distance s, lateralOffset u, heightOffset h).
   */
  public riverToWorld(distance: number, lateralOffset: number, heightOffset: number = 0): pc.Vec3 {
    const frame = this.getFrameAtDistance(distance);
    return new pc.Vec3(
      frame.position.x + frame.normal.x * lateralOffset + frame.binormal.x * heightOffset,
      frame.position.y + frame.normal.y * lateralOffset + frame.binormal.y * heightOffset,
      frame.position.z + frame.normal.z * lateralOffset + frame.binormal.z * heightOffset
    );
  }

  /**
   * Clamps lateral offset safely inside river boundaries with margin.
   */
  public clampLateral(distance: number, lateralOffset: number, margin: number = 0.8): number {
    const width = this.getWidthAtDistance(distance);
    const maxHalf = Math.max(0.2, (width * 0.5) - margin);
    return Math.max(-maxHalf, Math.min(maxHalf, lateralOffset));
  }

  public getMeshResult(): RiverMeshResult | null {
    return this.riverResult;
  }

  public clear(): void {
    if (this.riverResult) {
      this.riverResult.waterEntity.destroy();
      this.riverResult.banksEntity.destroy();
      this.riverResult = null;
    }
  }

  public getRoot(): pc.Entity {
    return this.rootEntity;
  }
}

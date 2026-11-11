import * as pc from 'playcanvas';
import { CatmullRomSpline, RiverSample, SplinePoint } from '../spline/CatmullRomSpline';
import { RiverMeshBuilder, RiverMeshResult } from './RiverMeshBuilder';

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

  public initFromPoints(
    points: SplinePoint[],
    options?: {
      waterMaterial?: pc.Material;
      bankMaterial?: pc.Material;
      stepSize?: number;
      bankWidth?: number;
      bankHeight?: number;
    }
  ): void {
    // Clean up previous entities if any
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

  public sampleAtDistance(distance: number): RiverSample {
    return this.spline.sampleAtDistance(distance);
  }

  /**
   * Converts river coordinates (distance s, lateralOffset u, heightOffset h) into world position.
   */
  public riverToWorld(distance: number, lateralOffset: number, heightOffset: number = 0): pc.Vec3 {
    const sample = this.spline.sampleAtDistance(distance);
    return new pc.Vec3(
      sample.position.x + sample.normal.x * lateralOffset + sample.up.x * heightOffset,
      sample.position.y + sample.normal.y * lateralOffset + sample.up.y * heightOffset,
      sample.position.z + sample.normal.z * lateralOffset + sample.up.z * heightOffset
    );
  }

  /**
   * Clamps a lateral offset within the navigable river bounds with a safety margin from banks.
   */
  public clampLateral(distance: number, lateralOffset: number, margin: number = 0.8): number {
    const sample = this.spline.sampleAtDistance(distance);
    const maxHalf = Math.max(0.2, (sample.width * 0.5) - margin);
    return Math.max(-maxHalf, Math.min(maxHalf, lateralOffset));
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

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
    this.rootEntity.addChild(this.riverResult.bedEntity);
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

  private waveTimer: number = 0;

  /**
   * Updates physical 3D wave undulation along the river surface (animasi gelombang air).
   * Generates organic sinusoidal river swells while keeping shoreline edges perfectly flush (0 dampening at banks).
   */
  public update(dt: number, flowSpeed: number = 10): void {
    if (!this.riverResult) return;
    const mesh = this.riverResult.waterMesh as any;
    if (!mesh.__origPositions || !mesh.__currPositions) return;

    this.waveTimer += dt * (1.6 + flowSpeed * 0.06);
    const orig = mesh.__origPositions as Float32Array;
    const curr = mesh.__currPositions as Float32Array;
    const samples = mesh.__samples as RiverFrame[];
    const crossSubs = mesh.__crossSubs as number;
    const numRows = samples.length;
    const numCols = crossSubs + 1;

    let vIdx = 0;
    for (let r = 0; r < numRows; r++) {
      const sample = samples[r];
      const dist = sample.distance;

      // Two overlapping wave harmonics propagating along the river
      const wavePhase1 = dist * 0.38 - this.waveTimer * 2.4;
      const wavePhase2 = dist * 0.72 - this.waveTimer * 1.5;
      const waveHarmonic = Math.sin(wavePhase1) * 0.045 + Math.sin(wavePhase2) * 0.022;

      for (let c = 0; c < numCols; c++) {
        const uRatio = c / crossSubs;
        // Shoreline dampening: 0 at edges so water never clips or creates gaps at riverbanks; 1 at stream center
        const shoreDamp = Math.sin(uRatio * Math.PI);
        const displacement = waveHarmonic * shoreDamp;

        const idx = vIdx * 3;
        curr[idx + 1] = orig[idx + 1] + displacement;
        vIdx++;
      }
    }

    mesh.setPositions(curr);
    mesh.update(pc.PRIMITIVE_TRIANGLES, false);
  }

  public getRoot(): pc.Entity {
    return this.rootEntity;
  }
}

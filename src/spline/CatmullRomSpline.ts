import * as pc from 'playcanvas';
import { SplineControlPoint, RiverFrame } from './RiverFrame';

export type SplinePoint = SplineControlPoint;

export class CatmullRomSpline {
  private points: SplineControlPoint[] = [];
  private totalLength: number = 0;
  private distanceLookup: { distance: number; u: number }[] = [];
  private readonly defaultWidth: number;
  private readonly defaultCurrent: number;

  constructor(points: SplineControlPoint[] = [], defaultWidth: number = 8.0, defaultCurrent: number = 5.0) {
    this.defaultWidth = defaultWidth;
    this.defaultCurrent = defaultCurrent;
    if (points.length >= 2) {
      this.setPoints(points);
    }
  }

  public setPoints(points: SplineControlPoint[]): void {
    if (points.length < 2) {
      throw new Error('Spline requires at least 2 control points');
    }

    this.points = points.map(pt => ({
      position: pt.position.clone(),
      width: pt.width ?? this.defaultWidth,
      current: pt.current ?? this.defaultCurrent
    }));

    this.rebuildArcLengthTable();
  }

  public getTotalLength(): number {
    return this.totalLength;
  }

  public getControlPoints(): SplineControlPoint[] {
    return this.points;
  }

  /**
   * Samples the river frame at exact arc-length distance s in meters.
   */
  public sampleAtDistance(distance: number): RiverFrame {
    if (this.totalLength <= 0 || this.distanceLookup.length < 2) {
      return this.createFallbackFrame(distance);
    }

    const clampedDist = Math.max(0, Math.min(this.totalLength, distance));

    // Binary search for segment in distance table
    let low = 0;
    let high = this.distanceLookup.length - 1;
    while (low <= high) {
      const mid = (low + high) >> 1;
      if (this.distanceLookup[mid].distance < clampedDist) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    const idx = Math.max(0, Math.min(this.distanceLookup.length - 2, high));
    const entry0 = this.distanceLookup[idx];
    const entry1 = this.distanceLookup[idx + 1];

    const segmentDist = entry1.distance - entry0.distance;
    const factor = segmentDist > 0.000001 ? (clampedDist - entry0.distance) / segmentDist : 0;

    // Continuous parameter u across all segments (100% C1 continuous, zero jumps)
    const u = entry0.u + factor * (entry1.u - entry0.u);

    const numSegments = this.points.length - 1;
    const pIdx = Math.max(0, Math.min(numSegments - 1, Math.floor(u)));
    const t = Math.max(0, Math.min(1.0, u - pIdx));

    return this.sampleSegment(pIdx, t, clampedDist);
  }

  public sampleAtProgress(progress: number): RiverFrame {
    const clampedProgress = Math.max(0, Math.min(1, progress));
    return this.sampleAtDistance(clampedProgress * this.totalLength);
  }

  private sampleSegment(pIdx: number, t: number, distance: number): RiverFrame {
    const n = this.points.length;
    const p0 = this.points[Math.max(0, pIdx - 1)];
    const p1 = this.points[pIdx];
    const p2 = this.points[Math.min(n - 1, pIdx + 1)];
    const p3 = this.points[Math.min(n - 1, pIdx + 2)];

    // Catmull-Rom Position
    const position = this.evaluateCatmullRomVec3(p0.position, p1.position, p2.position, p3.position, t);

    // Tangent (first derivative)
    const tangent = this.evaluateCatmullRomTangent(p0.position, p1.position, p2.position, p3.position, t);
    tangent.normalize();
    if (tangent.lengthSq() < 0.0001) {
      tangent.set(0, 0, 1);
    }

    // Stable Horizontal Normal: N = Tangent x UP (points to right bank)
    const normal = new pc.Vec3();
    normal.cross(tangent, pc.Vec3.UP).normalize();
    if (normal.lengthSq() < 0.0001) {
      normal.set(1, 0, 0);
    }

    // Binormal (stable perpendicular up vector)
    const binormal = new pc.Vec3();
    binormal.cross(normal, tangent).normalize();

    // Interpolate width and current
    const w0 = p1.width ?? this.defaultWidth;
    const w1 = p2.width ?? this.defaultWidth;
    const width = w0 + (w1 - w0) * t;

    const c0 = p1.current ?? this.defaultCurrent;
    const c1 = p2.current ?? this.defaultCurrent;
    const current = c0 + (c1 - c0) * t;

    // Curvature approximation via delta tangent
    const dt = 0.02;
    const tNext = Math.min(1.0, t + dt);
    const tanNext = this.evaluateCatmullRomTangent(p0.position, p1.position, p2.position, p3.position, tNext).normalize();
    const dot = Math.max(-1, Math.min(1, tangent.dot(tanNext)));
    const curvature = Math.acos(dot) / dt;

    const progress = this.totalLength > 0 ? (distance / this.totalLength) : 0;

    return {
      distance,
      progress,
      position,
      tangent,
      normal,
      binormal,
      width,
      current,
      curvature
    };
  }

  private evaluateCatmullRomVec3(p0: pc.Vec3, p1: pc.Vec3, p2: pc.Vec3, p3: pc.Vec3, t: number): pc.Vec3 {
    const t2 = t * t;
    const t3 = t2 * t;

    const x = 0.5 * (
      (2 * p1.x) +
      (-p0.x + p2.x) * t +
      (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
      (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
    );
    const y = 0.5 * (
      (2 * p1.y) +
      (-p0.y + p2.y) * t +
      (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
      (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
    );
    const z = 0.5 * (
      (2 * p1.z) +
      (-p0.z + p2.z) * t +
      (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 +
      (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3
    );

    return new pc.Vec3(x, y, z);
  }

  private evaluateCatmullRomTangent(p0: pc.Vec3, p1: pc.Vec3, p2: pc.Vec3, p3: pc.Vec3, t: number): pc.Vec3 {
    const t2 = t * t;

    const x = 0.5 * (
      (-p0.x + p2.x) +
      2 * (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t +
      3 * (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t2
    );
    const y = 0.5 * (
      (-p0.y + p2.y) +
      2 * (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t +
      3 * (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t2
    );
    const z = 0.5 * (
      (-p0.z + p2.z) +
      2 * (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t +
      3 * (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t2
    );

    return new pc.Vec3(x, y, z);
  }

  private rebuildArcLengthTable(): void {
    this.distanceLookup = [];
    this.totalLength = 0;

    const numSegments = this.points.length - 1;
    const samplesPerSegment = 25;

    let prevPos = this.points[0].position.clone();
    this.distanceLookup.push({ distance: 0, u: 0 });

    for (let i = 0; i < numSegments; i++) {
      const p0 = this.points[Math.max(0, i - 1)].position;
      const p1 = this.points[i].position;
      const p2 = this.points[Math.min(this.points.length - 1, i + 1)].position;
      const p3 = this.points[Math.min(this.points.length - 1, i + 2)].position;

      for (let s = 1; s <= samplesPerSegment; s++) {
        const t = s / samplesPerSegment;
        const pos = this.evaluateCatmullRomVec3(p0, p1, p2, p3, t);
        const dist = pos.distance(prevPos);
        this.totalLength += dist;
        this.distanceLookup.push({
          distance: this.totalLength,
          u: i + t
        });
        prevPos = pos;
      }
    }
  }

  private createFallbackFrame(distance: number): RiverFrame {
    return {
      distance,
      progress: 0,
      position: new pc.Vec3(0, 0, distance),
      tangent: new pc.Vec3(0, 0, 1),
      normal: new pc.Vec3(1, 0, 0),
      binormal: new pc.Vec3(0, 1, 0),
      width: this.defaultWidth,
      current: this.defaultCurrent,
      curvature: 0
    };
  }
}

import * as pc from 'playcanvas';

export interface SplinePoint {
  position: pc.Vec3;
  width?: number;
  current?: number;
}

export interface RiverSample {
  distance: number;
  position: pc.Vec3;
  tangent: pc.Vec3;
  normal: pc.Vec3; // Horizontal normal pointing to the right bank
  up: pc.Vec3;
  width: number;
  current: number;
  curvature: number;
}

export class CatmullRomSpline {
  private points: SplinePoint[] = [];
  private totalLength: number = 0;
  private distanceLookup: { distance: number; t: number; pointIndex: number }[] = [];
  private readonly defaultWidth: number;
  private readonly defaultCurrent: number;

  constructor(points: SplinePoint[] = [], defaultWidth: number = 8.0, defaultCurrent: number = 5.0) {
    this.defaultWidth = defaultWidth;
    this.defaultCurrent = defaultCurrent;
    if (points.length >= 2) {
      this.setPoints(points);
    }
  }

  public setPoints(points: SplinePoint[]): void {
    if (points.length < 2) {
      throw new Error('Spline must have at least 2 control points');
    }

    // Ensure all points have position clones and default widths/currents
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

  public getControlPoints(): SplinePoint[] {
    return this.points;
  }

  /**
   * Samples river data at exact arc-length distance s (meters from start).
   */
  public sampleAtDistance(distance: number): RiverSample {
    const clampedDist = Math.max(0, Math.min(this.totalLength, distance));
    
    // Binary search in distance lookup table
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
    const factor = segmentDist > 0.0001 ? (clampedDist - entry0.distance) / segmentDist : 0;

    // Interpolate segment pointIndex and t
    let t: number;
    let pIdx: number;

    if (entry0.pointIndex === entry1.pointIndex) {
      pIdx = entry0.pointIndex;
      t = entry0.t + factor * (entry1.t - entry0.t);
    } else {
      if (factor < 0.5) {
        pIdx = entry0.pointIndex;
        t = entry0.t;
      } else {
        pIdx = entry1.pointIndex;
        t = entry1.t;
      }
    }

    return this.sampleSegment(pIdx, t, clampedDist);
  }

  private sampleSegment(pIdx: number, t: number, distance: number): RiverSample {
    const numPoints = this.points.length;
    const p0 = this.points[Math.max(0, pIdx - 1)];
    const p1 = this.points[pIdx];
    const p2 = this.points[Math.min(numPoints - 1, pIdx + 1)];
    const p3 = this.points[Math.min(numPoints - 1, pIdx + 2)];

    // Catmull-Rom Position evaluation
    const position = this.evaluateCatmullRomVec3(p0.position, p1.position, p2.position, p3.position, t);

    // Tangent evaluation (first derivative)
    const tangent = this.evaluateCatmullRomTangent(p0.position, p1.position, p2.position, p3.position, t);
    tangent.normalize();
    if (tangent.lengthSq() < 0.0001) {
      tangent.set(0, 0, 1);
    }

    // Up vector (world up roughly adjusted if needed)
    const up = new pc.Vec3(0, 1, 0);

    // Horizontal normal (right vector relative to forward river flow)
    const normal = new pc.Vec3();
    normal.cross(up, tangent).normalize();
    if (normal.lengthSq() < 0.0001) {
      normal.set(1, 0, 0);
    }

    // Interpolate width and current
    const w0 = p1.width ?? this.defaultWidth;
    const w1 = p2.width ?? this.defaultWidth;
    const width = w0 + (w1 - w0) * t;

    const c0 = p1.current ?? this.defaultCurrent;
    const c1 = p2.current ?? this.defaultCurrent;
    const current = c0 + (c1 - c0) * t;

    // Approximate curvature via delta tangent
    const dt = 0.02;
    const tNext = Math.min(1, t + dt);
    const tanNext = this.evaluateCatmullRomTangent(p0.position, p1.position, p2.position, p3.position, tNext).normalize();
    const angleDelta = Math.acos(Math.max(-1, Math.min(1, tangent.dot(tanNext))));
    const curvature = angleDelta / dt;

    return {
      distance,
      position,
      tangent,
      normal,
      up,
      width,
      current,
      curvature
    };
  }

  private evaluateCatmullRomVec3(p0: pc.Vec3, p1: pc.Vec3, p2: pc.Vec3, p3: pc.Vec3, t: number): pc.Vec3 {
    const t2 = t * t;
    const t3 = t2 * t;

    // Catmull-Rom spline formula (0.5 * [...])
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
    const samplesPerSegment = 20;

    let prevPos = this.points[0].position.clone();
    this.distanceLookup.push({ distance: 0, t: 0, pointIndex: 0 });

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
          t,
          pointIndex: i
        });
        prevPos = pos;
      }
    }
  }
}

import * as pc from 'playcanvas';

export interface SplineControlPoint {
  position: pc.Vec3;
  width?: number;
  current?: number;
}

export interface RiverFrame {
  distance: number;
  progress: number; // Normalized 0.0 to 1.0 along the total spline length
  position: pc.Vec3;
  tangent: pc.Vec3;
  normal: pc.Vec3; // Horizontal normal pointing to the right bank
  binormal: pc.Vec3; // Upward vector perpendicular to tangent & normal
  width: number;
  current: number;
  curvature: number;
}

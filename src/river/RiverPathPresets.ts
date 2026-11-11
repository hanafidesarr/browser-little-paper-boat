import * as pc from 'playcanvas';
import { SplineControlPoint } from '../spline/RiverFrame';

export interface RiverSectionAnnotation {
  name: string;
  startDistance: number;
  endDistance: number;
  description: string;
}

export class RiverPathPresets {
  /**
   * Handcrafted Phase 1 Test River:
   * 1. Straight section
   * 2. Gentle left turn
   * 3. Gentle right turn
   * 4. S-shaped turn
   * 5. Narrow passage (width 4.8m)
   * 6. Wide section (width 12.0m)
   * 7. Combination of left and right turns
   */
  public static getPhase1TestRiver(): SplineControlPoint[] {
    return [
      // 1. Straight section (0m -> ~35m)
      { position: new pc.Vec3(0, 0, 0), width: 8.0, current: 4.5 },
      { position: new pc.Vec3(0, 0, 35), width: 8.0, current: 4.5 },

      // 2. Gentle left turn (~35m -> ~75m)
      { position: new pc.Vec3(-8, 0, 75), width: 8.2, current: 4.6 },

      // 3. Gentle right turn (~75m -> ~120m)
      { position: new pc.Vec3(4, 0, 120), width: 8.0, current: 4.6 },

      // 4. S-shaped turn (~120m -> ~195m)
      { position: new pc.Vec3(14, 0, 155), width: 7.8, current: 4.8 },
      { position: new pc.Vec3(-10, 0, 195), width: 7.5, current: 5.0 },

      // 5. Narrow passage (~195m -> ~240m)
      { position: new pc.Vec3(-4, 0, 235), width: 4.8, current: 5.5 },

      // 6. Wide section (~240m -> ~285m)
      { position: new pc.Vec3(8, 0, 280), width: 12.0, current: 3.8 },

      // 7. Compound left and right turns (~285m -> ~390m)
      { position: new pc.Vec3(-11, 0, 320), width: 8.5, current: 4.6 },
      { position: new pc.Vec3(9, 0, 360), width: 8.2, current: 4.5 },
      { position: new pc.Vec3(0, 0, 395), width: 8.5, current: 4.0 }
    ];
  }
}

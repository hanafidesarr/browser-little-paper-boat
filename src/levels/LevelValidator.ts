import * as pc from 'playcanvas';
import { CatmullRomSpline } from '../spline/CatmullRomSpline';
import { LEVEL_DATA } from './LevelData';

export interface LevelValidationResult {
  levelId: number;
  title: string;
  totalLength: number;
  splinePointsCount: number;
  obstaclesCount: number;
  collectiblesCount: number;
  passed: boolean;
  errors: string[];
}

export class LevelValidator {
  public static validateAllLevels(): LevelValidationResult[] {
    const results: LevelValidationResult[] = [];

    for (let id = 1; id <= 10; id++) {
      const cfg = LEVEL_DATA[id];
      const errors: string[] = [];

      if (!cfg) {
        results.push({
          levelId: id,
          title: 'Unknown',
          totalLength: 0,
          splinePointsCount: 0,
          obstaclesCount: 0,
          collectiblesCount: 0,
          passed: false,
          errors: [`Level ${id} configuration not found!`]
        });
        continue;
      }

      // 1. Build and validate spline
      const spline = new CatmullRomSpline(cfg.splinePoints);
      const totalLength = spline.getTotalLength();

      if (totalLength < 150) {
        errors.push(`Total river length (${totalLength.toFixed(1)}m) is too short (< 150m).`);
      }

      // Check continuity and stability along whole length
      const sampleStep = 1.0;
      for (let s = 0; s <= totalLength; s += sampleStep) {
        const frame = spline.sampleAtDistance(s);
        if (isNaN(frame.position.x) || isNaN(frame.position.y) || isNaN(frame.position.z)) {
          errors.push(`NaN detected in spline position at distance ${s}m`);
          break;
        }
        if (isNaN(frame.tangent.x) || isNaN(frame.tangent.y) || isNaN(frame.tangent.z)) {
          errors.push(`NaN detected in spline tangent at distance ${s}m`);
          break;
        }
        if (isNaN(frame.normal.x) || isNaN(frame.normal.y) || isNaN(frame.normal.z)) {
          errors.push(`NaN detected in spline normal at distance ${s}m`);
          break;
        }
        if (frame.width < 4.0) {
          errors.push(`River width (${frame.width}m) too narrow at distance ${s}m`);
          break;
        }
      }

      // 2. Validate Obstacle placement
      for (let i = 0; i < cfg.obstacles.length; i++) {
        const obs = cfg.obstacles[i];
        if (obs.distance < 10 || obs.distance > totalLength - 15) {
          errors.push(`Obstacle #${i} (${obs.type}) distance ${obs.distance}m outside safe river zone [10, ${totalLength - 15}m]`);
        }
        const frame = spline.sampleAtDistance(obs.distance);
        const maxHalfW = frame.width * 0.5 - 0.2;
        if (Math.abs(obs.lateralOffset) > maxHalfW) {
          errors.push(`Obstacle #${i} (${obs.type}) lateral offset ${obs.lateralOffset}m exceeds river bank half-width (${maxHalfW.toFixed(2)}m) at dist ${obs.distance}m`);
        }
      }

      // 3. Validate Collectibles placement
      if (cfg.collectibles.length < 10) {
        errors.push(`Level has only ${cfg.collectibles.length} collectibles (< 10).`);
      }
      for (let i = 0; i < cfg.collectibles.length; i++) {
        const col = cfg.collectibles[i];
        if (col.distance < 10 || col.distance > totalLength - 10) {
          errors.push(`Collectible #${i} distance ${col.distance}m outside navigable bounds`);
        }
        const frame = spline.sampleAtDistance(col.distance);
        const maxHalfW = frame.width * 0.5 - 0.2;
        if (Math.abs(col.lateralOffset) > maxHalfW) {
          errors.push(`Collectible #${i} lateral offset ${col.lateralOffset}m exceeds river bank half-width (${maxHalfW.toFixed(2)}m)`);
        }
      }

      // 4. Validate Finish Gate
      const finishDist = totalLength - 8;
      const finishFrame = spline.sampleAtDistance(finishDist);
      if (finishFrame.width < 5.0) {
        errors.push(`Finish gate width (${finishFrame.width}m) is too narrow (< 5.0m).`);
      }

      results.push({
        levelId: id,
        title: cfg.title,
        totalLength,
        splinePointsCount: cfg.splinePoints.length,
        obstaclesCount: cfg.obstacles.length,
        collectiblesCount: cfg.collectibles.length,
        passed: errors.length === 0,
        errors
      });
    }

    return results;
  }
}

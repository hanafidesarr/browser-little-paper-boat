import * as pc from 'playcanvas';
import { RiverSystem } from '../river/RiverSystem';
import { BoatController } from '../boat/BoatController';
import { ObstacleData, ObstacleEntity } from './ObstacleEntity';

export class ObstacleManager {
  private app: pc.AppBase;
  private river: RiverSystem;
  private rootEntity: pc.Entity;
  private obstacles: ObstacleEntity[] = [];

  public onObstacleBump: ((type: string) => void) | null = null;

  constructor(app: pc.AppBase, river: RiverSystem) {
    this.app = app;
    this.river = river;
    this.rootEntity = new pc.Entity('ObstaclesRoot');
    this.app.root.addChild(this.rootEntity);
  }

  public spawnObstacles(list: ObstacleData[]): void {
    this.clear();

    for (const d of list) {
      const obs = new ObstacleEntity(this.app.graphicsDevice, d);
      const pos = this.river.riverToWorld(d.distance, d.lateralOffset, 0);
      obs.entity.setPosition(pos);
      this.rootEntity.addChild(obs.entity);
      this.obstacles.push(obs);
    }
  }

  public update(dt: number, boat: BoatController): void {
    const boatDist = boat.getDistance();
    const boatLat = boat.getLateralOffset();

    for (const obs of this.obstacles) {
      obs.update(dt, boatDist, boatLat);

      // Whirlpool gentle lateral drift pull
      if (obs.type === 'whirlpool') {
        const dDist = Math.abs(obs.distance - boatDist);
        if (dDist < 3.5) {
          const dLat = obs.lateralOffset - boatLat;
          boat.nudgeLateral(Math.sign(dLat) * 1.8 * dt);
        }
      }

      // Collision check
      if (obs.canHit()) {
        const dDist = Math.abs(obs.distance - boatDist);
        const dLat = Math.abs(obs.lateralOffset - boatLat);

        if (dDist < obs.radius + 0.6 && dLat < obs.radius + 0.5) {
          obs.registerHit();

          // Soft cozy bump response: boat nudges aside gently
          const bounceDir = boatLat >= obs.lateralOffset ? 1 : -1;
          boat.nudgeLateral(bounceDir * 3.2);

          if (this.onObstacleBump) {
            this.onObstacleBump(obs.type);
          }
        }
      }
    }
  }

  public clear(): void {
    for (const obs of this.obstacles) {
      obs.destroy();
    }
    this.obstacles = [];
  }
}

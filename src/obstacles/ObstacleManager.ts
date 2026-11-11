import * as pc from 'playcanvas';
import { RiverSystem } from '../river/RiverSystem';
import { BoatController } from '../boat/BoatController';
import { EffectManager } from '../particles/EffectManager';
import { AudioManager } from '../audio/AudioManager';
import { ObstacleData, ObstacleEntity } from './ObstacleEntity';

export class ObstacleManager {
  private app: pc.AppBase;
  private river: RiverSystem;
  private effects: EffectManager;
  private audio: AudioManager;
  private rootEntity: pc.Entity;
  private obstacles: ObstacleEntity[] = [];

  public onObstacleBump: ((type: string, isDamage: boolean) => void) | null = null;

  constructor(app: pc.AppBase, river: RiverSystem, effects: EffectManager, audio: AudioManager) {
    this.app = app;
    this.river = river;
    this.effects = effects;
    this.audio = audio;
    this.rootEntity = new pc.Entity('ObstaclesRoot');
    this.app.root.addChild(this.rootEntity);
  }

  public spawnObstacles(list: ObstacleData[]): void {
    this.clear();

    for (const d of list) {
      const obs = new ObstacleEntity(this.app, d);
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
      obs.update(dt, boatDist, boatLat, this.river, this.effects, this.audio);

      const dDist = Math.abs(obs.distance - boatDist);
      const dLat = Math.abs(obs.lateralOffset - boatLat);

      // ==========================================
      // CONTINUOUS FORCES: Whirlpool & Rapids
      // ==========================================
      if (obs.type === 'whirlpool') {
        if (dDist < 3.8 && dLat < 3.2) {
          const latDir = obs.lateralOffset - boatLat;
          boat.nudgeLateral(Math.sign(latDir) * 2.2 * dt);
          boat.applySpinTorque(0.4);
          boat.applyExternalSpeedMultiplier(0.75, 0.2);
        }
      } else if (obs.type === 'waterfall_zone') {
        if (dDist < 3.5 && dLat < 3.0) {
          // Rapids boost speed forward with mist
          boat.applyExternalSpeedMultiplier(1.45, 0.3);
          if (Math.random() < 0.3) {
            const pos = boat.getPosition();
            this.effects.spawnWaterfallSplashes(pos);
          }
        }
      }

      // ==========================================
      // COLLISION INTERACTIONS
      // ==========================================
      if (obs.canHit()) {
        const hitThresholdDist = obs.radius + 0.65;
        const hitThresholdLat = obs.radius + 0.55;

        if (dDist < hitThresholdDist && dLat < hitThresholdLat) {
          obs.registerHit();

          if (obs.isFriendly) {
            // Friendly interaction (Lily pads, Ducks, Frogs, Fish)
            if (obs.type === 'lily_pads') {
              // Gentle dragging friction, zero damage
              boat.applyExternalSpeedMultiplier(0.8, 0.4);
            } else if (obs.type === 'duck') {
              // Gentle nudge aside
              const bounceDir = boatLat >= obs.lateralOffset ? 1 : -1;
              boat.nudgeLateral(bounceDir * 1.5);
            }

            if (this.onObstacleBump) {
              this.onObstacleBump(obs.type, false);
            }
          } else {
            // Hard obstacle (Rock, Driftwood Log)
            // Fair collision: soft bounce, water splash, 1 boat integrity damage
            const bounceDir = boatLat >= obs.lateralOffset ? 1 : -1;
            boat.nudgeLateral(bounceDir * 3.4);

            const hitPos = boat.getPosition();
            this.effects.spawnCollisionSplash(hitPos, 1.2);
            this.audio.playDamageThud();

            const tookDamage = boat.takeDamage(1);

            if (this.onObstacleBump) {
              this.onObstacleBump(obs.type, tookDamage);
            }
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

  public destroy(): void {
    this.clear();
    this.rootEntity.destroy();
  }
}

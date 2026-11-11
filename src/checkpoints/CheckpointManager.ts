import * as pc from 'playcanvas';
import { RiverSystem } from '../river/RiverSystem';
import { BoatController } from '../boat/BoatController';
import { EffectManager } from '../particles/EffectManager';
import { AudioManager } from '../audio/AudioManager';
import { CheckpointEntity } from './CheckpointEntity';

export class CheckpointManager {
  private app: pc.AppBase;
  private river: RiverSystem;
  private boat: BoatController;
  private effects: EffectManager;
  private audio: AudioManager;

  private checkpoints: CheckpointEntity[] = [];
  private lastPassedDistance: number = 2.0;

  public onCheckpointReached: ((distance: number) => void) | null = null;

  constructor(
    app: pc.AppBase,
    river: RiverSystem,
    boat: BoatController,
    effects: EffectManager,
    audio: AudioManager
  ) {
    this.app = app;
    this.river = river;
    this.boat = boat;
    this.effects = effects;
    this.audio = audio;
  }

  public initCheckpoints(distances?: number[]): void {
    this.clear();
    this.lastPassedDistance = 2.0;

    const totalLength = this.river.getTotalLength();
    let targets: number[] = [];

    if (distances && distances.length > 0) {
      targets = distances;
    } else if (totalLength > 80) {
      // Place default checkpoints at roughly 35% and 70% along river
      targets = [totalLength * 0.35, totalLength * 0.70];
    }

    for (const dist of targets) {
      if (dist > 10 && dist < totalLength - 20) {
        const cp = new CheckpointEntity(this.app, this.river, dist);
        this.checkpoints.push(cp);
      }
    }
  }

  public update(dt: number): void {
    const boatDist = this.boat.getDistance();

    for (const cp of this.checkpoints) {
      cp.update(dt);

      if (!cp.isPassed && boatDist >= cp.distance) {
        cp.activate();
        this.lastPassedDistance = cp.distance;

        // Visual & Audio Feedback
        const frame = this.river.getFrameAtDistance(cp.distance);
        this.effects.spawnSparkles(frame.position, new pc.Color(1.0, 0.9, 0.4), 16);
        this.effects.spawnSplash(frame.position, 2.5);
        this.audio.playCheckpointSound();

        if (this.onCheckpointReached) {
          this.onCheckpointReached(cp.distance);
        }
      }
    }
  }

  public getLastPassedDistance(): number {
    return this.lastPassedDistance;
  }

  public respawnBoatAtLastCheckpoint(): void {
    const targetDist = this.lastPassedDistance;
    const frame = this.river.getFrameAtDistance(targetDist);

    this.effects.spawnSplash(frame.position, 2.8);
    this.effects.spawnSparkles(frame.position, new pc.Color(0.4, 0.9, 1.0), 12);
    this.boat.respawnAt(targetDist, 0);
  }

  public clear(): void {
    for (const cp of this.checkpoints) {
      cp.destroy();
    }
    this.checkpoints = [];
    this.lastPassedDistance = 2.0;
  }
}

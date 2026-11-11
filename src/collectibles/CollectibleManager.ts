import * as pc from 'playcanvas';
import { RiverSystem } from '../river/RiverSystem';
import { BoatController } from '../boat/BoatController';
import { EffectManager } from '../particles/EffectManager';
import { AudioManager } from '../audio/AudioManager';
import { CollectibleEntity, CollectibleType } from './CollectibleEntity';

export interface CollectibleSpawn {
  distance: number;
  lateralOffset: number;
  type?: CollectibleType;
}

export class CollectibleManager {
  private app: pc.AppBase;
  private river: RiverSystem;
  private effects: EffectManager;
  private audio: AudioManager;
  private rootEntity: pc.Entity;
  private items: CollectibleEntity[] = [];

  private collectedCount: number = 0;
  private totalCount: number = 0;

  public onCollectCallback: ((collected: number, total: number) => void) | null = null;

  constructor(
    app: pc.AppBase,
    river: RiverSystem,
    effects: EffectManager,
    audio: AudioManager
  ) {
    this.app = app;
    this.river = river;
    this.effects = effects;
    this.audio = audio;
    this.rootEntity = new pc.Entity('CollectiblesRoot');
    this.app.root.addChild(this.rootEntity);
  }

  public spawnItems(spawns: CollectibleSpawn[]): void {
    this.clear();
    this.collectedCount = 0;
    this.totalCount = spawns.length;

    for (const s of spawns) {
      const item = new CollectibleEntity(
        this.app.graphicsDevice,
        s.distance,
        s.lateralOffset,
        s.type ?? 'golden_leaf'
      );

      const pos = this.river.riverToWorld(s.distance, s.lateralOffset, 0.38);
      item.setInitialPosition(pos);
      this.rootEntity.addChild(item.entity);
      this.items.push(item);
    }
  }

  public update(dt: number, boat: BoatController): void {
    const boatPos = boat.getPosition();
    const boatDist = boat.getDistance();
    const boatLat = boat.getLateralOffset();
    const pickupRadius = 1.35;

    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      if (item.collected) {
        item.update(dt, boatPos);
        continue;
      }

      item.update(dt, boatPos);

      // Distance check along river coordinates
      const distDelta = Math.abs(item.distance - boatDist);
      const latDelta = Math.abs(item.lateralOffset - boatLat);

      if (distDelta < pickupRadius && latDelta < pickupRadius) {
        // Collect!
        item.triggerCollect();
        this.collectedCount++;

        // Effects & Chime
        const itemPos = item.entity.getPosition();
        this.effects.spawnSparkles(itemPos, item.getColor(), 10);
        this.effects.spawnSplash(itemPos, 1.2);
        this.audio.playCollectSound();

        if (this.onCollectCallback) {
          this.onCollectCallback(this.collectedCount, this.totalCount);
        }
      }
    }
  }

  public getCollectedCount(): number {
    return this.collectedCount;
  }

  public getTotalCount(): number {
    return this.totalCount;
  }

  public clear(): void {
    for (const item of this.items) {
      item.destroy();
    }
    this.items = [];
    this.collectedCount = 0;
    this.totalCount = 0;
  }

  public destroy(): void {
    this.clear();
    this.rootEntity.destroy();
  }
}

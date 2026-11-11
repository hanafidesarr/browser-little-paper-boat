import * as pc from 'playcanvas';
import { RiverSystem } from '../river/RiverSystem';
import { CollectibleEntity, CollectibleType } from './CollectibleEntity';

export interface CollectibleSpawn {
  distance: number;
  lateralOffset: number;
  type?: CollectibleType;
}

export class CollectibleManager {
  private app: pc.AppBase;
  private river: RiverSystem;
  private rootEntity: pc.Entity;
  private items: CollectibleEntity[] = [];
  private collectedCount: number = 0;
  private totalCount: number = 0;
  public onCollectCallback: ((collected: number, total: number) => void) | null = null;

  constructor(app: pc.AppBase, river: RiverSystem) {
    this.app = app;
    this.river = river;
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

      const pos = this.river.riverToWorld(s.distance, s.lateralOffset, 0.35);
      item.entity.setPosition(pos);
      this.rootEntity.addChild(item.entity);
      this.items.push(item);
    }
  }

  public update(dt: number, boatDistance: number, boatLateral: number): void {
    const pickupRadius = 1.3;

    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      if (item.collected) continue;

      item.update(dt);

      // Distance check along river
      const distDelta = Math.abs(item.distance - boatDistance);
      if (distDelta < pickupRadius) {
        const latDelta = Math.abs(item.lateralOffset - boatLateral);
        if (latDelta < pickupRadius) {
          // Collect!
          item.triggerCollect();
          this.collectedCount++;
          if (this.onCollectCallback) {
            this.onCollectCallback(this.collectedCount, this.totalCount);
          }
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
}

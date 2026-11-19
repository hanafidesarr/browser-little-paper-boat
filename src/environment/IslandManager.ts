import * as pc from 'playcanvas';
import { RiverSystem } from '../river/RiverSystem';
import { IslandConfig, IslandEntity } from './IslandEntity';

export class IslandManager {
  private app: pc.AppBase;
  private river: RiverSystem;
  private rootEntity: pc.Entity;
  private islands: IslandEntity[] = [];

  constructor(app: pc.AppBase, river: RiverSystem) {
    this.app = app;
    this.river = river;
    this.rootEntity = new pc.Entity('IslandsRoot');
    this.app.root.addChild(this.rootEntity);
  }

  public populate(configs: IslandConfig[] = [], bankTint?: pc.Color): void {
    this.clear();

    for (const cfg of configs) {
      const island = new IslandEntity(cfg);
      island.build(this.app, this.river, bankTint);
      this.rootEntity.addChild(island.rootEntity);
      this.islands.push(island);
    }
  }

  public getIslands(): IslandEntity[] {
    return this.islands;
  }

  /**
   * Finds the island that covers the given distance along the river spline.
   */
  public getIslandAt(distance: number): IslandEntity | null {
    for (const isl of this.islands) {
      if (distance >= isl.getStartDistance() && distance <= isl.getEndDistance()) {
        return isl;
      }
    }
    return null;
  }

  /**
   * Checks if a point is within the upstream approach zone of any island.
   */
  public getUpcomingIsland(distance: number, lookahead: number = 8.0): IslandEntity | null {
    for (const isl of this.islands) {
      const start = isl.getStartDistance();
      if (distance < start && distance >= start - lookahead) {
        return isl;
      }
    }
    return null;
  }

  public clear(): void {
    for (const isl of this.islands) {
      isl.destroy();
    }
    this.islands = [];
  }

  public destroy(): void {
    this.clear();
    this.rootEntity.destroy();
  }
}

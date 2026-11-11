import * as pc from 'playcanvas';
import { RiverSystem } from '../river/RiverSystem';
import { NatureMeshes } from './NatureMeshes';

export interface EnvironmentOptions {
  seed?: number;
  treeDensity?: number;
  rockDensity?: number;
  lilyPadDensity?: number;
  isAutumn?: boolean;
  bridgeDistances?: number[];
}

export class EnvironmentManager {
  private app: pc.AppBase;
  private river: RiverSystem;
  private rootEntity: pc.Entity;
  private animatedPads: pc.Entity[] = [];

  constructor(app: pc.AppBase, river: RiverSystem) {
    this.app = app;
    this.river = river;
    this.rootEntity = new pc.Entity('EnvironmentRoot');
    this.app.root.addChild(this.rootEntity);
  }

  public populate(options: EnvironmentOptions = {}): void {
    this.clear();

    const totalLength = this.river.getTotalLength();
    let seed = options.seed ?? 12345;
    const rng = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    const treeDensity = options.treeDensity ?? 1.0;
    const rockDensity = options.rockDensity ?? 0.8;
    const lilyPadDensity = options.lilyPadDensity ?? 0.5;

    // 1. POPULATE TREES ALONG BANKS
    const treeSpacing = 7.0 / treeDensity;
    for (let s = 10; s < totalLength - 15; s += treeSpacing + rng() * 3.0) {
      const sample = this.river.sampleAtDistance(s);
      const halfW = sample.width * 0.5;

      // Left Bank Tree
      if (rng() > 0.25) {
        const leftDist = -halfW - 2.5 - rng() * 4.0;
        const treePos = new pc.Vec3(
          sample.position.x + sample.normal.x * leftDist,
          sample.position.y + 0.3 + rng() * 0.3,
          sample.position.z + sample.normal.z * leftDist
        );
        const tree = rng() > 0.4 
          ? NatureMeshes.createDeciduousTree(options.isAutumn) 
          : NatureMeshes.createPineTree();
        tree.setPosition(treePos);
        const sVal = 0.85 + rng() * 0.35;
        tree.setLocalScale(sVal, sVal, sVal);
        tree.setEulerAngles(0, rng() * 360, 0);
        this.rootEntity.addChild(tree);
      }

      // Right Bank Tree
      if (rng() > 0.25) {
        const rightDist = halfW + 2.5 + rng() * 4.0;
        const treePos = new pc.Vec3(
          sample.position.x + sample.normal.x * rightDist,
          sample.position.y + 0.3 + rng() * 0.3,
          sample.position.z + sample.normal.z * rightDist
        );
        const tree = rng() > 0.4 
          ? NatureMeshes.createDeciduousTree(options.isAutumn) 
          : NatureMeshes.createPineTree();
        tree.setPosition(treePos);
        const sVal = 0.85 + rng() * 0.35;
        tree.setLocalScale(sVal, sVal, sVal);
        tree.setEulerAngles(0, rng() * 360, 0);
        this.rootEntity.addChild(tree);
      }
    }

    // 2. POPULATE SHORELINE ROCKS
    const rockSpacing = 9.0 / rockDensity;
    for (let s = 8; s < totalLength - 10; s += rockSpacing + rng() * 4.0) {
      const sample = this.river.sampleAtDistance(s);
      const halfW = sample.width * 0.5;
      const side = rng() > 0.5 ? 1 : -1;
      const rockDist = side * (halfW + 0.6 + rng() * 1.8);

      const rock = NatureMeshes.createRiverRock(0.8 + rng() * 0.5);
      rock.setPosition(
        sample.position.x + sample.normal.x * rockDist,
        sample.position.y + 0.15,
        sample.position.z + sample.normal.z * rockDist
      );
      rock.setEulerAngles(rng() * 15, rng() * 360, rng() * 15);
      this.rootEntity.addChild(rock);
    }

    // 3. POPULATE LILY PADS IN SHALLOW EDGES
    const padSpacing = 14.0 / lilyPadDensity;
    for (let s = 12; s < totalLength - 20; s += padSpacing + rng() * 8.0) {
      const sample = this.river.sampleAtDistance(s);
      const halfW = sample.width * 0.5;
      const side = rng() > 0.5 ? 1 : -1;
      const padDist = side * (halfW - 0.9 - rng() * 0.8);

      const pad = NatureMeshes.createLilyPad();
      pad.setPosition(
        sample.position.x + sample.normal.x * padDist,
        sample.position.y + 0.02,
        sample.position.z + sample.normal.z * padDist
      );
      pad.setEulerAngles(0, rng() * 360, 0);
      this.rootEntity.addChild(pad);
      this.animatedPads.push(pad);
    }

    // 4. BRIDGES
    if (options.bridgeDistances) {
      options.bridgeDistances.forEach(bDist => {
        if (bDist > 0 && bDist < totalLength) {
          const sample = this.river.sampleAtDistance(bDist);
          const bridge = NatureMeshes.createWoodenBridge(sample.width);
          bridge.setPosition(sample.position.x, sample.position.y, sample.position.z);

          // Rotate bridge perpendicular to river flow
          const rotMat = new pc.Mat4();
          rotMat.setLookAt(pc.Vec3.ZERO, sample.tangent, pc.Vec3.UP);
          bridge.setRotation(new pc.Quat().setFromMat4(rotMat));
          this.rootEntity.addChild(bridge);
        }
      });
    }

    // 5. DISTANT MOUNTAINS / HORIZON SILHOUETTES
    this.createDistantHills(totalLength);
  }

  private createDistantHills(totalLength: number): void {
    const hillMat = new pc.StandardMaterial();
    hillMat.diffuse = new pc.Color(0.40, 0.62, 0.55);
    hillMat.ambient = new pc.Color(0.35, 0.55, 0.50);
    hillMat.update();

    // Place rolling green hill domes on sides of river
    for (let i = 0; i < 6; i++) {
      const dist = (i / 5) * totalLength;
      const sample = this.river.sampleAtDistance(dist);

      [-1, 1].forEach(side => {
        const hill = new pc.Entity('DistantHill');
        hill.addComponent('render', { type: 'sphere' });
        hill.setLocalScale(50, 24, 50);
        hill.setPosition(
          sample.position.x + sample.normal.x * (side * 45),
          sample.position.y - 8,
          sample.position.z + sample.normal.z * (side * 45)
        );
        if (hill.render?.meshInstances[0]) {
          hill.render.meshInstances[0].material = hillMat;
        }
        this.rootEntity.addChild(hill);
      });
    }
  }

  public update(dt: number): void {
    // Subtle animated bobbing for water lilies
    const time = Date.now() * 0.002;
    for (let i = 0; i < this.animatedPads.length; i++) {
      const pad = this.animatedPads[i];
      const pos = pad.getPosition();
      pad.setPosition(pos.x, 0.02 + Math.sin(time + i * 1.5) * 0.02, pos.z);
    }
  }

  public clear(): void {
    const children = [...this.rootEntity.children];
    children.forEach(c => c.destroy());
    this.animatedPads = [];
  }
}

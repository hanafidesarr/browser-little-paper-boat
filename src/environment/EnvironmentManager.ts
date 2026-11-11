import * as pc from 'playcanvas';
import { RiverSystem } from '../river/RiverSystem';
import { NatureMeshes } from './NatureMeshes';

export interface EnvironmentOptions {
  seed?: number;
  treeDensity?: number;
  rockDensity?: number;
  lilyPadDensity?: number;
  flowerDensity?: number;
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
    let seed = options.seed ?? 101;
    const rng = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    const treeDensity = options.treeDensity ?? 1.2;
    const rockDensity = options.rockDensity ?? 0.9;
    const lilyPadDensity = options.lilyPadDensity ?? 0.6;
    const flowerDensity = options.flowerDensity ?? 1.0;

    // 1. POPULATE STYLIZED TREES ALONG BOTH BANKS
    const treeSpacing = 6.0 / treeDensity;
    for (let s = 10; s < totalLength - 15; s += treeSpacing + rng() * 3.5) {
      const frame = this.river.getFrameAtDistance(s);
      const halfW = frame.width * 0.5;

      // Left Bank Tree
      if (rng() > 0.2) {
        const leftDist = -halfW - 2.8 - rng() * 4.5;
        const treePos = new pc.Vec3(
          frame.position.x + frame.normal.x * leftDist,
          frame.position.y + 0.35 + rng() * 0.4,
          frame.position.z + frame.normal.z * leftDist
        );
        const tree = rng() > 0.45 
          ? NatureMeshes.createDeciduousTree(options.isAutumn) 
          : NatureMeshes.createPineTree();
        tree.setPosition(treePos);
        const sVal = 0.85 + rng() * 0.4;
        tree.setLocalScale(sVal, sVal, sVal);
        tree.setEulerAngles(0, rng() * 360, 0);
        this.rootEntity.addChild(tree);
      }

      // Right Bank Tree
      if (rng() > 0.2) {
        const rightDist = halfW + 2.8 + rng() * 4.5;
        const treePos = new pc.Vec3(
          frame.position.x + frame.normal.x * rightDist,
          frame.position.y + 0.35 + rng() * 0.4,
          frame.position.z + frame.normal.z * rightDist
        );
        const tree = rng() > 0.45 
          ? NatureMeshes.createDeciduousTree(options.isAutumn) 
          : NatureMeshes.createPineTree();
        tree.setPosition(treePos);
        const sVal = 0.85 + rng() * 0.4;
        tree.setLocalScale(sVal, sVal, sVal);
        tree.setEulerAngles(0, rng() * 360, 0);
        this.rootEntity.addChild(tree);
      }
    }

    // 2. POPULATE FLOWER CLUSTERS & GRASS TUFTS ON RIVERBANKS
    const flowerSpacing = 5.0 / flowerDensity;
    for (let s = 8; s < totalLength - 10; s += flowerSpacing + rng() * 3.0) {
      const frame = this.river.getFrameAtDistance(s);
      const halfW = frame.width * 0.5;

      [-1, 1].forEach(side => {
        if (rng() > 0.35) {
          const lat = side * (halfW + 0.8 + rng() * 2.2);
          const pos = new pc.Vec3(
            frame.position.x + frame.normal.x * lat,
            frame.position.y + 0.15,
            frame.position.z + frame.normal.z * lat
          );

          if (rng() > 0.5) {
            const flower = NatureMeshes.createFlowerCluster(rng() > 0.5);
            flower.setPosition(pos);
            flower.setEulerAngles(0, rng() * 360, 0);
            this.rootEntity.addChild(flower);
          } else {
            const grass = NatureMeshes.createGrassTuft();
            grass.setPosition(pos);
            grass.setEulerAngles(0, rng() * 360, 0);
            this.rootEntity.addChild(grass);
          }
        }
      });
    }

    // 3. POPULATE MOSSY SHORELINE ROCKS
    const rockSpacing = 8.0 / rockDensity;
    for (let s = 8; s < totalLength - 12; s += rockSpacing + rng() * 4.0) {
      const frame = this.river.getFrameAtDistance(s);
      const halfW = frame.width * 0.5;
      const side = rng() > 0.5 ? 1 : -1;
      const rockDist = side * (halfW + 0.6 + rng() * 1.6);

      const rock = NatureMeshes.createRiverRock(0.75 + rng() * 0.55);
      rock.setPosition(
        frame.position.x + frame.normal.x * rockDist,
        frame.position.y + 0.1,
        frame.position.z + frame.normal.z * rockDist
      );
      rock.setEulerAngles(rng() * 12, rng() * 360, rng() * 12);
      this.rootEntity.addChild(rock);
    }

    // 4. POPULATE FLOATING LILY PADS IN SHALLOW EDGES
    const padSpacing = 12.0 / lilyPadDensity;
    for (let s = 12; s < totalLength - 20; s += padSpacing + rng() * 8.0) {
      const frame = this.river.getFrameAtDistance(s);
      const halfW = frame.width * 0.5;
      const side = rng() > 0.5 ? 1 : -1;
      const padDist = side * (halfW - 0.9 - rng() * 0.7);

      const pad = NatureMeshes.createLilyPad();
      pad.setPosition(
        frame.position.x + frame.normal.x * padDist,
        frame.position.y + 0.02,
        frame.position.z + frame.normal.z * padDist
      );
      pad.setEulerAngles(0, rng() * 360, 0);
      this.rootEntity.addChild(pad);
      this.animatedPads.push(pad);
    }

    // 5. WOODEN BRIDGES SPANNING THE RIVER
    const bridges = options.bridgeDistances ?? [100, 260];
    bridges.forEach(bDist => {
      if (bDist > 10 && bDist < totalLength - 15) {
        const frame = this.river.getFrameAtDistance(bDist);
        const bridge = NatureMeshes.createWoodenBridge(frame.width);
        bridge.setPosition(frame.position.x, frame.position.y, frame.position.z);

        const rotMat = new pc.Mat4();
        rotMat.setLookAt(pc.Vec3.ZERO, frame.tangent, pc.Vec3.UP);
        bridge.setRotation(new pc.Quat().setFromMat4(rotMat));
        this.rootEntity.addChild(bridge);
      }
    });

    // 6. DISTANT ROLLING GREEN HILLS / MOUNTAIN BACKDROPS
    this.createDistantHills(totalLength);
  }

  private createDistantHills(totalLength: number): void {
    const hillMat = new pc.StandardMaterial();
    hillMat.diffuse = new pc.Color(0.38, 0.62, 0.52);
    hillMat.ambient = new pc.Color(0.28, 0.48, 0.40);
    hillMat.update();

    const count = 7;
    for (let i = 0; i < count; i++) {
      const dist = (i / (count - 1)) * totalLength;
      const frame = this.river.getFrameAtDistance(dist);

      [-1, 1].forEach(side => {
        const hill = new pc.Entity('DistantHill');
        hill.addComponent('render', { type: 'sphere' });
        hill.setLocalScale(55, 22, 55);
        hill.setPosition(
          frame.position.x + frame.normal.x * (side * 42),
          frame.position.y - 7.5,
          frame.position.z + frame.normal.z * (side * 42)
        );
        if (hill.render?.meshInstances[0]) {
          hill.render.meshInstances[0].material = hillMat;
        }
        this.rootEntity.addChild(hill);
      });
    }
  }

  public update(dt: number): void {
    // Subtle animated floating bobbing for water lilies
    const time = Date.now() * 0.002;
    for (let i = 0; i < this.animatedPads.length; i++) {
      const pad = this.animatedPads[i];
      const pos = pad.getPosition();
      pad.setPosition(pos.x, 0.02 + Math.sin(time + i * 1.4) * 0.02, pos.z);
    }
  }

  public clear(): void {
    const children = [...this.rootEntity.children];
    children.forEach(c => c.destroy());
    this.animatedPads = [];
  }
}

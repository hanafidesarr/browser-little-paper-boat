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

interface SwayingEntity {
  entity: pc.Entity;
  baseRotY: number;
  phase: number;
  amplitude: number;
}

interface ButterflyEntity {
  entity: pc.Entity;
  wingL: pc.Entity;
  wingR: pc.Entity;
  anchorPos: pc.Vec3;
  phase: number;
  speed: number;
}

export class EnvironmentManager {
  private app: pc.AppBase;
  private river: RiverSystem;
  private rootEntity: pc.Entity;
  private animatedPads: pc.Entity[] = [];
  private swayingFlora: SwayingEntity[] = [];
  private swayingTrees: SwayingEntity[] = [];
  private butterflies: ButterflyEntity[] = [];

  constructor(app: pc.AppBase, river: RiverSystem) {
    this.app = app;
    this.river = river;
    this.rootEntity = new pc.Entity('EnvironmentRoot');
    this.app.root.addChild(this.rootEntity);
  }

  private getBankElevation(extraDist: number, bankHeight: number = 3.0, bankWidth: number = 15.0): number {
    const norm = Math.max(0, Math.min(1.0, extraDist / bankWidth));
    if (norm < 0.04) {
      return (norm / 0.04) * 0.16 * bankHeight;
    } else if (norm < 0.18) {
      const t = (norm - 0.04) / 0.14;
      return (0.16 + t * 0.34) * bankHeight;
    } else if (norm < 0.46) {
      const t = (norm - 0.18) / 0.28;
      return (0.50 + t * 0.38) * bankHeight;
    } else {
      const t = Math.min(1.0, (norm - 0.46) / 0.54);
      return (0.88 + t * 0.12) * bankHeight;
    }
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
    const flowerDensity = options.flowerDensity ?? 1.1;

    // 1. POPULATE STYLIZED TREES & FLOWERING BUSHES ALONG BOTH BANKS
    const treeSpacing = 6.0 / treeDensity;
    for (let s = 10; s < totalLength - 15; s += treeSpacing + rng() * 3.5) {
      const frame = this.river.getFrameAtDistance(s);
      const halfW = frame.width * 0.5;

      [-1, 1].forEach((side) => {
        if (rng() > 0.22) {
          const extra = 2.6 + rng() * 5.2;
          const latDist = side * (halfW + extra);
          const bankY = this.getBankElevation(extra);
          const treePos = new pc.Vec3(
            frame.position.x + frame.normal.x * latDist,
            frame.position.y + bankY,
            frame.position.z + frame.normal.z * latDist
          );

          let tree: pc.Entity;
          const roll = rng();
          if (options.isAutumn) {
            tree = NatureMeshes.createDeciduousTree(true);
          } else if (roll < 0.48) {
            tree = NatureMeshes.createDeciduousTree(false);
          } else if (roll < 0.76) {
            tree = NatureMeshes.createBirchTree();
          } else if (roll < 0.90) {
            tree = NatureMeshes.createPineTree();
          } else {
            tree = NatureMeshes.createFloweringBush(rng() > 0.5 ? 'pink' : 'yellow');
          }

          tree.setPosition(treePos);
          const sVal = 0.85 + rng() * 0.4;
          tree.setLocalScale(sVal, sVal, sVal);
          const rotY = rng() * 360;
          tree.setEulerAngles(0, rotY, 0);
          this.rootEntity.addChild(tree);

          this.swayingTrees.push({
            entity: tree,
            baseRotY: rotY,
            phase: rng() * Math.PI * 2,
            amplitude: 1.2 + rng() * 0.8
          });
        }
      });
    }

    // 2. POPULATE WILDFLOWERS & GRASS TUFTS ON RIVERBANKS
    const flowerSpacing = 4.2 / flowerDensity;
    const flowerVariants: ('white' | 'yellow' | 'pink' | 'purple')[] = ['white', 'yellow', 'pink', 'purple'];

    for (let s = 8; s < totalLength - 10; s += flowerSpacing + rng() * 2.5) {
      const frame = this.river.getFrameAtDistance(s);
      const halfW = frame.width * 0.5;

      [-1, 1].forEach(side => {
        if (rng() > 0.30) {
          const extra = 0.6 + rng() * 3.2;
          const lat = side * (halfW + extra);
          const bankY = this.getBankElevation(extra);
          const pos = new pc.Vec3(
            frame.position.x + frame.normal.x * lat,
            frame.position.y + bankY,
            frame.position.z + frame.normal.z * lat
          );

          const rotY = rng() * 360;
          if (rng() > 0.42) {
            const vIdx = Math.floor(rng() * flowerVariants.length);
            const flower = NatureMeshes.createFlowerCluster(flowerVariants[vIdx]);
            flower.setPosition(pos);
            flower.setEulerAngles(0, rotY, 0);
            this.rootEntity.addChild(flower);

            this.swayingFlora.push({
              entity: flower,
              baseRotY: rotY,
              phase: rng() * Math.PI * 2,
              amplitude: 3.2 + rng() * 1.5
            });
          } else {
            const grass = NatureMeshes.createGrassTuft();
            grass.setPosition(pos);
            grass.setEulerAngles(0, rotY, 0);
            this.rootEntity.addChild(grass);

            this.swayingFlora.push({
              entity: grass,
              baseRotY: rotY,
              phase: rng() * Math.PI * 2,
              amplitude: 4.0 + rng() * 2.0
            });
          }
        }
      });
    }

    // 3. POPULATE MOSSY SHORELINE ROCKS & PEBBLES
    const rockSpacing = 7.5 / rockDensity;
    for (let s = 8; s < totalLength - 12; s += rockSpacing + rng() * 3.5) {
      const frame = this.river.getFrameAtDistance(s);
      const halfW = frame.width * 0.5;
      const side = rng() > 0.5 ? 1 : -1;
      const extra = 0.3 + rng() * 1.8;
      const rockDist = side * (halfW + extra);
      const bankY = this.getBankElevation(extra);

      const rock = NatureMeshes.createRiverRock(0.75 + rng() * 0.55);
      rock.setPosition(
        frame.position.x + frame.normal.x * rockDist,
        frame.position.y + bankY * 0.65,
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

      const pad = NatureMeshes.createLilyPad(rng() > 0.5);
      pad.setPosition(
        frame.position.x + frame.normal.x * padDist,
        frame.position.y + 0.02,
        frame.position.z + frame.normal.z * padDist
      );
      pad.setEulerAngles(0, rng() * 360, 0);
      this.rootEntity.addChild(pad);
      this.animatedPads.push(pad);
    }

    // 5. WOODEN TIMBER BRIDGES SPANNING THE RIVER
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

    // 6. POPULATE CHARMING MEADOW BUTTERFLIES
    this.createButterflies(totalLength);

    // 7. DISTANT ROLLING GREEN MEADOW HILLS
    this.createDistantHills(totalLength);
  }

  private createButterflies(totalLength: number): void {
    const butterflyColors = [
      new pc.Color(0.969, 0.839, 0.416), // #F7D66A Yellow
      new pc.Color(0.545, 0.827, 0.910), // #8BD3E8 Soft Blue
      new pc.Color(0.914, 0.604, 0.698)  // #E99AB2 Pink
    ];

    const count = 5;
    for (let i = 0; i < count; i++) {
      const dist = 30 + (i / count) * (totalLength - 60);
      const frame = this.river.getFrameAtDistance(dist);
      const side = (i % 2 === 0) ? 1 : -1;
      const halfW = frame.width * 0.5;
      const bankY = this.getBankElevation(2.5);

      const anchor = new pc.Vec3(
        frame.position.x + frame.normal.x * (side * (halfW + 2.5)),
        frame.position.y + bankY + 0.8,
        frame.position.z + frame.normal.z * (side * (halfW + 2.5))
      );

      const bRoot = new pc.Entity(`Butterfly_${i}`);
      bRoot.setPosition(anchor);

      const wingMat = new pc.StandardMaterial();
      wingMat.diffuse = butterflyColors[i % butterflyColors.length];
      wingMat.ambient = new pc.Color(0.65, 0.65, 0.65);
      wingMat.cull = pc.CULLFACE_NONE;
      wingMat.update();

      // Left wing
      const wingL = new pc.Entity('WingL');
      wingL.addComponent('render', { type: 'sphere' });
      wingL.setLocalScale(0.16, 0.02, 0.12);
      wingL.setLocalPosition(-0.08, 0, 0);
      if (wingL.render?.meshInstances[0]) wingL.render.meshInstances[0].material = wingMat;
      bRoot.addChild(wingL);

      // Right wing
      const wingR = new pc.Entity('WingR');
      wingR.addComponent('render', { type: 'sphere' });
      wingR.setLocalScale(0.16, 0.02, 0.12);
      wingR.setLocalPosition(0.08, 0, 0);
      if (wingR.render?.meshInstances[0]) wingR.render.meshInstances[0].material = wingMat;
      bRoot.addChild(wingR);

      this.rootEntity.addChild(bRoot);
      this.butterflies.push({
        entity: bRoot,
        wingL,
        wingR,
        anchorPos: anchor,
        phase: i * 1.5,
        speed: 1.2 + (i % 3) * 0.3
      });
    }
  }

  private createDistantHills(totalLength: number): void {
    const hillMat = new pc.StandardMaterial();
    hillMat.diffuse = new pc.Color(0.471, 0.725, 0.420); // #78B96B Meadow Green
    hillMat.ambient = new pc.Color(0.35, 0.55, 0.32);
    hillMat.update();

    const count = 8;
    for (let i = 0; i < count; i++) {
      const dist = (i / (count - 1)) * totalLength;
      const frame = this.river.getFrameAtDistance(dist);

      [-1, 1].forEach(side => {
        const hill = new pc.Entity('DistantHill');
        hill.addComponent('render', { type: 'sphere' });
        hill.setLocalScale(58, 24, 58);
        hill.setPosition(
          frame.position.x + frame.normal.x * (side * 42),
          frame.position.y - 7.0,
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
    const now = Date.now() * 0.001;

    // 1. Floating bobbing for water lilies on river surface
    for (let i = 0; i < this.animatedPads.length; i++) {
      const pad = this.animatedPads[i];
      const pos = pad.getPosition();
      pad.setPosition(pos.x, 0.02 + Math.sin(now * 2.0 + i * 1.4) * 0.02, pos.z);
    }

    // 2. Gentle wind sway for wildflowers and grass tufts
    for (let i = 0; i < this.swayingFlora.length; i++) {
      const item = this.swayingFlora[i];
      const swayAngle = Math.sin(now * 2.2 + item.phase) * item.amplitude;
      item.entity.setEulerAngles(swayAngle, item.baseRotY, swayAngle * 0.5);
    }

    // 3. Subtle breathing sway for tree canopies
    for (let j = 0; j < this.swayingTrees.length; j++) {
      const tree = this.swayingTrees[j];
      const sway = Math.sin(now * 1.3 + tree.phase) * tree.amplitude;
      tree.entity.setEulerAngles(sway * 0.6, tree.baseRotY, sway);
    }

    // 4. Butterfly fluttering animation & flight paths
    for (let k = 0; k < this.butterflies.length; k++) {
      const b = this.butterflies[k];
      const t = now * b.speed + b.phase;

      // Figure-8 parametric flight path around anchor
      const offsetX = Math.sin(t) * 1.4;
      const offsetZ = Math.sin(t * 2.0) * 0.8;
      const offsetY = Math.cos(t * 1.5) * 0.35;

      b.entity.setPosition(
        b.anchorPos.x + offsetX,
        b.anchorPos.y + offsetY,
        b.anchorPos.z + offsetZ
      );

      // Rapid wing flutter
      const wingAngle = Math.sin(now * 16.0 + b.phase) * 45;
      b.wingL.setLocalEulerAngles(0, 0, wingAngle);
      b.wingR.setLocalEulerAngles(0, 0, -wingAngle);
    }
  }

  public clear(): void {
    const children = [...this.rootEntity.children];
    children.forEach(c => c.destroy());
    this.animatedPads = [];
    this.swayingFlora = [];
    this.swayingTrees = [];
    this.butterflies = [];
  }
}

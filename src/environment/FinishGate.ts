import * as pc from 'playcanvas';
import { RiverSystem } from '../river/RiverSystem';
import { EffectManager } from '../particles/EffectManager';

export class FinishGate {
  private entity: pc.Entity;
  private animTimer: number = 0;
  private lanterns: pc.Entity[] = [];
  private worldPosition: pc.Vec3;

  constructor(app: pc.AppBase, river: RiverSystem, finishDistance: number) {
    this.entity = new pc.Entity('FinishGate');
    const sample = river.sampleAtDistance(finishDistance);
    this.worldPosition = sample.position.clone();

    // Archway frame
    const woodMat = new pc.StandardMaterial();
    woodMat.diffuse = new pc.Color(0.85, 0.45, 0.25);
    woodMat.cull = pc.CULLFACE_NONE;
    woodMat.update();

    const bannerMat = new pc.StandardMaterial();
    bannerMat.diffuse = new pc.Color(1.0, 0.88, 0.55);
    bannerMat.emissive = new pc.Color(0.65, 0.45, 0.18);
    bannerMat.cull = pc.CULLFACE_NONE;
    bannerMat.update();

    const span = sample.width + 1.2;

    // Left and Right timber posts
    [-span * 0.48, span * 0.48].forEach(lat => {
      const post = new pc.Entity('GatePost');
      post.addComponent('render', { type: 'cylinder' });
      post.setLocalScale(0.38, 4.4, 0.38);
      post.setLocalPosition(lat, 2.2, 0);
      if (post.render?.meshInstances[0]) post.render.meshInstances[0].material = woodMat;
      this.entity.addChild(post);
    });

    // Top arch beam
    const beam = new pc.Entity('GateBeam');
    beam.addComponent('render', { type: 'box' });
    beam.setLocalScale(span + 1.0, 0.38, 0.38);
    beam.setLocalPosition(0, 4.2, 0);
    if (beam.render?.meshInstances[0]) beam.render.meshInstances[0].material = woodMat;
    this.entity.addChild(beam);

    // Decorative Hanging Lanterns
    [-span * 0.28, 0, span * 0.28].forEach(lat => {
      const lanternRoot = new pc.Entity('LanternRoot');
      lanternRoot.setLocalPosition(lat, 4.0, 0);

      const cord = new pc.Entity('Cord');
      cord.addComponent('render', { type: 'cylinder' });
      cord.setLocalScale(0.04, 0.6, 0.04);
      cord.setLocalPosition(0, -0.3, 0);
      if (cord.render?.meshInstances[0]) cord.render.meshInstances[0].material = woodMat;
      lanternRoot.addChild(cord);

      const lantern = new pc.Entity('Lantern');
      lantern.addComponent('render', { type: 'sphere' });
      lantern.setLocalScale(0.48, 0.62, 0.48);
      lantern.setLocalPosition(0, -0.7, 0);
      if (lantern.render?.meshInstances[0]) lantern.render.meshInstances[0].material = bannerMat;
      lanternRoot.addChild(lantern);

      this.entity.addChild(lanternRoot);
      this.lanterns.push(lanternRoot);
    });

    // Position and orient along spline
    this.entity.setPosition(sample.position);
    const rotMat = new pc.Mat4();
    rotMat.setLookAt(pc.Vec3.ZERO, sample.tangent, pc.Vec3.UP);
    this.entity.setRotation(new pc.Quat().setFromMat4(rotMat));

    app.root.addChild(this.entity);
  }

  public update(dt: number): void {
    this.animTimer += dt;
    // Gentle lantern swing in the breeze
    this.lanterns.forEach((l, idx) => {
      const swing = Math.sin(this.animTimer * 2.2 + idx * 1.2) * 8.0;
      l.setLocalEulerAngles(swing, 0, 0);
    });
  }

  public celebrate(effects: EffectManager): void {
    effects.spawnConfetti(this.worldPosition, 36);
    effects.spawnSplash(this.worldPosition, 3.2);
  }

  public destroy(): void {
    this.entity.destroy();
  }
}

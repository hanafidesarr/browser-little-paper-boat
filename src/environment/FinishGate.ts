import * as pc from 'playcanvas';
import { RiverSystem } from '../river/RiverSystem';

export class FinishGate {
  private entity: pc.Entity;
  private animTimer: number = 0;

  constructor(app: pc.AppBase, river: RiverSystem, finishDistance: number) {
    this.entity = new pc.Entity('FinishGate');
    const sample = river.sampleAtDistance(finishDistance);

    // Archway frame
    const woodMat = new pc.StandardMaterial();
    woodMat.diffuse = new pc.Color(0.85, 0.45, 0.25);
    woodMat.update();

    const bannerMat = new pc.StandardMaterial();
    bannerMat.diffuse = new pc.Color(0.98, 0.90, 0.65);
    bannerMat.emissive = new pc.Color(0.5, 0.45, 0.2);
    bannerMat.update();

    const span = sample.width + 1.0;

    // Left and Right timber posts
    [-span * 0.48, span * 0.48].forEach(lat => {
      const post = new pc.Entity('GatePost');
      post.addComponent('render', { type: 'cylinder' });
      post.setLocalScale(0.35, 4.0, 0.35);
      post.setLocalPosition(lat, 2.0, 0);
      if (post.render?.meshInstances[0]) post.render.meshInstances[0].material = woodMat;
      this.entity.addChild(post);
    });

    // Top arch beam
    const beam = new pc.Entity('GateBeam');
    beam.addComponent('render', { type: 'box' });
    beam.setLocalScale(span + 0.8, 0.35, 0.35);
    beam.setLocalPosition(0, 3.8, 0);
    if (beam.render?.meshInstances[0]) beam.render.meshInstances[0].material = woodMat;
    this.entity.addChild(beam);

    // Decorative Hanging Lanterns / Banners
    [-span * 0.25, 0, span * 0.25].forEach(lat => {
      const lantern = new pc.Entity('Lantern');
      lantern.addComponent('render', { type: 'sphere' });
      lantern.setLocalScale(0.4, 0.5, 0.4);
      lantern.setLocalPosition(lat, 3.2, 0);
      if (lantern.render?.meshInstances[0]) lantern.render.meshInstances[0].material = bannerMat;
      this.entity.addChild(lantern);
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
  }

  public destroy(): void {
    this.entity.destroy();
  }
}

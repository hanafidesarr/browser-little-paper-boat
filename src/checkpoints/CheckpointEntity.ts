import * as pc from 'playcanvas';
import { RiverSystem } from '../river/RiverSystem';

export class CheckpointEntity {
  public distance: number;
  public isPassed: boolean = false;
  public entity: pc.Entity;

  private leftLanternMat: pc.StandardMaterial;
  private rightLanternMat: pc.StandardMaterial;
  private animTimer: number = 0;

  constructor(app: pc.AppBase, river: RiverSystem, distance: number) {
    this.distance = distance;
    this.entity = new pc.Entity(`Checkpoint_${Math.floor(distance)}`);

    const frame = river.getFrameAtDistance(distance);
    const halfW = (frame.width * 0.5) - 0.4;

    // Materials
    const woodMat = new pc.StandardMaterial();
    woodMat.diffuse = new pc.Color(0.48, 0.35, 0.22);
    woodMat.update();

    this.leftLanternMat = new pc.StandardMaterial();
    this.leftLanternMat.diffuse = new pc.Color(1.0, 0.9, 0.6);
    this.leftLanternMat.emissive = new pc.Color(0.7, 0.45, 0.1);
    this.leftLanternMat.update();

    this.rightLanternMat = new pc.StandardMaterial();
    this.rightLanternMat.diffuse = new pc.Color(1.0, 0.9, 0.6);
    this.rightLanternMat.emissive = new pc.Color(0.7, 0.45, 0.1);
    this.rightLanternMat.update();

    // Create Left & Right buoys
    const createBuoy = (lat: number, mat: pc.StandardMaterial) => {
      const buoy = new pc.Entity('Buoy');

      // Floating disc base
      const disc = new pc.Entity('Disc');
      disc.addComponent('render', { type: 'cylinder' });
      disc.setLocalScale(0.9, 0.15, 0.9);
      disc.setLocalPosition(0, 0.05, 0);
      if (disc.render?.meshInstances[0]) disc.render.meshInstances[0].material = woodMat;
      buoy.addChild(disc);

      // Bamboo pole
      const pole = new pc.Entity('Pole');
      pole.addComponent('render', { type: 'cylinder' });
      pole.setLocalScale(0.12, 1.8, 0.12);
      pole.setLocalPosition(0, 0.9, 0);
      if (pole.render?.meshInstances[0]) pole.render.meshInstances[0].material = woodMat;
      buoy.addChild(pole);

      // Glowing paper lantern
      const lantern = new pc.Entity('Lantern');
      lantern.addComponent('render', { type: 'sphere' });
      lantern.setLocalScale(0.45, 0.55, 0.45);
      lantern.setLocalPosition(0, 1.6, 0);
      if (lantern.render?.meshInstances[0]) lantern.render.meshInstances[0].material = mat;
      buoy.addChild(lantern);

      buoy.setLocalPosition(lat, 0, 0);
      return buoy;
    };

    const leftBuoy = createBuoy(-halfW, this.leftLanternMat);
    const rightBuoy = createBuoy(halfW, this.rightLanternMat);
    this.entity.addChild(leftBuoy);
    this.entity.addChild(rightBuoy);

    // Position entity along river spline
    this.entity.setPosition(frame.position);
    const rotMat = new pc.Mat4();
    rotMat.setLookAt(pc.Vec3.ZERO, frame.tangent, pc.Vec3.UP);
    this.entity.setRotation(new pc.Quat().setFromMat4(rotMat));

    app.root.addChild(this.entity);
  }

  public update(dt: number): void {
    this.animTimer += dt;
    // Gentle floating bob
    const bob = Math.sin(this.animTimer * 2.2) * 0.04;
    const pos = this.entity.getPosition();
    this.entity.setPosition(pos.x, bob, pos.z);

    if (this.isPassed) {
      // Radiant pulsating flame
      const pulse = 0.8 + Math.sin(this.animTimer * 5.0) * 0.2;
      const radiantColor = new pc.Color(1.0 * pulse, 0.85 * pulse, 0.3 * pulse);
      this.leftLanternMat.emissive.copy(radiantColor);
      this.leftLanternMat.update();
      this.rightLanternMat.emissive.copy(radiantColor);
      this.rightLanternMat.update();
    }
  }

  public activate(): void {
    this.isPassed = true;
    this.leftLanternMat.diffuse = new pc.Color(1.0, 1.0, 0.8);
    this.rightLanternMat.diffuse = new pc.Color(1.0, 1.0, 0.8);
  }

  public destroy(): void {
    this.entity.destroy();
  }
}

import * as pc from 'playcanvas';

export type CollectibleType = 'golden_leaf' | 'lily_flower' | 'starlight';

export class CollectibleEntity {
  public distance: number;
  public lateralOffset: number;
  public type: CollectibleType;
  public collected: boolean = false;
  public entity: pc.Entity;

  private animTimer: number;
  private collectAnimProgress: number = 0;
  private basePos: pc.Vec3 = new pc.Vec3();
  private currentWorldPos: pc.Vec3 = new pc.Vec3();

  constructor(
    device: pc.GraphicsDevice,
    distance: number,
    lateralOffset: number,
    type: CollectibleType = 'golden_leaf'
  ) {
    this.distance = distance;
    this.lateralOffset = lateralOffset;
    this.type = type;
    this.animTimer = Math.random() * 10;

    this.entity = new pc.Entity(`Collectible_${type}_${Math.floor(distance)}`);
    this.buildMesh(device);
  }

  private buildMesh(device: pc.GraphicsDevice): void {
    const mat = new pc.StandardMaterial();
    mat.cull = pc.CULLFACE_NONE;

    if (this.type === 'golden_leaf') {
      mat.diffuse = new pc.Color(1.0, 0.82, 0.22);
      mat.emissive = new pc.Color(0.85, 0.55, 0.12);
      mat.shininess = 64;
      mat.update();

      // Leaf diamond shape
      const meshEntity = new pc.Entity('LeafVisual');
      meshEntity.addComponent('render', { type: 'box' });
      meshEntity.setLocalScale(0.48, 0.05, 0.7);
      meshEntity.setLocalEulerAngles(15, 45, 10);
      if (meshEntity.render?.meshInstances[0]) meshEntity.render.meshInstances[0].material = mat;
      this.entity.addChild(meshEntity);

    } else if (this.type === 'lily_flower') {
      mat.diffuse = new pc.Color(0.98, 0.45, 0.72);
      mat.emissive = new pc.Color(0.70, 0.22, 0.48);
      mat.shininess = 50;
      mat.update();

      const meshEntity = new pc.Entity('FlowerVisual');
      meshEntity.addComponent('render', { type: 'sphere' });
      meshEntity.setLocalScale(0.5, 0.42, 0.5);
      if (meshEntity.render?.meshInstances[0]) meshEntity.render.meshInstances[0].material = mat;
      this.entity.addChild(meshEntity);

    } else {
      // Celestial Starlight mote
      mat.diffuse = new pc.Color(0.5, 0.95, 1.0);
      mat.emissive = new pc.Color(0.4, 0.88, 1.0);
      mat.opacity = 0.9;
      mat.blendType = pc.BLEND_ADDITIVE;
      mat.update();

      const meshEntity = new pc.Entity('StarVisual');
      meshEntity.addComponent('render', { type: 'cone' });
      meshEntity.setLocalScale(0.38, 0.6, 0.38);
      if (meshEntity.render?.meshInstances[0]) meshEntity.render.meshInstances[0].material = mat;
      this.entity.addChild(meshEntity);
    }
  }

  public setInitialPosition(pos: pc.Vec3): void {
    this.basePos.copy(pos);
    this.currentWorldPos.copy(pos);
    this.entity.setPosition(pos);
  }

  public update(dt: number, boatPos: pc.Vec3): void {
    if (this.collected) {
      // Clean float-up and shrink animation
      if (this.collectAnimProgress < 1.0) {
        this.collectAnimProgress += dt * 2.8;
        const currentPos = this.entity.getPosition();
        this.entity.setPosition(currentPos.x, currentPos.y + dt * 3.5, currentPos.z);
        const s = Math.max(0.01, 1.0 - this.collectAnimProgress);
        this.entity.setLocalScale(s, s, s);

        if (this.collectAnimProgress >= 1.0) {
          this.entity.enabled = false;
        }
      }
      return;
    }

    this.animTimer += dt;

    // Gentle spin
    this.entity.rotate(0, 85 * dt, 0);

    // Magnetic Attraction: if boat is within attraction radius, pull towards boat
    const distToBoat = this.currentWorldPos.distance(boatPos);
    if (distToBoat < 3.2 && distToBoat > 0.05) {
      const magnetStrength = 4.5;
      const pullDir = boatPos.clone().sub(this.currentWorldPos).normalize();
      this.currentWorldPos.add(pullDir.mulScalar(magnetStrength * dt));
      this.entity.setPosition(this.currentWorldPos);
    } else {
      // Gentle natural hovering bob
      const bob = Math.sin(this.animTimer * 2.8) * 0.08;
      this.entity.setPosition(this.basePos.x, this.basePos.y + bob, this.basePos.z);
      this.currentWorldPos.copy(this.entity.getPosition());
    }
  }

  public triggerCollect(): void {
    if (this.collected) return;
    this.collected = true;
    this.collectAnimProgress = 0;
  }

  public getColor(): pc.Color {
    if (this.type === 'golden_leaf') return new pc.Color(1.0, 0.85, 0.25);
    if (this.type === 'lily_flower') return new pc.Color(0.98, 0.45, 0.72);
    return new pc.Color(0.4, 0.9, 1.0);
  }

  public destroy(): void {
    this.entity.destroy();
  }
}

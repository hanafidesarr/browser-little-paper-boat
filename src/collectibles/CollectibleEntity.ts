import * as pc from 'playcanvas';

export type CollectibleType = 'golden_leaf' | 'lily_flower' | 'starlight';

export class CollectibleEntity {
  public distance: number;
  public lateralOffset: number;
  public type: CollectibleType;
  public collected: boolean = false;
  public entity: pc.Entity;
  private animTimer: number;

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

    if (this.type === 'golden_leaf') {
      mat.diffuse = new pc.Color(1.0, 0.82, 0.2);
      mat.emissive = new pc.Color(0.8, 0.55, 0.1);
      mat.shininess = 64;
      mat.update();

      // Leaf diamond shape
      const meshEntity = new pc.Entity('LeafVisual');
      meshEntity.addComponent('render', { type: 'box' });
      meshEntity.setLocalScale(0.45, 0.04, 0.65);
      meshEntity.setLocalEulerAngles(15, 45, 10);
      if (meshEntity.render?.meshInstances[0]) meshEntity.render.meshInstances[0].material = mat;
      this.entity.addChild(meshEntity);

    } else if (this.type === 'lily_flower') {
      mat.diffuse = new pc.Color(0.98, 0.45, 0.72);
      mat.emissive = new pc.Color(0.65, 0.2, 0.45);
      mat.shininess = 50;
      mat.update();

      const meshEntity = new pc.Entity('FlowerVisual');
      meshEntity.addComponent('render', { type: 'sphere' });
      meshEntity.setLocalScale(0.48, 0.42, 0.48);
      if (meshEntity.render?.meshInstances[0]) meshEntity.render.meshInstances[0].material = mat;
      this.entity.addChild(meshEntity);

    } else {
      // Starlight / mote
      mat.diffuse = new pc.Color(0.5, 0.95, 1.0);
      mat.emissive = new pc.Color(0.4, 0.85, 1.0);
      mat.opacity = 0.9;
      mat.blendType = pc.BLEND_ADDITIVE;
      mat.update();

      const meshEntity = new pc.Entity('StarVisual');
      meshEntity.addComponent('render', { type: 'cone' });
      meshEntity.setLocalScale(0.35, 0.55, 0.35);
      if (meshEntity.render?.meshInstances[0]) meshEntity.render.meshInstances[0].material = mat;
      this.entity.addChild(meshEntity);
    }
  }

  public update(dt: number): void {
    if (this.collected) return;
    this.animTimer += dt;

    // Gentle spin and hover
    const rotSpeed = 70;
    this.entity.rotate(0, rotSpeed * dt, 0);

    const pos = this.entity.getPosition();
    const bob = Math.sin(this.animTimer * 2.8) * 0.08;
    this.entity.setPosition(pos.x, 0.35 + bob, pos.z);
  }

  public triggerCollect(): void {
    this.collected = true;
    // Animate collect (fly up & disappear)
    let progress = 0;
    const initialPos = this.entity.getPosition();
    const startY = initialPos.y;

    const interval = setInterval(() => {
      progress += 0.08;
      const currentPos = this.entity.getPosition();
      this.entity.setPosition(currentPos.x, startY + progress * 2.5, currentPos.z);
      const s = Math.max(0.01, 1.0 - progress);
      this.entity.setLocalScale(s, s, s);

      if (progress >= 1.0) {
        clearInterval(interval);
        this.entity.enabled = false;
      }
    }, 20);
  }

  public destroy(): void {
    this.entity.destroy();
  }
}

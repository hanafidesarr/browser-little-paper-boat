import * as pc from 'playcanvas';

export type WeatherType = 'sunny' | 'rain' | 'autumn_leaves' | 'fireflies' | 'mist';

export class WeatherEffects {
  private app: pc.AppBase;
  private rootEntity: pc.Entity;
  private weatherType: WeatherType = 'sunny';
  private particles: pc.Entity[] = [];
  private particleData: { entity: pc.Entity; speed: pc.Vec3; seed: number }[] = [];

  constructor(app: pc.AppBase) {
    this.app = app;
    this.rootEntity = new pc.Entity('WeatherEffectsRoot');
    this.app.root.addChild(this.rootEntity);
  }

  public setWeather(type: WeatherType, targetPos: pc.Vec3): void {
    this.clear();
    this.weatherType = type;

    if (type === 'rain') {
      this.initRain(targetPos);
    } else if (type === 'autumn_leaves') {
      this.initFallingLeaves(targetPos);
    } else if (type === 'fireflies') {
      this.initFireflies(targetPos);
    }
  }

  private initRain(center: pc.Vec3): void {
    const rainMat = new pc.StandardMaterial();
    rainMat.diffuse = new pc.Color(0.85, 0.92, 1.0);
    rainMat.opacity = 0.55;
    rainMat.blendType = pc.BLEND_NORMAL;
    rainMat.update();

    for (let i = 0; i < 40; i++) {
      const drop = new pc.Entity('RainDrop');
      drop.addComponent('render', { type: 'cylinder' });
      drop.setLocalScale(0.02, 0.8, 0.02);
      if (drop.render?.meshInstances[0]) drop.render.meshInstances[0].material = rainMat;

      const px = center.x + (Math.random() - 0.5) * 30;
      const py = center.y + 2 + Math.random() * 12;
      const pz = center.z + (Math.random() - 0.5) * 30;
      drop.setPosition(px, py, pz);

      this.rootEntity.addChild(drop);
      this.particleData.push({
        entity: drop,
        speed: new pc.Vec3((Math.random() - 0.5) * 0.5, -(12 + Math.random() * 4), 1.0),
        seed: Math.random() * 100
      });
    }
  }

  private initFallingLeaves(center: pc.Vec3): void {
    const leafMat = new pc.StandardMaterial();
    leafMat.diffuse = new pc.Color(0.95, 0.60, 0.15);
    leafMat.update();

    for (let i = 0; i < 25; i++) {
      const leaf = new pc.Entity('Leaf');
      leaf.addComponent('render', { type: 'box' });
      leaf.setLocalScale(0.25, 0.02, 0.35);
      if (leaf.render?.meshInstances[0]) leaf.render.meshInstances[0].material = leafMat;

      const px = center.x + (Math.random() - 0.5) * 25;
      const py = center.y + 2 + Math.random() * 8;
      const pz = center.z + (Math.random() - 0.5) * 25;
      leaf.setPosition(px, py, pz);

      this.rootEntity.addChild(leaf);
      this.particleData.push({
        entity: leaf,
        speed: new pc.Vec3((Math.random() - 0.5) * 1.5, -(1.2 + Math.random() * 0.8), 0.8 + Math.random() * 0.8),
        seed: Math.random() * 100
      });
    }
  }

  private initFireflies(center: pc.Vec3): void {
    const glowMat = new pc.StandardMaterial();
    glowMat.diffuse = new pc.Color(0.85, 1.0, 0.4);
    glowMat.emissive = new pc.Color(0.9, 1.0, 0.5);
    glowMat.opacity = 0.85;
    glowMat.blendType = pc.BLEND_ADDITIVE;
    glowMat.update();

    for (let i = 0; i < 30; i++) {
      const fly = new pc.Entity('Firefly');
      fly.addComponent('render', { type: 'sphere' });
      fly.setLocalScale(0.12, 0.12, 0.12);
      if (fly.render?.meshInstances[0]) fly.render.meshInstances[0].material = glowMat;

      const px = center.x + (Math.random() - 0.5) * 22;
      const py = center.y + 0.4 + Math.random() * 3.5;
      const pz = center.z + (Math.random() - 0.5) * 22;
      fly.setPosition(px, py, pz);

      this.rootEntity.addChild(fly);
      this.particleData.push({
        entity: fly,
        speed: new pc.Vec3(0, 0, 0),
        seed: Math.random() * 100
      });
    }
  }

  public update(dt: number, focusPos: pc.Vec3): void {
    if (this.particleData.length === 0) return;

    const time = Date.now() * 0.001;

    for (let i = 0; i < this.particleData.length; i++) {
      const p = this.particleData[i];
      const pos = p.entity.getPosition();
      let nx = pos.x;
      let ny = pos.y;
      let nz = pos.z;

      if (this.weatherType === 'fireflies') {
        // Organic wandering motion
        const s = p.seed;
        nx += Math.sin(time * 1.2 + s) * 0.03;
        ny += Math.cos(time * 0.9 + s * 2) * 0.02;
        nz += Math.sin(time * 0.7 + s * 3) * 0.03;

        // Keep within boat vicinity
        if (pos.distance(focusPos) > 18) {
          nx = focusPos.x + (Math.random() - 0.5) * 16;
          ny = focusPos.y + 0.4 + Math.random() * 3.0;
          nz = focusPos.z + (Math.random() - 0.5) * 16;
        }
      } else {
        // Rain & falling leaves
        nx += p.speed.x * dt;
        ny += p.speed.y * dt;
        nz += p.speed.z * dt;

        // Reset when fallen to ground
        if (ny < focusPos.y - 0.2 || pos.distance(focusPos) > 22) {
          nx = focusPos.x + (Math.random() - 0.5) * 22;
          ny = focusPos.y + 7 + Math.random() * 4;
          nz = focusPos.z + (Math.random() - 0.5) * 22;
        }
      }

      p.entity.setPosition(nx, ny, nz);
    }
  }

  public clear(): void {
    const children = [...this.rootEntity.children];
    children.forEach(c => c.destroy());
    this.particleData = [];
  }
}

import * as pc from 'playcanvas';
import { ObjectPool } from '../utils/ObjectPool';

interface SplashRing {
  entity: pc.Entity;
  material: pc.StandardMaterial;
  age: number;
  duration: number;
  startScale: number;
  targetScale: number;
}

interface SparkleParticle {
  entity: pc.Entity;
  material: pc.StandardMaterial;
  velocity: pc.Vec3;
  age: number;
  duration: number;
}

export class EffectManager {
  private app: pc.AppBase;
  private rootEntity: pc.Entity;

  // Pools
  private ringPool: ObjectPool<SplashRing>;
  private activeRings: SplashRing[] = [];

  private sparklePool: ObjectPool<SparkleParticle>;
  private activeSparkles: SparkleParticle[] = [];

  constructor(app: pc.AppBase) {
    this.app = app;
    this.rootEntity = new pc.Entity('EffectManagerRoot');
    this.app.root.addChild(this.rootEntity);

    // 1. Water Splash Ring Pool
    this.ringPool = new ObjectPool<SplashRing>(
      () => this.createSplashRingInstance(),
      (ring) => {
        ring.entity.enabled = false;
        ring.age = 0;
      },
      12
    );

    // 2. Sparkle Particle Pool
    this.sparklePool = new ObjectPool<SparkleParticle>(
      () => this.createSparkleParticleInstance(),
      (sparkle) => {
        sparkle.entity.enabled = false;
        sparkle.age = 0;
      },
      32
    );
  }

  private createSplashRingInstance(): SplashRing {
    const entity = new pc.Entity('PooledSplashRing');
    entity.addComponent('render', { type: 'plane' });
    entity.setLocalScale(0.1, 1.0, 0.1);

    const mat = new pc.StandardMaterial();
    mat.diffuse = new pc.Color(1.0, 1.0, 1.0);
    mat.emissive = new pc.Color(0.8, 0.95, 1.0);
    mat.opacity = 0.8;
    mat.blendType = pc.BLEND_ADDITIVE;
    mat.cull = pc.CULLFACE_NONE;
    mat.update();

    if (entity.render?.meshInstances[0]) {
      entity.render.meshInstances[0].material = mat;
    }

    entity.enabled = false;
    this.rootEntity.addChild(entity);

    return {
      entity,
      material: mat,
      age: 0,
      duration: 0.5,
      startScale: 0.4,
      targetScale: 2.2
    };
  }

  private createSparkleParticleInstance(): SparkleParticle {
    const entity = new pc.Entity('PooledSparkle');
    entity.addComponent('render', { type: 'sphere' });
    entity.setLocalScale(0.12, 0.12, 0.12);

    const mat = new pc.StandardMaterial();
    mat.diffuse = new pc.Color(1.0, 0.9, 0.3);
    mat.emissive = new pc.Color(1.0, 0.8, 0.2);
    mat.blendType = pc.BLEND_ADDITIVE;
    mat.update();

    if (entity.render?.meshInstances[0]) {
      entity.render.meshInstances[0].material = mat;
    }

    entity.enabled = false;
    this.rootEntity.addChild(entity);

    return {
      entity,
      material: mat,
      velocity: new pc.Vec3(),
      age: 0,
      duration: 0.7
    };
  }

  public spawnSplash(pos: pc.Vec3, scale: number = 1.8): void {
    const ring = this.ringPool.get();
    ring.age = 0;
    ring.duration = 0.55;
    ring.startScale = 0.3 * scale;
    ring.targetScale = scale;
    ring.entity.setPosition(pos.x, 0.03, pos.z);
    ring.entity.setLocalScale(ring.startScale, 1.0, ring.startScale);
    ring.material.opacity = 0.85;
    ring.material.update();
    ring.entity.enabled = true;
    this.activeRings.push(ring);
  }

  public spawnSparkles(pos: pc.Vec3, color?: pc.Color, count: number = 8): void {
    const tint = color || new pc.Color(1.0, 0.85, 0.25);

    for (let i = 0; i < count; i++) {
      const sparkle = this.sparklePool.get();
      sparkle.age = 0;
      sparkle.duration = 0.6 + Math.random() * 0.4;
      sparkle.material.diffuse.copy(tint);
      sparkle.material.emissive.copy(tint);
      sparkle.material.update();

      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const speed = 1.2 + Math.random() * 1.5;
      sparkle.velocity.set(
        Math.cos(angle) * speed,
        1.8 + Math.random() * 2.0,
        Math.sin(angle) * speed
      );

      sparkle.entity.setPosition(
        pos.x + (Math.random() - 0.5) * 0.3,
        pos.y + 0.2 + (Math.random() - 0.5) * 0.2,
        pos.z + (Math.random() - 0.5) * 0.3
      );
      sparkle.entity.setLocalScale(0.14, 0.14, 0.14);
      sparkle.entity.enabled = true;
      this.activeSparkles.push(sparkle);
    }
  }

  public spawnConfetti(pos: pc.Vec3, count: number = 24): void {
    const colors = [
      new pc.Color(1.0, 0.4, 0.5), // Pink cherry petal
      new pc.Color(1.0, 0.85, 0.2), // Gold
      new pc.Color(0.4, 0.9, 0.95), // Cyan
      new pc.Color(0.8, 0.5, 1.0)  // Lavender
    ];

    for (let i = 0; i < count; i++) {
      const p = this.sparklePool.get();
      p.age = 0;
      p.duration = 1.2 + Math.random() * 0.8;
      const col = colors[Math.floor(Math.random() * colors.length)];
      p.material.diffuse.copy(col);
      p.material.emissive.copy(col);
      p.material.update();

      const angle = Math.random() * Math.PI * 2;
      const speed = 2.0 + Math.random() * 3.0;
      p.velocity.set(
        Math.cos(angle) * speed,
        3.5 + Math.random() * 3.5,
        Math.sin(angle) * speed
      );

      p.entity.setPosition(pos.x, pos.y + 0.5, pos.z);
      p.entity.setLocalScale(0.18, 0.18, 0.18);
      p.entity.enabled = true;
      this.activeSparkles.push(p);
    }
  }

  public update(dt: number): void {
    // 1. Update Splash Rings
    for (let i = this.activeRings.length - 1; i >= 0; i--) {
      const ring = this.activeRings[i];
      ring.age += dt;
      const t = ring.age / ring.duration;

      if (t >= 1.0) {
        this.activeRings.splice(i, 1);
        this.ringPool.release(ring);
      } else {
        const currentScale = ring.startScale + (ring.targetScale - ring.startScale) * t;
        ring.entity.setLocalScale(currentScale, 1.0, currentScale);
        ring.material.opacity = (1.0 - t) * 0.8;
        ring.material.update();
      }
    }

    // 2. Update Sparkles
    const gravity = -6.5;
    for (let i = this.activeSparkles.length - 1; i >= 0; i--) {
      const s = this.activeSparkles[i];
      s.age += dt;
      const t = s.age / s.duration;

      if (t >= 1.0) {
        this.activeSparkles.splice(i, 1);
        this.sparklePool.release(s);
      } else {
        s.velocity.y += gravity * dt;
        const p = s.entity.getPosition();
        s.entity.setPosition(
          p.x + s.velocity.x * dt,
          p.y + s.velocity.y * dt,
          p.z + s.velocity.z * dt
        );

        const scale = 0.14 * (1.0 - t);
        s.entity.setLocalScale(scale, scale, scale);
      }
    }
  }

  public clear(): void {
    for (const r of this.activeRings) {
      this.ringPool.release(r);
    }
    this.activeRings = [];

    for (const s of this.activeSparkles) {
      this.sparklePool.release(s);
    }
    this.activeSparkles = [];
  }

  public destroy(): void {
    this.clear();
    this.rootEntity.destroy();
  }
}

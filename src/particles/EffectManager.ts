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

interface WaterDroplet {
  entity: pc.Entity;
  material: pc.StandardMaterial;
  velocity: pc.Vec3;
  age: number;
  duration: number;
  initialScale: number;
}

interface SparkleParticle {
  entity: pc.Entity;
  material: pc.StandardMaterial;
  velocity: pc.Vec3;
  age: number;
  duration: number;
}

interface MistParticle {
  entity: pc.Entity;
  material: pc.StandardMaterial;
  velocity: pc.Vec3;
  age: number;
  duration: number;
  startScale: number;
  targetScale: number;
}

export class EffectManager {
  private app: pc.AppBase;
  private rootEntity: pc.Entity;

  // Cached procedural textures
  private static ringTexture: pc.Texture | null = null;
  private static dropletTexture: pc.Texture | null = null;
  private static mistTexture: pc.Texture | null = null;

  // Object Pools
  private ringPool: ObjectPool<SplashRing>;
  private activeRings: SplashRing[] = [];

  private dropletPool: ObjectPool<WaterDroplet>;
  private activeDroplets: WaterDroplet[] = [];

  private sparklePool: ObjectPool<SparkleParticle>;
  private activeSparkles: SparkleParticle[] = [];

  private mistPool: ObjectPool<MistParticle>;
  private activeMist: MistParticle[] = [];

  // Boat wake emission throttler
  private boatWakeTimer: number = 0;

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
      24
    );

    // 2. Water Droplet Pool (Physical 3D translucent water beads)
    this.dropletPool = new ObjectPool<WaterDroplet>(
      () => this.createDropletInstance(),
      (drop) => {
        drop.entity.enabled = false;
        drop.age = 0;
      },
      48
    );

    // 3. Sparkle Particle Pool (Collectibles / Celebrations)
    this.sparklePool = new ObjectPool<SparkleParticle>(
      () => this.createSparkleParticleInstance(),
      (sparkle) => {
        sparkle.entity.enabled = false;
        sparkle.age = 0;
      },
      32
    );

    // 4. Mist Particle Pool (Waterfall spray / Current foam)
    this.mistPool = new ObjectPool<MistParticle>(
      () => this.createMistInstance(),
      (mist) => {
        mist.entity.enabled = false;
        mist.age = 0;
      },
      16
    );
  }

  // ====================================================
  // PROCEDURAL ALPHA TEXTURES (No square edges, soft falloff)
  // ====================================================

  /**
   * Generates a circular ripple ring with transparent center and transparent outer boundary.
   */
  public static getRingTexture(device: pc.GraphicsDevice): pc.Texture {
    if (this.ringTexture) return this.ringTexture;

    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, size, size);

    // Soft concentric ring gradient
    const center = size / 2;
    const grad = ctx.createRadialGradient(center, center, 0, center, center, center);
    grad.addColorStop(0.00, 'rgba(255, 255, 255, 0.0)');
    grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.0)');
    grad.addColorStop(0.65, 'rgba(215, 245, 255, 0.75)');
    grad.addColorStop(0.78, 'rgba(255, 255, 255, 0.95)');
    grad.addColorStop(0.88, 'rgba(180, 235, 255, 0.60)');
    grad.addColorStop(1.00, 'rgba(255, 255, 255, 0.0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(center, center, center, 0, Math.PI * 2);
    ctx.fill();

    const texture = new pc.Texture(device, {
      width: size,
      height: size,
      format: pc.PIXELFORMAT_RGBA8,
      addressU: pc.ADDRESS_CLAMP_TO_EDGE,
      addressV: pc.ADDRESS_CLAMP_TO_EDGE,
      minFilter: pc.FILTER_LINEAR,
      magFilter: pc.FILTER_LINEAR
    });
    texture.setSource(canvas);

    this.ringTexture = texture;
    return texture;
  }

  /**
   * Generates a soft translucent water droplet texture.
   */
  public static getDropletTexture(device: pc.GraphicsDevice): pc.Texture {
    if (this.dropletTexture) return this.dropletTexture;

    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, size, size);

    const center = size / 2;
    const grad = ctx.createRadialGradient(center * 0.85, center * 0.85, 2, center, center, center * 0.95);
    grad.addColorStop(0.00, 'rgba(255, 255, 255, 0.98)');
    grad.addColorStop(0.30, 'rgba(230, 250, 255, 0.85)');
    grad.addColorStop(0.70, 'rgba(160, 230, 245, 0.65)');
    grad.addColorStop(0.95, 'rgba(120, 210, 235, 0.20)');
    grad.addColorStop(1.00, 'rgba(255, 255, 255, 0.0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(center, center, center * 0.95, 0, Math.PI * 2);
    ctx.fill();

    const texture = new pc.Texture(device, {
      width: size,
      height: size,
      format: pc.PIXELFORMAT_RGBA8,
      addressU: pc.ADDRESS_CLAMP_TO_EDGE,
      addressV: pc.ADDRESS_CLAMP_TO_EDGE,
      minFilter: pc.FILTER_LINEAR,
      magFilter: pc.FILTER_LINEAR
    });
    texture.setSource(canvas);

    this.dropletTexture = texture;
    return texture;
  }

  /**
   * Generates a soft Gaussian mist puff texture.
   */
  public static getMistTexture(device: pc.GraphicsDevice): pc.Texture {
    if (this.mistTexture) return this.mistTexture;

    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, size, size);

    const center = size / 2;
    const grad = ctx.createRadialGradient(center, center, 0, center, center, center);
    grad.addColorStop(0.00, 'rgba(240, 250, 255, 0.50)');
    grad.addColorStop(0.40, 'rgba(210, 240, 250, 0.35)');
    grad.addColorStop(0.80, 'rgba(180, 225, 245, 0.12)');
    grad.addColorStop(1.00, 'rgba(255, 255, 255, 0.0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(center, center, center, 0, Math.PI * 2);
    ctx.fill();

    const texture = new pc.Texture(device, {
      width: size,
      height: size,
      format: pc.PIXELFORMAT_RGBA8,
      addressU: pc.ADDRESS_CLAMP_TO_EDGE,
      addressV: pc.ADDRESS_CLAMP_TO_EDGE,
      minFilter: pc.FILTER_LINEAR,
      magFilter: pc.FILTER_LINEAR
    });
    texture.setSource(canvas);

    this.mistTexture = texture;
    return texture;
  }

  // ====================================================
  // POOL INSTANCE FACTORIES
  // ====================================================

  private createSplashRingInstance(): SplashRing {
    const entity = new pc.Entity('PooledSplashRing');
    entity.addComponent('render', { type: 'plane' });
    entity.setLocalScale(0.1, 1.0, 0.1);

    const ringTex = EffectManager.getRingTexture(this.app.graphicsDevice);

    const mat = new pc.StandardMaterial();
    mat.diffuse = new pc.Color(0.85, 0.96, 1.0);
    mat.emissive = new pc.Color(0.70, 0.90, 0.98);
    mat.diffuseMap = ringTex;
    mat.opacityMap = ringTex;
    mat.opacityMapChannel = 'a';
    mat.opacity = 0.85;
    mat.blendType = pc.BLEND_NORMAL;
    mat.depthWrite = false; // Prevent z-clipping with water plane
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
      duration: 0.55,
      startScale: 0.3,
      targetScale: 1.8
    };
  }

  private createDropletInstance(): WaterDroplet {
    const entity = new pc.Entity('PooledDroplet');
    entity.addComponent('render', { type: 'sphere' });
    entity.setLocalScale(0.1, 0.1, 0.1);

    const mat = new pc.StandardMaterial();
    mat.diffuse = new pc.Color(0.88, 0.96, 1.0);
    mat.emissive = new pc.Color(0.65, 0.88, 0.95);
    mat.opacity = 0.78;
    mat.blendType = pc.BLEND_NORMAL;
    mat.depthWrite = false;
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
      duration: 0.65,
      initialScale: 0.1
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
    mat.depthWrite = false;
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

  private createMistInstance(): MistParticle {
    const entity = new pc.Entity('PooledMist');
    entity.addComponent('render', { type: 'plane' });
    entity.setLocalScale(0.4, 1.0, 0.4);

    const mistTex = EffectManager.getMistTexture(this.app.graphicsDevice);

    const mat = new pc.StandardMaterial();
    mat.diffuse = new pc.Color(0.92, 0.97, 1.0);
    mat.diffuseMap = mistTex;
    mat.opacityMap = mistTex;
    mat.opacityMapChannel = 'a';
    mat.opacity = 0.45;
    mat.blendType = pc.BLEND_NORMAL;
    mat.depthWrite = false;
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
      velocity: new pc.Vec3(),
      age: 0,
      duration: 0.9,
      startScale: 0.4,
      targetScale: 1.4
    };
  }

  // ====================================================
  // BEHAVIORAL PARTICLE SPAWNERS
  // ====================================================

  /**
   * 1. Fish jumping splash:
   * Emits a soft circular expanding ripple + 6 arcing translucent water droplets.
   */
  public spawnFishSplash(pos: pc.Vec3, scale: number = 1.5): void {
    // 1A. Soft expanding ripple ring on water surface
    const ring = this.ringPool.get();
    ring.age = 0;
    ring.duration = 0.75;
    ring.startScale = 0.3 * scale;
    ring.targetScale = 1.35 * scale;
    ring.entity.setPosition(pos.x, 0.035, pos.z);
    ring.entity.setLocalScale(ring.startScale, 1.0, ring.startScale);
    ring.material.opacity = 0.85;
    ring.material.update();
    ring.entity.enabled = true;
    this.activeRings.push(ring);

    // 1B. Arcing water droplets (translucent beads shooting up and falling back)
    const dropCount = 6;
    for (let i = 0; i < dropCount; i++) {
      const drop = this.dropletPool.get();
      drop.age = 0;
      drop.duration = 0.55 + Math.random() * 0.3;
      drop.initialScale = 0.08 + Math.random() * 0.05;

      const angle = (i / dropCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
      const speed = 0.8 + Math.random() * 1.2;
      drop.velocity.set(
        Math.cos(angle) * speed,
        2.2 + Math.random() * 1.4, // Upward initial velocity
        Math.sin(angle) * speed
      );

      drop.entity.setPosition(
        pos.x + (Math.random() - 0.5) * 0.2,
        0.08,
        pos.z + (Math.random() - 0.5) * 0.2
      );
      drop.entity.setLocalScale(drop.initialScale, drop.initialScale, drop.initialScale);
      drop.material.opacity = 0.8;
      drop.material.update();
      drop.entity.enabled = true;
      this.activeDroplets.push(drop);
    }
  }

  /**
   * 2. Boat movement wake:
   * Periodic gentle trailing ripples behind the paper boat stern.
   */
  public spawnBoatWake(sternPos: pc.Vec3, boatSpeed: number): void {
    if (boatSpeed < 1.0) return;

    const ring = this.ringPool.get();
    ring.age = 0;
    ring.duration = 0.65;
    ring.startScale = 0.45;
    ring.targetScale = 1.4;
    ring.entity.setPosition(sternPos.x, 0.032, sternPos.z);
    ring.entity.setLocalScale(ring.startScale, 1.0, ring.startScale);
    ring.material.opacity = 0.45;
    ring.material.update();
    ring.entity.enabled = true;
    this.activeRings.push(ring);
  }

  /**
   * 3. Small collisions:
   * High-energy burst splash with expanding ring and fast lateral droplets.
   */
  public spawnCollisionSplash(pos: pc.Vec3, intensity: number = 1.0): void {
    const ring = this.ringPool.get();
    ring.age = 0;
    ring.duration = 0.6;
    ring.startScale = 0.5;
    ring.targetScale = 2.2 * intensity;
    ring.entity.setPosition(pos.x, 0.038, pos.z);
    ring.entity.setLocalScale(ring.startScale, 1.0, ring.startScale);
    ring.material.opacity = 0.9;
    ring.material.update();
    ring.entity.enabled = true;
    this.activeRings.push(ring);

    const dropCount = Math.floor(8 * intensity);
    for (let i = 0; i < dropCount; i++) {
      const drop = this.dropletPool.get();
      drop.age = 0;
      drop.duration = 0.6 + Math.random() * 0.35;
      drop.initialScale = 0.10 + Math.random() * 0.06;

      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 2.2 * intensity;
      drop.velocity.set(
        Math.cos(angle) * speed,
        2.5 + Math.random() * 2.2,
        Math.sin(angle) * speed
      );

      drop.entity.setPosition(pos.x, 0.1, pos.z);
      drop.entity.setLocalScale(drop.initialScale, drop.initialScale, drop.initialScale);
      drop.material.opacity = 0.85;
      drop.material.update();
      drop.entity.enabled = true;
      this.activeDroplets.push(drop);
    }
  }

  /**
   * 4. River currents / Whirlpools:
   * Gentle surface foam bubbles drifting with current.
   */
  public spawnCurrentBubble(pos: pc.Vec3): void {
    const drop = this.dropletPool.get();
    drop.age = 0;
    drop.duration = 1.2;
    drop.initialScale = 0.06 + Math.random() * 0.04;
    drop.velocity.set((Math.random() - 0.5) * 0.4, 0.05, 0.8 + Math.random() * 0.6);

    drop.entity.setPosition(
      pos.x + (Math.random() - 0.5) * 1.5,
      0.04,
      pos.z + (Math.random() - 0.5) * 1.5
    );
    drop.entity.setLocalScale(drop.initialScale, drop.initialScale, drop.initialScale);
    drop.material.opacity = 0.6;
    drop.material.update();
    drop.entity.enabled = true;
    this.activeDroplets.push(drop);
  }

  /**
   * 5. Waterfall splashes:
   * Upward-rising translucent mist puffs and cascading droplets.
   */
  public spawnWaterfallSplashes(pos: pc.Vec3): void {
    // Mist puff
    const mist = this.mistPool.get();
    mist.age = 0;
    mist.duration = 0.95;
    mist.startScale = 0.6;
    mist.targetScale = 2.2;
    mist.velocity.set(
      (Math.random() - 0.5) * 0.8,
      0.8 + Math.random() * 0.6,
      (Math.random() - 0.5) * 0.8
    );
    mist.entity.setPosition(
      pos.x + (Math.random() - 0.5) * 1.2,
      0.15,
      pos.z + (Math.random() - 0.5) * 1.2
    );
    mist.material.opacity = 0.4;
    mist.material.update();
    mist.entity.enabled = true;
    this.activeMist.push(mist);

    // Cascading droplets
    for (let i = 0; i < 4; i++) {
      const drop = this.dropletPool.get();
      drop.age = 0;
      drop.duration = 0.6 + Math.random() * 0.4;
      drop.initialScale = 0.12;
      drop.velocity.set(
        (Math.random() - 0.5) * 2.0,
        1.8 + Math.random() * 1.8,
        (Math.random() - 0.5) * 2.0
      );
      drop.entity.setPosition(pos.x, 0.2, pos.z);
      drop.entity.setLocalScale(drop.initialScale, drop.initialScale, drop.initialScale);
      drop.material.opacity = 0.75;
      drop.material.update();
      drop.entity.enabled = true;
      this.activeDroplets.push(drop);
    }
  }

  /**
   * Standard legacy spawnSplash (fully backward compatible with checkpoints, finish gates, etc.)
   */
  public spawnSplash(pos: pc.Vec3, scale: number = 1.8): void {
    this.spawnFishSplash(pos, scale);
  }

  /**
   * Collectible sparkle burst.
   */
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

  /**
   * Level complete confetti burst.
   */
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

  // ====================================================
  // SIMULATION UPDATE LOOP
  // ====================================================

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
        // Smooth ease-out expansion
        const ease = 1.0 - Math.pow(1.0 - t, 2.5);
        const currentScale = ring.startScale + (ring.targetScale - ring.startScale) * ease;
        ring.entity.setLocalScale(currentScale, 1.0, currentScale);
        ring.material.opacity = (1.0 - t) * 0.85;
        ring.material.update();
      }
    }

    // 2. Update Water Droplets (Ballistic gravity arc)
    const gravity = -8.5;
    for (let i = this.activeDroplets.length - 1; i >= 0; i--) {
      const drop = this.activeDroplets[i];
      drop.age += dt;
      const t = drop.age / drop.duration;

      if (t >= 1.0) {
        this.activeDroplets.splice(i, 1);
        this.dropletPool.release(drop);
      } else {
        drop.velocity.y += gravity * dt;
        const p = drop.entity.getPosition();
        const nextY = p.y + drop.velocity.y * dt;

        // If droplet hits water level, gently dissolve
        if (nextY <= 0.03 && drop.velocity.y < 0) {
          this.activeDroplets.splice(i, 1);
          this.dropletPool.release(drop);
          continue;
        }

        drop.entity.setPosition(
          p.x + drop.velocity.x * dt,
          nextY,
          p.z + drop.velocity.z * dt
        );

        const currentScale = drop.initialScale * (1.0 - t * 0.4);
        drop.entity.setLocalScale(currentScale, currentScale, currentScale);
        drop.material.opacity = (1.0 - t) * 0.8;
      }
    }

    // 3. Update Mist Puffs
    for (let i = this.activeMist.length - 1; i >= 0; i--) {
      const mist = this.activeMist[i];
      mist.age += dt;
      const t = mist.age / mist.duration;

      if (t >= 1.0) {
        this.activeMist.splice(i, 1);
        this.mistPool.release(mist);
      } else {
        const p = mist.entity.getPosition();
        mist.entity.setPosition(
          p.x + mist.velocity.x * dt,
          p.y + mist.velocity.y * dt,
          p.z + mist.velocity.z * dt
        );

        const currentScale = mist.startScale + (mist.targetScale - mist.startScale) * t;
        mist.entity.setLocalScale(currentScale, 1.0, currentScale);
        mist.material.opacity = (1.0 - t) * 0.45;
        mist.material.update();
      }
    }

    // 4. Update Sparkles
    const sparkleGrav = -6.5;
    for (let i = this.activeSparkles.length - 1; i >= 0; i--) {
      const s = this.activeSparkles[i];
      s.age += dt;
      const t = s.age / s.duration;

      if (t >= 1.0) {
        this.activeSparkles.splice(i, 1);
        this.sparklePool.release(s);
      } else {
        s.velocity.y += sparkleGrav * dt;
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
    for (const r of this.activeRings) this.ringPool.release(r);
    this.activeRings = [];

    for (const d of this.activeDroplets) this.dropletPool.release(d);
    this.activeDroplets = [];

    for (const m of this.activeMist) this.mistPool.release(m);
    this.activeMist = [];

    for (const s of this.activeSparkles) this.sparklePool.release(s);
    this.activeSparkles = [];
  }

  public destroy(): void {
    this.clear();
    this.rootEntity.destroy();
  }
}

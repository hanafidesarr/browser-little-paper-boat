import * as pc from 'playcanvas';

export type WeatherType = 'sunny' | 'rain' | 'autumn_leaves' | 'fireflies' | 'mist';

interface ParticleData {
  entity: pc.Entity;
  speed: pc.Vec3;
  seed: number;
  flutterSpeed?: number;
  swayAmp?: number;
}

export class WeatherEffects {
  private app: pc.AppBase;
  private rootEntity: pc.Entity;
  private weatherType: WeatherType = 'sunny';
  private particleData: ParticleData[] = [];

  // Static cached assets for zero-allocation performance
  private static leafMesh: pc.Mesh | null = null;
  private static leafMaterials: pc.StandardMaterial[] = [];

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
    } else {
      // Sunny: gentle floating golden pollen and dandelion seeds
      this.initPollenAndSeeds(targetPos);
    }
  }

  /**
   * Procedural 3D botanical leaf mesh with midrib crease, curved blade profile, and stem.
   */
  private static getLeafMesh(device: pc.GraphicsDevice): pc.Mesh {
    if (this.leafMesh) return this.leafMesh;

    const segments = 6;
    const length = 0.45;
    const maxWidth = 0.26;

    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    // Midrib vertices and left/right curved leaf margins
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const z = (t - 0.25) * length;
      const width = Math.sin(t * Math.PI) * (1.0 - 0.22 * t) * (maxWidth * 0.5);

      // Midrib vertex (slightly dipped for authentic botanical V-shaped crease)
      const yCenter = 0.0;
      // Edge vertices raised slightly for 3D cupped leaf form
      const yEdge = Math.sin(t * Math.PI) * 0.038;

      // 3 vertices per slice:
      // Left edge
      positions.push(-width, yEdge, z);
      normals.push(0.35, 0.92, 0.05);
      uvs.push(0.0, t);

      // Center midrib
      positions.push(0, yCenter, z);
      normals.push(0.0, 1.0, 0.0);
      uvs.push(0.5, t);

      // Right edge
      positions.push(width, yEdge, z);
      normals.push(-0.35, 0.92, 0.05);
      uvs.push(1.0, t);

      if (i < segments) {
        const row = i * 3;
        const next = (i + 1) * 3;

        // Left quad: (L0, C0, C1) & (L0, C1, L1)
        indices.push(row, row + 1, next + 1);
        indices.push(row, next + 1, next);

        // Right quad: (C0, R0, R1) & (C0, R1, C1)
        indices.push(row + 1, row + 2, next + 2);
        indices.push(row + 1, next + 2, next + 1);
      }
    }

    // Slender leaf stem (petiole) extending out from base
    const stemBaseIdx = positions.length / 3;
    const stemZ = -0.25 * length - 0.10;
    positions.push(-0.012, -0.005, stemZ);
    normals.push(0, 1, 0);
    uvs.push(0.45, 0);

    positions.push(0.012, -0.005, stemZ);
    normals.push(0, 1, 0);
    uvs.push(0.55, 0);

    // Triangulate stem into base midrib vertex (index 1)
    indices.push(stemBaseIdx, stemBaseIdx + 1, 1);

    const mesh = new pc.Mesh(device);
    mesh.clear(true, false);
    mesh.setPositions(positions);
    mesh.setNormals(normals);
    mesh.setUvs(0, uvs);
    mesh.setIndices(indices);
    mesh.update(pc.PRIMITIVE_TRIANGLES);

    this.leafMesh = mesh;
    return mesh;
  }

  /**
   * Autumn foliage color palette (Scarlet Maple, Golden Amber, Russet Orange, Autumn Ochre)
   */
  private static getLeafMaterials(): pc.StandardMaterial[] {
    if (this.leafMaterials.length > 0) return this.leafMaterials;

    const colors = [
      new pc.Color(0.86, 0.22, 0.12), // Scarlet Maple
      new pc.Color(0.95, 0.56, 0.08), // Golden Amber
      new pc.Color(0.80, 0.38, 0.06), // Russet Orange
      new pc.Color(0.82, 0.68, 0.14)  // Autumn Ochre
    ];

    for (const c of colors) {
      const mat = new pc.StandardMaterial();
      mat.diffuse = c;
      mat.ambient = new pc.Color(c.r * 0.4, c.g * 0.4, c.b * 0.4);
      mat.specular = new pc.Color(0.25, 0.25, 0.25);
      mat.shininess = 32;
      mat.cull = pc.CULLFACE_NONE; // Double-sided leaf rendering
      mat.update();
      this.leafMaterials.push(mat);
    }

    return this.leafMaterials;
  }

  private initFallingLeaves(center: pc.Vec3): void {
    const mesh = WeatherEffects.getLeafMesh(this.app.graphicsDevice);
    const materials = WeatherEffects.getLeafMaterials();

    const leafCount = 24; // Optimized leaf count for high-performance 60fps rendering
    for (let i = 0; i < leafCount; i++) {
      const leaf = new pc.Entity(`AutumnLeaf_${i}`);
      const mat = materials[i % materials.length];

      leaf.addComponent('render', {
        meshInstances: [new pc.MeshInstance(mesh, mat)]
      });

      const s = 0.85 + Math.random() * 0.45;
      leaf.setLocalScale(s, s, s);

      const px = center.x + (Math.random() - 0.5) * 22;
      const py = center.y + 2.5 + Math.random() * 7.5;
      const pz = center.z + (Math.random() - 0.5) * 22;
      leaf.setPosition(px, py, pz);

      this.rootEntity.addChild(leaf);
      this.particleData.push({
        entity: leaf,
        speed: new pc.Vec3(
          (Math.random() - 0.5) * 0.8,
          -(0.75 + Math.random() * 0.45), // Gentle realistic glide descent
          0.6 + Math.random() * 0.6
        ),
        seed: Math.random() * 100,
        flutterSpeed: 2.2 + Math.random() * 1.5,
        swayAmp: 0.6 + Math.random() * 0.5
      });
    }
  }

  private initPollenAndSeeds(center: pc.Vec3): void {
    const seedMat = new pc.StandardMaterial();
    seedMat.diffuse = new pc.Color(1.0, 0.96, 0.75);
    seedMat.emissive = new pc.Color(0.85, 0.80, 0.50);
    seedMat.opacity = 0.75;
    seedMat.blendType = pc.BLEND_ADDITIVE;
    seedMat.update();

    for (let i = 0; i < 24; i++) {
      const mote = new pc.Entity('SunMote');
      mote.addComponent('render', { type: 'sphere' });
      mote.setLocalScale(0.12, 0.12, 0.12);
      if (mote.render?.meshInstances[0]) mote.render.meshInstances[0].material = seedMat;

      const px = center.x + (Math.random() - 0.5) * 24;
      const py = center.y + 0.5 + Math.random() * 4.0;
      const pz = center.z + (Math.random() - 0.5) * 24;
      mote.setPosition(px, py, pz);

      this.rootEntity.addChild(mote);
      this.particleData.push({
        entity: mote,
        speed: new pc.Vec3((Math.random() - 0.5) * 0.3, -(0.12 + Math.random() * 0.18), 0.5 + Math.random() * 0.4),
        seed: Math.random() * 100
      });
    }
  }

  private initRain(center: pc.Vec3): void {
    const rainMat = new pc.StandardMaterial();
    rainMat.diffuse = new pc.Color(0.85, 0.92, 1.0);
    rainMat.opacity = 0.55;
    rainMat.blendType = pc.BLEND_NORMAL;
    rainMat.update();

    for (let i = 0; i < 32; i++) {
      const drop = new pc.Entity('RainDrop');
      drop.addComponent('render', { type: 'cylinder' });
      drop.setLocalScale(0.02, 0.8, 0.02);
      if (drop.render?.meshInstances[0]) drop.render.meshInstances[0].material = rainMat;

      const px = center.x + (Math.random() - 0.5) * 28;
      const py = center.y + 2 + Math.random() * 10;
      const pz = center.z + (Math.random() - 0.5) * 28;
      drop.setPosition(px, py, pz);

      this.rootEntity.addChild(drop);
      this.particleData.push({
        entity: drop,
        speed: new pc.Vec3((Math.random() - 0.5) * 0.4, -(11 + Math.random() * 3), 0.8),
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

    for (let i = 0; i < 24; i++) {
      const fly = new pc.Entity('Firefly');
      fly.addComponent('render', { type: 'sphere' });
      fly.setLocalScale(0.11, 0.11, 0.11);
      if (fly.render?.meshInstances[0]) fly.render.meshInstances[0].material = glowMat;

      const px = center.x + (Math.random() - 0.5) * 20;
      const py = center.y + 0.4 + Math.random() * 3.0;
      const pz = center.z + (Math.random() - 0.5) * 20;
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
    const fx = focusPos.x;
    const fy = focusPos.y;
    const fz = focusPos.z;

    for (let i = 0; i < this.particleData.length; i++) {
      const p = this.particleData[i];
      const pos = p.entity.getPosition();
      let nx = pos.x;
      let ny = pos.y;
      let nz = pos.z;

      if (this.weatherType === 'autumn_leaves') {
        const flutter = p.flutterSpeed ?? 2.5;
        const t = time * flutter + p.seed;

        // Realistic aerodynamic leaf fluttering:
        // Harmonic pitch rocking, side roll tipping, and yaw drifting
        const pitch = Math.sin(t * 1.8) * 32;
        const roll = Math.cos(t * 1.35) * 44;
        const yaw = (time * 35 + p.seed * 48) % 360;
        p.entity.setEulerAngles(pitch, yaw, roll);

        // Lateral sway glide with wind
        const sway = p.swayAmp ?? 0.6;
        nx += Math.sin(t * 1.1) * dt * sway + p.speed.x * dt;
        ny += p.speed.y * dt;
        nz += (p.speed.z + Math.cos(t * 0.8) * 0.25) * dt;

        // Reset when fallen near water surface or drifted out of view
        const dx = nx - fx;
        const dz = nz - fz;
        if (ny < fy - 0.15 || (dx * dx + dz * dz) > 480) {
          nx = fx + (Math.random() - 0.5) * 22;
          ny = fy + 5.5 + Math.random() * 5.0;
          nz = fz + (Math.random() - 0.5) * 22;
        }

      } else if (this.weatherType === 'fireflies') {
        // Organic wandering motion
        const s = p.seed;
        nx += Math.sin(time * 1.2 + s) * 0.03;
        ny += Math.cos(time * 0.9 + s * 2) * 0.02;
        nz += Math.sin(time * 0.7 + s * 3) * 0.03;

        // Fast squared distance check to keep near boat
        const dx = nx - fx;
        const dz = nz - fz;
        if ((dx * dx + dz * dz) > 324) {
          nx = fx + (Math.random() - 0.5) * 16;
          ny = fy + 0.4 + Math.random() * 2.8;
          nz = fz + (Math.random() - 0.5) * 16;
        }

      } else {
        // Rain & Sunny motes
        nx += p.speed.x * dt;
        ny += p.speed.y * dt;
        nz += p.speed.z * dt;

        const dx = nx - fx;
        const dz = nz - fz;
        if (ny < fy - 0.2 || (dx * dx + dz * dz) > 480) {
          nx = fx + (Math.random() - 0.5) * 22;
          ny = fy + 6.5 + Math.random() * 4;
          nz = fz + (Math.random() - 0.5) * 22;
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

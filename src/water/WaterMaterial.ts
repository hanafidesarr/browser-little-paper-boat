import * as pc from 'playcanvas';

export class WaterMaterial {
  private static waterTexture: pc.Texture | null = null;
  private static rippleNormalTexture: pc.Texture | null = null;
  private static foamTexture: pc.Texture | null = null;

  /**
   * Generates a crystal-clear (soft blue bening) river caustics texture with organic cellular web patterns.
   * Color direction:
   * - Shallow water: #B9E8F2
   * - Normal water: #8BD3E8
   * - Deep water: #65B9D8
   * - Surface highlights: #E5FAFF
   * - Wave highlights: #D5F5FA
   */
  public static getCausticTexture(device: pc.GraphicsDevice): pc.Texture {
    if (this.waterTexture) return this.waterTexture;

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // 1. Soft Blue Crystal-Clear Depth Gradient (translucent so riverbed is clearly visible)
    // Reference Colors: Shallow #B9E8F2 | Normal #8BD3E8 | Deep #65B9D8
    const bgGrad = ctx.createLinearGradient(0, 0, size, size);
    bgGrad.addColorStop(0.0, 'rgba(101, 185, 216, 0.68)'); // #65B9D8 Deep water
    bgGrad.addColorStop(0.5, 'rgba(139, 211, 232, 0.56)'); // #8BD3E8 Normal water
    bgGrad.addColorStop(1.0, 'rgba(185, 232, 242, 0.44)'); // #B9E8F2 Shallow water
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, size, size);

    // 2. Organic Non-Repeating Cellular Caustics (multi-scale organic curves, zero grid repetition)
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Seeded pseudo-random generator for deterministic non-grid organic caustics
    let seed = 4289;
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    // Primary wave highlight bands (#D5F5FA soft translucent ribbon)
    ctx.strokeStyle = 'rgba(215, 245, 252, 0.35)';
    ctx.lineWidth = 4.8;
    for (let i = 0; i < 38; i++) {
      const x1 = rnd() * size;
      const y1 = rnd() * size;
      const x2 = (x1 + (rnd() - 0.5) * 140 + size) % size;
      const y2 = (y1 + (rnd() - 0.5) * 140 + size) % size;
      const cx = (x1 + x2) * 0.5 + (rnd() - 0.5) * 50;
      const cy = (y1 + y2) * 0.5 + (rnd() - 0.5) * 50;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(cx, cy, x2, y2);
      ctx.stroke();
    }

    // Secondary delicate surface highlight threads (#E5FAFF)
    ctx.strokeStyle = 'rgba(235, 252, 255, 0.25)';
    ctx.lineWidth = 2.4;
    for (let j = 0; j < 52; j++) {
      const cx = rnd() * size;
      const cy = rnd() * size;
      const r = 14 + rnd() * 32;
      const startAngle = rnd() * Math.PI * 2;
      const endAngle = startAngle + Math.PI * (0.8 + rnd() * 0.8);

      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.stroke();
    }

    // 3. Delicate Sunlight Sparkling Glimmers (subtle sparkling highlights when sunlight hits water)
    for (let k = 0; k < 42; k++) {
      const gx = rnd() * size;
      const gy = rnd() * size;
      const gr = 1.2 + rnd() * 1.8;
      const sparkleGrad = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr * 2.5);
      sparkleGrad.addColorStop(0.0, 'rgba(229, 250, 255, 0.35)'); // #E5FAFF
      sparkleGrad.addColorStop(1.0, 'rgba(229, 250, 255, 0.0)');
      ctx.fillStyle = sparkleGrad;
      ctx.beginPath();
      ctx.arc(gx, gy, gr * 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new pc.Texture(device, {
      width: size,
      height: size,
      format: pc.PIXELFORMAT_RGBA8,
      addressU: pc.ADDRESS_REPEAT,
      addressV: pc.ADDRESS_REPEAT,
      minFilter: pc.FILTER_LINEAR_MIPMAP_LINEAR,
      magFilter: pc.FILTER_LINEAR,
      mipmaps: true
    });
    texture.setSource(canvas);

    this.waterTexture = texture;
    return texture;
  }

  /**
   * Generates a high-density, multi-octave normal map with authentic rolling wave swells (gelombang ombak).
   * Combines primary Gerstner-style rolling swells, crossing diagonal waves, surface chop, and micro-ripples.
   */
  public static getRippleNormalTexture(device: pc.GraphicsDevice): pc.Texture {
    if (this.rippleNormalTexture) return this.rippleNormalTexture;

    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const u = (x / size) * Math.PI * 2;
        const v = (y / size) * Math.PI * 2;

        // Wave Harmonics for authentic rolling waves (gelombang ombak):
        // 1. Primary rolling river wave swells (peaked crests along current)
        const wavePhase1 = v * 3.5 + u * 1.5;
        const dX1 = (Math.sin(wavePhase1) - 0.28 * Math.cos(wavePhase1 * 2.0)) * 0.48;
        const dY1 = (Math.cos(wavePhase1) + 0.28 * Math.sin(wavePhase1 * 2.0)) * 0.58;

        // 2. Secondary diagonal crossing wave swells (gelombang silang)
        const wavePhase2 = u * 4.8 - v * 3.2 + 1.2;
        const dX2 = Math.sin(wavePhase2) * 0.32;
        const dY2 = Math.cos(wavePhase2) * 0.28;

        // 3. Surface chop / medium waves
        const dX3 = Math.cos(u * 9.6 + v * 8.2) * 0.20;
        const dY3 = Math.sin(u * 8.4 - v * 10.6) * 0.20;

        // 4. Fine capillary micro-ripples
        const dX4 = Math.sin(u * 18.0 - v * 16.0) * 0.12;
        const dY4 = Math.cos(u * 16.0 + v * 18.0) * 0.12;

        const nx = dX1 + dX2 + dX3 + dX4;
        const ny = dY1 + dY2 + dY3 + dY4;
        const nz = 1.0;

        const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
        data[idx + 0] = Math.floor(((nx / len) * 0.5 + 0.5) * 255);
        data[idx + 1] = Math.floor(((ny / len) * 0.5 + 0.5) * 255);
        data[idx + 2] = Math.floor(((nz / len) * 0.5 + 0.5) * 255);
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);

    const texture = new pc.Texture(device, {
      width: size,
      height: size,
      format: pc.PIXELFORMAT_RGBA8,
      addressU: pc.ADDRESS_REPEAT,
      addressV: pc.ADDRESS_REPEAT,
      minFilter: pc.FILTER_LINEAR_MIPMAP_LINEAR,
      magFilter: pc.FILTER_LINEAR,
      mipmaps: true
    });
    texture.setSource(canvas);

    this.rippleNormalTexture = texture;
    return texture;
  }

  /**
   * Generates a soft shoreline foam texture for water edges and rock boundaries.
   */
  public static getFoamTexture(device: pc.GraphicsDevice): pc.Texture {
    if (this.foamTexture) return this.foamTexture;

    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, size, size);

    // Soft bubbly foam cluster
    ctx.fillStyle = 'rgba(255, 255, 255, 0.70)';
    for (let i = 0; i < 95; i++) {
      const cx = (i * 29) % size;
      const cy = (i * 41) % size;
      const r = 3 + (i % 12);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Connective foam lace webs
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.40)';
    ctx.lineWidth = 2.8;
    for (let j = 0; j < 36; j++) {
      ctx.beginPath();
      ctx.arc((j * 37) % size, (j * 43) % size, 18, 0, Math.PI * 1.6);
      ctx.stroke();
    }

    const texture = new pc.Texture(device, {
      width: size,
      height: size,
      format: pc.PIXELFORMAT_RGBA8,
      addressU: pc.ADDRESS_REPEAT,
      addressV: pc.ADDRESS_REPEAT,
      minFilter: pc.FILTER_LINEAR,
      magFilter: pc.FILTER_LINEAR
    });
    texture.setSource(canvas);

    this.foamTexture = texture;
    return texture;
  }

  /**
   * Creates crystal-clear (Soft Blue bening) water material with authentic rolling waves (gelombang ombak)
   * and non-repeating dual-speed incommensurate UV animation (optimized for 60 FPS mobile).
   * Reference Colors:
   * Shallow: #B9E8F2 | Normal: #8BD3E8 | Deep: #65B9D8 | Highlights: #E5FAFF & #D5F5FA
   */
  public static create(
    device: pc.GraphicsDevice,
    tint: pc.Color = new pc.Color(0.545, 0.827, 0.910), // #8BD3E8 Soft Blue
    opacity: number = 0.38 // Soft Blue Crystal-Clear water transparency
  ): { material: pc.StandardMaterial; update: (dt: number, speed: number) => void } {
    const material = new pc.StandardMaterial();
    const diffuseTex = this.getCausticTexture(device);
    const normalTex = this.getRippleNormalTexture(device);

    material.diffuse = tint;
    material.ambient = new pc.Color(0.48, 0.76, 0.88); // Soft blue ambient light (preserves clear blue tone without blowing out to white)
    material.emissive = new pc.Color(0.06, 0.18, 0.26); // Subtle aquatic radiance

    // Primary diffuse caustic map (incommensurate irrational tiling)
    material.diffuseMap = diffuseTex;
    material.diffuseMapTiling = new pc.Vec2(1.73, 4.19);
    material.diffuseMapOffset = new pc.Vec2(0, 0);

    // Multi-octave rolling wave swells normal map (non-harmonic irrational tiling)
    material.normalMap = normalTex;
    material.normalMapTiling = new pc.Vec2(3.37, 8.63);
    material.normalMapOffset = new pc.Vec2(0, 0);
    material.bumpiness = 0.38; // Soft natural wave crests without harsh glare

    // Gentle sunlight highlights (#FFE5A3 & #E5FAFF tone response)
    material.specular = new pc.Color(0.14, 0.18, 0.22);
    material.shininess = 28;
    material.opacity = opacity;
    material.blendType = pc.BLEND_NORMAL;
    material.cull = pc.CULLFACE_NONE;
    material.update();

    let offsetV1 = 0;
    let offsetU1 = 0;
    let offsetV2 = 0;
    let offsetU2 = 0;

    const update = (dt: number, flowSpeed: number) => {
      // Layer 1 (Caustic map): flows along river at base speed, drifts right
      offsetV1 = (offsetV1 - dt * flowSpeed * 0.058) % 100.0;
      offsetU1 = (offsetU1 + dt * 0.016) % 100.0;

      // Layer 2 (Wave swells normal map): flows faster at non-harmonic rate, drifts left
      offsetV2 = (offsetV2 - dt * flowSpeed * 0.091) % 100.0;
      offsetU2 = (offsetU2 - dt * 0.024) % 100.0;

      material.diffuseMapOffset.x = offsetU1;
      material.diffuseMapOffset.y = offsetV1;

      // Interlocking wave interference pattern continuously breaks texture repetition
      material.normalMapOffset.x = offsetU2;
      material.normalMapOffset.y = offsetV2;

      material.update();
    };

    return { material, update };
  }
}

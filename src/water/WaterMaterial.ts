import * as pc from 'playcanvas';

export class WaterMaterial {
  private static waterTexture: pc.Texture | null = null;
  private static rippleNormalTexture: pc.Texture | null = null;
  private static foamTexture: pc.Texture | null = null;

  /**
   * Generates a seamless soft-blue river caustics & wave highlight texture.
   * Color direction:
   * - Base soft blue: rgba(139, 211, 232, 0.82) (#8BD3E8)
   * - Wave crest ribbons: rgba(215, 245, 252, 0.45) (#D5F5FA)
   * - Sunlight sparkle glimmers: rgba(235, 252, 255, 0.55) (#E5FAFF)
   */
  public static getCausticTexture(device: pc.GraphicsDevice): pc.Texture {
    if (this.waterTexture) return this.waterTexture;

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // 1. Uniform Seamless Soft Blue Base (#8BD3E8)
    // Translucent soft blue volume so water has authentic color while clearly revealing riverbed beneath
    ctx.fillStyle = 'rgba(125, 205, 228, 0.60)';
    ctx.fillRect(0, 0, size, size);

    // 2. Seamless Multi-Scale Organic Wave Caustic Curves (Subtle aquatic highlights, no white cloud blowout)
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    let seed = 4289;
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    // Helper to draw toroidal seamless strokes across all boundaries
    const drawSeamlessCurve = (
      x1: number, y1: number,
      cx: number, cy: number,
      x2: number, y2: number
    ) => {
      const offsets = [
        [0, 0], [-size, 0], [size, 0],
        [0, -size], [0, size],
        [-size, -size], [size, -size], [-size, size], [size, size]
      ];
      for (const [ox, oy] of offsets) {
        ctx.beginPath();
        ctx.moveTo(x1 + ox, y1 + oy);
        ctx.quadraticCurveTo(cx + ox, cy + oy, x2 + ox, y2 + oy);
        ctx.stroke();
      }
    };

    // Helper to draw toroidal seamless arcs
    const drawSeamlessArc = (
      cx: number, cy: number,
      r: number,
      startAngle: number,
      endAngle: number
    ) => {
      const offsets = [
        [0, 0], [-size, 0], [size, 0],
        [0, -size], [0, size],
        [-size, -size], [size, -size], [-size, size], [size, size]
      ];
      for (const [ox, oy] of offsets) {
        ctx.beginPath();
        ctx.arc(cx + ox, cy + oy, r, startAngle, endAngle);
        ctx.stroke();
      }
    };

    // Primary delicate aquatic wave highlight bands (subtle soft turquoise, no harsh white cloud patches)
    ctx.strokeStyle = 'rgba(180, 235, 248, 0.18)';
    ctx.lineWidth = 2.4;
    for (let i = 0; i < 28; i++) {
      const x1 = rnd() * size;
      const y1 = rnd() * size;
      const x2 = x1 + (rnd() - 0.5) * 110;
      const y2 = y1 + (rnd() - 0.5) * 110;
      const cx = (x1 + x2) * 0.5 + (rnd() - 0.5) * 35;
      const cy = (y1 + y2) * 0.5 + (rnd() - 0.5) * 35;

      drawSeamlessCurve(x1, y1, cx, cy, x2, y2);
    }

    // Secondary delicate surface ripple threads (translucent aquatic shimmer)
    ctx.strokeStyle = 'rgba(195, 242, 252, 0.12)';
    ctx.lineWidth = 1.4;
    for (let j = 0; j < 36; j++) {
      const cx = rnd() * size;
      const cy = rnd() * size;
      const r = 14 + rnd() * 24;
      const startAngle = rnd() * Math.PI * 2;
      const endAngle = startAngle + Math.PI * (0.8 + rnd() * 0.8);

      drawSeamlessArc(cx, cy, r, startAngle, endAngle);
    }

    // 3. Very subtle soft sparkling points
    for (let k = 0; k < 24; k++) {
      const gx = rnd() * size;
      const gy = rnd() * size;
      const gr = 0.8 + rnd() * 1.2;
      const sparkleGrad = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr * 2.0);
      sparkleGrad.addColorStop(0.0, 'rgba(215, 245, 255, 0.16)');
      sparkleGrad.addColorStop(1.0, 'rgba(215, 245, 255, 0.0)');
      ctx.fillStyle = sparkleGrad;

      const offsets = [
        [0, 0], [-size, 0], [size, 0],
        [0, -size], [0, size]
      ];
      for (const [ox, oy] of offsets) {
        ctx.beginPath();
        ctx.arc(gx + ox, gy + oy, gr * 2.0, 0, Math.PI * 2);
        ctx.fill();
      }
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
        // Broad, natural wavelengths for a peaceful, flowing river feel
        // 1. Primary gentle rolling river wave swells (along current)
        const wavePhase1 = v * 1.0 + u * 1.0;
        const dX1 = (Math.sin(wavePhase1) - 0.20 * Math.cos(wavePhase1 * 2.0)) * 0.45;
        const dY1 = (Math.cos(wavePhase1) + 0.20 * Math.sin(wavePhase1 * 2.0)) * 0.55;

        // 2. Secondary diagonal crossing gentle swells
        const wavePhase2 = u * 2.0 - v * 1.0;
        const dX2 = Math.sin(wavePhase2) * 0.28;
        const dY2 = Math.cos(wavePhase2) * 0.25;

        // 3. Subtle undulating water ripples
        const dX3 = Math.cos(u * 2.0 + v * 2.0) * 0.16;
        const dY3 = Math.sin(u * 3.0 - v * 2.0) * 0.16;

        // 4. Fine gentle micro-highlights
        const dX4 = Math.sin(u * 4.0 - v * 4.0) * 0.10;
        const dY4 = Math.cos(u * 4.0 + v * 4.0) * 0.10;

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
   * Creates soft-blue water material with visible wave animation (animasi gelombang air)
   * and balanced translucency (air sedikit transparent).
   * Reference Colors:
   * Shallow: #B9E8F2 | Normal: #8BD3E8 | Deep: #65B9D8 | Highlights: #E5FAFF & #D5F5FA
   */
  public static create(
    device: pc.GraphicsDevice,
    tint: pc.Color = new pc.Color(0.545, 0.827, 0.910), // #8BD3E8 Soft Blue
    opacity: number = 0.58 // Sedikit transparent (semi-translucent with visible riverbed beneath)
  ): { material: pc.StandardMaterial; update: (dt: number, speed: number) => void } {
    const material = new pc.StandardMaterial();
    const diffuseTex = this.getCausticTexture(device);
    const normalTex = this.getRippleNormalTexture(device);

    material.diffuse = tint
      ? new pc.Color(tint.r * 0.55, tint.g * 0.65, tint.b * 0.72)
      : new pc.Color(0.28, 0.54, 0.68);
    material.ambient = new pc.Color(0.18, 0.36, 0.46); // Calibrated aquatic ambient (prevents RGB blowout)
    material.emissive = new pc.Color(0.02, 0.08, 0.12); // Subtle aquatic radiance

    // Primary diffuse caustic map (natural scale across river width)
    material.diffuseMap = diffuseTex;
    material.diffuseMapTiling = new pc.Vec2(1.0, 2.0);
    material.diffuseMapOffset = new pc.Vec2(0, 0);

    // Multi-octave rolling wave swells normal map (gentle river swells)
    material.normalMap = normalTex;
    material.normalMapTiling = new pc.Vec2(1.0, 2.0);
    material.normalMapOffset = new pc.Vec2(0, 0);
    material.bumpiness = 0.38; // Soft liquid surface waves without harsh glare ridges

    // Soft subtle water gleam (eliminates broad white cloud blowout reflection)
    material.specular = new pc.Color(0.08, 0.12, 0.16);
    material.shininess = 72;
    material.opacity = opacity;
    material.blendType = pc.BLEND_NORMAL;
    material.cull = pc.CULLFACE_NONE;
    material.update();

    let offsetV1 = 0;
    let offsetU1 = 0;
    let offsetV2 = 0;
    let offsetU2 = 0;

    const update = (dt: number, flowSpeed: number) => {
      // Layer 1 (Caustic map): flows along river at base speed, drifts gently
      offsetV1 = (offsetV1 - dt * flowSpeed * 0.08) % 10.0;
      offsetU1 = (offsetU1 + dt * 0.02) % 10.0;

      // Layer 2 (Wave swells normal map): flows dynamically along river with wave propagation
      offsetV2 = (offsetV2 - dt * flowSpeed * 0.14) % 10.0;
      offsetU2 = (offsetU2 - dt * 0.035) % 10.0;

      material.diffuseMapOffset.x = offsetU1;
      material.diffuseMapOffset.y = offsetV1;

      // Interlocking wave interference pattern continuously animates rolling wave crests
      material.normalMapOffset.x = offsetU2;
      material.normalMapOffset.y = offsetV2;

      material.update();
    };

    return { material, update };
  }
}

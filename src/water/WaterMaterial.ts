import * as pc from 'playcanvas';

export class WaterMaterial {
  private static waterTexture: pc.Texture | null = null;
  private static rippleNormalTexture: pc.Texture | null = null;
  private static foamTexture: pc.Texture | null = null;

  /**
   * Generates a stylized, high-aesthetic clear river caustics & aquatic gradient texture.
   * Multi-frequency Voronoi-like web cells with soft turquoise-to-cerulean depth gradient.
   */
  public static getCausticTexture(device: pc.GraphicsDevice): pc.Texture {
    if (this.waterTexture) return this.waterTexture;

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // 1. Natural aquatic depth gradient (deep river turquoise to luminous aquamarine)
    const bgGrad = ctx.createLinearGradient(0, 0, size, size);
    bgGrad.addColorStop(0.0, '#1c728d'); // Deep river cerulean
    bgGrad.addColorStop(0.35, '#2691ab'); // Clear flowing turquoise
    bgGrad.addColorStop(0.70, '#31adc4'); // Luminous sunlit aquamarine
    bgGrad.addColorStop(1.0, '#2285a0'); // Gentle river green-blue
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, size, size);

    // 2. Organic layered caustics (sunlight refractions through river surface)
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Primary broad caustic bands
    ctx.strokeStyle = 'rgba(235, 252, 255, 0.45)';
    ctx.lineWidth = 7;
    for (let i = 0; i < 48; i++) {
      const cx = (i * 47) % size;
      const cy = (i * 73) % size;
      const r = 26 + ((i * 23) % 42);

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0.1, Math.PI * 1.55);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx + r * 0.65, cy + r * 0.45, r * 0.8, Math.PI * 0.5, Math.PI * 1.95);
      ctx.stroke();
    }

    // Secondary fine crisp caustic webs
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = 3.5;
    for (let i = 0; i < 64; i++) {
      const cx = (i * 61 + 31) % size;
      const cy = (i * 37 + 19) % size;
      const r = 16 + ((i * 17) % 30);

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0.3, Math.PI * 1.7);
      ctx.stroke();
    }

    // 3. Sunlight sparkling glints (small diamond specks catching afternoon sun)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    for (let j = 0; j < 80; j++) {
      const px = (j * 89) % size;
      const py = (j * 53) % size;
      const pr = 2.5 + (j % 4);
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
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
   * Generates an organic multi-octave normal map for flowing river surface ripples.
   * Combines broad swells, diagonal river flow, and delicate micro-ripples.
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

        // Multi-frequency wave normal synthesis (3 octaves)
        // Octave 1: Longitudinal river flow swell
        const dX1 = Math.sin(u * 4.0 + v * 2.0) * 0.35;
        const dY1 = Math.cos(v * 4.0 - u * 1.5) * 0.35;

        // Octave 2: Diagonal crossing wake wave
        const dX2 = Math.cos(u * 7.0 - v * 5.0) * 0.20;
        const dY2 = Math.sin(u * 5.0 + v * 6.0) * 0.20;

        // Octave 3: Delicate micro-ripple shimmer
        const dX3 = Math.sin(u * 12.0 + v * 10.0) * 0.10;
        const dY3 = Math.cos(u * 10.0 - v * 12.0) * 0.10;

        const nx = dX1 + dX2 + dX3;
        const ny = dY1 + dY2 + dY3;
        const nz = 1.0;

        // Normalize vector into [0, 255] RGB normal map space
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
    ctx.fillStyle = 'rgba(255, 255, 255, 0.80)';
    for (let i = 0; i < 95; i++) {
      const cx = (i * 29) % size;
      const cy = (i * 41) % size;
      const r = 4 + (i % 14);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Connective foam lace webs
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.48)';
    ctx.lineWidth = 3.5;
    for (let j = 0; j < 36; j++) {
      ctx.beginPath();
      ctx.arc((j * 37) % size, (j * 43) % size, 20, 0, Math.PI * 1.6);
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
   * Creates the stylized clear river water material with dual-layer flowing caustics,
   * sunlight specular sparkles, and multi-octave surface normals.
   */
  public static create(
    device: pc.GraphicsDevice,
    tint: pc.Color = new pc.Color(0.22, 0.72, 0.78),
    opacity: number = 0.88
  ): { material: pc.StandardMaterial; update: (dt: number, speed: number) => void } {
    const material = new pc.StandardMaterial();
    const diffuseTex = this.getCausticTexture(device);
    const normalTex = this.getRippleNormalTexture(device);

    material.diffuse = tint;
    material.ambient = new pc.Color(0.18, 0.52, 0.62);

    // Primary diffuse caustic map
    material.diffuseMap = diffuseTex;
    material.diffuseMapTiling = new pc.Vec2(2.5, 7.5);
    material.diffuseMapOffset = new pc.Vec2(0, 0);

    // Multi-octave surface normal ripple map
    material.normalMap = normalTex;
    material.normalMapTiling = new pc.Vec2(3.2, 8.5);
    material.normalMapOffset = new pc.Vec2(0, 0);
    material.bumpiness = 0.22; // Distinct organic water ripples

    // Soft warm sunlight specular highlights
    material.specular = new pc.Color(0.88, 0.96, 1.0);
    material.shininess = 64; // Sparkling sunlight wave crests
    material.opacity = opacity;
    material.blendType = pc.BLEND_NORMAL;
    material.cull = pc.CULLFACE_NONE;
    material.update();

    let offsetV = 0;
    let offsetU = 0;

    const update = (dt: number, flowSpeed: number) => {
      // Primary longitudinal flow along the river spline
      offsetV = (offsetV - dt * flowSpeed * 0.075) % 1.0;
      // Secondary cross-flow diagonal oscillation
      offsetU = (offsetU + dt * 0.018) % 1.0;

      // Phase-differenced scrolling creates organic stretching and reforming waves
      material.diffuseMapOffset.x = offsetU * 0.35;
      material.diffuseMapOffset.y = offsetV;

      material.normalMapOffset.x = -offsetU * 0.55;
      material.normalMapOffset.y = offsetV * 1.25;

      material.update();
    };

    return { material, update };
  }
}

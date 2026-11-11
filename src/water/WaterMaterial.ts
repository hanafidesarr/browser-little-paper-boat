import * as pc from 'playcanvas';

export class WaterMaterial {
  private static waterTexture: pc.Texture | null = null;
  private static rippleNormalTexture: pc.Texture | null = null;
  private static foamTexture: pc.Texture | null = null;

  /**
   * Generates a crystal-clear (bening) river caustics texture.
   * Completely transparent background with gentle soft aquatic caustics.
   * Harsh blinding white glints are completely eliminated.
   */
  public static getCausticTexture(device: pc.GraphicsDevice): pc.Texture {
    if (this.waterTexture) return this.waterTexture;

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // 1. Crystal-clear aquatic gradient (semi-transparent so riverbed is clearly visible)
    const bgGrad = ctx.createLinearGradient(0, 0, size, size);
    bgGrad.addColorStop(0.0, 'rgba(28, 120, 145, 0.30)'); // Soft turquoise depth
    bgGrad.addColorStop(0.5, 'rgba(38, 155, 175, 0.20)'); // Crystalline mid-stream
    bgGrad.addColorStop(1.0, 'rgba(48, 170, 185, 0.15)'); // Clear shallow aqua
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, size, size);

    // 2. Soft subtle watercolor caustics (gentle ripples, NO harsh white glare)
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Primary gentle caustic ripples (soft translucent cyan)
    ctx.strokeStyle = 'rgba(215, 245, 252, 0.20)';
    ctx.lineWidth = 6;
    for (let i = 0; i < 40; i++) {
      const cx = (i * 47) % size;
      const cy = (i * 73) % size;
      const r = 26 + ((i * 23) % 40);

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0.1, Math.PI * 1.5);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx + r * 0.6, cy + r * 0.4, r * 0.75, Math.PI * 0.5, Math.PI * 1.9);
      ctx.stroke();
    }

    // Secondary delicate ripple threads
    ctx.strokeStyle = 'rgba(230, 250, 255, 0.16)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 50; i++) {
      const cx = (i * 61 + 31) % size;
      const cy = (i * 37 + 19) % size;
      const r = 16 + ((i * 17) % 28);

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0.3, Math.PI * 1.6);
      ctx.stroke();
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
   * Generates a high-density, multi-octave normal map for delicate small waves (gelombang kecil).
   * Combines longitudinal ripples, diagonal crossing waves, and fine capillary micro-ripples.
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

        // Wave Harmonics for visible small ripples (gelombang kecil):
        // 1. Longitudinal current ripples
        const dX1 = Math.sin(u * 8.0 + v * 4.0) * 0.42;
        const dY1 = Math.cos(v * 8.0 - u * 3.0) * 0.42;

        // 2. Crossing diagonal small waves (gelombang kecil beriak)
        const dX2 = Math.cos(u * 16.0 - v * 12.0) * 0.28;
        const dY2 = Math.sin(u * 12.0 + v * 14.0) * 0.28;

        // 3. Delicate capillary surface ripples
        const dX3 = Math.sin(u * 28.0 + v * 22.0) * 0.16;
        const dY3 = Math.cos(u * 22.0 - v * 28.0) * 0.16;

        const nx = dX1 + dX2 + dX3;
        const ny = dY1 + dY2 + dY3;
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
   * Creates the crystal-clear (bening) water material with delicate small waves (gelombang kecil)
   * and soft matte lighting with zero harsh glare.
   */
  public static create(
    device: pc.GraphicsDevice,
    tint: pc.Color = new pc.Color(0.25, 0.75, 0.82),
    opacity: number = 0.54 // Crystal-clear bening water transparency
  ): { material: pc.StandardMaterial; update: (dt: number, speed: number) => void } {
    const material = new pc.StandardMaterial();
    const diffuseTex = this.getCausticTexture(device);
    const normalTex = this.getRippleNormalTexture(device);

    material.diffuse = tint;
    material.ambient = new pc.Color(0.20, 0.50, 0.58);

    // Primary diffuse caustic map
    material.diffuseMap = diffuseTex;
    material.diffuseMapTiling = new pc.Vec2(2.5, 7.5);
    material.diffuseMapOffset = new pc.Vec2(0, 0);

    // Multi-octave small ripples (gelombang kecil)
    material.normalMap = normalTex;
    material.normalMapTiling = new pc.Vec2(5.5, 16.0); // Dense small ripples
    material.normalMapOffset = new pc.Vec2(0, 0);
    material.bumpiness = 0.36; // Clearly visible ripples without harsh reflection

    // Toned-down specular: soft matte water with ZERO blinding white glare
    material.specular = new pc.Color(0.04, 0.06, 0.08); // Very soft, gentle reflection
    material.shininess = 16;
    material.opacity = opacity;
    material.blendType = pc.BLEND_NORMAL;
    material.cull = pc.CULLFACE_NONE;
    material.update();

    let offsetV = 0;
    let offsetU = 0;

    const update = (dt: number, flowSpeed: number) => {
      // Primary longitudinal flow along the river spline
      offsetV = (offsetV - dt * flowSpeed * 0.07) % 1.0;
      // Secondary cross-flow diagonal ripple movement (gelombang kecil)
      offsetU = (offsetU + dt * 0.025) % 1.0;

      material.diffuseMapOffset.x = offsetU * 0.3;
      material.diffuseMapOffset.y = offsetV;

      // Small ripples continuously slide and interlock across the surface
      material.normalMapOffset.x = -offsetU * 0.7;
      material.normalMapOffset.y = offsetV * 1.45;

      material.update();
    };

    return { material, update };
  }
}

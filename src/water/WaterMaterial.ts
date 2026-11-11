import * as pc from 'playcanvas';

export class WaterMaterial {
  private static waterTexture: pc.Texture | null = null;
  private static rippleNormalTexture: pc.Texture | null = null;
  private static foamTexture: pc.Texture | null = null;

  /**
   * Generates a stylized hand-painted caustics & water ripple texture.
   */
  public static getCausticTexture(device: pc.GraphicsDevice): pc.Texture {
    if (this.waterTexture) return this.waterTexture;

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // 1. Aquatic gradient (cerulean to deep turquoise)
    const bgGrad = ctx.createLinearGradient(0, 0, size, size);
    bgGrad.addColorStop(0.0, '#2e96b8');
    bgGrad.addColorStop(0.4, '#38a9c5');
    bgGrad.addColorStop(0.7, '#2482a6');
    bgGrad.addColorStop(1.0, '#1c7293');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, size, size);

    // 2. Soft watercolor caustic cells
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let pass = 0; pass < 2; pass++) {
      ctx.strokeStyle = pass === 0 ? 'rgba(255, 255, 255, 0.35)' : 'rgba(220, 248, 255, 0.55)';
      ctx.lineWidth = pass === 0 ? 8 : 4;

      for (let i = 0; i < 40; i++) {
        const cx = (i * 37) % size;
        const cy = (i * 61) % size;
        const r = 24 + ((i * 19) % 36);

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0.2, Math.PI * 1.6);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx + r * 0.7, cy + r * 0.5, r * 0.85, Math.PI * 0.6, Math.PI * 2.1);
        ctx.stroke();
      }
    }

    // 3. Gentle sparkling caustic highlights
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let j = 0; j < 60; j++) {
      const px = (j * 71) % size;
      const py = (j * 43) % size;
      const pr = 3 + (j % 5);
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
   * Generates a procedural water normal map for gentle surface ripple highlights.
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
        const u = (x / size) * Math.PI * 8;
        const v = (y / size) * Math.PI * 8;

        // Wave normal calculation
        const nx = Math.sin(u) * 0.25;
        const ny = Math.cos(v) * 0.25;
        const nz = 1.0;

        // Normalize
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
   * Generates a soft shoreline foam texture for water edges.
   */
  public static getFoamTexture(device: pc.GraphicsDevice): pc.Texture {
    if (this.foamTexture) return this.foamTexture;

    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Transparent background
    ctx.clearRect(0, 0, size, size);

    // Soft bubbly foam texture
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    for (let i = 0; i < 90; i++) {
      const cx = (i * 23) % size;
      const cy = (i * 37) % size;
      const r = 4 + (i % 12);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Connective foam lace
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 3;
    for (let j = 0; j < 30; j++) {
      ctx.beginPath();
      ctx.arc((j * 31) % size, (j * 47) % size, 18, 0, Math.PI * 1.5);
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
   * Creates the stylized water material with dual-layer animated flow.
   */
  public static create(
    device: pc.GraphicsDevice,
    tint: pc.Color = new pc.Color(0.24, 0.68, 0.82),
    opacity: number = 0.88
  ): { material: pc.StandardMaterial; update: (dt: number, speed: number) => void } {
    const material = new pc.StandardMaterial();
    const diffuseTex = this.getCausticTexture(device);
    const normalTex = this.getRippleNormalTexture(device);

    material.diffuse = tint;
    material.ambient = new pc.Color(0.22, 0.52, 0.62);

    material.diffuseMap = diffuseTex;
    material.diffuseMapTiling = new pc.Vec2(2.5, 8.0);
    material.diffuseMapOffset = new pc.Vec2(0, 0);

    material.normalMap = normalTex;
    material.normalMapTiling = new pc.Vec2(3.0, 8.0);
    material.normalMapOffset = new pc.Vec2(0, 0);
    material.bumpiness = 0.12;

    material.specular = new pc.Color(0.22, 0.32, 0.38);
    material.shininess = 36;
    material.opacity = opacity;
    material.blendType = pc.BLEND_NORMAL;
    material.cull = pc.CULLFACE_NONE;
    material.update();

    let offsetV = 0;
    let offsetU = 0;

    const update = (dt: number, flowSpeed: number) => {
      // Primary longitudinal flow
      offsetV = (offsetV - dt * flowSpeed * 0.07) % 1.0;
      // Subtle secondary diagonal wave oscillation
      offsetU = (offsetU + dt * 0.015) % 1.0;

      material.diffuseMapOffset.x = offsetU * 0.3;
      material.diffuseMapOffset.y = offsetV;

      material.normalMapOffset.x = -offsetU * 0.5;
      material.normalMapOffset.y = offsetV * 1.2;

      material.update();
    };

    return { material, update };
  }
}

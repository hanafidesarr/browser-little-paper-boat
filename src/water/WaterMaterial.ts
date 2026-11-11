import * as pc from 'playcanvas';

export class WaterMaterial {
  private static waterTexture: pc.Texture | null = null;
  private static foamTexture: pc.Texture | null = null;

  /**
   * Generates a procedural stylized caustics/ripple texture.
   */
  public static getCausticTexture(device: pc.GraphicsDevice): pc.Texture {
    if (this.waterTexture) return this.waterTexture;

    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Base soft aquatic blue
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#2e96b8');
    grad.addColorStop(0.5, '#45b8cf');
    grad.addColorStop(1, '#2e96b8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Draw stylized caustic ripples
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    for (let i = 0; i < 35; i++) {
      const cx = Math.random() * size;
      const cy = Math.random() * size;
      const r = 16 + Math.random() * 32;

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 1.5);
      ctx.stroke();

      // Interlocking wave cell
      ctx.beginPath();
      ctx.arc(cx + r * 0.7, cy + r * 0.7, r * 0.8, Math.PI * 0.5, Math.PI * 2);
      ctx.stroke();
    }

    // Soft blur
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    for (let j = 0; j < 50; j++) {
      ctx.beginPath();
      ctx.arc(Math.random() * size, Math.random() * size, Math.random() * 6 + 2, 0, Math.PI * 2);
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
   * Creates a stylized PlayCanvas material for river water with flow animation.
   */
  public static create(
    device: pc.GraphicsDevice,
    tint: pc.Color = new pc.Color(0.24, 0.65, 0.78),
    opacity: number = 0.86
  ): { material: pc.StandardMaterial; update: (dt: number, speed: number) => void } {
    const material = new pc.StandardMaterial();
    const texture = this.getCausticTexture(device);

    material.diffuse = tint;
    material.ambient = new pc.Color(0.2, 0.48, 0.58);
    material.diffuseMap = texture;
    material.diffuseMapTiling = new pc.Vec2(2, 6);
    material.diffuseMapOffset = new pc.Vec2(0, 0);

    material.specular = new pc.Color(0.85, 0.95, 1.0);
    material.shininess = 90;
    material.opacity = opacity;
    material.blendType = pc.BLEND_NORMAL;
    material.cull = pc.CULLFACE_NONE;
    material.update();

    let offsetV = 0;

    const update = (dt: number, flowSpeed: number) => {
      offsetV = (offsetV - dt * flowSpeed * 0.08) % 1.0;
      material.diffuseMapOffset.y = offsetV;
      material.update();
    };

    return { material, update };
  }
}

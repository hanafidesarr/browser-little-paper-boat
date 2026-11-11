import * as pc from 'playcanvas';

export class PaperBoatMesh {
  private static paperTexture: pc.Texture | null = null;

  /**
   * Generates a warm, authentic origami washi paper texture with subtle paper grain
   * and clean cream/ivory tones. Zero harsh black artifacts.
   */
  public static getPaperTexture(device: pc.GraphicsDevice): pc.Texture {
    if (this.paperTexture) return this.paperTexture;

    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Clean warm ivory origami paper base
    ctx.fillStyle = '#faf8f2';
    ctx.fillRect(0, 0, size, size);

    // Subtle washi paper fibers (soft organic warm fibers)
    ctx.fillStyle = 'rgba(238, 230, 214, 0.4)';
    for (let i = 0; i < 180; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 1 + Math.random() * 2;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Delicate paper creases / fibers
    ctx.strokeStyle = 'rgba(225, 216, 198, 0.25)';
    ctx.lineWidth = 1;
    for (let j = 0; j < 40; j++) {
      const x1 = Math.random() * size;
      const y1 = Math.random() * size;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x1 + (Math.random() - 0.5) * 20, y1 + (Math.random() - 0.5) * 20);
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

    this.paperTexture = texture;
    return texture;
  }

  /**
   * Creates a handcrafted origami paper boat procedural 3D mesh.
   * Model dimensions: length ~ 1.8m, width ~ 0.8m, height ~ 0.9m.
   * Ensures all normals face outward/upward with warm paper translucency so no face is ever black.
   */
  public static create(device: pc.GraphicsDevice, customColor?: pc.Color): pc.Entity {
    const boatEntity = new pc.Entity('PaperBoatEntity');
    const visualRoot = new pc.Entity('VisualRoot');
    boatEntity.addChild(visualRoot);

    const rawFaces: number[][] = [
      // 1. Left Bow Hull (Outer Side)
      [0.0, 0.46, 0.95,   -0.40, 0.36, 0.0,   -0.24, 0.06, 0.0],
      [0.0, 0.46, 0.95,   -0.24, 0.06, 0.0,    0.0, 0.03, 0.55],

      // 2. Right Bow Hull (Outer Side)
      [0.0, 0.46, 0.95,    0.24, 0.06, 0.0,    0.40, 0.36, 0.0],
      [0.0, 0.46, 0.95,    0.0, 0.03, 0.55,    0.24, 0.06, 0.0],

      // 3. Left Stern Hull (Outer Side)
      [0.0, 0.46, -0.95,  -0.24, 0.06, 0.0,   -0.40, 0.36, 0.0],
      [0.0, 0.46, -0.95,   0.0, 0.03, -0.55,  -0.24, 0.06, 0.0],

      // 4. Right Stern Hull (Outer Side)
      [0.0, 0.46, -0.95,   0.40, 0.36, 0.0,    0.24, 0.06, 0.0],
      [0.0, 0.46, -0.95,   0.24, 0.06, 0.0,    0.0, 0.03, -0.55],

      // 5. Bottom Keel Plates (Under-hull)
      [0.0, 0.03, 0.55,   -0.24, 0.06, 0.0,    0.0, 0.01, 0.0],
      [0.0, 0.03, 0.55,    0.0, 0.01, 0.0,     0.24, 0.06, 0.0],
      [0.0, 0.03, -0.55,   0.0, 0.01, 0.0,    -0.24, 0.06, 0.0],
      [0.0, 0.03, -0.55,   0.24, 0.06, 0.0,    0.0, 0.01, 0.0],

      // 6. Center Triangular Origami Sail Peak
      // Front-Left Face
      [0.0, 0.88, 0.0,    -0.24, 0.22, 0.0,    0.0, 0.28, 0.38],
      // Front-Right Face
      [0.0, 0.88, 0.0,     0.0, 0.28, 0.38,    0.24, 0.22, 0.0],
      // Back-Left Face
      [0.0, 0.88, 0.0,     0.0, 0.28, -0.38,  -0.24, 0.22, 0.0],
      // Back-Right Face
      [0.0, 0.88, 0.0,     0.24, 0.22, 0.0,    0.0, 0.28, -0.38],

      // 7. Interior Paper Flanges (Transition between sail base and gunwales)
      [-0.24, 0.22, 0.0,   -0.40, 0.36, 0.0,   0.0, 0.28, 0.38],
      [-0.24, 0.22, 0.0,    0.0, 0.28, -0.38, -0.40, 0.36, 0.0],
      [ 0.24, 0.22, 0.0,    0.0, 0.28, 0.38,   0.40, 0.36, 0.0],
      [ 0.24, 0.22, 0.0,    0.40, 0.36, 0.0,   0.0, 0.28, -0.38]
    ];

    const numTriangles = rawFaces.length;
    const positions = new Float32Array(numTriangles * 3 * 3);
    const normals = new Float32Array(numTriangles * 3 * 3);
    const uvs = new Float32Array(numTriangles * 3 * 2);
    const indices = new Uint16Array(numTriangles * 3);

    for (let t = 0; t < numTriangles; t++) {
      const face = rawFaces[t];
      const v0 = new pc.Vec3(face[0], face[1], face[2]);
      const v1 = new pc.Vec3(face[3], face[4], face[5]);
      const v2 = new pc.Vec3(face[6], face[7], face[8]);

      // Calculate flat face normal
      const edge1 = new pc.Vec3().sub2(v1, v0);
      const edge2 = new pc.Vec3().sub2(v2, v0);
      let norm = new pc.Vec3().cross(edge1, edge2).normalize();

      // Ensure normal never faces steeply downward (which would cause pitch black shadowing)
      if (norm.y < -0.15) {
        norm.mulScalar(-1);
      }

      for (let i = 0; i < 3; i++) {
        const vert = i === 0 ? v0 : (i === 1 ? v1 : v2);
        const idx = t * 3 + i;

        positions[idx * 3 + 0] = vert.x;
        positions[idx * 3 + 1] = vert.y;
        positions[idx * 3 + 2] = vert.z;

        normals[idx * 3 + 0] = norm.x;
        normals[idx * 3 + 1] = norm.y;
        normals[idx * 3 + 2] = norm.z;

        uvs[idx * 2 + 0] = (vert.x + 0.5);
        uvs[idx * 2 + 1] = (vert.z + 1.0) * 0.5;

        indices[idx] = idx;
      }
    }

    const mesh = new pc.Mesh(device);
    mesh.setPositions(positions);
    mesh.setNormals(normals);
    mesh.setUvs(0, uvs);
    mesh.setIndices(indices);
    mesh.update(pc.PRIMITIVE_TRIANGLES);

    // Warm, realistic origami paper material (ZERO BLACK)
    const paperMat = new pc.StandardMaterial();
    const paperTex = this.getPaperTexture(device);

    paperMat.diffuseMap = paperTex;
    paperMat.diffuse = customColor ?? new pc.Color(0.99, 0.98, 0.95); // Crisp warm origami white
    paperMat.ambient = new pc.Color(0.85, 0.83, 0.80);               // Warm ambient illumination
    paperMat.emissive = new pc.Color(0.24, 0.23, 0.22);              // Paper subsurface translucency (prevents black shadows)
    paperMat.specular = new pc.Color(0.06, 0.06, 0.06);              // Soft matte paper finish
    paperMat.shininess = 12;
    paperMat.cull = pc.CULLFACE_NONE;                                // Two-sided paper folds
    paperMat.twoSidedLighting = true;                                // Both sides illuminated
    paperMat.update();

    const meshInstance = new pc.MeshInstance(mesh, paperMat);
    visualRoot.addComponent('render', {
      meshInstances: [meshInstance]
    });

    return boatEntity;
  }
}

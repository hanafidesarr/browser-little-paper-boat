import * as pc from 'playcanvas';

export class PaperBoatMesh {
  /**
   * Creates a handcrafted origami paper boat procedural 3D mesh.
   * Model dimensions: length ~ 1.8m, width ~ 0.8m, height ~ 0.9m.
   */
  public static create(device: pc.GraphicsDevice, customColor?: pc.Color): pc.Entity {
    const boatEntity = new pc.Entity('PaperBoatEntity');
    const visualRoot = new pc.Entity('VisualRoot');
    boatEntity.addChild(visualRoot);

    // Origami Paper Boat Vertices
    // Length: -0.9 (back/stern) to +0.9 (front/bow)
    // Width: -0.42 to +0.42
    // Height: 0.0 (keel/bottom) to +0.85 (center peak)
    
    // Key landmarks:
    // Prow / Bow tip: (0, 0.40, 0.95)
    // Stern tip: (0, 0.40, -0.95)
    // Center sail peak: (0, 0.85, 0.0)
    // Left rim peak: (-0.42, 0.35, 0.0)
    // Right rim peak: (+0.42, 0.35, 0.0)
    // Bottom keel front: (0, 0.02, 0.55)
    // Bottom keel back: (0, 0.02, -0.55)
    // Bottom keel center: (0, 0.0, 0.0)
    // Bottom left knuckle: (-0.25, 0.05, 0.0)
    // Bottom right knuckle: (+0.25, 0.05, 0.0)
    // Inner fold valley: (0, 0.22, 0.0)

    const rawFaces: number[][] = [
      // Left bow hull (prow, left rim peak, bottom left knuckle)
      [0.0, 0.42, 0.95,  -0.42, 0.35, 0.0,  -0.22, 0.05, 0.0],
      [0.0, 0.42, 0.95,  -0.22, 0.05, 0.0,  0.0, 0.02, 0.55],
      // Right bow hull
      [0.0, 0.42, 0.95,   0.22, 0.05, 0.0,   0.42, 0.35, 0.0],
      [0.0, 0.42, 0.95,   0.0, 0.02, 0.55,   0.22, 0.05, 0.0],

      // Left stern hull
      [0.0, 0.42, -0.95, -0.22, 0.05, 0.0,  -0.42, 0.35, 0.0],
      [0.0, 0.42, -0.95,  0.0, 0.02, -0.55, -0.22, 0.05, 0.0],
      // Right stern hull
      [0.0, 0.42, -0.95,  0.42, 0.35, 0.0,   0.22, 0.05, 0.0],
      [0.0, 0.42, -0.95,  0.22, 0.05, 0.0,   0.0, 0.02, -0.55],

      // Bottom hull plates
      [0.0, 0.02, 0.55,  -0.22, 0.05, 0.0,   0.0, 0.0, 0.0],
      [0.0, 0.02, 0.55,   0.0, 0.0, 0.0,     0.22, 0.05, 0.0],
      [0.0, 0.02, -0.55,  0.0, 0.0, 0.0,    -0.22, 0.05, 0.0],
      [0.0, 0.02, -0.55,  0.22, 0.05, 0.0,   0.0, 0.0, 0.0],

      // Center Origami Sail Peak (Front face)
      [0.0, 0.88, 0.0,   -0.25, 0.20, 0.0,   0.0, 0.25, 0.38],
      [0.0, 0.88, 0.0,    0.0, 0.25, 0.38,   0.25, 0.20, 0.0],
      // Center Origami Sail Peak (Back face)
      [0.0, 0.88, 0.0,    0.0, 0.25, -0.38, -0.25, 0.20, 0.0],
      [0.0, 0.88, 0.0,    0.25, 0.20, 0.0,   0.0, 0.25, -0.38],

      // Sail side wings
      [0.0, 0.88, 0.0,   -0.38, 0.34, 0.0,  -0.25, 0.20, 0.0],
      [0.0, 0.88, 0.0,    0.25, 0.20, 0.0,   0.38, 0.34, 0.0],

      // Inside fold floors (paper interior)
      [0.0, 0.25, 0.38,  -0.38, 0.34, 0.0,   0.0, 0.42, 0.95],
      [0.0, 0.25, 0.38,   0.0, 0.42, 0.95,   0.38, 0.34, 0.0],
      [0.0, 0.25, -0.38,  0.0, 0.42, -0.95, -0.38, 0.34, 0.0],
      [0.0, 0.25, -0.38,  0.38, 0.34, 0.0,   0.0, 0.42, -0.95]
    ];

    const numTriangles = rawFaces.length;
    const positions = new Float32Array(numTriangles * 3 * 3);
    const normals = new Float32Array(numTriangles * 3 * 3);
    const uvs = new Float32Array(numTriangles * 3 * 2);
    const indices = new Uint16Array(numTriangles * 3);

    for (let t = 0; t < numTriangles; t++) {
      const face = rawFaces[t];
      // 3 vertices
      const v0 = new pc.Vec3(face[0], face[1], face[2]);
      const v1 = new pc.Vec3(face[3], face[4], face[5]);
      const v2 = new pc.Vec3(face[6], face[7], face[8]);

      // Calculate flat face normal for crisp folded paper origami edges
      const edge1 = new pc.Vec3().sub2(v1, v0);
      const edge2 = new pc.Vec3().sub2(v2, v0);
      const norm = new pc.Vec3().cross(edge1, edge2).normalize();

      for (let i = 0; i < 3; i++) {
        const vert = i === 0 ? v0 : (i === 1 ? v1 : v2);
        const idx = t * 3 + i;

        positions[idx * 3 + 0] = vert.x;
        positions[idx * 3 + 1] = vert.y;
        positions[idx * 3 + 2] = vert.z;

        normals[idx * 3 + 0] = norm.x;
        normals[idx * 3 + 1] = norm.y;
        normals[idx * 3 + 2] = norm.z;

        // Planar UV projection
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

    // Warm origami paper material
    const paperMat = new pc.StandardMaterial();
    paperMat.diffuse = customColor ?? new pc.Color(0.97, 0.95, 0.90);
    paperMat.ambient = new pc.Color(0.85, 0.82, 0.78);
    paperMat.specular = new pc.Color(0.18, 0.18, 0.18);
    paperMat.shininess = 32;
    paperMat.cull = pc.CULLFACE_NONE; // Double sided paper folds
    paperMat.update();

    const meshInstance = new pc.MeshInstance(mesh, paperMat);
    visualRoot.addComponent('render', {
      meshInstances: [meshInstance]
    });

    return boatEntity;
  }
}

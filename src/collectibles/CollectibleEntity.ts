import * as pc from 'playcanvas';

export type CollectibleType = 'red_gem' | 'golden_leaf' | 'lily_flower' | 'starlight';

export class CollectibleEntity {
  public distance: number;
  public lateralOffset: number;
  public type: CollectibleType;
  public collected: boolean = false;
  public entity: pc.Entity;

  private animTimer: number;
  private collectAnimProgress: number = 0;
  private basePos: pc.Vec3 = new pc.Vec3();
  private currentWorldPos: pc.Vec3 = new pc.Vec3();

  constructor(
    device: pc.GraphicsDevice,
    distance: number,
    lateralOffset: number,
    type: CollectibleType = 'red_gem'
  ) {
    this.distance = distance;
    this.lateralOffset = lateralOffset;
    this.type = type;
    this.animTimer = Math.random() * 10;

    this.entity = new pc.Entity(`Collectible_RedGem_${Math.floor(distance)}`);
    this.buildMesh(device);
  }

  /**
   * Builds the 3D brilliant-cut Red Gem / Ruby crystal mesh and floating water radiance halo.
   */
  private buildMesh(device: pc.GraphicsDevice): void {
    // 1. Faceted Red Gem Mesh
    const gemMesh = this.createFacetedGemMesh(device);

    const gemMat = new pc.StandardMaterial();
    gemMat.diffuse = new pc.Color(0.96, 0.12, 0.24); // Luminous Ruby Red
    gemMat.emissive = new pc.Color(0.62, 0.05, 0.14); // Warm Crimson Inner Glow
    gemMat.specular = new pc.Color(1.0, 0.85, 0.90); // Sparkling Crystal Highlight
    gemMat.shininess = 96;
    gemMat.ambient = new pc.Color(0.38, 0.05, 0.10);
    gemMat.cull = pc.CULLFACE_NONE;
    gemMat.update();

    const gemVisual = new pc.Entity('GemCrystalVisual');
    gemVisual.addComponent('render', {
      meshInstances: [new pc.MeshInstance(gemMesh, gemMat)]
    });
    this.entity.addChild(gemVisual);
  }

  /**
   * Procedural brilliant-cut gemstone geometry with flat facet normals.
   */
  private createFacetedGemMesh(device: pc.GraphicsDevice): pc.Mesh {
    const numSegments = 8;
    const tableRadius = 0.16;
    const tableHeight = 0.22;
    const girdleRadius = 0.32;
    const girdleHeight = 0.00;
    const culetHeight = -0.34;

    const tablePoints: pc.Vec3[] = [];
    const girdlePoints: pc.Vec3[] = [];

    for (let i = 0; i < numSegments; i++) {
      const angleTable = (i / numSegments) * Math.PI * 2;
      tablePoints.push(new pc.Vec3(
        Math.cos(angleTable) * tableRadius,
        tableHeight,
        Math.sin(angleTable) * tableRadius
      ));

      // Interleaved girdle angles for classic faceted gemstone cut
      const angleGirdle = ((i + 0.5) / numSegments) * Math.PI * 2;
      girdlePoints.push(new pc.Vec3(
        Math.cos(angleGirdle) * girdleRadius,
        girdleHeight,
        Math.sin(angleGirdle) * girdleRadius
      ));
    }

    const tableCenter = new pc.Vec3(0, tableHeight, 0);
    const culetPoint = new pc.Vec3(0, culetHeight, 0);

    // Triangles accumulator
    const triPositions: number[] = [];
    const triNormals: number[] = [];
    const triUvs: number[] = [];
    const triIndices: number[] = [];
    let vertexCounter = 0;

    const addTriangle = (p1: pc.Vec3, p2: pc.Vec3, p3: pc.Vec3) => {
      // Calculate flat face normal
      const e1 = new pc.Vec3().sub2(p2, p1);
      const e2 = new pc.Vec3().sub2(p3, p1);
      const norm = new pc.Vec3().cross(e1, e2).normalize();

      // Vertex 1
      triPositions.push(p1.x, p1.y, p1.z);
      triNormals.push(norm.x, norm.y, norm.z);
      triUvs.push(0.5, 0.5);
      triIndices.push(vertexCounter++);

      // Vertex 2
      triPositions.push(p2.x, p2.y, p2.z);
      triNormals.push(norm.x, norm.y, norm.z);
      triUvs.push(1.0, 0.0);
      triIndices.push(vertexCounter++);

      // Vertex 3
      triPositions.push(p3.x, p3.y, p3.z);
      triNormals.push(norm.x, norm.y, norm.z);
      triUvs.push(0.0, 1.0);
      triIndices.push(vertexCounter++);
    };

    // 1. Top Table Facets (octagon fan)
    for (let i = 0; i < numSegments; i++) {
      const next = (i + 1) % numSegments;
      addTriangle(tableCenter, tablePoints[i], tablePoints[next]);
    }

    // 2. Crown Facets (connecting table ring to girdle ring)
    for (let i = 0; i < numSegments; i++) {
      const next = (i + 1) % numSegments;
      // Kite upper triangle 1
      addTriangle(tablePoints[i], girdlePoints[i], tablePoints[next]);
      // Kite upper triangle 2
      addTriangle(tablePoints[next], girdlePoints[i], girdlePoints[next]);
    }

    // 3. Pavilion Facets (connecting girdle ring to bottom culet tip)
    for (let i = 0; i < numSegments; i++) {
      const next = (i + 1) % numSegments;
      addTriangle(girdlePoints[next], girdlePoints[i], culetPoint);
    }

    const mesh = new pc.Mesh(device);
    mesh.setPositions(new Float32Array(triPositions));
    mesh.setNormals(new Float32Array(triNormals));
    mesh.setUvs(0, new Float32Array(triUvs));
    mesh.setIndices(new Uint16Array(triIndices));
    mesh.update(pc.PRIMITIVE_TRIANGLES);

    return mesh;
  }

  public setInitialPosition(pos: pc.Vec3): void {
    this.basePos.copy(pos);
    this.currentWorldPos.copy(pos);
    this.entity.setPosition(pos);
  }

  public update(dt: number, boatPos: pc.Vec3): void {
    if (this.collected) {
      // Float up and shrink shimmer animation upon pickup
      if (this.collectAnimProgress < 1.0) {
        this.collectAnimProgress += dt * 3.0;
        const currentPos = this.entity.getPosition();
        this.entity.setPosition(currentPos.x, currentPos.y + dt * 4.2, currentPos.z);
        const s = Math.max(0.01, 1.0 - this.collectAnimProgress);
        this.entity.setLocalScale(s, s, s);

        if (this.collectAnimProgress >= 1.0) {
          this.entity.enabled = false;
        }
      }
      return;
    }

    this.animTimer += dt;

    // Continuous crystal rotation
    this.entity.rotate(0, 85 * dt, 0);

    // Magnetic attraction to paper boat
    const distToBoat = this.currentWorldPos.distance(boatPos);
    if (distToBoat < 3.4 && distToBoat > 0.05) {
      const magnetStrength = 4.8;
      const pullDir = boatPos.clone().sub(this.currentWorldPos).normalize();
      this.currentWorldPos.add(pullDir.mulScalar(magnetStrength * dt));
      this.entity.setPosition(this.currentWorldPos);
    } else {
      // Gentle floating aquatic bobbing
      const bob = Math.sin(this.animTimer * 2.8) * 0.08;
      this.entity.setPosition(this.basePos.x, this.basePos.y + bob, this.basePos.z);
      this.currentWorldPos.copy(this.entity.getPosition());
    }
  }

  public triggerCollect(): void {
    if (this.collected) return;
    this.collected = true;
    this.collectAnimProgress = 0;
  }

  public getColor(): pc.Color {
    return new pc.Color(1.0, 0.15, 0.25); // Vibrant Ruby Red sparkles
  }

  public destroy(): void {
    this.entity.destroy();
  }
}

import * as pc from 'playcanvas';
import { RiverSystem } from '../river/RiverSystem';
import { NatureMeshes } from './NatureMeshes';

export interface IslandConfig {
  startDistance: number;
  endDistance: number;
  islandWidth?: number;  // Peak width in meters (default ~6.2m)
  islandHeight?: number; // Peak elevation in meters above water (default ~2.0m)
  treeType?: 'deciduous' | 'pine' | 'birch' | 'autumn';
  hasSignpost?: boolean; // Rustic wooden fork signpost with left/right arrows
  hasProwRock?: boolean; // Upstream prow splitter boulder
  flowerColor?: 'pink' | 'yellow' | 'white';
}

export class IslandEntity {
  public config: IslandConfig;
  public rootEntity: pc.Entity;
  private meshEntity: pc.Entity | null = null;
  private peakWidth: number;
  private peakHeight: number;

  constructor(config: IslandConfig) {
    this.config = config;
    this.peakWidth = config.islandWidth ?? 6.2;
    this.peakHeight = config.islandHeight ?? 2.0;
    this.rootEntity = new pc.Entity(`RiverIsland_${Math.floor(config.startDistance)}`);
  }

  public getStartDistance(): number {
    return this.config.startDistance;
  }

  public getEndDistance(): number {
    return this.config.endDistance;
  }

  public getLength(): number {
    return this.config.endDistance - this.config.startDistance;
  }

  /**
   * Evaluates island half-width at given river distance.
   * Returns 0 if distance is outside the island bounds.
   */
  public getHalfWidthAt(distance: number): number {
    if (distance < this.config.startDistance || distance > this.config.endDistance) {
      return 0;
    }
    const len = this.getLength();
    if (len <= 0) return 0;
    const t = (distance - this.config.startDistance) / len;
    // Aerodynamic streamlined teardrop shape
    const shape = Math.sin(Math.pow(t, 0.9) * Math.PI);
    return Math.max(0, (this.peakWidth * 0.5) * shape);
  }

  /**
   * Builds the 3D procedural island terrain mesh and populates nature dressing.
   */
  public build(app: pc.AppBase, river: RiverSystem, bankTint?: pc.Color): void {
    NatureMeshes.initMaterials();

    // 1. Generate 3D procedural island terrain mesh
    this.meshEntity = this.createIslandMesh(app.graphicsDevice, river, bankTint);
    this.rootEntity.addChild(this.meshEntity);

    // 2. Decorate Island with Nature Assets
    this.populateDecorations(river);
  }

  private createIslandMesh(
    device: pc.GraphicsDevice,
    river: RiverSystem,
    bankTint?: pc.Color
  ): pc.Entity {
    const len = this.getLength();
    const stepSize = 1.4;
    const numRows = Math.max(6, Math.ceil(len / stepSize) + 1);

    // 7-column profile across the island cross-section
    const profileCols = [
      { uRatio: -1.00, hFactor: -0.32, nx: -0.9, ny: 0.15 }, // Underwater lip Left
      { uRatio: -0.80, hFactor:  0.28, nx: -0.7, ny: 0.65 }, // Cutbank slope Left
      { uRatio: -0.50, hFactor:  0.86, nx: -0.35, ny: 0.92 }, // Plateau shoulder Left
      { uRatio:  0.00, hFactor:  1.00, nx:  0.0, ny: 1.00 }, // Ridge crest
      { uRatio:  0.50, hFactor:  0.86, nx:  0.35, ny: 0.92 }, // Plateau shoulder Right
      { uRatio:  0.80, hFactor:  0.28, nx:  0.7, ny: 0.65 }, // Cutbank slope Right
      { uRatio:  1.00, hFactor: -0.32, nx:  0.9, ny: 0.15 }  // Underwater lip Right
    ];
    const numCols = profileCols.length;
    const numVertices = numRows * numCols;

    const positions = new Float32Array(numVertices * 3);
    const normals = new Float32Array(numVertices * 3);
    const uvs = new Float32Array(numVertices * 2);

    let vIdx = 0;
    let uvIdx = 0;

    for (let r = 0; r < numRows; r++) {
      const rowT = r / (numRows - 1);
      const s = this.config.startDistance + rowT * len;
      const frame = river.getFrameAtDistance(s);

      // Width and height envelope along length
      const shape = Math.sin(Math.pow(rowT, 0.9) * Math.PI);
      const curHalfW = (this.peakWidth * 0.5) * shape;
      const curH = this.peakHeight * shape;

      for (let c = 0; c < numCols; c++) {
        const p = profileCols[c];
        const lat = p.uRatio * curHalfW;
        const elev = Math.max(-0.35, p.hFactor * curH);

        const px = frame.position.x + frame.normal.x * lat;
        const py = frame.position.y + elev;
        const pz = frame.position.z + frame.normal.z * lat;

        positions[vIdx * 3 + 0] = px;
        positions[vIdx * 3 + 1] = py;
        positions[vIdx * 3 + 2] = pz;

        // Normal
        const nx = frame.normal.x * p.nx;
        const ny = p.ny;
        const nz = frame.normal.z * p.nx;
        const invLen = 1.0 / Math.sqrt(nx * nx + ny * ny + nz * nz);

        normals[vIdx * 3 + 0] = nx * invLen;
        normals[vIdx * 3 + 1] = ny * invLen;
        normals[vIdx * 3 + 2] = nz * invLen;

        uvs[uvIdx * 2 + 0] = c / (numCols - 1);
        uvs[uvIdx * 2 + 1] = (s - this.config.startDistance) / 8.0;

        vIdx++;
        uvIdx++;
      }
    }

    const numQuads = (numRows - 1) * (numCols - 1);
    const indices = new Uint16Array(numQuads * 6);
    let iIdx = 0;

    for (let r = 0; r < numRows - 1; r++) {
      for (let c = 0; c < numCols - 1; c++) {
        const tl = r * numCols + c;
        const tr = tl + 1;
        const bl = (r + 1) * numCols + c;
        const br = bl + 1;

        indices[iIdx++] = tl;
        indices[iIdx++] = tr;
        indices[iIdx++] = bl;

        indices[iIdx++] = tr;
        indices[iIdx++] = br;
        indices[iIdx++] = bl;
      }
    }

    const mesh = new pc.Mesh(device);
    mesh.setPositions(positions);
    mesh.setNormals(normals);
    mesh.setUvs(0, uvs);
    mesh.setIndices(indices);
    mesh.update(pc.PRIMITIVE_TRIANGLES);

    // Island Material: Lush grass with warm earth undertones
    const mat = new pc.StandardMaterial();
    const tint = bankTint ?? new pc.Color(0.471, 0.725, 0.420);
    mat.diffuse = new pc.Color(tint.r * 1.05, tint.g * 1.05, tint.b * 1.0);
    mat.ambient = new pc.Color(0.35, 0.42, 0.32);
    mat.shininess = 12;
    mat.cull = pc.CULLFACE_NONE;
    mat.update();

    const meshEntity = new pc.Entity('IslandTerrainMesh');
    meshEntity.addComponent('render', {
      meshInstances: [new pc.MeshInstance(mesh, mat)]
    });

    return meshEntity;
  }

  private populateDecorations(river: RiverSystem): void {
    const start = this.config.startDistance;
    const end = this.config.endDistance;
    const mid = (start + end) * 0.5;

    // ==========================================
    // 1. UPSTREAM PROW: SPLITTER BOULDER & ARROW SIGNPOST
    // ==========================================
    if (this.config.hasProwRock !== false) {
      const prowDist = start + 3.2;
      const prowPos = river.riverToWorld(prowDist, 0, 0.25);
      const prowRock = NatureMeshes.createRiverRock(1.5);
      prowRock.setPosition(prowPos);
      this.rootEntity.addChild(prowRock);

      // Foam ring around prow divider stone
      const foamDisc = this.createWaterlineFoamDisc(appFoamDevice(prowRock));
      if (foamDisc) {
        foamDisc.setPosition(prowPos.x, 0.04, prowPos.z);
        this.rootEntity.addChild(foamDisc);
      }
    }

    if (this.config.hasSignpost !== false) {
      const signDist = start + 4.8;
      const signPos = river.riverToWorld(signDist, 0, 0.95);
      const signpost = this.createRusticSignpost(river, signDist);
      signpost.setPosition(signPos);
      this.rootEntity.addChild(signpost);
    }

    // ==========================================
    // 2. CENTER HIGH PLATEAU: STATELY TREE & FLOWER BUSHES
    // ==========================================
    const treePos = river.riverToWorld(mid, 0.2, this.peakHeight * 0.92);
    let tree: pc.Entity;
    const treeType = this.config.treeType ?? 'deciduous';

    if (treeType === 'autumn') {
      tree = NatureMeshes.createDeciduousTree(true);
    } else if (treeType === 'pine') {
      tree = NatureMeshes.createPineTree();
    } else if (treeType === 'birch') {
      tree = NatureMeshes.createBirchTree();
    } else {
      tree = NatureMeshes.createDeciduousTree(false);
    }
    tree.setPosition(treePos);
    this.rootEntity.addChild(tree);

    // Flowering bushes on island plateau
    const flowerColor = this.config.flowerColor ?? 'pink';
    const bush1Pos = river.riverToWorld(mid - 4.5, -1.2, this.peakHeight * 0.75);
    const bush1 = NatureMeshes.createFloweringBush(flowerColor);
    bush1.setPosition(bush1Pos);
    this.rootEntity.addChild(bush1);

    const bush2Pos = river.riverToWorld(mid + 5.2, 1.1, this.peakHeight * 0.72);
    const bush2 = NatureMeshes.createFloweringBush('yellow');
    bush2.setPosition(bush2Pos);
    this.rootEntity.addChild(bush2);

    // Stately river stone cluster on island
    const rockPos = river.riverToWorld(mid + 2.8, -1.3, this.peakHeight * 0.7);
    const rock = NatureMeshes.createRiverRock(1.1);
    rock.setPosition(rockPos);
    this.rootEntity.addChild(rock);

    // Resting duck on the grass bank of the island
    const duckPos = river.riverToWorld(mid - 2.5, 1.4, this.peakHeight * 0.65);
    const restingDuck = this.createRestingDuck();
    restingDuck.setPosition(duckPos);
    this.rootEntity.addChild(restingDuck);

    // ==========================================
    // 3. DOWNSTREAM TAIL: REJOINING STONES
    // ==========================================
    const tailDist = end - 3.0;
    const tailPos = river.riverToWorld(tailDist, 0, 0.2);
    const tailRock = NatureMeshes.createRiverRock(1.2);
    tailRock.setPosition(tailPos);
    this.rootEntity.addChild(tailRock);
  }

  /**
   * Creates a charming rustic wooden fork signpost pointing left (⇦) and right (⇨).
   */
  private createRusticSignpost(river: RiverSystem, distance: number): pc.Entity {
    const signRoot = new pc.Entity('SignpostRoot');

    const woodMat = new pc.StandardMaterial();
    woodMat.diffuse = new pc.Color(0.48, 0.32, 0.18);
    woodMat.cull = pc.CULLFACE_NONE;
    woodMat.update();

    const signMat = new pc.StandardMaterial();
    signMat.diffuse = new pc.Color(0.85, 0.75, 0.58);
    signMat.cull = pc.CULLFACE_NONE;
    signMat.update();

    // Wooden vertical post
    const post = new pc.Entity('Post');
    post.addComponent('render', { type: 'cylinder' });
    post.setLocalScale(0.14, 1.4, 0.14);
    post.setLocalPosition(0, 0.7, 0);
    if (post.render?.meshInstances[0]) post.render.meshInstances[0].material = woodMat;
    signRoot.addChild(post);

    // Left arrow board
    const leftBoard = new pc.Entity('BoardLeft');
    leftBoard.addComponent('render', { type: 'box' });
    leftBoard.setLocalScale(0.65, 0.22, 0.06);
    leftBoard.setLocalPosition(-0.35, 1.15, 0);
    leftBoard.setLocalEulerAngles(0, 15, 6);
    if (leftBoard.render?.meshInstances[0]) leftBoard.render.meshInstances[0].material = signMat;
    signRoot.addChild(leftBoard);

    // Left arrow tip
    const leftTip = new pc.Entity('ArrowTipLeft');
    leftTip.addComponent('render', { type: 'cone' });
    leftTip.setLocalScale(0.18, 0.25, 0.08);
    leftTip.setLocalPosition(-0.72, 1.15, 0);
    leftTip.setLocalEulerAngles(0, 0, 90);
    if (leftTip.render?.meshInstances[0]) leftTip.render.meshInstances[0].material = signMat;
    signRoot.addChild(leftTip);

    // Right arrow board
    const rightBoard = new pc.Entity('BoardRight');
    rightBoard.addComponent('render', { type: 'box' });
    rightBoard.setLocalScale(0.65, 0.22, 0.06);
    rightBoard.setLocalPosition(0.35, 0.88, 0);
    rightBoard.setLocalEulerAngles(0, -15, -6);
    if (rightBoard.render?.meshInstances[0]) rightBoard.render.meshInstances[0].material = signMat;
    signRoot.addChild(rightBoard);

    // Right arrow tip
    const rightTip = new pc.Entity('ArrowTipRight');
    rightTip.addComponent('render', { type: 'cone' });
    rightTip.setLocalScale(0.18, 0.25, 0.08);
    rightTip.setLocalPosition(0.72, 0.88, 0);
    rightTip.setLocalEulerAngles(0, 0, -90);
    if (rightTip.render?.meshInstances[0]) rightTip.render.meshInstances[0].material = signMat;
    signRoot.addChild(rightTip);

    // Align signpost to face oncoming player along river tangent
    const tangent = river.getTangentAtDistance(distance);
    const yaw = Math.atan2(tangent.x, tangent.z) * (180 / Math.PI);
    signRoot.setEulerAngles(0, yaw, 0);

    return signRoot;
  }

  private createWaterlineFoamDisc(device: pc.GraphicsDevice | null): pc.Entity | null {
    if (!device) return null;
    const foam = new pc.Entity('ProwFoam');
    foam.addComponent('render', { type: 'cylinder' });
    foam.setLocalScale(3.2, 0.02, 3.2);

    const foamMat = new pc.StandardMaterial();
    foamMat.diffuse = new pc.Color(1.0, 1.0, 1.0);
    foamMat.opacity = 0.45;
    foamMat.blendType = pc.BLEND_ADDITIVE;
    foamMat.cull = pc.CULLFACE_NONE;
    foamMat.update();

    if (foam.render?.meshInstances[0]) foam.render.meshInstances[0].material = foamMat;
    return foam;
  }

  private createRestingDuck(): pc.Entity {
    const duck = new pc.Entity('IslandDuck');
    const yellowMat = new pc.StandardMaterial();
    yellowMat.diffuse = new pc.Color(0.98, 0.84, 0.22);
    yellowMat.update();

    const orangeMat = new pc.StandardMaterial();
    orangeMat.diffuse = new pc.Color(0.96, 0.45, 0.12);
    orangeMat.update();

    const body = new pc.Entity('Body');
    body.addComponent('render', { type: 'sphere' });
    body.setLocalScale(0.55, 0.38, 0.72);
    body.setLocalPosition(0, 0.18, 0);
    if (body.render?.meshInstances[0]) body.render.meshInstances[0].material = yellowMat;
    duck.addChild(body);

    const head = new pc.Entity('Head');
    head.addComponent('render', { type: 'sphere' });
    head.setLocalScale(0.34, 0.34, 0.34);
    head.setLocalPosition(0, 0.40, 0.24);
    if (head.render?.meshInstances[0]) head.render.meshInstances[0].material = yellowMat;
    duck.addChild(head);

    const beak = new pc.Entity('Beak');
    beak.addComponent('render', { type: 'cone' });
    beak.setLocalScale(0.14, 0.22, 0.14);
    beak.setLocalEulerAngles(85, 0, 0);
    beak.setLocalPosition(0, 0.36, 0.45);
    if (beak.render?.meshInstances[0]) beak.render.meshInstances[0].material = orangeMat;
    duck.addChild(beak);

    duck.setLocalEulerAngles(0, -40, 0);
    return duck;
  }

  public destroy(): void {
    this.rootEntity.destroy();
  }
}

function appFoamDevice(entity: pc.Entity): pc.GraphicsDevice | null {
  try {
    return (entity as any)._app?.graphicsDevice ?? null;
  } catch (_) {
    return null;
  }
}

import * as pc from 'playcanvas';
import { CatmullRomSpline, RiverSample } from '../spline/CatmullRomSpline';

export interface RiverMeshResult {
  waterMesh: pc.Mesh;
  waterEntity: pc.Entity;
  banksMesh: pc.Mesh;
  banksEntity: pc.Entity;
  samples: RiverSample[];
}

export class RiverMeshBuilder {
  /**
   * Generates water surface and bank meshes from a CatmullRomSpline.
   */
  public static buildRiver(
    app: pc.AppBase,
    spline: CatmullRomSpline,
    options: {
      stepSize?: number;
      crossSubdivisions?: number;
      bankWidth?: number;
      bankHeight?: number;
      waterMaterial?: pc.Material;
      bankMaterial?: pc.Material;
    } = {}
  ): RiverMeshResult {
    const stepSize = options.stepSize ?? 1.5;
    const crossSubs = Math.max(2, options.crossSubdivisions ?? 4);
    const bankWidth = options.bankWidth ?? 12.0;
    const bankHeight = options.bankHeight ?? 1.6;

    const totalLength = spline.getTotalLength();
    const sampleCount = Math.max(4, Math.ceil(totalLength / stepSize) + 1);

    // Pre-sample spline along length
    const samples: RiverSample[] = [];
    for (let i = 0; i < sampleCount; i++) {
      const dist = Math.min(totalLength, (i / (sampleCount - 1)) * totalLength);
      samples.push(spline.sampleAtDistance(dist));
    }

    // 1. BUILD WATER MESH
    const waterMesh = this.createWaterMesh(app.graphicsDevice, samples, crossSubs);

    // 2. BUILD RIVER BANKS & EMBANKMENTS
    const banksMesh = this.createBanksMesh(app.graphicsDevice, samples, bankWidth, bankHeight);

    // Entities
    const waterEntity = new pc.Entity('RiverWater');
    const waterModel = new pc.Model();
    const waterNode = new pc.GraphNode();
    const waterMeshInstance = new pc.MeshInstance(waterMesh, options.waterMaterial || new pc.StandardMaterial());
    waterModel.graph = waterNode;
    waterModel.meshInstances.push(waterMeshInstance);
    waterEntity.addComponent('render', {
      meshInstances: [waterMeshInstance]
    });

    const banksEntity = new pc.Entity('RiverBanks');
    const banksMeshInstance = new pc.MeshInstance(banksMesh, options.bankMaterial || new pc.StandardMaterial());
    banksEntity.addComponent('render', {
      meshInstances: [banksMeshInstance]
    });

    return {
      waterMesh,
      waterEntity,
      banksMesh,
      banksEntity,
      samples
    };
  }

  private static createWaterMesh(
    device: pc.GraphicsDevice,
    samples: RiverSample[],
    crossSubs: number
  ): pc.Mesh {
    const numRows = samples.length;
    const numCols = crossSubs + 1;
    const numVertices = numRows * numCols;

    const positions = new Float32Array(numVertices * 3);
    const normals = new Float32Array(numVertices * 3);
    const uvs = new Float32Array(numVertices * 2);

    let vIdx = 0;
    let uvIdx = 0;

    for (let r = 0; r < numRows; r++) {
      const sample = samples[r];
      const halfWidth = sample.width * 0.5;

      for (let c = 0; c < numCols; c++) {
        const uRatio = c / crossSubs; // 0 to 1 across width
        const lateralOffset = (uRatio - 0.5) * sample.width;

        // Position: RiverCenter + Normal * lateralOffset
        const px = sample.position.x + sample.normal.x * lateralOffset;
        // Slightly cup water in the center for depth illusion
        const cupDepth = Math.sin(uRatio * Math.PI) * -0.05;
        const py = sample.position.y + cupDepth;
        const pz = sample.position.z + sample.normal.z * lateralOffset;

        positions[vIdx * 3 + 0] = px;
        positions[vIdx * 3 + 1] = py;
        positions[vIdx * 3 + 2] = pz;

        normals[vIdx * 3 + 0] = 0;
        normals[vIdx * 3 + 1] = 1;
        normals[vIdx * 3 + 2] = 0;

        // UVs: U = lateral (0 to 1), V = longitudinal distance in meters / tiling factor
        uvs[uvIdx * 2 + 0] = uRatio;
        uvs[uvIdx * 2 + 1] = sample.distance / 12.0;

        vIdx++;
        uvIdx++;
      }
    }

    // Indices for quads
    const numQuads = (numRows - 1) * (numCols - 1);
    const indices = new Uint16Array(numQuads * 6);
    let idx = 0;

    for (let r = 0; r < numRows - 1; r++) {
      for (let c = 0; c < numCols - 1; c++) {
        const topLeft = r * numCols + c;
        const topRight = topLeft + 1;
        const bottomLeft = (r + 1) * numCols + c;
        const bottomRight = bottomLeft + 1;

        // Triangle 1
        indices[idx++] = topLeft;
        indices[idx++] = bottomLeft;
        indices[idx++] = topRight;

        // Triangle 2
        indices[idx++] = topRight;
        indices[idx++] = bottomLeft;
        indices[idx++] = bottomRight;
      }
    }

    const mesh = new pc.Mesh(device);
    mesh.setPositions(positions);
    mesh.setNormals(normals);
    mesh.setUvs(0, uvs);
    mesh.setIndices(indices);
    mesh.update(pc.PRIMITIVE_TRIANGLES);

    return mesh;
  }

  private static createBanksMesh(
    device: pc.GraphicsDevice,
    samples: RiverSample[],
    bankWidth: number,
    bankHeight: number
  ): pc.Mesh {
    // Each cross-section has:
    // Left outer edge (-bankWidth), Left bank crest, Left water edge,
    // Right water edge, Right bank crest, Right outer edge (+bankWidth)
    // 6 profile points per slice
    const profileOffsets = [
      { lateral: -1.0, height: 1.2, uvX: 0.0 }, // Outer terrain skirt left
      { lateral: -0.65, height: 0.9, uvX: 0.2 }, // Mid slope left
      { lateral: -0.5, height: 0.25, uvX: 0.45 }, // Water edge bank left (mossy)
      { lateral: 0.5, height: 0.25, uvX: 0.55 }, // Water edge bank right (mossy)
      { lateral: 0.65, height: 0.9, uvX: 0.8 }, // Mid slope right
      { lateral: 1.0, height: 1.2, uvX: 1.0 }   // Outer terrain skirt right
    ];

    const numRows = samples.length;
    const numCols = profileOffsets.length;
    const numVertices = numRows * numCols;

    const positions = new Float32Array(numVertices * 3);
    const normals = new Float32Array(numVertices * 3);
    const uvs = new Float32Array(numVertices * 2);

    let vIdx = 0;
    let uvIdx = 0;

    for (let r = 0; r < numRows; r++) {
      const sample = samples[r];
      const halfW = sample.width * 0.5;

      for (let c = 0; c < numCols; c++) {
        const prof = profileOffsets[c];
        let latDist: number;

        if (prof.lateral < 0) {
          // Left bank
          const extra = (Math.abs(prof.lateral) - 0.5) * bankWidth * 2;
          latDist = -halfW - extra;
        } else {
          // Right bank
          const extra = (prof.lateral - 0.5) * bankWidth * 2;
          latDist = halfW + extra;
        }

        const px = sample.position.x + sample.normal.x * latDist;
        const py = sample.position.y + prof.height * bankHeight;
        const pz = sample.position.z + sample.normal.z * latDist;

        positions[vIdx * 3 + 0] = px;
        positions[vIdx * 3 + 1] = py;
        positions[vIdx * 3 + 2] = pz;

        // Normal estimation roughly up and outward
        const sideDir = prof.lateral < 0 ? -1 : 1;
        normals[vIdx * 3 + 0] = sample.normal.x * sideDir * 0.4;
        normals[vIdx * 3 + 1] = 0.9;
        normals[vIdx * 3 + 2] = sample.normal.z * sideDir * 0.4;

        uvs[uvIdx * 2 + 0] = prof.uvX * 4.0;
        uvs[uvIdx * 2 + 1] = sample.distance / 10.0;

        vIdx++;
        uvIdx++;
      }
    }

    // Indices for banks (split: cols 0-2 left bank, cols 3-5 right bank; skip center 2-3 where water is)
    const indicesList: number[] = [];

    for (let r = 0; r < numRows - 1; r++) {
      // Left bank (cols 0, 1, 2)
      for (let c = 0; c < 2; c++) {
        const tl = r * numCols + c;
        const tr = tl + 1;
        const bl = (r + 1) * numCols + c;
        const br = bl + 1;

        indicesList.push(tl, bl, tr);
        indicesList.push(tr, bl, br);
      }

      // Right bank (cols 3, 4, 5)
      for (let c = 3; c < 5; c++) {
        const tl = r * numCols + c;
        const tr = tl + 1;
        const bl = (r + 1) * numCols + c;
        const br = bl + 1;

        indicesList.push(tl, bl, tr);
        indicesList.push(tr, bl, br);
      }
    }

    const indices = new Uint16Array(indicesList);

    const mesh = new pc.Mesh(device);
    mesh.setPositions(positions);
    mesh.setNormals(normals);
    mesh.setUvs(0, uvs);
    mesh.setIndices(indices);
    mesh.update(pc.PRIMITIVE_TRIANGLES);

    return mesh;
  }
}

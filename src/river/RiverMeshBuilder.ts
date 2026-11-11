import * as pc from 'playcanvas';
import { CatmullRomSpline } from '../spline/CatmullRomSpline';
import { RiverFrame } from '../spline/RiverFrame';

export interface RiverMeshResult {
  waterMesh: pc.Mesh;
  waterEntity: pc.Entity;
  banksMesh: pc.Mesh;
  banksEntity: pc.Entity;
  samples: RiverFrame[];
}

export interface RiverMeshOptions {
  stepSize?: number;
  crossSubdivisions?: number;
  bankWidth?: number;
  bankHeight?: number;
  waterMaterial?: pc.Material;
  bankMaterial?: pc.Material;
}

export class RiverMeshBuilder {
  /**
   * Generates water surface and bank meshes from a CatmullRomSpline with guaranteed gapless seams.
   */
  public static buildRiver(
    app: pc.AppBase,
    spline: CatmullRomSpline,
    options: RiverMeshOptions = {}
  ): RiverMeshResult {
    const stepSize = options.stepSize ?? 1.5;
    const crossSubs = Math.max(2, options.crossSubdivisions ?? 4);
    const bankWidth = options.bankWidth ?? 12.0;
    const bankHeight = options.bankHeight ?? 1.6;

    const totalLength = spline.getTotalLength();
    const sampleCount = Math.max(4, Math.ceil(totalLength / stepSize) + 1);

    // 1. Sample spline uniformly along distance
    const samples: RiverFrame[] = [];
    for (let i = 0; i < sampleCount; i++) {
      const dist = Math.min(totalLength, (i / (sampleCount - 1)) * totalLength);
      samples.push(spline.sampleAtDistance(dist));
    }

    // 2. Generate Water Mesh
    const waterMesh = this.createWaterMesh(app.graphicsDevice, samples, crossSubs);

    // 3. Generate Bank Embankment Mesh
    const banksMesh = this.createBanksMesh(app.graphicsDevice, samples, bankWidth, bankHeight);

    // Create Water Entity
    const waterEntity = new pc.Entity('RiverWater');
    const waterMeshInstance = new pc.MeshInstance(waterMesh, options.waterMaterial || this.createDefaultWaterMaterial());
    waterEntity.addComponent('render', {
      meshInstances: [waterMeshInstance]
    });

    // Create Banks Entity
    const banksEntity = new pc.Entity('RiverBanks');
    const banksMeshInstance = new pc.MeshInstance(banksMesh, options.bankMaterial || this.createDefaultBankMaterial());
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
    samples: RiverFrame[],
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

      for (let c = 0; c < numCols; c++) {
        const uRatio = c / crossSubs; // 0 to 1 across width
        const lateralOffset = (uRatio - 0.5) * sample.width;

        const px = sample.position.x + sample.normal.x * lateralOffset;
        // Subtle natural cup in river center
        const cup = Math.sin(uRatio * Math.PI) * -0.04;
        const py = sample.position.y + cup;
        const pz = sample.position.z + sample.normal.z * lateralOffset;

        positions[vIdx * 3 + 0] = px;
        positions[vIdx * 3 + 1] = py;
        positions[vIdx * 3 + 2] = pz;

        normals[vIdx * 3 + 0] = 0;
        normals[vIdx * 3 + 1] = 1;
        normals[vIdx * 3 + 2] = 0;

        // UV: U = lateral (0..1), V = longitudinal distance in meters / tiling factor (10m)
        uvs[uvIdx * 2 + 0] = uRatio;
        uvs[uvIdx * 2 + 1] = sample.distance / 10.0;

        vIdx++;
        uvIdx++;
      }
    }

    const numQuads = (numRows - 1) * (numCols - 1);
    const indices = new Uint16Array(numQuads * 6);
    let idx = 0;

    for (let r = 0; r < numRows - 1; r++) {
      for (let c = 0; c < numCols - 1; c++) {
        const tl = r * numCols + c;
        const tr = tl + 1;
        const bl = (r + 1) * numCols + c;
        const br = bl + 1;

        // Counter-Clockwise Triangles (upward normal)
        indices[idx++] = tl;
        indices[idx++] = tr;
        indices[idx++] = bl;

        indices[idx++] = tr;
        indices[idx++] = br;
        indices[idx++] = bl;
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
    samples: RiverFrame[],
    bankWidth: number,
    bankHeight: number
  ): pc.Mesh {
    // Bank Profile: Left and right banks meet exactly at water boundary
    // Left Bank: Outer skirt -> Mid slope -> Shore edge (meets water)
    // Right Bank: Shore edge (meets water) -> Mid slope -> Outer skirt
    const profile = [
      { side: -1, extraLateral: bankWidth, heightFactor: 1.0, uvX: 0.0 }, // Left outer skirt
      { side: -1, extraLateral: bankWidth * 0.35, heightFactor: 0.65, uvX: 0.25 }, // Left mid slope
      { side: -1, extraLateral: 0.0, heightFactor: 0.0, uvX: 0.5 }, // Left shoreline (exact water edge)
      { side: 1, extraLateral: 0.0, heightFactor: 0.0, uvX: 0.5 }, // Right shoreline (exact water edge)
      { side: 1, extraLateral: bankWidth * 0.35, heightFactor: 0.65, uvX: 0.75 }, // Right mid slope
      { side: 1, extraLateral: bankWidth, heightFactor: 1.0, uvX: 1.0 }  // Right outer skirt
    ];

    const numRows = samples.length;
    const numCols = profile.length;
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
        const p = profile[c];
        const lat = p.side * (halfW + p.extraLateral);

        const px = sample.position.x + sample.normal.x * lat;
        const py = sample.position.y + p.heightFactor * bankHeight;
        const pz = sample.position.z + sample.normal.z * lat;

        positions[vIdx * 3 + 0] = px;
        positions[vIdx * 3 + 1] = py;
        positions[vIdx * 3 + 2] = pz;

        // Normal: outward horizontal + upward
        normals[vIdx * 3 + 0] = sample.normal.x * p.side * 0.45;
        normals[vIdx * 3 + 1] = 0.89;
        normals[vIdx * 3 + 2] = sample.normal.z * p.side * 0.45;

        uvs[uvIdx * 2 + 0] = p.uvX * 3.0;
        uvs[uvIdx * 2 + 1] = sample.distance / 12.0;

        vIdx++;
        uvIdx++;
      }
    }

    const indicesList: number[] = [];

    for (let r = 0; r < numRows - 1; r++) {
      // Left Bank quads (columns 0->1 and 1->2)
      for (let c = 0; c < 2; c++) {
        const tl = r * numCols + c;
        const tr = tl + 1;
        const bl = (r + 1) * numCols + c;
        const br = bl + 1;

        indicesList.push(tl, tr, bl);
        indicesList.push(tr, br, bl);
      }

      // Right Bank quads (columns 3->4 and 4->5)
      for (let c = 3; c < 5; c++) {
        const tl = r * numCols + c;
        const tr = tl + 1;
        const bl = (r + 1) * numCols + c;
        const br = bl + 1;

        indicesList.push(tl, tr, bl);
        indicesList.push(tr, br, bl);
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

  private static createDefaultWaterMaterial(): pc.StandardMaterial {
    const mat = new pc.StandardMaterial();
    mat.diffuse = new pc.Color(0.24, 0.65, 0.78);
    mat.ambient = new pc.Color(0.18, 0.48, 0.58);
    mat.shininess = 64;
    mat.opacity = 0.88;
    mat.blendType = pc.BLEND_NORMAL;
    mat.cull = pc.CULLFACE_NONE;
    mat.update();
    return mat;
  }

  private static createDefaultBankMaterial(): pc.StandardMaterial {
    const mat = new pc.StandardMaterial();
    mat.diffuse = new pc.Color(0.32, 0.58, 0.28);
    mat.ambient = new pc.Color(0.22, 0.42, 0.20);
    mat.cull = pc.CULLFACE_NONE;
    mat.update();
    return mat;
  }
}

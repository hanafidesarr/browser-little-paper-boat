import * as pc from 'playcanvas';
import { CatmullRomSpline } from '../spline/CatmullRomSpline';
import { RiverFrame } from '../spline/RiverFrame';

export interface RiverMeshResult {
  waterMesh: pc.Mesh;
  waterEntity: pc.Entity;
  banksMesh: pc.Mesh;
  banksEntity: pc.Entity;
  bedMesh: pc.Mesh;
  bedEntity: pc.Entity;
  samples: RiverFrame[];
}

export interface RiverMeshOptions {
  stepSize?: number;
  crossSubdivisions?: number;
  bankWidth?: number;
  bankHeight?: number;
  bedDepth?: number;
  waterMaterial?: pc.Material;
  bankMaterial?: pc.Material;
  bedMaterial?: pc.Material;
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
    const crossSubs = Math.max(2, options.crossSubdivisions ?? 8);
    const bankWidth = options.bankWidth ?? 15.0;
    const bankHeight = options.bankHeight ?? 3.0;
    const bedDepth = options.bedDepth ?? 1.15;

    const totalLength = spline.getTotalLength();
    const sampleCount = Math.max(4, Math.ceil(totalLength / stepSize) + 1);

    // 1. Sample spline uniformly along distance
    const samples: RiverFrame[] = [];
    for (let i = 0; i < sampleCount; i++) {
      const dist = Math.min(totalLength, (i / (sampleCount - 1)) * totalLength);
      samples.push(spline.sampleAtDistance(dist));
    }

    // 2. Generate Water Surface Mesh (flat at y = 0)
    const waterMesh = this.createWaterMesh(app.graphicsDevice, samples, crossSubs);

    // 3. Generate Sunken Riverbed Mesh underneath water (y = -bedDepth)
    const bedMesh = this.createRiverbedMesh(app.graphicsDevice, samples, crossSubs, bedDepth);

    // 4. Generate Bank Embankment Mesh (y = 0 up to y = bankHeight)
    const banksMesh = this.createBanksMesh(app.graphicsDevice, samples, bankWidth, bankHeight);

    // Create Water Entity
    const waterEntity = new pc.Entity('RiverWater');
    const waterMeshInstance = new pc.MeshInstance(waterMesh, options.waterMaterial || this.createDefaultWaterMaterial());
    waterEntity.addComponent('render', {
      meshInstances: [waterMeshInstance]
    });

    // Create Riverbed Entity
    const bedEntity = new pc.Entity('RiverBed');
    const bedMeshInstance = new pc.MeshInstance(bedMesh, options.bedMaterial || this.createDefaultRiverbedMaterial(app.graphicsDevice));
    bedEntity.addComponent('render', {
      meshInstances: [bedMeshInstance]
    });

    // Create Banks Entity
    const banksEntity = new pc.Entity('RiverBanks');
    const banksMeshInstance = new pc.MeshInstance(banksMesh, options.bankMaterial || this.createDefaultBankMaterial(app.graphicsDevice));
    banksEntity.addComponent('render', {
      meshInstances: [banksMeshInstance]
    });

    return {
      waterMesh,
      waterEntity,
      banksMesh,
      banksEntity,
      bedMesh,
      bedEntity,
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
        const py = sample.position.y;
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

    // Dynamic wave animation metadata
    (mesh as any).__origPositions = Float32Array.from(positions);
    (mesh as any).__currPositions = Float32Array.from(positions);
    (mesh as any).__samples = samples;
    (mesh as any).__crossSubs = crossSubs;

    return mesh;
  }

  private static createRiverbedMesh(
    device: pc.GraphicsDevice,
    samples: RiverFrame[],
    crossSubs: number,
    bedDepth: number = 1.15
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
        const uRatio = c / crossSubs; // 0 to 1 across river width
        const lateralOffset = (uRatio - 0.5) * sample.width;

        const px = sample.position.x + sample.normal.x * lateralOffset;
        // Deep parabolic river channel underneath water
        const cupDepth = Math.sin(uRatio * Math.PI) * bedDepth + 0.05;
        const py = sample.position.y - cupDepth;
        const pz = sample.position.z + sample.normal.z * lateralOffset;

        positions[vIdx * 3 + 0] = px;
        positions[vIdx * 3 + 1] = py;
        positions[vIdx * 3 + 2] = pz;

        // Upward normal with subtle inward curvature
        const slope = Math.cos(uRatio * Math.PI) * 0.35;
        normals[vIdx * 3 + 0] = -sample.normal.x * slope;
        normals[vIdx * 3 + 1] = 0.94;
        normals[vIdx * 3 + 2] = -sample.normal.z * slope;

        uvs[uvIdx * 2 + 0] = uRatio;
        uvs[uvIdx * 2 + 1] = sample.distance / 8.0;

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

  public static createDefaultRiverbedMaterial(device: pc.GraphicsDevice, customTint?: pc.Color): pc.StandardMaterial {
    const mat = new pc.StandardMaterial();

    // Procedural hand-painted riverbed: golden river sand, rounded river stones & smooth pebbles
    // Optimized for Soft Blue Crystal Clear water transparency
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Seamless golden sand & clean riverbed gravel base
    ctx.fillStyle = '#cfc29f'; // Uniform warm riverbed sand (zero seam wrapping)
    ctx.fillRect(0, 0, size, size);

    // Smooth rounded underwater stones & quartz river pebbles
    ctx.fillStyle = 'rgba(118, 132, 140, 0.42)';
    for (let i = 0; i < 75; i++) {
      const cx = (i * 37) % size;
      const cy = (i * 59) % size;
      const rx = 3 + (i % 8);
      const ry = 2 + (i % 6);
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, (i * 0.4), 0, Math.PI * 2);
      ctx.fill();
    }

    // Lighter cream quartz pebbles (shimmering under clear blue water)
    ctx.fillStyle = 'rgba(242, 236, 224, 0.55)';
    for (let j = 0; j < 65; j++) {
      const cx = (j * 43 + 17) % size;
      const cy = (j * 31 + 23) % size;
      const r = 1.5 + (j % 5);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Warm sand ripple veins (clean natural riverbed currents)
    ctx.strokeStyle = 'rgba(168, 150, 122, 0.28)';
    ctx.lineWidth = 2.0;
    for (let k = 0; k < 15; k++) {
      ctx.beginPath();
      ctx.moveTo((k * 19) % size, 0);
      ctx.quadraticCurveTo((k * 31) % size, size * 0.5, (k * 47) % size, size);
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

    mat.diffuse = customTint ?? new pc.Color(1.0, 1.0, 1.0);
    mat.diffuseMap = texture;
    mat.ambient = new pc.Color(0.72, 0.74, 0.76);
    mat.specular = new pc.Color(0.04, 0.04, 0.04);
    mat.shininess = 8;
    mat.cull = pc.CULLFACE_NONE;
    mat.update();
    return mat;
  }

  private static createBanksMesh(
    device: pc.GraphicsDevice,
    samples: RiverFrame[],
    bankWidth: number,
    bankHeight: number
  ): pc.Mesh {
    // Multi-tier Natural Riverbank Profile with Earthen Cutbank and High Plateau:
    // Left Bank: Outer Plateau -> Upper Crest -> Dirt Bluff -> Cutbank -> Waterline Lip
    // Right Bank: Waterline Lip -> Cutbank -> Dirt Bluff -> Upper Crest -> Outer Plateau
    const profile = [
      // Left Bank (5 points)
      { side: -1, extraLateral: bankWidth,        heightFactor: 1.00, uvX: 0.00 }, // Outer high meadow plateau
      { side: -1, extraLateral: bankWidth * 0.46, heightFactor: 0.88, uvX: 0.18 }, // Upper meadow crest
      { side: -1, extraLateral: bankWidth * 0.18, heightFactor: 0.50, uvX: 0.32 }, // Stratified dirt bluff
      { side: -1, extraLateral: bankWidth * 0.04, heightFactor: 0.16, uvX: 0.43 }, // Moist river clay / cutbank
      { side: -1, extraLateral: 0.0,              heightFactor: 0.00, uvX: 0.50 }, // Waterline silt contact
      // Right Bank (5 points)
      { side:  1, extraLateral: 0.0,              heightFactor: 0.00, uvX: 0.50 }, // Waterline silt contact
      { side:  1, extraLateral: bankWidth * 0.04, heightFactor: 0.16, uvX: 0.57 }, // Moist river clay / cutbank
      { side:  1, extraLateral: bankWidth * 0.18, heightFactor: 0.50, uvX: 0.68 }, // Stratified dirt bluff
      { side:  1, extraLateral: bankWidth * 0.46, heightFactor: 0.88, uvX: 0.82 }, // Upper meadow crest
      { side:  1, extraLateral: bankWidth,        heightFactor: 1.00, uvX: 1.00 }  // Outer high meadow plateau
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

        // Normal: Outward slope tilt + upward normal
        const slopeFactor = p.heightFactor > 0.85 ? 0.15 : (p.heightFactor > 0.3 ? 0.65 : 0.45);
        normals[vIdx * 3 + 0] = sample.normal.x * p.side * slopeFactor;
        normals[vIdx * 3 + 1] = Math.sqrt(Math.max(0.1, 1.0 - slopeFactor * slopeFactor));
        normals[vIdx * 3 + 2] = sample.normal.z * p.side * slopeFactor;

        // UV: U = cross-section texture coordinate, V = longitudinal distance
        uvs[uvIdx * 2 + 0] = p.uvX;
        uvs[uvIdx * 2 + 1] = sample.distance / 12.0;

        vIdx++;
        uvIdx++;
      }
    }

    // 8 Quads per segment: 4 quads on Left Bank (0->1, 1->2, 2->3, 3->4) and 4 on Right Bank (5->6, 6->7, 7->8, 8->9)
    const totalQuads = (numRows - 1) * 8;
    const indices = new Uint16Array(totalQuads * 6);
    let idx = 0;

    for (let r = 0; r < numRows - 1; r++) {
      // Left Bank Quads
      for (let c = 0; c < 4; c++) {
        const tl = r * numCols + c;
        const tr = tl + 1;
        const bl = (r + 1) * numCols + c;
        const br = bl + 1;

        indices[idx++] = tl;
        indices[idx++] = tr;
        indices[idx++] = bl;

        indices[idx++] = tr;
        indices[idx++] = br;
        indices[idx++] = bl;
      }

      // Right Bank Quads
      for (let c = 5; c < 9; c++) {
        const tl = r * numCols + c;
        const tr = tl + 1;
        const bl = (r + 1) * numCols + c;
        const br = bl + 1;

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

  private static createDefaultWaterMaterial(): pc.StandardMaterial {
    const mat = new pc.StandardMaterial();
    mat.diffuse = new pc.Color(0.20, 0.68, 0.76);
    mat.ambient = new pc.Color(0.18, 0.48, 0.58);
    mat.shininess = 32;
    mat.opacity = 0.65; // Sedikit transparent soft blue water
    mat.blendType = pc.BLEND_NORMAL;
    mat.cull = pc.CULLFACE_NONE;
    mat.update();
    return mat;
  }

  public static createDefaultBankMaterial(device: pc.GraphicsDevice, customTint?: pc.Color): pc.StandardMaterial {
    const mat = new pc.StandardMaterial();

    // Procedural hand-painted riverbank cross-section:
    // Bright vibrant meadow plateau -> sunlit grass -> smooth light brown (coklat muda) earth transition -> waterline sand
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // 1. Bright Vibrant Meadow & Slender Light Brown (Coklat Muda) Shoreline Strip
    const grad = ctx.createLinearGradient(0, 0, size, 0);
    // Left Bank: Bright Green Grass (0.00-0.44) -> Slender Coklat Muda Strip (0.45-0.50)
    grad.addColorStop(0.00, '#66DE48'); // Bright vibrant meadow green
    grad.addColorStop(0.20, '#74EC54'); // Lush bright sunlit grass
    grad.addColorStop(0.32, '#82EE58'); // Sloping vibrant green grass
    grad.addColorStop(0.38, '#9AEF62'); // Lower slope green grass
    grad.addColorStop(0.42, '#B8EC6E'); // Grass crest right above waterline
    grad.addColorStop(0.44, '#D2C876'); // Soft golden transition edge
    grad.addColorStop(0.46, '#D6B472'); // Coklat muda: slender warm honey soil strip
    grad.addColorStop(0.48, '#CA9C5E'); // Coklat muda: slender light caramel clay lip
    grad.addColorStop(0.50, '#E0C28E'); // Waterline light sand contact

    // Right Bank: Mirror from Waterline to Outer Plateau
    grad.addColorStop(0.50, '#E0C28E'); // Waterline light sand contact
    grad.addColorStop(0.52, '#CA9C5E'); // Coklat muda: slender light caramel clay lip
    grad.addColorStop(0.54, '#D6B472'); // Coklat muda: slender warm honey soil strip
    grad.addColorStop(0.56, '#D2C876'); // Soft golden transition edge
    grad.addColorStop(0.58, '#B8EC6E'); // Grass crest right above waterline
    grad.addColorStop(0.62, '#9AEF62'); // Lower slope green grass
    grad.addColorStop(0.68, '#82EE58'); // Sloping vibrant green grass
    grad.addColorStop(0.80, '#74EC54'); // Lush bright sunlit grass
    grad.addColorStop(1.00, '#66DE48'); // Bright vibrant meadow green

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, 256);

    // 2. Delicate Warm Light Caramel Striations on the slender Coklat Muda shoreline zone
    ctx.fillStyle = 'rgba(165, 115, 65, 0.20)';
    for (let i = 0; i < 28; i++) {
      const y = Math.random() * 256;
      const xLeft = 226 + Math.random() * 28;
      const xRight = 258 + Math.random() * 28;
      const w = 12 + Math.random() * 20;
      ctx.fillRect(xLeft, y, w, 2.0);
      ctx.fillRect(xRight, y, w, 2.0);
    }

    // 3. Natural Light Sand Pebbles along the slender shoreline strip (Coklat Muda & Cream)
    ctx.fillStyle = 'rgba(235, 215, 175, 0.45)';
    for (let j = 0; j < 45; j++) {
      const y = Math.random() * 256;
      const xLeft = 230 + Math.random() * 24;
      const xRight = 258 + Math.random() * 24;
      const r = 1.0 + Math.random() * 1.8;
      ctx.beginPath();
      ctx.arc(xLeft, y, r, 0, Math.PI * 2);
      ctx.arc(xRight, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Stylized Wildflower Sprinkles on the Bright Meadow Plateaus & Slopes (#FFE066 & #FFF6D0)
    for (let k = 0; k < 65; k++) {
      const y = Math.random() * 256;
      const isLeft = Math.random() > 0.5;
      const x = isLeft ? Math.random() * 205 : 307 + Math.random() * 205;
      const isWhite = Math.random() > 0.5;
      ctx.fillStyle = isWhite ? '#FFF6D0' : '#FFE066';
      ctx.beginPath();
      ctx.arc(x, y, 1.6 + Math.random() * 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new pc.Texture(device, {
      width: size,
      height: 256,
      format: pc.PIXELFORMAT_RGBA8,
      addressU: pc.ADDRESS_CLAMP_TO_EDGE,
      addressV: pc.ADDRESS_REPEAT,
      minFilter: pc.FILTER_LINEAR_MIPMAP_LINEAR,
      magFilter: pc.FILTER_LINEAR,
      mipmaps: true
    });
    texture.setSource(canvas);

    if (customTint) {
      // Gentle atmospheric tinting (82% texture true color, 18% level ambiance) so brown soil stays cleanly brown and grass stays bright
      mat.diffuse = new pc.Color(
        0.82 + customTint.r * 0.18,
        0.82 + customTint.g * 0.18,
        0.82 + customTint.b * 0.18
      );
    } else {
      mat.diffuse = new pc.Color(1.0, 1.0, 1.0);
    }
    mat.diffuseMap = texture;
    mat.ambient = new pc.Color(0.68, 0.76, 0.62); // Fresh, bright daylight ambient response
    mat.specular = new pc.Color(0.06, 0.08, 0.05);
    mat.shininess = 12;
    mat.cull = pc.CULLFACE_NONE;
    mat.update();
    return mat;
  }
}

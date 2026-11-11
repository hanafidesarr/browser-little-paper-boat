# LITTLE PAPER BOAT — Technical Architecture (Phase 0 & 1)

## 1. System Overview

```
src/
├── spline/
│   ├── CatmullRomSpline.ts      # Cubic Catmull-Rom spline with arc-length parameterization
│   └── RiverFrame.ts            # River sample frame data structure
├── river/
│   ├── RiverMeshBuilder.ts      # Water mesh and bank mesh procedural generation
│   ├── RiverSystem.ts           # River coordinate queries & spline manager
│   └── RiverPathPresets.ts      # Handcrafted test river containing all 7 required sections
├── camera/
│   └── PrototypeRiverCamera.ts  # Prototype lookahead follow camera
├── debug/
│   └── RiverDebugVisualizer.ts  # Real-time visualizer for tangents, normals, bounds & samples
├── main.ts                      # Phase 1 standalone prototype entry point
└── style.css                    # Clean minimal styling
```

---

## 2. River Coordinate System Specification

The river is represented as a parameterized 3D curve $\mathbf{C}(s)$, where $s \in [0, L]$ is the arc-length distance in meters.

At any distance $s$, the local Frenet-style horizontal reference frame is defined by:
- **Centerline Position:** $\mathbf{P}(s) \in \mathbb{R}^3$
- **Forward Tangent:** $\mathbf{T}(s) = \frac{d\mathbf{C}}{ds}$, $\|\mathbf{T}(s)\| = 1$
- **Horizontal Normal:** $\mathbf{N}(s) = \frac{\mathbf{T}(s) \times \mathbf{UP}}{\|\mathbf{T}(s) \times \mathbf{UP}\|}$ (points to river's right bank)
- **Up Vector:** $\mathbf{B}(s) = \mathbf{N}(s) \times \mathbf{T}(s) \approx (0, 1, 0)$
- **River Width:** $W(s) \in \mathbb{R}^+$
- **Curvature:** $\kappa(s) \in \mathbb{R}$

Any point in river space $(s, u, h)$ maps to world space via:
$$\mathbf{P}_{\text{world}}(s, u, h) = \mathbf{P}(s) + \mathbf{N}(s) \cdot u + \mathbf{B}(s) \cdot h$$
where $u \in \left[-\frac{W(s)}{2}, +\frac{W(s)}{2}\right]$ is the lateral cross-sectional coordinate, and $h$ is vertical elevation above water level.

### Reusable Query Methods on `RiverSystem`:
- `getPositionAtDistance(distance: number): pc.Vec3`
- `getTangentAtDistance(distance: number): pc.Vec3`
- `getNormalAtDistance(distance: number): pc.Vec3`
- `getWidthAtDistance(distance: number): number`
- `getFrameAtDistance(distance: number): RiverFrame`
- `getDistanceAtNormalizedProgress(progress: number): number`

---

## 3. Procedural River Meshing Pipeline

1. **Water Surface Mesh:**
   - Sampled longitudinally at regular intervals $\Delta s \approx 1.5\text{m}$.
   - Subdivided into $M$ cross-sectional columns ($M = 4$ or $6$).
   - Vertex positions: $\mathbf{V}(i, j) = \mathbf{P}(s_i) + \mathbf{N}(s_i) \cdot \left(\left(\frac{j}{M} - 0.5\right) W(s_i)\right)$.
   - Normals: Pointing upward with slight banking curvature.
   - UVs: $U = \frac{j}{M} \in [0, 1]$, $V = \frac{s_i}{\lambda}$.

2. **River Banks Mesh:**
   - Left bank: Extrudes outward from $-\frac{W(s)}{2}$ to $-\frac{W(s)}{2} - W_{\text{bank}}$ while rising from water height $y$ to $y + H_{\text{bank}}$.
   - Right bank: Mirrors left bank from $+\frac{W(s)}{2}$ to $+\frac{W(s)}{2} + W_{\text{bank}}$.
   - Guarantees seamless water-to-bank continuity with 0 gap tolerance.

---

## 4. Debug Visualization Subsystem

A non-intrusive runtime debug layer:
- **Control points:** Yellow spheres.
- **Sample positions:** White dots along the spline spine.
- **Tangents:** Bright green vectors along direction of flow.
- **Normals:** Coral red vectors pointing toward the right bank.
- **River Boundaries:** Cyan lines tracing left and right water edges.
- **Segment Gates:** Translucent cross-sectional boundary lines.
- Toggleable instantaneously via keyboard `D` or on-screen overlay button.

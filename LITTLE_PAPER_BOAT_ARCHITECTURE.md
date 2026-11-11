# Little Paper Boat — Technical Architecture Document

## System Architecture

```
src/
├── main.ts                    # Entry point & bootstrap
├── core/
│   ├── Game.ts                # Main orchestrator & state machine
│   ├── Config.ts              # Global constants & tuning parameters
│   └── EventBus.ts            # Decoupled event messaging
├── spline/
│   ├── CatmullRomSpline.ts    # 3D spline interpolation & arc-length parameterization
│   └── RiverSample.ts         # Sample structure (pos, tangent, normal, width, current, etc.)
├── river/
│   ├── RiverMeshBuilder.ts    # Procedural mesh generation (water surface + banks)
│   └── RiverSystem.ts         # Segment management & coordinate transforms
├── boat/
│   ├── PaperBoatMesh.ts       # Procedural origami boat geometry with creases & paper texture
│   ├── BoatController.ts      # Hybrid spline-lateral physics, acceleration & boundary clamps
│   └── BoatEffects.ts         # Water ripples, wake foam particles & wake trails
├── camera/
│   └── RiverFollowCamera.ts   # Spline-lookahead elevated 3rd-person follow camera
├── water/
│   └── WaterShader.ts         # Stylized PlayCanvas custom shader / material with foam & caustics
├── environment/
│   ├── EnvironmentBuilder.ts  # Deterministic seed-based placement of trees, foliage, rocks & bridges
│   ├── NatureMeshes.ts        # Handcrafted low-overhead procedural models (stylized trees, flowers, rocks)
│   └── WeatherEffects.ts      # Sun shafts, rain particles, floating leaves, fireflies
├── obstacles/
│   ├── ObstacleManager.ts     # Object pooling for river rocks, logs, rapids & animals
│   └── ObstacleEntity.ts      # Collisions, animation & cozy interaction behaviors
├── collectibles/
│   ├── CollectibleManager.ts  # Golden leaves & water lily blossoms
│   └── CollectibleEntity.ts   # Bobbing animation, pickup sparks & audio trigger
├── levels/
│   ├── LevelConfig.ts         # Type definitions for level themes, splines, obstacles & items
│   ├── LevelData.ts           # 10 complete level configurations
│   └── LevelManager.ts        # Level loading, transition & segment generation
├── progression/
│   └── ProgressionManager.ts  # LocalStorage persistence (stars, completion, high scores)
├── audio/
│   └── AudioManager.ts        # Synthesized cozy soundscape (rivers, birds, breeze, chimes, music)
└── ui/
    ├── UIManager.ts           # UI orchestrator
    ├── screens/
    │   ├── MainMenu.ts
    │   ├── LevelSelect.ts
    │   ├── HUD.ts
    │   ├── PauseModal.ts
    │   └── ResultModal.ts
    └── styles.css             # Cozy storybook aesthetic stylesheet
```

### Key Technical Mechanisms

1. **River Coordinate System:**
   - Position is sampled at distance $s$ along the spline: $P_{center}(s)$.
   - Lateral vector $N(s) = T(s) \times (0, 1, 0)$ gives the horizontal cross-section.
   - Boat Position: $P_{boat}(s, u) = P_{center}(s) + N(s) \cdot u$, where $u \in [-W(s)/2, +W(s)/2]$.
   - Steering acts upon $u$ with smooth acceleration, drag, and soft bank bounce boundaries.

2. **Procedural Spline Meshing:**
   - Subdivides spline into cross-sections.
   - River surface: Quad strips with scrolling UV coordinates along $s$.
   - River banks: Left and right embankments extruding outward and upward with gentle terrain skirts.
   - Zero seam gaps, perfectly aligned riverbed and water plane.

3. **Performance & Memory:**
   - Low draw call budget: Shared materials, procedural primitive batching.
   - Object pooling for all obstacles, collectibles, and particles.
   - No runtime garbage collection spikes from per-frame vector allocations.

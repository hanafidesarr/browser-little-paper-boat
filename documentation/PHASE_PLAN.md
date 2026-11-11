# LITTLE PAPER BOAT — Phased Development Plan

This document outlines the strict incremental phase roadmap for *Little Paper Boat*.

---

## Current Scope: Phase 0 & Phase 1

### Phase 0 — Project Audit
- Complete inspection of engine version, build pipeline, canvas management, and directory structure.
- Deliverables:
  - `documentation/PROJECT_AUDIT.md`
  - `documentation/PHASE_PLAN.md`
  - `documentation/LITTLE_PAPER_BOAT_ARCHITECTURE.md`

### Phase 1 — Procedural River Prototype (CURRENT FOCUS)
1. **Spline Generator:**
   - Cubic Catmull-Rom spline with $C^1$ smooth tangents.
   - Stable horizontal normal vectors: $\mathbf{N} = \frac{\mathbf{T} \times \mathbf{UP}}{\|\mathbf{T} \times \mathbf{UP}\|}$.
   - Arc-length parameterization via dense sampling lookup table.
   - Continuous variable river width.
2. **River Mesh Generator:**
   - Procedural quad-strip water ribbon.
   - Correct CCW triangle winding and smooth upward normals.
   - Continuous UV mapping along distance.
3. **River Bank Generator:**
   - Symmetric left and right embankments extruding from water edges.
   - Flush seams between water and bank geometry.
4. **Test River Path:**
   - Straight section $\rightarrow$ Gentle left turn $\rightarrow$ Gentle right turn $\rightarrow$ S-shaped turn $\rightarrow$ Narrow passage $\rightarrow$ Wide section $\rightarrow$ Compound turns.
5. **River Coordinate System:**
   - `getPositionAtDistance(distance)`
   - `getTangentAtDistance(distance)`
   - `getNormalAtDistance(distance)`
   - `getWidthAtDistance(distance)`
   - `getFrameAtDistance(distance)`
   - `getDistanceAtNormalizedProgress(progress)`
6. **Prototype Camera:**
   - Elevated follow camera tracking a moving test point along the spline.
   - Lookahead targeting along the forward river curve.
7. **Debug Visualization:**
   - Toggleable development visualizer (`D` key or button):
   - Spline control points, sample points, tangent vectors (green), normal vectors (red), left/right boundaries (blue), and segment cross-sections.
8. **Phase 1 Acceptance Testing:**
   - 10 rigorous acceptance tests verified before proceeding to Phase 2.

---

## Future Phases (On Hold until Phase 1 Acceptance)

- **Phase 2 — Boat Movement & Controls:** Origami boat mesh, hybrid movement, player steering, roll banking, buoyancy.
- **Phase 3 — Environment & Water Shader:** Animated caustics, trees, stones, flowers, wooden bridges, weather.
- **Phase 4 — Gameplay Systems:** Obstacles, fair bumps, dynamic animals, whirlpool currents, collectibles, finish gate.
- **Phase 5 — Level System:** 10 handcrafted level configurations & progression.
- **Phase 6 — UI & Audio:** Storybook UI, level select, pause menu, synthesized cozy soundscapes.
- **Phase 7 — Optimization & QA:** Mobile performance profiling, final QA sign-off.

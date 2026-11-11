# Little Paper Boat — Game Design Document

**Title:** Little Paper Boat  
**Tagline:** "A little boat. A wonderful journey."  
**Genre:** Cozy Adventure / Relaxing Casual / Obstacle Navigation  
**Platform:** Modern Desktop & Mobile Browsers  
**Engine:** PlayCanvas 2.24+  
**Target Framerate:** 60 FPS Desktop, 30–60 FPS Mobile  

---

## 1. Game Philosophy & Core Experience

*Little Paper Boat* provides a peaceful, atmospheric journey down winding rivers in lush fantasy landscapes. The player guides a delicate origami paper boat drifting naturally with river currents.

### Experience Breakdown
- **60% Peaceful Exploration:** Enjoying scenic river banks, blooming flora, gentle waters, sun rays, and twilight fireflies.
- **30% Light Obstacle Avoidance:** Navigating around mossy river stones, floating driftwood, fallen logs, and gentle swirls.
- **10% Special Challenges & Delights:** Passing through ancient wooden bridge archways, interacting with friendly ducks/frogs, and navigating waterfall turbulence.

### Design Principles
- **No Countdown Timers:** Players explore at the pace of the river's gentle flow.
- **No Punishment / Hard Failures:** Collisions produce soft bumps, water splashes, and temporary slowing, not abrupt game overs.
- **Readability & Fairness:** Obstacles are clearly visible well in advance with clear navigational lanes.
- **Tactile Origami Aesthetic:** The boat features realistic paper folds, soft creasing, natural water buoyancy, and responsive steering.

---

## 2. Controls & Input

- **Desktop:**
  - `A` / `D` or `Left Arrow` / `Right Arrow`: Steer left/right across the river width.
  - Mouse Drag: Direct lateral position dragging across the river cross-section.
- **Mobile:**
  - Virtual Touch Joystick / Horizontal Drag: Fluid lateral displacement.
  - Responsive Landscape Layout with touch-friendly UI.

---

## 3. Systems Overview

1. **Procedural Spline River System:** Continuous 3D Catmull-Rom splines sampling position, tangent, normal, width, and current speed.
2. **Hybrid Boat Movement:** Automatic spline forward progression coupled with player lateral displacement and dynamic physics banking.
3. **Stylized Dynamic Water:** Custom animated shaders with caustic highlights, shore foam blending, and gentle surface bobbing.
4. **Environment & Biome Generator:** Spline-relative placement of rocks, trees, grass patches, flowers, and landmarks without camera obstruction.
5. **Collectibles & Progression:** Golden leaves and river water-lilies stored in browser `localStorage`, unlocking 10 progressive handcrafted journeys.
6. **Adaptive Audio:** WebAudio-based procedural ambient sounds (river murmur, birdsong, breeze, soft splashes) and cozy melodies.

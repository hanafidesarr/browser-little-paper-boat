# LITTLE PAPER BOAT — MOBILE-FIRST OPTIMIZATION & VISUAL REFINEMENT SPECIFICATION

**Project Title:** Little Paper Boat  
**Tagline:** "A little boat. A wonderful journey."  
**Engine:** PlayCanvas 2.24.0 (ESM) | TypeScript 5.4.2 | Vite 5.4.21  
**Primary Target:** Mobile Browsers (iOS Safari, Android Chrome, Tablet WebGL) & Desktop Browsers  

---

## 1. White Square Water Splash Particle Elimination

### Root Cause Analysis
Previously, water splashes created in `EffectManager.ts` utilized `entity.addComponent('render', { type: 'plane' })` equipped with a standard material devoid of an opacity map or alpha channel mask. In PlayCanvas, a plane mesh primitive contains quad vertices in a flat rectangle; without a circular alpha mask, it rendered as an opaque white square polygon on the river surface.

### Reconstructed Implementation
1. **Procedural Soft Alpha Textures (`EffectManager.ts`):**
   - **`getRingTexture(device)`**: Concentric radial gradient with transparent center (inner radius 0.0–0.4), soft cyan-white crest (0.75 radius), and smooth antialiased outer falloff (1.0 radius).
   - **`getDropletTexture(device)`**: Soft Gaussian radial bead gradient (`rgba(220, 248, 255, 0.95)` to `0.0` alpha).
   - **`getMistTexture(device)`**: Soft volumetric Gaussian puff for waterfall zones.
2. **Material Transparency Configuration:**
   - `blendType = pc.BLEND_NORMAL`
   - `depthWrite = false` (prevents depth buffer conflicts and occlusion lines against water geometry)
   - `cull = pc.CULLFACE_NONE`
   - `opacityMap = texture` with `opacityMapChannel = 'a'`
3. **Dedicated Behavioral Systems:**
   - **Fish Jumping (`spawnFishSplash`)**: Emits a soft expanding circular water ripple plus 6 ballistic translucent droplets arcing into the air and splashing back down.
   - **Boat Wake (`spawnBoatWake`)**: Gentle trailing stern ripples emitted continuously as the paper boat glides.
   - **Collisions (`spawnCollisionSplash`)**: High-energy burst splash with expanding ripple and high-velocity lateral droplets.
   - **River Currents (`spawnCurrentBubble`)**: Translucent surface foam bubbles drifting with the water current.
   - **Waterfall Zones (`spawnWaterfallSplashes`)**: Upward rising mist puffs accompanied by cascading droplets.

---

## 2. Progressive Web App (PWA) & Fullscreen Support

### Web App Manifest (`manifest.webmanifest`)
- **Name / Short Name:** `Little Paper Boat`
- **Display Mode:** `fullscreen` (removes browser URL bar, navigation buttons, and status bars when opened)
- **Orientation:** `any` (seamless portrait and landscape support)
- **Theme Color:** `#7ac2cd` (soft aquatic river teal)
- **Background Color:** `#1c3243` (deep river bed blue)
- **Icons:**
  - `icon-192.png` (192x192 PNG, any & maskable)
  - `icon-512.png` (512x512 PNG, any & maskable)
  - `icon.svg` (vector SVG icon)

### Fullscreen Controls & Fixed Viewport
- Configured fixed viewport styling (`height: 100dvh`, `position: fixed`, `inset: 0`, `overflow: hidden`, `touch-action: none`) preventing browser bar reveals during touch drags.
- Automatic `requestFullscreenIfAllowed()` triggered on user gesture (Sail River / Start Journey / Tutorial Understood).
- Dedicated interactive trigger buttons provided in Main Menu (`#btn-fullscreen-main`), Settings (`#btn-fullscreen-settings`), and In-Game HUD (`#btn-hud-fullscreen`).

---

## 3. Water & Land Visual Polish (Visual Realism Refinements)

### 1. Paper Boat Stability & Glitch Elimination (No Flickering)
- **Strobe Fix:** Removed `visualRoot.enabled = blink` which previously caused the paper boat to rapidly flicker on/off at 12 Hz whenever invulnerability was active after respawns or damage. Mesh visibility is now continuously preserved (`enabled = true`).
- **Wake Decal Slicing Fix:** Set `depthWrite = false` on `BoatWakeRing` and attached it flat to the logical navigation root at `y = 0.015`, preventing the wake disc from tilting and slicing through the boat hull in 3D space.
- **Origami Mesh Manifold:** Rebuilt procedural faces in [`PaperBoatMesh.ts`](file:///Users/hanafidesar/Documents/MYPROJECT/GAME%20BROWSER/little-paper-boat/src/boat/PaperBoatMesh.ts) into a clean, non-overlapping origami manifold. Removed co-planar duplicate vertices at prow/stern, eliminating Z-fighting along fold seams.

### 2. Elevated Land & Earthen Soil Riverbank Transition
- **Elevated Land:** Riverbank height increased to `3.0m` (from 1.6m) and width to `15.0m`, sculpting an authentic natural river valley/canyon embankment.
- **10-Column Multi-Tier Profile:**
  - Waterline silt & sand lip (`height 0.0m`).
  - Moist dark river clay / cutbank (`height 0.48m`).
  - Stratified brown dirt bluff / cutbank (`height 1.50m`).
  - Upper meadow grass crest (`height 2.64m`).
  - Outer elevated grass plateau (`height 3.00m`).
- **Rich Procedural Dirt-to-Grass Material:** Hand-painted 512x256 texture featuring exposed stratified soil, natural dirt pebbles, and lush green grass transitions ([`RiverMeshBuilder.ts`](file:///Users/hanafidesar/Documents/MYPROJECT/GAME%20BROWSER/little-paper-boat/src/river/RiverMeshBuilder.ts#L270-L330)).
- **Surface Elevation Alignment:** Nature elements (trees, grass tufts, flower clusters, and rocks) in [`EnvironmentManager.ts`](file:///Users/hanafidesar/Documents/MYPROJECT/GAME%20BROWSER/little-paper-boat/src/environment/EnvironmentManager.ts#L25-L105) sit directly on the elevated terrain profile according to their lateral offset.

### 3. Ultra Crystal-Clear Water with Non-Repeating Waves (Bening & Gelombang Ombak)
- **Ultra Crystal-Clear (Bening Sekali):** Water opacity set to `0.38` with an ultra-translucent aquatic background gradient (`rgba(20, 110, 132, 0.16)` to `rgba(42, 170, 185, 0.05)`). The riverbed, submerged stones, and underwater depths are completely visible.
- **Rolling Wave Crests (Gelombang Ombak):** High-density normal map combines 4 wave harmonics: primary Gerstner-style rolling river swells, crossing diagonal wave crests, surface chop, and capillary micro-ripples.
- **Zero Visible Texture Repetition:**
  - Incommensurate irrational tiling factors (`diffuseMapTiling = Vec2(1.73, 4.19)`, `normalMapTiling = Vec2(3.37, 8.63)`).
  - Dual-speed, opposite-drift UV scrolling: the caustics layer and the wave normal layer continuously glide across each other at different velocities and opposite angles, producing dynamic non-repeating wave interference.
  - 100% optimized for mobile browsers at 60 FPS using standard PlayCanvas materials without costly shader recompilations.

---

## 3. Responsive Camera Architecture

The camera system dynamically adapts its framing according to the viewport aspect ratio and device input:

| Parameter | Desktop Landscape | Mobile Landscape | Mobile Portrait |
| :--- | :---: | :---: | :---: |
| **Follow Distance** | 12.0 m | **9.5 m** (Closer) | **8.2 m** (Closest) |
| **Elevation** | 10.0 m | 8.2 m | 8.8 m |
| **Lookahead along Spline** | 3.8 m | 3.5 m | **5.2 m** (Extended corridor view) |
| **Look Target Height (Y)** | 0.35 m | 0.35 m | 0.40 m |
| **Field of View (FOV)** | 58° | 62° | 66° |

### Smooth Orientation Transition
When the device is rotated, the camera continuously lerps its parameters (`dt * 3.5`), preventing abrupt cuts or visual jarring while preserving boat navigation progress.

---

## 4. Portrait & Landscape Gameplay Support

### Portrait Mode Support
- The previous blocking `#portrait-advisory` overlay is eliminated; portrait orientation is now a fully functional first-class gameplay mode.
- River camera sits closer to the boat with extended lookahead along the vertical corridor.

### Responsive Touch Joystick (`VirtualJoystick.ts`)
- **Portrait Positioning:** Centered horizontally near the bottom of the viewport:
  ```css
  bottom: calc(22px + var(--safe-bottom));
  left: 50%;
  transform: translateX(-50%);
  ```
- **Landscape Positioning:** Positioned at bottom-left:
  ```css
  bottom: calc(22px + var(--safe-bottom));
  left: calc(28px + var(--safe-left));
  transform: none;
  ```
- **Pointer Event Handling:** Supports `pointerdown`, `pointermove`, `pointerup`, and `pointercancel` with pointer capture, analog clamping, and multi-touch isolation so touch button interactions never conflict with steering.

---

## 5. Water Visual Quality Upgrades (`WaterMaterial.ts`)

- **Multi-Frequency Caustics:** Procedural Voronoi-style caustic cells rendered with layered watercolor strokes and sunlit water glints.
- **Tri-Octave Surface Ripple Normal Map:** Synthesizes longitudinal flow swells, diagonal crossing ripples, and fine surface shimmer.
- **Warm Sunlight Specular Reflections:** Material specular tuned to `Color(0.88, 0.96, 1.0)` with shininess 64, generating sparkling wave crests in sunlight.
- **Dual Scrolling UVs:** Differential longitudinal and cross-flow speeds create organic wave interference without requiring expensive planar reflections or compute shaders.

---

## 6. Graphics Quality Profiles

Users can choose between 3 visual quality profiles saved in `localStorage`:

1. **Performance (Default for Mobile):**
   - Pixel ratio clamped to `1.0` (saves battery, prevents GPU thermal throttling on high-DPI phones)
   - Optimized particle budgets
2. **Balanced (Default for Desktop):**
   - Pixel ratio up to `1.5`
   - Standard particle and ripple density
3. **Quality:**
   - Full native device pixel ratio (up to `2.0` on Retina displays)
   - Maximum visual sharpness

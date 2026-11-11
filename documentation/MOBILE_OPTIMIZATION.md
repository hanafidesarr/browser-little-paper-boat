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

## 3. Water Rendering & Visual Polish (7 Core Refinements)

### 1. Water Glare Elimination
- Reduced water specular highlight from `Color(0.88, 0.96, 1.0)` down to `Color(0.04, 0.06, 0.08)` and lowered shininess from 64 to 16.
- Directional sun intensity softened to 1.15 and ambient fill to 0.58.
- Harsh white diamond caustics eliminated in favor of gentle, soft watercolor caustics.

### 2. Multi-Octave Small Waves (Gelombang Kecil)
- Generated procedural high-frequency normal texture combining 3 wave harmonics: longitudinal current ripples, diagonal crossing waves, and fine capillary micro-ripples.
- Continuous dual-phase UV scrolling offset in update loop creates living river surface motion.

### 3. Under-Boat Hull Wake & Flank Ripples
- Added `EffectManager.spawnBoatWaterInteraction(...)`:
  - Central displacement ripple under the hull at waterline (`y = 0.026`).
  - Dual bow V-ripples branching outward along the boat's flanks.
  - Micro-foam bubbles and droplets during sharp turns and banking.

### 4. Crystal-Clear Transparent Water (Bening)
- Water opacity lowered to `0.54` for crystalline clarity revealing the cupped riverbed beneath.
- Translucent caustics canvas background (`rgba(28, 120, 145, 0.30)` to `rgba(48, 170, 185, 0.15)`).

### 5. Touchpad Navigation (No Virtual Joystick)
- Virtual joystick visually hidden (`display: none !important; pointer-events: none !important;`).
- Direct screen touchpad dragging implemented on canvas with smooth sensitivity and horizontal drift compensation.

### 6. Authentic Origami Paper Material (Zero Black Faces)
- High-res procedural washi paper texture with subtle organic fibers (`#faf8f2`).
- Flat normal vectors sanitized (`norm.y < -0.15 => norm.mulScalar(-1)`).
- Material configured with `twoSidedLighting: true`, `cull: CULLFACE_NONE`, `emissive: Color(0.24, 0.23, 0.22)` for paper subsurface translucency, warm ambient `Color(0.85, 0.83, 0.80)`, and soft matte specular `Color(0.06, 0.06, 0.06)`. Absolutely zero pitch-black polygons.

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

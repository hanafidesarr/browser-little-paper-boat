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
- **Display Mode:** `standalone` (removes browser URL bar and navigation buttons when installed to home screen)
- **Theme Color:** `#7ac2cd` (soft aquatic river teal)
- **Background Color:** `#1c3243` (deep river bed blue)
- **Icons:**
  - `icon-192.png` (192x192 PNG, any & maskable)
  - `icon-512.png` (512x512 PNG, any & maskable)
  - `icon.svg` (vector SVG icon)

### Service Worker (`public/sw.js`)
- Pre-caches core application shell (`/`, `/index.html`, `/manifest.webmanifest`, `/favicon.svg`, `/icons/icon.svg`).
- **Network-First for Navigation (HTML):** Ensures users immediately receive updated game releases without stale code lock-in.
- **Cache-First for Hashed Static Assets:** High-speed instant loading for immutable Vite chunks (`/assets/*`).
- **Cache Invalidation:** Automatically purges outdated caches upon activating a new version tag.

### Fullscreen Controls
- Cross-platform Fullscreen API helper supporting standard `requestFullscreen()` and WebKit `webkitRequestFullscreen()`.
- Interactive trigger buttons provided in:
  - Main Menu (`#btn-fullscreen-main`)
  - Settings Modal (`#btn-fullscreen-settings`)
  - In-Game HUD (`#btn-hud-fullscreen`)

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

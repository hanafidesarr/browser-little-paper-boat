# LITTLE PAPER BOAT — Phase 0 Project Audit

**Date:** 2026-11-11  
**Project:** Little Paper Boat  
**Engine:** PlayCanvas 2.24.0  
**Build Tool:** Vite 5.1.6  
**Language:** TypeScript 5.4.2  

---

## 1. Project Structure Inspection

```
little-paper-boat/
├── documentation/
│   ├── PROJECT_AUDIT.md
│   ├── PHASE_PLAN.md
│   └── LITTLE_PAPER_BOAT_ARCHITECTURE.md
├── src/
│   ├── core/
│   ├── spline/
│   ├── river/
│   ├── debug/
│   └── main.ts
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

- **Root directory:** `little-paper-boat` (dedicated workspace).
- **Environment:** Node.js v20.19.6, npm 10.8.2.

---

## 2. PlayCanvas Engine Version

- **Installed Version:** `playcanvas` 2.24.0 (ESM build via npm).
- **API Features Utilized:**
  - `pc.Application` / `pc.AppBase`
  - `pc.GraphicsDevice`, `pc.Mesh`, `pc.MeshInstance`, `pc.Model`
  - `pc.StandardMaterial`, `pc.Color`, `pc.Vec3`, `pc.Mat4`, `pc.Quat`
  - `pc.FILLMODE_FILL_WINDOW`, `pc.RESOLUTION_AUTO`
  - PlayCanvas built-in line rendering (`app.drawLine`) for high-performance debug visualizer.

---

## 3. Rendering Pipeline

- **Target:** WebGL2 / WebGPU modern desktop and mobile browsers.
- **Canvas Setup:** Dynamic viewport sizing (`app.resizeCanvas()` on window resize).
- **Pipeline:** Forward rendering with directional sunlight and ambient fill.
- **Color Space:** Linear workflow with standard sRGB display.

---

## 4. Scenes, Entities, and Hierarchy

- Clean entity hierarchy anchored to `app.root`:
  - `SunLight` (directional light)
  - `AmbientFill` (ambient directional light)
  - `PrototypeFollowCamera` (elevated prototype camera with lookahead)
  - `RiverSystemRoot`:
    - `RiverWater` (procedural water mesh)
    - `RiverBanks` (procedural bank mesh)
  - `SplineProbe` (visual moving test point drifting along the spline)
  - `RiverDebugVisualizer` (development visualization overlay)

---

## 5. Scripts and Dependencies

- **Dependencies:**
  - `playcanvas`: `^2.2.0` (core 3D engine)
- **Dev Dependencies:**
  - `vite`: `^5.1.6` (ESM bundler & dev server)
  - `typescript`: `^5.4.2` (strict typed codebase)

---

## 6. Asset Loading & Development Workflow

- **Asset Workflow:** Procedural geometry and procedural textures (HTML5 Canvas-backed dynamic caustics / materials) ensure instant startup with zero external HTTP asset blocking or missing asset errors.
- **Launch Command:** `npm run dev` (starts Vite dev server on `http://localhost:3000`).
- **Build / Verification Command:** `npm run build` (`tsc && vite build`).
- **Preview Command:** `npm run preview`.

---

## 7. Functionality to Preserve for Phase 1

- Keep the pure procedural mathematical approach for Catmull-Rom spline arc-length sampling.
- Keep the decoupled separation between:
  1. Spline evaluation ([`CatmullRomSpline.ts`](file:///Users/hanafidesar/Documents/MYPROJECT/GAME%20BROWSER/little-paper-boat/src/spline/CatmullRomSpline.ts))
  2. River coordinate system queries ([`RiverSystem.ts`](file:///Users/hanafidesar/Documents/MYPROJECT/GAME%20BROWSER/little-paper-boat/src/river/RiverSystem.ts))
  3. Mesh & bank geometry synthesis ([`RiverMeshBuilder.ts`](file:///Users/hanafidesar/Documents/MYPROJECT/GAME%20BROWSER/little-paper-boat/src/river/RiverMeshBuilder.ts))
  4. Real-time debug vector visualizer ([`RiverDebugVisualizer.ts`](file:///Users/hanafidesar/Documents/MYPROJECT/GAME%20BROWSER/little-paper-boat/src/debug/RiverDebugVisualizer.ts))

import * as pc from 'playcanvas';
import { RiverSystem } from './river/RiverSystem';
import { RiverPathPresets } from './river/RiverPathPresets';
import { PrototypeRiverCamera } from './camera/PrototypeRiverCamera';
import { RiverDebugVisualizer } from './debug/RiverDebugVisualizer';

window.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize PlayCanvas Application
  const canvas = document.getElementById('application-canvas') as HTMLCanvasElement;
  const app = new pc.Application(canvas, {
    mouse: new pc.Mouse(canvas),
    touch: new pc.TouchDevice(canvas),
    keyboard: new pc.Keyboard(window),
    elementInput: new pc.ElementInput(canvas)
  });

  app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
  app.setCanvasResolution(pc.RESOLUTION_AUTO);
  app.start();

  window.addEventListener('resize', () => app.resizeCanvas());

  // 2. Scene Lighting
  const sunLight = new pc.Entity('SunLight');
  sunLight.addComponent('light', {
    type: 'directional',
    color: new pc.Color(1.0, 0.96, 0.88),
    intensity: 1.3
  });
  sunLight.setEulerAngles(45, 30, 0);
  app.root.addChild(sunLight);

  const ambientFill = new pc.Entity('AmbientFill');
  ambientFill.addComponent('light', {
    type: 'directional',
    color: new pc.Color(0.7, 0.82, 0.95),
    intensity: 0.5
  });
  ambientFill.setEulerAngles(-60, 150, 0);
  app.root.addChild(ambientFill);

  // 3. Initialize Procedural River System with Phase 1 Test Spline
  const river = new RiverSystem(app);
  const testSplinePoints = RiverPathPresets.getPhase1TestRiver();
  river.initFromPoints(testSplinePoints, {
    stepSize: 1.5,
    crossSubdivisions: 4,
    bankWidth: 12.0,
    bankHeight: 1.8
  });

  const totalLength = river.getTotalLength();

  // 4. Create Moving Probe (Test marker drifting along spline)
  const probeEntity = new pc.Entity('SplineProbeMarker');
  probeEntity.addComponent('render', {
    type: 'cone'
  });
  probeEntity.setLocalScale(0.8, 1.2, 0.8);
  probeEntity.setLocalEulerAngles(90, 0, 0);

  const probeMat = new pc.StandardMaterial();
  probeMat.diffuse = new pc.Color(0.15, 0.85, 0.75);
  probeMat.emissive = new pc.Color(0.08, 0.45, 0.40);
  probeMat.shininess = 64;
  probeMat.update();
  if (probeEntity.render?.meshInstances[0]) {
    probeEntity.render.meshInstances[0].material = probeMat;
  }
  app.root.addChild(probeEntity);

  // 5. Prototype Camera
  const camera = new PrototypeRiverCamera(app, river);

  // 6. Debug Visualizer
  const debugVis = new RiverDebugVisualizer(app, river);

  // State
  let probeDistance = 0.0;
  let probeSpeed = 5.0; // m/s
  let isPaused = false;

  // DOM Elements
  const elDistance = document.getElementById('metric-distance')!;
  const elProgress = document.getElementById('metric-progress')!;
  const elWidth = document.getElementById('metric-width')!;
  const elCurvature = document.getElementById('metric-curvature')!;
  const elTotal = document.getElementById('metric-total')!;
  const elSpeed = document.getElementById('metric-speed')!;
  const elSection = document.getElementById('section-indicator')!;
  const btnToggleDebug = document.getElementById('btn-toggle-debug')!;
  const btnTogglePause = document.getElementById('btn-toggle-pause')!;
  const btnRestart = document.getElementById('btn-restart-probe')!;

  elTotal.textContent = `${totalLength.toFixed(1)} m`;

  const getSectionName = (dist: number): string => {
    if (dist < 35) return '1. Straight Section';
    if (dist < 75) return '2. Gentle Left Turn';
    if (dist < 120) return '3. Gentle Right Turn';
    if (dist < 195) return '4. S-Shaped Turn';
    if (dist < 240) return '5. Narrow Passage (Width 4.8m)';
    if (dist < 285) return '6. Wide Section (Width 12.0m)';
    return '7. Compound Left/Right Turns';
  };

  // Button Listeners
  btnToggleDebug.addEventListener('click', () => {
    const active = debugVis.toggle();
    btnToggleDebug.textContent = active ? 'Hide Debug Vectors (D)' : 'Show Debug Vectors (D)';
  });

  btnTogglePause.addEventListener('click', () => {
    isPaused = !isPaused;
    btnTogglePause.textContent = isPaused ? 'Resume Probe' : 'Pause Probe';
  });

  btnRestart.addEventListener('click', () => {
    probeDistance = 0.0;
    camera.reset();
  });

  // Keyboard shortcut 'D' and 'Space'
  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyD') {
      const active = debugVis.toggle();
      btnToggleDebug.textContent = active ? 'Hide Debug Vectors (D)' : 'Show Debug Vectors (D)';
    } else if (e.code === 'Space') {
      isPaused = !isPaused;
      btnTogglePause.textContent = isPaused ? 'Resume Probe' : 'Pause Probe';
    }
  });

  // 7. Main Update Loop
  app.on('update', (dt: number) => {
    if (!isPaused && dt > 0) {
      probeDistance += probeSpeed * dt;
      if (probeDistance > totalLength) {
        probeDistance = 0.0;
        camera.reset();
      }
    }

    // River Frame evaluation
    const frame = river.getFrameAtDistance(probeDistance);

    // Update Probe Position & Rotation along spline
    probeEntity.setPosition(frame.position.x, frame.position.y + 0.35, frame.position.z);

    const rotMat = new pc.Mat4();
    rotMat.setLookAt(pc.Vec3.ZERO, frame.tangent, pc.Vec3.UP);
    probeEntity.setRotation(new pc.Quat().setFromMat4(rotMat));

    // Update Prototype Follow Camera
    camera.update(dt, probeDistance);

    // Render Debug Lines
    debugVis.render();

    // Update UI Metrics
    elDistance.textContent = `${probeDistance.toFixed(1)} m`;
    elProgress.textContent = `${(frame.progress * 100).toFixed(1)}%`;
    elWidth.textContent = `${frame.width.toFixed(1)} m`;
    elCurvature.textContent = `${frame.curvature.toFixed(2)} rad/m`;
    elSpeed.textContent = `${probeSpeed.toFixed(1)} m/s`;
    elSection.textContent = getSectionName(probeDistance);
  });

  console.log('Little Paper Boat — Phase 1 Procedural River Prototype ready.');
});

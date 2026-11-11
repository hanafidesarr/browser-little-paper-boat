import * as pc from 'playcanvas';
import { RiverSystem } from './river/RiverSystem';
import { RiverPathPresets } from './river/RiverPathPresets';
import { BoatController } from './boat/BoatController';
import { RiverFollowCamera } from './camera/RiverFollowCamera';
import { RiverDebugVisualizer } from './debug/RiverDebugVisualizer';
import { WaterMaterial } from './water/WaterMaterial';
import { EnvironmentManager } from './environment/EnvironmentManager';
import { WeatherEffects } from './environment/WeatherEffects';

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

  // 2. Warm Cinematic Sunlight & Soft Atmospheric Fog
  const skyColor = new pc.Color(0.70, 0.86, 0.94);
  app.scene.fog.type = pc.FOG_LINEAR;
  app.scene.fog.color.copy(skyColor);
  app.scene.fog.start = 65;
  app.scene.fog.end = 260;
  app.scene.ambientLight = new pc.Color(0.55, 0.68, 0.76);

  const sunLight = new pc.Entity('SunLight');
  sunLight.addComponent('light', {
    type: 'directional',
    color: new pc.Color(1.0, 0.96, 0.86),
    intensity: 1.35
  });
  sunLight.setEulerAngles(45, 30, 0);
  app.root.addChild(sunLight);

  const ambientFill = new pc.Entity('AmbientFill');
  ambientFill.addComponent('light', {
    type: 'directional',
    color: new pc.Color(0.72, 0.84, 0.96),
    intensity: 0.5
  });
  ambientFill.setEulerAngles(-60, 150, 0);
  app.root.addChild(ambientFill);

  // 3. Stylized Animated Water Material & Bank Material
  const { material: waterMat, update: waterUpdate } = WaterMaterial.create(
    app.graphicsDevice,
    new pc.Color(0.24, 0.68, 0.82),
    0.88
  );

  // 4. Initialize Procedural River System
  const river = new RiverSystem(app);
  const testRiverPoints = RiverPathPresets.getPhase1TestRiver();
  river.initFromPoints(testRiverPoints, {
    waterMaterial: waterMat,
    stepSize: 1.5,
    crossSubdivisions: 4,
    bankWidth: 12.0,
    bankHeight: 1.8
  });

  const totalLength = river.getTotalLength();

  // 5. Instantiate Hybrid Boat Controller
  const boat = new BoatController(app, river);
  boat.setPosition(2.0, 0.0);

  // 6. Reconstructed Elevated Follow Camera with Lookahead
  const camera = new RiverFollowCamera(app, river, boat);

  // 7. Deterministic Spline-Relative Environment Population
  const environment = new EnvironmentManager(app, river);
  environment.populate({
    seed: 101,
    treeDensity: 1.3,
    rockDensity: 1.0,
    lilyPadDensity: 0.8,
    flowerDensity: 1.2,
    bridgeDistances: [95, 250]
  });

  // 8. Atmospheric Weather Particles (Sunny floating pollen & motes)
  const weather = new WeatherEffects(app);
  weather.setWeather('sunny', boat.getPosition());

  // 9. Debug Visualizer (starts disabled, toggleable via D)
  const debugVis = new RiverDebugVisualizer(app, river);

  // 10. UI & Telemetry
  const elDistance = document.getElementById('p3-metric-distance')!;
  const elLateral = document.getElementById('p3-metric-lateral')!;
  const elSpeed = document.getElementById('p3-metric-speed')!;
  const elWidth = document.getElementById('p3-metric-width')!;
  const elSection = document.getElementById('p3-section-name')!;
  const boundaryFlash = document.getElementById('boundary-flash')!;

  const btnToggleDebug = document.getElementById('p3-btn-toggle-debug')!;
  const btnToggleJoystick = document.getElementById('p3-btn-toggle-joystick')!;
  const btnRestart = document.getElementById('p3-btn-restart')!;

  let joystickVisible = true;
  let isPaused = false;

  const getSectionName = (dist: number): string => {
    if (dist < 35) return '1. Morning Creek (Straight Flow)';
    if (dist < 75) return '2. Lily Garden Bend (Gentle Left)';
    if (dist < 120) return '3. Rustic Bridge (Gentle Right)';
    if (dist < 195) return '4. Mossy S-Curves (Lush Canopy)';
    if (dist < 240) return '5. Narrow Gorge Passage (Width 4.8m)';
    if (dist < 285) return '6. Expansive Lagoon (Width 12.0m)';
    return '7. Blossom Estuary (Compound Curves)';
  };

  // Bank Bump Event
  boat.onBankBump = () => {
    boundaryFlash.classList.add('active');
    setTimeout(() => {
      boundaryFlash.classList.remove('active');
    }, 350);
  };

  // Button Listeners
  btnToggleDebug.addEventListener('click', () => {
    const active = debugVis.toggle();
    btnToggleDebug.textContent = active ? 'Hide Vectors (D)' : 'Show Vectors (D)';
  });

  btnToggleJoystick.addEventListener('click', () => {
    joystickVisible = !joystickVisible;
    boat.setJoystickVisible(joystickVisible);
    btnToggleJoystick.textContent = joystickVisible ? 'Hide Joystick' : 'Show Joystick';
  });

  const restartBoat = () => {
    boat.setPosition(2.0, 0.0);
    camera.reset();
  };

  btnRestart.addEventListener('click', restartBoat);

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyD') {
      const active = debugVis.toggle();
      btnToggleDebug.textContent = active ? 'Hide Vectors (D)' : 'Show Vectors (D)';
    } else if (e.code === 'KeyR') {
      restartBoat();
    } else if (e.code === 'Space') {
      isPaused = !isPaused;
    }
  });

  // 11. Main Game Loop
  app.on('update', (dt: number) => {
    if (!isPaused && dt > 0) {
      // Flowing water animated caustics & normal map
      waterUpdate(dt, boat.getForwardSpeed());

      // Floating lily pad oscillations
      environment.update(dt);

      // Atmospheric pollen & motes drifting in breeze
      weather.update(dt, boat.getPosition());

      // Boat & Camera updates
      boat.update(dt);
      camera.update(dt);
    }

    // Render debug vectors if enabled
    if (debugVis.isEnabled()) {
      debugVis.render();
      debugVis.renderCameraDebug(camera, boat);
    }

    // Telemetry updates
    const dist = boat.getDistance();
    const lat = boat.getLateralOffset();
    const fwdSpeed = boat.getForwardSpeed();
    const frame = river.getFrameAtDistance(dist);

    elDistance.textContent = `${dist.toFixed(1)} m / ${totalLength.toFixed(1)} m`;
    elLateral.textContent = `${lat >= 0 ? '+' : ''}${lat.toFixed(2)} m`;
    elSpeed.textContent = `${fwdSpeed.toFixed(1)} m/s`;
    elWidth.textContent = `${frame.width.toFixed(1)} m`;
    elSection.textContent = getSectionName(dist);

    // Auto-loop when reaching end of river
    if (dist >= totalLength) {
      setTimeout(() => {
        restartBoat();
      }, 500);
    }
  });

  console.log('Little Paper Boat — Phase 3 Stylized Hand-Painted 3D Environment initialized.');
});

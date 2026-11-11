import * as pc from 'playcanvas';
import { RiverSystem } from './river/RiverSystem';
import { RiverPathPresets } from './river/RiverPathPresets';
import { BoatController } from './boat/BoatController';
import { RiverFollowCamera } from './camera/RiverFollowCamera';
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

  // 2. Lighting: Directional sunlight & ambient sky fill
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

  // 3. Initialize Procedural River System (Preserving Phase 1)
  const river = new RiverSystem(app);
  const testRiverPoints = RiverPathPresets.getPhase1TestRiver();
  river.initFromPoints(testRiverPoints, {
    stepSize: 1.5,
    crossSubdivisions: 4,
    bankWidth: 12.0,
    bankHeight: 1.8
  });

  const totalLength = river.getTotalLength();

  // 4. Instantiate Hybrid Boat Controller
  const boat = new BoatController(app, river);
  boat.setPosition(2.0, 0.0);

  // 5. Reconstructed Elevated Follow Camera with Lookahead
  const camera = new RiverFollowCamera(app, river, boat);

  // 6. Debug Visualizer (Preserving Phase 1 + Camera Vector Debugger)
  const debugVis = new RiverDebugVisualizer(app, river);

  // 7. Telemetry & UI Bindings
  const elDistance = document.getElementById('p2-metric-distance')!;
  const elLateral = document.getElementById('p2-metric-lateral')!;
  const elSpeed = document.getElementById('p2-metric-speed')!;
  const elWidth = document.getElementById('p2-metric-width')!;
  const elSection = document.getElementById('p2-section-name')!;
  const boundaryFlash = document.getElementById('boundary-flash')!;

  // Camera Telemetry DOM elements
  const elCamPos = document.getElementById('cam-pos')!;
  const elCamPitch = document.getElementById('cam-pitch')!;
  const elCamYaw = document.getElementById('cam-yaw')!;
  const elCamTarget = document.getElementById('cam-target')!;
  const elCamBoatDist = document.getElementById('cam-boat-dist')!;
  const elCamHeight = document.getElementById('cam-height')!;
  const elBoatPos = document.getElementById('boat-pos')!;

  const btnToggleDebug = document.getElementById('p2-btn-toggle-debug')!;
  const btnToggleJoystick = document.getElementById('p2-btn-toggle-joystick')!;
  const btnRestart = document.getElementById('p2-btn-restart')!;

  let joystickVisible = true;
  let isPaused = false;

  const getSectionName = (dist: number): string => {
    if (dist < 35) return '1. Straight Section (Base Speed 4.5m/s)';
    if (dist < 75) return '2. Gentle Left Turn (Width 8.2m)';
    if (dist < 120) return '3. Gentle Right Turn (Width 8.0m)';
    if (dist < 195) return '4. S-Shaped Curve (Lateral Agility)';
    if (dist < 240) return '5. Narrow Passage (Choke Point Width 4.8m - Current +20%)';
    if (dist < 285) return '6. Wide Section (Expansive Basin Width 12.0m)';
    return '7. Compound Left/Right Turns (Final Approach)';
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

  // 8. Main Game Loop
  app.on('update', (dt: number) => {
    if (!isPaused && dt > 0) {
      boat.update(dt);
      camera.update(dt);
    }

    // Render debug vectors (spline lines + camera look ray & vectors)
    debugVis.render();
    debugVis.renderCameraDebug(camera, boat);

    // Telemetry updates
    const dist = boat.getDistance();
    const lat = boat.getLateralOffset();
    const fwdSpeed = boat.getForwardSpeed();
    const frame = river.getFrameAtDistance(dist);
    const bPos = boat.getLogicalPosition();

    elDistance.textContent = `${dist.toFixed(1)} m / ${totalLength.toFixed(1)} m`;
    elLateral.textContent = `${lat >= 0 ? '+' : ''}${lat.toFixed(2)} m`;
    elSpeed.textContent = `${fwdSpeed.toFixed(1)} m/s`;
    elWidth.textContent = `${frame.width.toFixed(1)} m`;
    elSection.textContent = getSectionName(dist);

    // Camera Telemetry
    const camTele = camera.getTelemetry();
    elCamPos.textContent = `(${camTele.worldPosition.x.toFixed(1)}, ${camTele.worldPosition.y.toFixed(1)}, ${camTele.worldPosition.z.toFixed(1)})`;
    elCamPitch.textContent = `${camTele.pitchDeg.toFixed(1)}° (Downward)`;
    elCamYaw.textContent = `${camTele.yawDeg.toFixed(1)}°`;
    elCamTarget.textContent = `(${camTele.lookTarget.x.toFixed(1)}, ${camTele.lookTarget.y.toFixed(1)}, ${camTele.lookTarget.z.toFixed(1)})`;
    elCamBoatDist.textContent = `${camTele.distanceToBoat.toFixed(1)} m`;
    elCamHeight.textContent = `${camTele.heightAboveWater.toFixed(1)} m`;
    elBoatPos.textContent = `(${bPos.x.toFixed(1)}, ${bPos.y.toFixed(1)}, ${bPos.z.toFixed(1)})`;

    // Auto-loop test when reaching end
    if (dist >= totalLength) {
      setTimeout(() => {
        restartBoat();
      }, 500);
    }
  });

  console.log('Little Paper Boat — Reconstructed Elevated Camera initialized.');
});

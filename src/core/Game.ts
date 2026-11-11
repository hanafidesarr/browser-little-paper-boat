import * as pc from 'playcanvas';
import { RiverSystem } from '../river/RiverSystem';
import { BoatController } from '../boat/BoatController';
import { RiverFollowCamera } from '../camera/RiverFollowCamera';
import { EnvironmentManager } from '../environment/EnvironmentManager';
import { WeatherEffects } from '../environment/WeatherEffects';
import { ObstacleManager } from '../obstacles/ObstacleManager';
import { CollectibleManager } from '../collectibles/CollectibleManager';
import { CheckpointManager } from '../checkpoints/CheckpointManager';
import { EffectManager } from '../particles/EffectManager';
import { LevelManager } from '../levels/LevelManager';
import { ProgressionManager } from '../progression/ProgressionManager';
import { AudioManager } from '../audio/AudioManager';
import { UIManager, GameState, ModalType } from '../ui/UIManager';

export class Game {
  private app: pc.AppBase;
  private state: GameState = 'MAIN_MENU';

  // Systems
  private river: RiverSystem;
  private boat: BoatController;
  private camera: RiverFollowCamera;
  private environment: EnvironmentManager;
  private weather: WeatherEffects;
  private effects: EffectManager;
  private audio: AudioManager;
  private obstacles: ObstacleManager;
  private collectibles: CollectibleManager;
  private checkpoints: CheckpointManager;
  private levelManager: LevelManager;
  private ui: UIManager;

  private sunLight: pc.Entity;
  private boatWakeTimer: number = 0;

  constructor() {
    ProgressionManager.init();

    // 1. Initialize PlayCanvas Application
    const canvas = document.getElementById('application-canvas') as HTMLCanvasElement;
    this.app = new pc.Application(canvas, {
      mouse: new pc.Mouse(canvas),
      touch: new pc.TouchDevice(canvas),
      keyboard: new pc.Keyboard(window),
      elementInput: new pc.ElementInput(canvas)
    });

    this.app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
    this.app.setCanvasResolution(pc.RESOLUTION_AUTO);
    this.app.start();

    window.addEventListener('resize', () => this.app.resizeCanvas());
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.app.resizeCanvas(), 100);
    });

    // 2. Lighting
    this.sunLight = new pc.Entity('SunLight');
    this.sunLight.addComponent('light', {
      type: 'directional',
      color: new pc.Color(1.0, 0.96, 0.88),
      intensity: 1.15
    });
    this.sunLight.setEulerAngles(45, 30, 0);
    this.app.root.addChild(this.sunLight);

    const ambientFill = new pc.Entity('AmbientFill');
    ambientFill.addComponent('light', {
      type: 'directional',
      color: new pc.Color(0.72, 0.84, 0.96),
      intensity: 0.58
    });
    ambientFill.setEulerAngles(-60, 150, 0);
    this.app.root.addChild(ambientFill);

    // 3. Subsystems
    this.audio = new AudioManager();
    this.effects = new EffectManager(this.app);
    this.river = new RiverSystem(this.app);
    this.boat = new BoatController(this.app, this.river);
    this.camera = new RiverFollowCamera(this.app, this.river, this.boat);
    this.environment = new EnvironmentManager(this.app, this.river);
    this.weather = new WeatherEffects(this.app);
    this.obstacles = new ObstacleManager(this.app, this.river, this.effects, this.audio);
    this.collectibles = new CollectibleManager(this.app, this.river, this.effects, this.audio);
    this.checkpoints = new CheckpointManager(this.app, this.river, this.boat, this.effects, this.audio);

    this.levelManager = new LevelManager(
      this.app,
      this.river,
      this.boat,
      this.environment,
      this.weather,
      this.obstacles,
      this.collectibles,
      this.checkpoints,
      this.effects,
      this.audio,
      this.sunLight,
      this.camera.getEntity()
    );

    this.ui = new UIManager(this.audio);

    this.setupInteractions();
    this.bindGlobalKeyboard();
    this.startLoop();

    // Apply saved graphics profile
    this.setGraphicsQuality(ProgressionManager.getGraphicsQuality());

    // Load Level 1 into background for peaceful main menu scene
    this.levelManager.loadLevel(1);
    this.state = 'MAIN_MENU';
    this.boat.setMovementEnabled(false);
    this.boat.setJoystickVisible(false);
    this.ui.showMainMenu();
  }

  private setupInteractions(): void {
    // Collectible picked up
    this.collectibles.onCollectCallback = (collected, total) => {
      this.ui.updateCollectibles(collected, total);
    };

    // Graphics Quality profile change
    this.ui.onQualityChange = (quality) => {
      this.setGraphicsQuality(quality);
    };

    // Boat integrity / damage changed
    this.boat.onIntegrityChange = (current, max) => {
      this.ui.updateIntegrity(current, max);
    };

    // Boat sank (integrity depleted)
    this.boat.onBoatSink = () => {
      this.state = 'GAME_OVER';
      this.boat.setMovementEnabled(false);
      this.boat.setJoystickVisible(false);
      this.ui.showGameOverModal();
    };

    // Checkpoint crossed
    this.checkpoints.onCheckpointReached = () => {
      this.ui.showCheckpointBanner('🏮 Lantern Checkpoint Reached');
    };

    // Level finished
    this.levelManager.onLevelFinish = (levelId, collected, total) => {
      this.state = 'LEVEL_COMPLETE';
      this.boat.setMovementEnabled(false);
      this.boat.setJoystickVisible(false);

      const { stars } = ProgressionManager.completeLevel(levelId, collected, total);
      this.audio.playWinFanfare();
      const hasNext = levelId < 10;
      this.ui.showResultModal(stars, collected, total, hasNext);
    };

    // UI Navigation events
    this.ui.onPlayClicked = (levelId) => {
      this.startLevel(levelId);
    };

    this.ui.onTutorialUnderstood = () => {
      this.state = 'PLAYING';
      this.boat.setMovementEnabled(true);
      this.boat.setJoystickVisible(true);
    };

    this.ui.onRestartLevel = () => {
      this.startLevel(this.levelManager.getCurrentLevelId());
    };

    this.ui.onResumeGame = () => {
      this.state = 'PLAYING';
      this.boat.setMovementEnabled(true);
      this.boat.setJoystickVisible(true);
    };

    this.ui.onExitToLevelSelect = () => {
      this.state = 'LEVEL_SELECTION';
      this.boat.setMovementEnabled(false);
      this.boat.setJoystickVisible(false);
      this.ui.showLevelSelection(false);
    };

    this.ui.onOpenLevelSelect = () => {
      this.state = 'LEVEL_SELECTION';
      this.boat.setMovementEnabled(false);
      this.boat.setJoystickVisible(false);
    };

    this.ui.onBackToMenu = () => {
      this.state = 'MAIN_MENU';
      this.boat.setMovementEnabled(false);
      this.boat.setJoystickVisible(false);
    };

    this.ui.onNextLevel = () => {
      const nextId = this.levelManager.getCurrentLevelId() + 1;
      this.startLevel(nextId <= 10 ? nextId : 1);
    };

    this.ui.onGameOverRespawn = () => {
      this.state = 'PLAYING';
      this.checkpoints.respawnBoatAtLastCheckpoint();
      this.camera.reset();
      this.boat.setMovementEnabled(true);
      this.boat.setJoystickVisible(true);
    };

    this.ui.onModalStateChange = (modal: ModalType, isOpen: boolean) => {
      if (isOpen) {
        if (modal === 'PAUSE') {
          this.state = 'PAUSED';
        }
        this.boat.setJoystickVisible(false);
        this.boat.setMovementEnabled(false);
      } else {
        if (modal === 'PAUSE' && this.state === 'PAUSED') {
          this.state = 'PLAYING';
        }
        if (this.state === 'PLAYING') {
          this.boat.setMovementEnabled(true);
          this.boat.setJoystickVisible(true);
        } else {
          this.boat.setJoystickVisible(false);
        }
      }
    };
  }

  private bindGlobalKeyboard(): void {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (this.state === 'PLAYING') {
          this.state = 'PAUSED';
          this.boat.setMovementEnabled(false);
          this.boat.setJoystickVisible(false);
          this.ui.openModal('PAUSE', 'PLAYING');
        } else if (this.state === 'PAUSED' && this.ui.getActiveModal() === 'PAUSE') {
          this.ui.closeModal();
          this.state = 'PLAYING';
          this.boat.setMovementEnabled(true);
          this.boat.setJoystickVisible(true);
        }
      }
    });
  }

  public startLevel(levelId: number): void {
    // 1. Initialize level geometry, river spline, obstacles, collectibles
    this.levelManager.loadLevel(levelId);
    this.camera.reset();

    const cfg = this.levelManager.getCurrentConfig();
    this.ui.showHUD(
      `Level 0${cfg.id}`.slice(-8) + ` — ${cfg.title}`,
      cfg.subtitle,
      cfg.collectibles.length
    );
    this.ui.updateIntegrity(this.boat.maxIntegrity, this.boat.maxIntegrity);

    // 2. First-time tutorial check: only show if player hasn't seen it yet
    if (!ProgressionManager.hasSeenTutorial()) {
      this.state = 'TUTORIAL';
      this.boat.setMovementEnabled(false);
      this.boat.setJoystickVisible(false);
      this.ui.openModal('TUTORIAL', 'PLAYING');
    } else {
      this.state = 'PLAYING';
      this.boat.setMovementEnabled(true);
      this.boat.setJoystickVisible(true);
    }
  }

  public getUIManager(): UIManager {
    return this.ui;
  }

  public completeLevel(levelId: number, collected: number, total: number): void {
    if (this.levelManager.onLevelFinish) {
      this.levelManager.onLevelFinish(levelId, collected, total);
    }
  }

  public getState(): GameState {
    return this.state;
  }

  public getBoat(): BoatController {
    return this.boat;
  }

  public setGraphicsQuality(quality: 'performance' | 'balanced' | 'quality'): void {
    ProgressionManager.setGraphicsQuality(quality);
    const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
    const device = this.app.graphicsDevice as any;
    if (quality === 'performance') {
      device.maxPixelRatio = 1.0;
    } else if (quality === 'balanced') {
      device.maxPixelRatio = Math.min(1.5, dpr);
    } else {
      device.maxPixelRatio = Math.min(2.0, dpr);
    }
    this.app.resizeCanvas();
    console.log(`[Graphics] Profile applied: ${quality} (maxPixelRatio: ${device.maxPixelRatio})`);
  }

  private startLoop(): void {
    this.app.on('update', (dt: number) => {
      if (this.state === 'PLAYING') {
        this.boat.update(dt);
        this.camera.update(dt);
        this.environment.update(dt);
        this.weather.update(dt, this.boat.getPosition());
        this.effects.update(dt);
        this.obstacles.update(dt, this.boat);
        this.collectibles.update(dt, this.boat);
        this.checkpoints.update(dt);
        this.levelManager.update(dt);

        // Boat movement wake ripples
        if (this.boat.isMovementEnabled()) {
          this.boatWakeTimer += dt;
          if (this.boatWakeTimer >= 0.18) {
            this.boatWakeTimer = 0;
            this.effects.spawnBoatWaterInteraction(
              this.boat.getPosition(),
              this.boat.getForwardVector(),
              this.boat.getNormalVector(),
              this.boat.getForwardSpeed(),
              this.boat.getLateralVelocity()
            );
          }
        }

        // Update progress bar
        const total = this.river.getTotalLength();
        const cur = this.boat.getDistance();
        this.ui.updateProgress(total > 0 ? (cur / total) : 0);
      } else if (
        this.state === 'TUTORIAL' ||
        this.state === 'PAUSED' ||
        this.state === 'LEVEL_COMPLETE' ||
        this.state === 'GAME_OVER'
      ) {
        // Paused in-game modal states: boat does not advance forward
        this.boat.update(0);
        this.environment.update(dt * 0.1);
        this.effects.update(dt * 0.15);
      } else if (this.state === 'MAIN_MENU' || this.state === 'LEVEL_SELECTION') {
        // Slow peaceful camera panning in menu
        this.camera.update(dt * 0.35);
        this.environment.update(dt * 0.35);
        this.effects.update(dt * 0.35);
        this.levelManager.update(dt * 0.35);
      }
    });
  }
}

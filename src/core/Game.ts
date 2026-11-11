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
import { UIManager, GameState } from '../ui/UIManager';

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

  constructor() {
    ProgressionManager.init();

    // 1. Initialize PlayCanvas App
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

    // 2. Lighting
    this.sunLight = new pc.Entity('SunLight');
    this.sunLight.addComponent('light', {
      type: 'directional',
      color: new pc.Color(1.0, 0.96, 0.88),
      intensity: 1.35
    });
    this.sunLight.setEulerAngles(45, 30, 0);
    this.app.root.addChild(this.sunLight);

    const ambientFill = new pc.Entity('AmbientFill');
    ambientFill.addComponent('light', {
      type: 'directional',
      color: new pc.Color(0.7, 0.82, 0.95),
      intensity: 0.55
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
      this.sunLight,
      this.camera.getEntity()
    );

    this.ui = new UIManager(this.audio);

    this.setupInteractions();
    this.startLoop();

    // Load Level 1 into background for serene main menu view
    this.levelManager.loadLevel(1);
    this.ui.showMainMenu();
  }

  private setupInteractions(): void {
    // Collectible picked up
    this.collectibles.onCollectCallback = (collected, total) => {
      this.ui.updateCollectibles(collected, total);
    };

    // Boat integrity / damage changed
    this.boat.onIntegrityChange = (current, max) => {
      this.ui.updateIntegrity(current, max);
    };

    // Boat sank (integrity depleted)
    this.boat.onBoatSink = () => {
      this.ui.showCheckpointBanner('Origami unfolding... Restoring at lantern 🏮');
      setTimeout(() => {
        this.checkpoints.respawnBoatAtLastCheckpoint();
        this.camera.reset();
      }, 900);
    };

    // Checkpoint crossed
    this.checkpoints.onCheckpointReached = () => {
      this.ui.showCheckpointBanner('🏮 Lantern Checkpoint Reached');
    };

    // Level finished
    this.levelManager.onLevelFinish = (levelId, collected, total) => {
      this.state = 'RESULT';
      const { stars } = ProgressionManager.completeLevel(levelId, collected, total);
      this.audio.playWinFanfare();
      const hasNext = levelId < 10;
      this.ui.showResultModal(stars, collected, total, hasNext);
    };

    // UI Navigation events
    this.ui.onPlayClicked = (levelId) => {
      this.startLevel(levelId);
    };

    this.ui.onRestartLevel = () => {
      this.startLevel(this.levelManager.getCurrentLevelId());
    };

    this.ui.onResumeGame = () => {
      this.state = 'PLAYING';
    };

    this.ui.onExitToLevelSelect = () => {
      this.state = 'LEVEL_SELECT';
      this.ui.showLevelSelect();
    };

    this.ui.onNextLevel = () => {
      const nextId = this.levelManager.getCurrentLevelId() + 1;
      this.startLevel(nextId <= 10 ? nextId : 1);
    };
  }

  private startLevel(levelId: number): void {
    this.state = 'PLAYING';
    this.levelManager.loadLevel(levelId);
    this.camera.reset();

    const cfg = this.levelManager.getCurrentConfig();
    this.ui.showHUD(
      `Level 0${cfg.id}`.slice(-8) + ` — ${cfg.title}`,
      cfg.subtitle,
      cfg.collectibles.length
    );
    this.ui.updateIntegrity(this.boat.maxIntegrity, this.boat.maxIntegrity);
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

        // Update progress bar
        const total = this.river.getTotalLength();
        const cur = this.boat.getDistance();
        this.ui.updateProgress(total > 0 ? (cur / total) : 0);
      } else if (this.state === 'MAIN_MENU' || this.state === 'LEVEL_SELECT') {
        // Slow peaceful camera panning in menu
        this.camera.update(dt * 0.4);
        this.environment.update(dt);
        this.effects.update(dt);
        this.levelManager.update(dt * 0.4);
      }
    });
  }
}

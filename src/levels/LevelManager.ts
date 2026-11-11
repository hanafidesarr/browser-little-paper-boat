import * as pc from 'playcanvas';
import { RiverSystem } from '../river/RiverSystem';
import { BoatController } from '../boat/BoatController';
import { EnvironmentManager } from '../environment/EnvironmentManager';
import { WeatherEffects } from '../environment/WeatherEffects';
import { ObstacleManager } from '../obstacles/ObstacleManager';
import { CollectibleManager } from '../collectibles/CollectibleManager';
import { CheckpointManager } from '../checkpoints/CheckpointManager';
import { EffectManager } from '../particles/EffectManager';
import { AudioManager } from '../audio/AudioManager';
import { FinishGate } from '../environment/FinishGate';
import { WaterMaterial } from '../water/WaterMaterial';
import { RiverMeshBuilder } from '../river/RiverMeshBuilder';
import { LEVEL_DATA } from './LevelData';
import { LevelConfig } from './LevelConfig';

export class LevelManager {
  private app: pc.AppBase;
  private river: RiverSystem;
  private boat: BoatController;
  private environment: EnvironmentManager;
  private weather: WeatherEffects;
  private obstacles: ObstacleManager;
  private collectibles: CollectibleManager;
  private checkpoints: CheckpointManager;
  private effects: EffectManager;
  private audio: AudioManager;

  private currentLevelId: number = 1;
  private currentConfig: LevelConfig = LEVEL_DATA[1];
  private finishGate: FinishGate | null = null;
  private waterUpdateFn: ((dt: number, speed: number) => void) | null = null;

  // Scene lights
  private sunLight: pc.Entity;
  private cameraEntity: pc.Entity;

  public onLevelFinish: ((levelId: number, collected: number, total: number) => void) | null = null;
  private hasTriggeredFinish: boolean = false;

  constructor(
    app: pc.AppBase,
    river: RiverSystem,
    boat: BoatController,
    environment: EnvironmentManager,
    weather: WeatherEffects,
    obstacles: ObstacleManager,
    collectibles: CollectibleManager,
    checkpoints: CheckpointManager,
    effects: EffectManager,
    audio: AudioManager,
    sunLight: pc.Entity,
    cameraEntity: pc.Entity
  ) {
    this.app = app;
    this.river = river;
    this.boat = boat;
    this.environment = environment;
    this.weather = weather;
    this.obstacles = obstacles;
    this.collectibles = collectibles;
    this.checkpoints = checkpoints;
    this.effects = effects;
    this.audio = audio;
    this.sunLight = sunLight;
    this.cameraEntity = cameraEntity;
  }

  public loadLevel(levelId: number): void {
    const config = LEVEL_DATA[levelId] || LEVEL_DATA[1];
    this.currentLevelId = config.id;
    this.currentConfig = config;
    this.hasTriggeredFinish = false;

    // 1. Water, Riverbed & Bank Materials
    // "Sedikit transparent": sunny weather has translucent soft blue water (0.58 opacity); rainy/misty weather is slightly murkier (0.68 opacity)
    const isBadWeather = config.environment.weather === 'rain' || config.environment.weather === 'mist';
    const waterOpacity = isBadWeather ? 0.68 : 0.58;

    const { material: waterMat, update: waterUpdate } = WaterMaterial.create(
      this.app.graphicsDevice,
      config.environment.waterTint,
      waterOpacity
    );
    this.waterUpdateFn = waterUpdate;

    // Rich procedural riverbed material (pebbles, sand & sunken river stones)
    const bedMat = RiverMeshBuilder.createDefaultRiverbedMaterial(
      this.app.graphicsDevice
    );

    // Rich procedural dirt-to-grass riverbank material with level tint
    const bankMat = RiverMeshBuilder.createDefaultBankMaterial(
      this.app.graphicsDevice,
      config.environment.bankTint
    );

    // 2. Build River Spline & Meshes (Water surface, sunken riverbed, and elevated 3.0m land)
    this.river.initFromPoints(config.splinePoints, {
      waterMaterial: waterMat,
      bedMaterial: bedMat,
      bankMaterial: bankMat,
      stepSize: 1.5,
      bankWidth: 15.0,
      bankHeight: 3.0,
      bedDepth: 1.15
    });

    // 3. Reset Boat to start
    this.boat.setPosition(2, 0);
    this.boat.setBaseSpeed(config.baseSpeed);

    // 4. Populate Environment & Weather
    this.environment.populate({
      seed: config.environment.seed,
      treeDensity: config.environment.treeDensity,
      rockDensity: config.environment.rockDensity,
      lilyPadDensity: config.environment.lilyPadDensity,
      flowerDensity: config.environment.flowerDensity,
      isAutumn: config.environment.isAutumn,
      bridgeDistances: config.bridgeDistances
    });

    this.weather.setWeather(config.environment.weather, this.boat.getPosition());
    this.audio.setTheme(config.audioTheme || 'morning');

    // 5. Lighting & Atmosphere
    if (this.sunLight.light) {
      this.sunLight.light.color = config.environment.sunColor;
      this.sunLight.light.intensity = config.environment.sunIntensity;
    }

    if (this.cameraEntity.camera) {
      this.cameraEntity.camera.clearColor = config.environment.skyColor;
    }

    // Set scene ambient lighting so shadows are soft and cozy fantasy pastel
    const isTwilight = config.environment.weather === 'fireflies';
    this.app.scene.ambientLight = isTwilight 
      ? new pc.Color(0.42, 0.40, 0.58)
      : new pc.Color(0.68, 0.74, 0.78);

    // 6. Spawn Obstacles & Collectibles
    this.obstacles.spawnObstacles(config.obstacles);
    this.collectibles.spawnItems(config.collectibles);

    // 7. Initialize River Checkpoints
    this.checkpoints.initCheckpoints();

    // 8. Destination Finish Gate
    if (this.finishGate) {
      this.finishGate.destroy();
    }
    const finishDist = this.river.getTotalLength() - 8;
    this.finishGate = new FinishGate(this.app, this.river, finishDist);

    console.log(`Loaded Level ${config.id}: ${config.title}`);
  }

  public update(dt: number): void {
    if (this.waterUpdateFn) {
      this.waterUpdateFn(dt, this.currentConfig.baseSpeed);
    }

    this.river.update(dt, this.currentConfig.baseSpeed);

    if (this.finishGate) {
      this.finishGate.update(dt);
    }

    // Check level completion
    if (!this.hasTriggeredFinish) {
      const boatDist = this.boat.getDistance();
      const finishDist = this.river.getTotalLength() - 8;

      if (boatDist >= finishDist) {
        this.hasTriggeredFinish = true;
        if (this.finishGate) {
          this.finishGate.celebrate(this.effects);
        }
        if (this.onLevelFinish) {
          this.onLevelFinish(
            this.currentLevelId,
            this.collectibles.getCollectedCount(),
            this.collectibles.getTotalCount()
          );
        }
      }
    }
  }

  public getCurrentConfig(): LevelConfig {
    return this.currentConfig;
  }

  public getCurrentLevelId(): number {
    return this.currentLevelId;
  }
}

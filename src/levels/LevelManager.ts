import * as pc from 'playcanvas';
import { RiverSystem } from '../river/RiverSystem';
import { BoatController } from '../boat/BoatController';
import { EnvironmentManager } from '../environment/EnvironmentManager';
import { WeatherEffects } from '../environment/WeatherEffects';
import { ObstacleManager } from '../obstacles/ObstacleManager';
import { CollectibleManager } from '../collectibles/CollectibleManager';
import { FinishGate } from '../environment/FinishGate';
import { WaterMaterial } from '../water/WaterMaterial';
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
    this.sunLight = sunLight;
    this.cameraEntity = cameraEntity;
  }

  public loadLevel(levelId: number): void {
    const config = LEVEL_DATA[levelId] || LEVEL_DATA[1];
    this.currentLevelId = config.id;
    this.currentConfig = config;
    this.hasTriggeredFinish = false;

    // 1. Water & Bank Materials
    const { material: waterMat, update: waterUpdate } = WaterMaterial.create(
      this.app.graphicsDevice,
      config.environment.waterTint,
      0.88
    );
    this.waterUpdateFn = waterUpdate;

    const bankMat = new pc.StandardMaterial();
    bankMat.diffuse = config.environment.bankTint;
    bankMat.ambient = new pc.Color(
      config.environment.bankTint.r * 0.7,
      config.environment.bankTint.g * 0.7,
      config.environment.bankTint.b * 0.7
    );
    bankMat.update();

    // 2. Build River Spline & Meshes
    this.river.initFromPoints(config.splinePoints, {
      waterMaterial: waterMat,
      bankMaterial: bankMat,
      stepSize: 1.5,
      bankWidth: 12.0,
      bankHeight: 1.8
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
      isAutumn: config.environment.isAutumn,
      bridgeDistances: config.bridgeDistances
    });

    this.weather.setWeather(config.environment.weather, this.boat.getPosition());

    // 5. Lighting & Atmosphere
    if (this.sunLight.light) {
      this.sunLight.light.color = config.environment.sunColor;
      this.sunLight.light.intensity = config.environment.sunIntensity;
    }

    if (this.cameraEntity.camera) {
      this.cameraEntity.camera.clearColor = config.environment.skyColor;
    }

    // 6. Spawn Obstacles & Collectibles
    this.obstacles.spawnObstacles(config.obstacles);
    this.collectibles.spawnItems(config.collectibles);

    // 7. Destination Finish Gate
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

    if (this.finishGate) {
      this.finishGate.update(dt);
    }

    // Check level completion
    if (!this.hasTriggeredFinish) {
      const boatDist = this.boat.getDistance();
      const finishDist = this.river.getTotalLength() - 8;

      if (boatDist >= finishDist) {
        this.hasTriggeredFinish = true;
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

import * as pc from 'playcanvas';
import { SplinePoint } from '../spline/CatmullRomSpline';
import { ObstacleData } from '../obstacles/ObstacleEntity';
import { CollectibleSpawn } from '../collectibles/CollectibleManager';
import { WeatherType } from '../environment/WeatherEffects';

export interface LevelConfig {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  splinePoints: SplinePoint[];
  obstacles: ObstacleData[];
  collectibles: CollectibleSpawn[];
  bridgeDistances?: number[];
  baseSpeed: number;
  audioTheme?: 'morning' | 'garden' | 'forest' | 'rain' | 'autumn' | 'twilight' | 'rapids';
  environment: {
    seed: number;
    treeDensity: number;
    rockDensity: number;
    lilyPadDensity: number;
    flowerDensity?: number;
    isAutumn?: boolean;
    weather: WeatherType;
    skyColor: pc.Color;
    sunColor: pc.Color;
    sunIntensity: number;
    waterTint: pc.Color;
    bankTint: pc.Color;
  };
}

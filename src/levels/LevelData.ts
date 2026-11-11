import * as pc from 'playcanvas';
import { LevelConfig } from './LevelConfig';

export const LEVEL_DATA: { [id: number]: LevelConfig } = {
  // ==========================================
  // LEVEL 01 — MORNING CREEK
  // ==========================================
  1: {
    id: 1,
    title: 'Morning Creek',
    subtitle: 'A gentle dawn awakening',
    description: 'Crisp morning sunshine, bright green meadows, and gentle murmuring waters.',
    baseSpeed: 4.5,
    splinePoints: [
      { position: new pc.Vec3(0, 0, 0), width: 8.0, current: 4.5 },
      { position: new pc.Vec3(3, 0, 25), width: 8.2, current: 4.5 },
      { position: new pc.Vec3(-4, 0, 55), width: 7.8, current: 4.8 },
      { position: new pc.Vec3(5, 0, 90), width: 8.5, current: 4.5 },
      { position: new pc.Vec3(-3, 0, 125), width: 8.0, current: 4.6 },
      { position: new pc.Vec3(2, 0, 160), width: 8.0, current: 4.5 },
      { position: new pc.Vec3(0, 0, 190), width: 8.5, current: 4.0 }
    ],
    obstacles: [
      { distance: 22, lateralOffset: 0.8, type: 'duck', radius: 0.8 },
      { distance: 42, lateralOffset: -1.8, type: 'rock', radius: 0.85 },
      { distance: 68, lateralOffset: 0.5, type: 'fish', radius: 0.7 },
      { distance: 92, lateralOffset: 1.8, type: 'branch', radius: 1.2 },
      { distance: 118, lateralOffset: -0.6, type: 'lily_pads', radius: 1.3 },
      { distance: 140, lateralOffset: 1.5, type: 'frog', radius: 0.7 },
      { distance: 162, lateralOffset: 0.0, type: 'waterfall_zone', radius: 2.8 }
    ],
    collectibles: [
      { distance: 15, lateralOffset: 0.0, type: 'golden_leaf' },
      { distance: 28, lateralOffset: 1.5, type: 'golden_leaf' },
      { distance: 45, lateralOffset: -1.2, type: 'golden_leaf' },
      { distance: 60, lateralOffset: 1.0, type: 'golden_leaf' },
      { distance: 80, lateralOffset: -1.8, type: 'golden_leaf' },
      { distance: 95, lateralOffset: 0.0, type: 'golden_leaf' },
      { distance: 118, lateralOffset: 1.8, type: 'golden_leaf' },
      { distance: 130, lateralOffset: -1.0, type: 'golden_leaf' },
      { distance: 150, lateralOffset: 0.0, type: 'golden_leaf' },
      { distance: 170, lateralOffset: 1.2, type: 'golden_leaf' }
    ],
    environment: {
      seed: 101,
      treeDensity: 1.0,
      rockDensity: 0.8,
      lilyPadDensity: 0.4,
      isAutumn: false,
      weather: 'sunny',
      skyColor: new pc.Color(0.72, 0.88, 0.96),
      sunColor: new pc.Color(1.0, 0.96, 0.88),
      sunIntensity: 1.3,
      waterTint: new pc.Color(0.24, 0.65, 0.80),
      bankTint: new pc.Color(0.36, 0.62, 0.32)
    }
  },

  // ==========================================
  // LEVEL 02 — LILY GARDEN
  // ==========================================
  2: {
    id: 2,
    title: 'Lily Garden',
    subtitle: 'Floating blossoms and soft reflections',
    description: 'Wander through calm botanical garden curves adorned with water lilies.',
    baseSpeed: 4.6,
    splinePoints: [
      { position: new pc.Vec3(0, 0, 0), width: 8.5, current: 4.6 },
      { position: new pc.Vec3(-6, 0, 30), width: 8.0, current: 4.6 },
      { position: new pc.Vec3(7, 0, 65), width: 9.0, current: 4.4 },
      { position: new pc.Vec3(-8, 0, 105), width: 8.5, current: 4.6 },
      { position: new pc.Vec3(6, 0, 145), width: 8.0, current: 4.6 },
      { position: new pc.Vec3(-3, 0, 185), width: 8.5, current: 4.5 },
      { position: new pc.Vec3(0, 0, 220), width: 9.0, current: 4.2 }
    ],
    obstacles: [
      { distance: 28, lateralOffset: -1.2, type: 'duck', radius: 0.8 },
      { distance: 55, lateralOffset: 1.5, type: 'whirlpool', radius: 2.2 },
      { distance: 88, lateralOffset: -1.6, type: 'lily_pads', radius: 1.3 },
      { distance: 115, lateralOffset: 1.8, type: 'fish', radius: 0.7 },
      { distance: 145, lateralOffset: -1.8, type: 'frog', radius: 0.7 },
      { distance: 175, lateralOffset: 1.6, type: 'rock', radius: 0.85 }
    ],
    collectibles: [
      { distance: 18, lateralOffset: -1.2, type: 'lily_flower' },
      { distance: 32, lateralOffset: 1.5, type: 'lily_flower' },
      { distance: 52, lateralOffset: 0.0, type: 'lily_flower' },
      { distance: 70, lateralOffset: -1.8, type: 'lily_flower' },
      { distance: 88, lateralOffset: 1.6, type: 'lily_flower' },
      { distance: 102, lateralOffset: 0.0, type: 'lily_flower' },
      { distance: 122, lateralOffset: 1.8, type: 'lily_flower' },
      { distance: 140, lateralOffset: -1.6, type: 'lily_flower' },
      { distance: 165, lateralOffset: 0.8, type: 'lily_flower' },
      { distance: 195, lateralOffset: -0.8, type: 'lily_flower' }
    ],
    environment: {
      seed: 202,
      treeDensity: 0.9,
      rockDensity: 0.6,
      lilyPadDensity: 1.8,
      isAutumn: false,
      weather: 'sunny',
      skyColor: new pc.Color(0.70, 0.90, 0.92),
      sunColor: new pc.Color(1.0, 0.98, 0.90),
      sunIntensity: 1.25,
      waterTint: new pc.Color(0.20, 0.68, 0.75),
      bankTint: new pc.Color(0.32, 0.65, 0.36)
    }
  },

  // ==========================================
  // LEVEL 03 — MOSSY FOREST
  // ==========================================
  3: {
    id: 3,
    title: 'Mossy Forest',
    subtitle: 'Emerald canopies and ancient stones',
    description: 'Navigate beneath deep moss-covered forest boughs and ancient fallen timber.',
    baseSpeed: 4.8,
    splinePoints: [
      { position: new pc.Vec3(0, 0, 0), width: 8.0, current: 4.8 },
      { position: new pc.Vec3(8, 0, 35), width: 7.5, current: 5.0 },
      { position: new pc.Vec3(-9, 0, 75), width: 7.2, current: 5.2 },
      { position: new pc.Vec3(8, 0, 115), width: 7.0, current: 5.0 },
      { position: new pc.Vec3(-7, 0, 155), width: 7.5, current: 4.9 },
      { position: new pc.Vec3(5, 0, 195), width: 8.0, current: 4.7 },
      { position: new pc.Vec3(0, 0, 230), width: 8.5, current: 4.2 }
    ],
    obstacles: [
      { distance: 42, lateralOffset: 1.6, type: 'rock', radius: 1.0 },
      { distance: 68, lateralOffset: -1.8, type: 'branch', radius: 1.3 },
      { distance: 100, lateralOffset: 1.4, type: 'rock', radius: 0.9 },
      { distance: 135, lateralOffset: -1.5, type: 'branch', radius: 1.3 },
      { distance: 170, lateralOffset: 1.8, type: 'rock', radius: 1.0 },
      { distance: 200, lateralOffset: -1.2, type: 'branch', radius: 1.2 }
    ],
    collectibles: [
      { distance: 20, lateralOffset: 1.2, type: 'golden_leaf' },
      { distance: 35, lateralOffset: -1.5, type: 'golden_leaf' },
      { distance: 55, lateralOffset: 0.0, type: 'golden_leaf' },
      { distance: 82, lateralOffset: 1.6, type: 'golden_leaf' },
      { distance: 95, lateralOffset: -1.2, type: 'golden_leaf' },
      { distance: 115, lateralOffset: 0.0, type: 'golden_leaf' },
      { distance: 145, lateralOffset: 1.5, type: 'golden_leaf' },
      { distance: 160, lateralOffset: -1.4, type: 'golden_leaf' },
      { distance: 185, lateralOffset: 0.0, type: 'golden_leaf' },
      { distance: 210, lateralOffset: 1.2, type: 'golden_leaf' }
    ],
    environment: {
      seed: 303,
      treeDensity: 1.8,
      rockDensity: 1.3,
      lilyPadDensity: 0.5,
      isAutumn: false,
      weather: 'sunny',
      skyColor: new pc.Color(0.62, 0.82, 0.85),
      sunColor: new pc.Color(0.95, 0.98, 0.82),
      sunIntensity: 1.15,
      waterTint: new pc.Color(0.18, 0.58, 0.65),
      bankTint: new pc.Color(0.24, 0.52, 0.28)
    }
  },

  // ==========================================
  // LEVEL 04 — GENTLE RAIN
  // ==========================================
  4: {
    id: 4,
    title: 'Gentle Rain',
    subtitle: 'Soft drops and serene ripples',
    description: 'Listen to tranquil raindrops tap dancing on the surface of the river.',
    baseSpeed: 4.7,
    splinePoints: [
      { position: new pc.Vec3(0, 0, 0), width: 8.5, current: 4.7 },
      { position: new pc.Vec3(-5, 0, 30), width: 8.2, current: 4.8 },
      { position: new pc.Vec3(6, 0, 65), width: 8.0, current: 4.9 },
      { position: new pc.Vec3(-7, 0, 105), width: 8.4, current: 4.7 },
      { position: new pc.Vec3(5, 0, 145), width: 8.0, current: 4.8 },
      { position: new pc.Vec3(-4, 0, 185), width: 8.2, current: 4.6 },
      { position: new pc.Vec3(0, 0, 220), width: 8.5, current: 4.2 }
    ],
    obstacles: [
      { distance: 40, lateralOffset: -1.8, type: 'rock', radius: 0.9 },
      { distance: 85, lateralOffset: 2.0, type: 'branch', radius: 1.2 },
      { distance: 125, lateralOffset: -1.6, type: 'whirlpool', radius: 1.1 },
      { distance: 165, lateralOffset: 1.8, type: 'rock', radius: 0.9 }
    ],
    collectibles: [
      { distance: 15, lateralOffset: 0.0, type: 'starlight' },
      { distance: 35, lateralOffset: 1.5, type: 'starlight' },
      { distance: 58, lateralOffset: -1.5, type: 'starlight' },
      { distance: 75, lateralOffset: 0.8, type: 'starlight' },
      { distance: 98, lateralOffset: -1.4, type: 'starlight' },
      { distance: 115, lateralOffset: 1.6, type: 'starlight' },
      { distance: 140, lateralOffset: 0.0, type: 'starlight' },
      { distance: 160, lateralOffset: -1.5, type: 'starlight' },
      { distance: 180, lateralOffset: 1.2, type: 'starlight' },
      { distance: 200, lateralOffset: 0.0, type: 'starlight' }
    ],
    environment: {
      seed: 404,
      treeDensity: 1.2,
      rockDensity: 1.0,
      lilyPadDensity: 0.7,
      isAutumn: false,
      weather: 'rain',
      skyColor: new pc.Color(0.55, 0.65, 0.75),
      sunColor: new pc.Color(0.85, 0.90, 0.95),
      sunIntensity: 0.95,
      waterTint: new pc.Color(0.28, 0.55, 0.68),
      bankTint: new pc.Color(0.28, 0.48, 0.32)
    }
  },

  // ==========================================
  // LEVEL 05 — AUTUMN RIVER
  // ==========================================
  5: {
    id: 5,
    title: 'Autumn River',
    subtitle: 'Golden leaves and brisk currents',
    description: 'Drift through glorious autumn foliage where golden leaves glide across the water.',
    baseSpeed: 5.2,
    splinePoints: [
      { position: new pc.Vec3(0, 0, 0), width: 9.0, current: 5.2 },
      { position: new pc.Vec3(8, 0, 35), width: 8.8, current: 5.4 },
      { position: new pc.Vec3(-10, 0, 75), width: 8.0, current: 5.5 },
      { position: new pc.Vec3(11, 0, 120), width: 8.5, current: 5.3 },
      { position: new pc.Vec3(-9, 0, 165), width: 8.0, current: 5.4 },
      { position: new pc.Vec3(6, 0, 205), width: 8.6, current: 5.0 },
      { position: new pc.Vec3(0, 0, 240), width: 9.0, current: 4.5 }
    ],
    obstacles: [
      { distance: 45, lateralOffset: 2.2, type: 'rock', radius: 1.0 },
      { distance: 80, lateralOffset: -2.0, type: 'branch', radius: 1.3 },
      { distance: 110, lateralOffset: 1.8, type: 'rock', radius: 0.9 },
      { distance: 145, lateralOffset: -2.2, type: 'whirlpool', radius: 1.2 },
      { distance: 185, lateralOffset: 1.9, type: 'branch', radius: 1.3 },
      { distance: 215, lateralOffset: -1.5, type: 'rock', radius: 0.9 }
    ],
    collectibles: [
      { distance: 20, lateralOffset: -1.2, type: 'golden_leaf' },
      { distance: 40, lateralOffset: 1.4, type: 'golden_leaf' },
      { distance: 62, lateralOffset: -1.8, type: 'golden_leaf' },
      { distance: 90, lateralOffset: 0.0, type: 'golden_leaf' },
      { distance: 105, lateralOffset: 1.9, type: 'golden_leaf' },
      { distance: 128, lateralOffset: -1.5, type: 'golden_leaf' },
      { distance: 155, lateralOffset: 1.6, type: 'golden_leaf' },
      { distance: 175, lateralOffset: 0.0, type: 'golden_leaf' },
      { distance: 198, lateralOffset: -1.8, type: 'golden_leaf' },
      { distance: 220, lateralOffset: 1.2, type: 'golden_leaf' }
    ],
    environment: {
      seed: 505,
      treeDensity: 1.4,
      rockDensity: 0.9,
      lilyPadDensity: 0.3,
      isAutumn: true,
      weather: 'autumn_leaves',
      skyColor: new pc.Color(0.82, 0.75, 0.68),
      sunColor: new pc.Color(1.0, 0.88, 0.70),
      sunIntensity: 1.3,
      waterTint: new pc.Color(0.32, 0.60, 0.65),
      bankTint: new pc.Color(0.58, 0.45, 0.25)
    }
  },

  // ==========================================
  // LEVEL 06 — OLD WOODEN BRIDGE
  // ==========================================
  6: {
    id: 6,
    title: 'Old Wooden Bridge',
    subtitle: 'Rustic timbers and historic pathways',
    description: 'Steer through narrow stone-lined channels beneath charming wooden country bridges.',
    baseSpeed: 4.8,
    bridgeDistances: [70, 160],
    splinePoints: [
      { position: new pc.Vec3(0, 0, 0), width: 8.0, current: 4.8 },
      { position: new pc.Vec3(-4, 0, 30), width: 7.2, current: 4.8 },
      { position: new pc.Vec3(0, 0, 70), width: 6.2, current: 5.2 }, // Narrow under bridge
      { position: new pc.Vec3(7, 0, 110), width: 7.8, current: 4.9 },
      { position: new pc.Vec3(0, 0, 160), width: 6.0, current: 5.3 }, // Narrow under bridge 2
      { position: new pc.Vec3(-6, 0, 200), width: 7.5, current: 4.8 },
      { position: new pc.Vec3(0, 0, 235), width: 8.2, current: 4.4 }
    ],
    obstacles: [
      { distance: 35, lateralOffset: 1.5, type: 'rock', radius: 0.9 },
      { distance: 68, lateralOffset: -1.7, type: 'rock', radius: 0.8 }, // Near bridge pillar
      { distance: 95, lateralOffset: 1.8, type: 'branch', radius: 1.2 },
      { distance: 135, lateralOffset: -1.6, type: 'rock', radius: 0.9 },
      { distance: 158, lateralOffset: 1.6, type: 'rock', radius: 0.8 }, // Near bridge pillar
      { distance: 195, lateralOffset: -1.4, type: 'branch', radius: 1.1 }
    ],
    collectibles: [
      { distance: 18, lateralOffset: 0.0, type: 'golden_leaf' },
      { distance: 45, lateralOffset: -1.2, type: 'golden_leaf' },
      { distance: 70, lateralOffset: 0.0, type: 'golden_leaf' }, // Center under bridge
      { distance: 88, lateralOffset: 1.5, type: 'golden_leaf' },
      { distance: 115, lateralOffset: -1.4, type: 'golden_leaf' },
      { distance: 138, lateralOffset: 1.2, type: 'golden_leaf' },
      { distance: 160, lateralOffset: 0.0, type: 'golden_leaf' }, // Center under bridge 2
      { distance: 180, lateralOffset: -1.5, type: 'golden_leaf' },
      { distance: 205, lateralOffset: 1.4, type: 'golden_leaf' },
      { distance: 222, lateralOffset: 0.0, type: 'golden_leaf' }
    ],
    environment: {
      seed: 606,
      treeDensity: 1.3,
      rockDensity: 1.2,
      lilyPadDensity: 0.6,
      isAutumn: false,
      weather: 'sunny',
      skyColor: new pc.Color(0.70, 0.85, 0.92),
      sunColor: new pc.Color(1.0, 0.94, 0.82),
      sunIntensity: 1.25,
      waterTint: new pc.Color(0.22, 0.62, 0.72),
      bankTint: new pc.Color(0.38, 0.58, 0.35)
    }
  },

  // ==========================================
  // LEVEL 07 — LITTLE FRIENDS
  // ==========================================
  7: {
    id: 7,
    title: 'Little Friends',
    subtitle: 'Playful ducks and curious companions',
    description: 'Delight in river animals sharing the water, swimming and leaping along your path.',
    baseSpeed: 4.8,
    splinePoints: [
      { position: new pc.Vec3(0, 0, 0), width: 8.5, current: 4.8 },
      { position: new pc.Vec3(6, 0, 30), width: 8.2, current: 4.8 },
      { position: new pc.Vec3(-7, 0, 68), width: 8.5, current: 4.7 },
      { position: new pc.Vec3(8, 0, 110), width: 8.0, current: 4.9 },
      { position: new pc.Vec3(-6, 0, 150), width: 8.2, current: 4.8 },
      { position: new pc.Vec3(5, 0, 190), width: 8.5, current: 4.7 },
      { position: new pc.Vec3(0, 0, 230), width: 9.0, current: 4.3 }
    ],
    obstacles: [
      { distance: 30, lateralOffset: 0.5, type: 'duck', radius: 0.8 },
      { distance: 55, lateralOffset: -1.6, type: 'frog', radius: 0.7 },
      { distance: 82, lateralOffset: 1.8, type: 'duck', radius: 0.8 },
      { distance: 112, lateralOffset: -1.2, type: 'duck', radius: 0.8 },
      { distance: 140, lateralOffset: 1.5, type: 'frog', radius: 0.7 },
      { distance: 168, lateralOffset: -0.6, type: 'duck', radius: 0.8 },
      { distance: 198, lateralOffset: 1.4, type: 'duck', radius: 0.8 }
    ],
    collectibles: [
      { distance: 15, lateralOffset: -1.2, type: 'lily_flower' },
      { distance: 38, lateralOffset: 1.6, type: 'lily_flower' },
      { distance: 62, lateralOffset: 0.0, type: 'lily_flower' },
      { distance: 88, lateralOffset: -1.8, type: 'lily_flower' },
      { distance: 105, lateralOffset: 1.4, type: 'lily_flower' },
      { distance: 128, lateralOffset: 0.0, type: 'lily_flower' },
      { distance: 152, lateralOffset: -1.5, type: 'lily_flower' },
      { distance: 178, lateralOffset: 1.6, type: 'lily_flower' },
      { distance: 202, lateralOffset: 0.0, type: 'lily_flower' },
      { distance: 218, lateralOffset: -1.2, type: 'lily_flower' }
    ],
    environment: {
      seed: 707,
      treeDensity: 1.1,
      rockDensity: 0.7,
      lilyPadDensity: 1.6,
      isAutumn: false,
      weather: 'sunny',
      skyColor: new pc.Color(0.72, 0.88, 0.95),
      sunColor: new pc.Color(1.0, 0.97, 0.88),
      sunIntensity: 1.3,
      waterTint: new pc.Color(0.24, 0.65, 0.78),
      bankTint: new pc.Color(0.35, 0.62, 0.35)
    }
  },

  // ==========================================
  // LEVEL 08 — FIREFLY VALLEY
  // ==========================================
  8: {
    id: 8,
    title: 'Firefly Valley',
    subtitle: 'Twilight glow and dancing stars',
    description: 'Drift serenely under purple twilight skies illuminated by swarms of magical fireflies.',
    baseSpeed: 4.6,
    splinePoints: [
      { position: new pc.Vec3(0, 0, 0), width: 8.5, current: 4.6 },
      { position: new pc.Vec3(-7, 0, 32), width: 8.2, current: 4.6 },
      { position: new pc.Vec3(8, 0, 72), width: 8.0, current: 4.8 },
      { position: new pc.Vec3(-9, 0, 115), width: 8.5, current: 4.6 },
      { position: new pc.Vec3(7, 0, 158), width: 8.0, current: 4.7 },
      { position: new pc.Vec3(-4, 0, 198), width: 8.5, current: 4.5 },
      { position: new pc.Vec3(0, 0, 235), width: 9.0, current: 4.2 }
    ],
    obstacles: [
      { distance: 42, lateralOffset: 1.8, type: 'rock', radius: 0.9 },
      { distance: 78, lateralOffset: -1.8, type: 'branch', radius: 1.2 },
      { distance: 118, lateralOffset: 1.5, type: 'whirlpool', radius: 1.2 },
      { distance: 155, lateralOffset: -1.6, type: 'rock', radius: 0.9 },
      { distance: 190, lateralOffset: 1.7, type: 'branch', radius: 1.2 }
    ],
    collectibles: [
      { distance: 18, lateralOffset: 0.0, type: 'starlight' },
      { distance: 36, lateralOffset: -1.5, type: 'starlight' },
      { distance: 58, lateralOffset: 1.6, type: 'starlight' },
      { distance: 82, lateralOffset: 0.0, type: 'starlight' },
      { distance: 104, lateralOffset: -1.8, type: 'starlight' },
      { distance: 126, lateralOffset: 1.7, type: 'starlight' },
      { distance: 148, lateralOffset: 0.0, type: 'starlight' },
      { distance: 172, lateralOffset: -1.5, type: 'starlight' },
      { distance: 195, lateralOffset: 1.4, type: 'starlight' },
      { distance: 220, lateralOffset: 0.0, type: 'starlight' }
    ],
    environment: {
      seed: 808,
      treeDensity: 1.4,
      rockDensity: 0.8,
      lilyPadDensity: 0.9,
      isAutumn: false,
      weather: 'fireflies',
      skyColor: new pc.Color(0.24, 0.22, 0.42), // Deep purple twilight
      sunColor: new pc.Color(0.68, 0.72, 1.0),
      sunIntensity: 0.75,
      waterTint: new pc.Color(0.18, 0.38, 0.58),
      bankTint: new pc.Color(0.22, 0.38, 0.28)
    }
  },

  // ==========================================
  // LEVEL 09 — WHISPERING FALLS
  // ==========================================
  9: {
    id: 9,
    title: 'Whispering Falls',
    subtitle: 'Misty currents and refreshing rapids',
    description: 'Ride faster sparkling currents past misty river alcoves and bubbling whirlpool eddies.',
    baseSpeed: 5.5,
    splinePoints: [
      { position: new pc.Vec3(0, 0, 0), width: 9.0, current: 5.5 },
      { position: new pc.Vec3(9, 0, 35), width: 8.5, current: 5.8 },
      { position: new pc.Vec3(-10, 0, 75), width: 8.0, current: 6.0 },
      { position: new pc.Vec3(11, 0, 120), width: 8.2, current: 5.8 },
      { position: new pc.Vec3(-8, 0, 165), width: 8.5, current: 5.6 },
      { position: new pc.Vec3(6, 0, 205), width: 8.8, current: 5.4 },
      { position: new pc.Vec3(0, 0, 245), width: 9.2, current: 4.8 }
    ],
    obstacles: [
      { distance: 38, lateralOffset: -2.0, type: 'whirlpool', radius: 1.3 },
      { distance: 65, lateralOffset: 1.8, type: 'rock', radius: 1.0 },
      { distance: 95, lateralOffset: -1.7, type: 'whirlpool', radius: 1.3 },
      { distance: 130, lateralOffset: 2.2, type: 'rock', radius: 1.0 },
      { distance: 160, lateralOffset: -2.0, type: 'branch', radius: 1.3 },
      { distance: 190, lateralOffset: 1.6, type: 'whirlpool', radius: 1.3 },
      { distance: 220, lateralOffset: -1.5, type: 'rock', radius: 0.9 }
    ],
    collectibles: [
      { distance: 18, lateralOffset: 1.2, type: 'starlight' },
      { distance: 42, lateralOffset: -1.4, type: 'starlight' },
      { distance: 68, lateralOffset: 0.0, type: 'starlight' },
      { distance: 92, lateralOffset: 1.8, type: 'starlight' },
      { distance: 115, lateralOffset: -1.6, type: 'starlight' },
      { distance: 140, lateralOffset: 0.0, type: 'starlight' },
      { distance: 165, lateralOffset: 1.5, type: 'starlight' },
      { distance: 188, lateralOffset: -1.6, type: 'starlight' },
      { distance: 210, lateralOffset: 1.2, type: 'starlight' },
      { distance: 230, lateralOffset: 0.0, type: 'starlight' }
    ],
    environment: {
      seed: 909,
      treeDensity: 1.2,
      rockDensity: 1.5,
      lilyPadDensity: 0.4,
      isAutumn: false,
      weather: 'sunny',
      skyColor: new pc.Color(0.68, 0.88, 0.94),
      sunColor: new pc.Color(0.98, 0.98, 1.0),
      sunIntensity: 1.35,
      waterTint: new pc.Color(0.20, 0.68, 0.82),
      bankTint: new pc.Color(0.32, 0.58, 0.34)
    }
  },

  // ==========================================
  // LEVEL 10 — THE ENDLESS JOURNEY
  // ==========================================
  10: {
    id: 10,
    title: 'The Endless Journey',
    subtitle: 'A sunset voyage across all realms',
    description: 'A grand master journey uniting friends, bridges, fireflies, and peaceful golden sunset vistas.',
    baseSpeed: 5.0,
    bridgeDistances: [90, 200],
    splinePoints: [
      { position: new pc.Vec3(0, 0, 0), width: 8.5, current: 5.0 },
      { position: new pc.Vec3(8, 0, 40), width: 8.2, current: 5.2 },
      { position: new pc.Vec3(-10, 0, 85), width: 7.2, current: 5.4 },
      { position: new pc.Vec3(9, 0, 135), width: 8.5, current: 5.0 },
      { position: new pc.Vec3(-11, 0, 185), width: 7.5, current: 5.2 },
      { position: new pc.Vec3(8, 0, 235), width: 8.0, current: 5.0 },
      { position: new pc.Vec3(-6, 0, 280), width: 8.5, current: 4.8 },
      { position: new pc.Vec3(0, 0, 320), width: 9.0, current: 4.2 }
    ],
    obstacles: [
      { distance: 40, lateralOffset: 1.8, type: 'duck', radius: 0.8 },
      { distance: 75, lateralOffset: -1.9, type: 'rock', radius: 0.9 },
      { distance: 110, lateralOffset: 1.6, type: 'frog', radius: 0.7 },
      { distance: 145, lateralOffset: -2.0, type: 'branch', radius: 1.3 },
      { distance: 175, lateralOffset: 1.8, type: 'whirlpool', radius: 1.2 },
      { distance: 215, lateralOffset: -1.7, type: 'duck', radius: 0.8 },
      { distance: 250, lateralOffset: 1.8, type: 'rock', radius: 1.0 },
      { distance: 285, lateralOffset: -1.5, type: 'frog', radius: 0.7 }
    ],
    collectibles: [
      { distance: 20, lateralOffset: 0.0, type: 'golden_leaf' },
      { distance: 45, lateralOffset: -1.5, type: 'lily_flower' },
      { distance: 70, lateralOffset: 1.8, type: 'starlight' },
      { distance: 90, lateralOffset: 0.0, type: 'golden_leaf' }, // Bridge 1
      { distance: 118, lateralOffset: -1.6, type: 'lily_flower' },
      { distance: 140, lateralOffset: 1.5, type: 'starlight' },
      { distance: 165, lateralOffset: 0.0, type: 'golden_leaf' },
      { distance: 195, lateralOffset: -1.8, type: 'starlight' },
      { distance: 200, lateralOffset: 0.0, type: 'golden_leaf' }, // Bridge 2
      { distance: 230, lateralOffset: 1.6, type: 'lily_flower' },
      { distance: 260, lateralOffset: -1.4, type: 'starlight' },
      { distance: 290, lateralOffset: 1.5, type: 'golden_leaf' },
      { distance: 305, lateralOffset: 0.0, type: 'starlight' }
    ],
    environment: {
      seed: 1010,
      treeDensity: 1.3,
      rockDensity: 1.0,
      lilyPadDensity: 1.2,
      isAutumn: true,
      weather: 'fireflies',
      skyColor: new pc.Color(0.85, 0.58, 0.52), // Golden sunset
      sunColor: new pc.Color(1.0, 0.82, 0.65),
      sunIntensity: 1.4,
      waterTint: new pc.Color(0.28, 0.62, 0.72),
      bankTint: new pc.Color(0.48, 0.55, 0.32)
    }
  }
};

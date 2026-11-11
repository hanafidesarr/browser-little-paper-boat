import * as pc from 'playcanvas';
import { LevelConfig } from './LevelConfig';

export const LEVEL_DATA: { [id: number]: LevelConfig } = {
  // ==========================================
  // LEVEL 01 — MORNING CREEK (EASY / TUTORIAL)
  // Length: ~390m (2x extended)
  // Peaceful, wide, gentle current, zero damaging obstacles
  // ==========================================
  1: {
    id: 1,
    title: 'Morning Creek',
    subtitle: 'A gentle dawn awakening',
    description: 'Crisp morning sunshine, bright green meadows, and gentle murmuring waters.',
    baseSpeed: 4.5,
    audioTheme: 'morning',
    splinePoints: [
      { position: new pc.Vec3(0, 0, 0), width: 8.8, current: 4.2 },
      { position: new pc.Vec3(4, 0, 48), width: 8.8, current: 4.2 },
      { position: new pc.Vec3(-5, 0, 105), width: 8.6, current: 4.4 },
      { position: new pc.Vec3(6, 0, 175), width: 9.0, current: 4.2 },
      { position: new pc.Vec3(-4, 0, 245), width: 8.8, current: 4.3 },
      { position: new pc.Vec3(5, 0, 315), width: 8.6, current: 4.2 },
      { position: new pc.Vec3(0, 0, 390), width: 9.2, current: 4.0 }
    ],
    obstacles: [
      { distance: 35, lateralOffset: 0.8, type: 'duck', radius: 0.8 },
      { distance: 75, lateralOffset: -1.2, type: 'lily_pads', radius: 1.3 },
      { distance: 120, lateralOffset: 0.6, type: 'fish', radius: 0.7 },
      { distance: 170, lateralOffset: 1.2, type: 'frog', radius: 0.7 },
      { distance: 220, lateralOffset: -0.8, type: 'duck', radius: 0.8 },
      { distance: 275, lateralOffset: 1.0, type: 'lily_pads', radius: 1.3 },
      { distance: 330, lateralOffset: 0.0, type: 'waterfall_zone', radius: 2.8 }
    ],
    collectibles: [
      { distance: 25, lateralOffset: 0.0, type: 'golden_leaf' },
      { distance: 55, lateralOffset: 1.2, type: 'golden_leaf' },
      { distance: 90, lateralOffset: -1.2, type: 'golden_leaf' },
      { distance: 130, lateralOffset: 1.0, type: 'golden_leaf' },
      { distance: 165, lateralOffset: -1.4, type: 'golden_leaf' },
      { distance: 205, lateralOffset: 0.0, type: 'golden_leaf' },
      { distance: 245, lateralOffset: 1.4, type: 'golden_leaf' },
      { distance: 285, lateralOffset: -1.0, type: 'golden_leaf' },
      { distance: 325, lateralOffset: 0.0, type: 'golden_leaf' },
      { distance: 360, lateralOffset: 1.2, type: 'golden_leaf' }
    ],
    environment: {
      seed: 101,
      treeDensity: 1.0,
      rockDensity: 0.8,
      lilyPadDensity: 0.5,
      isAutumn: false,
      weather: 'sunny',
      skyColor: new pc.Color(0.72, 0.88, 0.96),
      sunColor: new pc.Color(1.0, 0.96, 0.88),
      sunIntensity: 1.15,
      waterTint: new pc.Color(0.20, 0.68, 0.80),
      bankTint: new pc.Color(0.36, 0.62, 0.32)
    }
  },

  // ==========================================
  // LEVEL 02 — LILY GARDEN (EASY-MODERATE)
  // Length: ~450m (2x extended)
  // First gentle whirlpool introducing vortex spin
  // ==========================================
  2: {
    id: 2,
    title: 'Lily Garden',
    subtitle: 'Floating blossoms and soft reflections',
    description: 'Wander through calm botanical garden curves adorned with water lilies.',
    baseSpeed: 4.6,
    audioTheme: 'garden',
    splinePoints: [
      { position: new pc.Vec3(0, 0, 0), width: 8.8, current: 4.5 },
      { position: new pc.Vec3(-8, 0, 65), width: 8.5, current: 4.5 },
      { position: new pc.Vec3(9, 0, 140), width: 9.5, current: 4.3 },
      { position: new pc.Vec3(-10, 0, 224), width: 8.8, current: 4.6 },
      { position: new pc.Vec3(8, 0, 310), width: 8.5, current: 4.5 },
      { position: new pc.Vec3(-5, 0, 385), width: 8.8, current: 4.4 },
      { position: new pc.Vec3(0, 0, 455), width: 9.2, current: 4.2 }
    ],
    obstacles: [
      { distance: 45, lateralOffset: -1.2, type: 'duck', radius: 0.8 },
      { distance: 110, lateralOffset: 1.8, type: 'whirlpool', radius: 2.2 },
      { distance: 175, lateralOffset: -1.6, type: 'lily_pads', radius: 1.3 },
      { distance: 235, lateralOffset: 1.8, type: 'fish', radius: 0.7 },
      { distance: 295, lateralOffset: -1.8, type: 'frog', radius: 0.7 },
      { distance: 360, lateralOffset: 1.6, type: 'rock', radius: 0.85 },
      { distance: 415, lateralOffset: -1.2, type: 'duck', radius: 0.8 }
    ],
    collectibles: [
      { distance: 30, lateralOffset: -1.2, type: 'lily_flower' },
      { distance: 70, lateralOffset: 1.5, type: 'lily_flower' },
      { distance: 110, lateralOffset: -0.8, type: 'lily_flower' },
      { distance: 150, lateralOffset: -1.8, type: 'lily_flower' },
      { distance: 195, lateralOffset: 1.6, type: 'lily_flower' },
      { distance: 240, lateralOffset: 0.0, type: 'lily_flower' },
      { distance: 285, lateralOffset: 1.8, type: 'lily_flower' },
      { distance: 330, lateralOffset: -1.6, type: 'lily_flower' },
      { distance: 375, lateralOffset: 0.8, type: 'lily_flower' },
      { distance: 420, lateralOffset: -0.8, type: 'lily_flower' }
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
      sunIntensity: 1.15,
      waterTint: new pc.Color(0.20, 0.68, 0.75),
      bankTint: new pc.Color(0.32, 0.65, 0.36)
    }
  },

  // ==========================================
  // LEVEL 03 — MOSSY FOREST (MODERATE)
  // Length: ~470m (2x extended)
  // Boughs, fallen driftwood and mossy river rocks
  // ==========================================
  3: {
    id: 3,
    title: 'Mossy Forest',
    subtitle: 'Emerald canopies and ancient stones',
    description: 'Navigate beneath deep moss-covered forest boughs and ancient fallen timber.',
    baseSpeed: 4.8,
    audioTheme: 'forest',
    splinePoints: [
      { position: new pc.Vec3(0, 0, 0), width: 8.2, current: 4.8 },
      { position: new pc.Vec3(9, 0, 70), width: 7.6, current: 5.0 },
      { position: new pc.Vec3(-10, 0, 150), width: 7.2, current: 5.2 },
      { position: new pc.Vec3(10, 0, 235), width: 7.4, current: 5.0 },
      { position: new pc.Vec3(-9, 0, 318), width: 7.8, current: 4.9 },
      { position: new pc.Vec3(7, 0, 398), width: 8.2, current: 4.7 },
      { position: new pc.Vec3(0, 0, 475), width: 8.8, current: 4.3 }
    ],
    obstacles: [
      { distance: 65, lateralOffset: 1.5, type: 'rock', radius: 1.0 },
      { distance: 130, lateralOffset: -1.6, type: 'branch', radius: 1.3 },
      { distance: 195, lateralOffset: 1.4, type: 'frog', radius: 0.7 },
      { distance: 255, lateralOffset: -1.5, type: 'log', radius: 1.3 },
      { distance: 320, lateralOffset: 1.7, type: 'rock', radius: 1.0 },
      { distance: 385, lateralOffset: -1.2, type: 'lily_pads', radius: 1.2 },
      { distance: 435, lateralOffset: 1.4, type: 'branch', radius: 1.3 }
    ],
    collectibles: [
      { distance: 35, lateralOffset: 1.2, type: 'golden_leaf' },
      { distance: 75, lateralOffset: -1.5, type: 'golden_leaf' },
      { distance: 115, lateralOffset: 0.0, type: 'golden_leaf' },
      { distance: 165, lateralOffset: 1.5, type: 'golden_leaf' },
      { distance: 210, lateralOffset: -1.2, type: 'golden_leaf' },
      { distance: 255, lateralOffset: 0.0, type: 'golden_leaf' },
      { distance: 300, lateralOffset: 1.4, type: 'golden_leaf' },
      { distance: 345, lateralOffset: -1.3, type: 'golden_leaf' },
      { distance: 395, lateralOffset: 0.0, type: 'golden_leaf' },
      { distance: 445, lateralOffset: 1.2, type: 'golden_leaf' }
    ],
    environment: {
      seed: 303,
      treeDensity: 1.8,
      rockDensity: 1.4,
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
  // LEVEL 04 — GENTLE RAIN (MODERATE)
  // Length: ~470m (2x extended)
  // Bad weather: slightly murkier water, 2 whirlpools
  // ==========================================
  4: {
    id: 4,
    title: 'Gentle Rain',
    subtitle: 'Soft drops and serene ripples',
    description: 'Listen to tranquil raindrops tap dancing on the surface of the river.',
    baseSpeed: 4.8,
    audioTheme: 'rain',
    splinePoints: [
      { position: new pc.Vec3(0, 0, 0), width: 8.5, current: 4.7 },
      { position: new pc.Vec3(-7, 0, 65), width: 8.2, current: 4.8 },
      { position: new pc.Vec3(8, 0, 140), width: 8.0, current: 4.9 },
      { position: new pc.Vec3(-9, 0, 225), width: 8.4, current: 4.7 },
      { position: new pc.Vec3(7, 0, 310), width: 8.0, current: 4.8 },
      { position: new pc.Vec3(-5, 0, 390), width: 8.2, current: 4.6 },
      { position: new pc.Vec3(0, 0, 470), width: 8.6, current: 4.2 }
    ],
    obstacles: [
      { distance: 75, lateralOffset: -1.8, type: 'rock', radius: 0.9 },
      { distance: 145, lateralOffset: 1.8, type: 'duck', radius: 0.8 },
      { distance: 215, lateralOffset: -1.7, type: 'whirlpool', radius: 2.2 },
      { distance: 290, lateralOffset: 1.6, type: 'fish', radius: 0.7 },
      { distance: 360, lateralOffset: -1.5, type: 'branch', radius: 1.2 },
      { distance: 415, lateralOffset: 1.7, type: 'whirlpool', radius: 2.2 }
    ],
    collectibles: [
      { distance: 35, lateralOffset: 0.0, type: 'starlight' },
      { distance: 75, lateralOffset: 1.5, type: 'starlight' },
      { distance: 120, lateralOffset: -1.5, type: 'starlight' },
      { distance: 165, lateralOffset: 0.8, type: 'starlight' },
      { distance: 205, lateralOffset: -1.4, type: 'starlight' },
      { distance: 255, lateralOffset: 1.6, type: 'starlight' },
      { distance: 300, lateralOffset: 0.0, type: 'starlight' },
      { distance: 345, lateralOffset: -1.5, type: 'starlight' },
      { distance: 395, lateralOffset: 1.2, type: 'starlight' },
      { distance: 440, lateralOffset: 0.0, type: 'starlight' }
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
      waterTint: new pc.Color(0.28, 0.52, 0.65), // Bad weather slightly deeper/murkier
      bankTint: new pc.Color(0.28, 0.48, 0.32)
    }
  },

  // ==========================================
  // LEVEL 05 — AUTUMN RIVER (CHALLENGING)
  // Length: ~490m (2x extended)
  // Meanders, 2 whirlpools, fallen logs, rocks
  // ==========================================
  5: {
    id: 5,
    title: 'Autumn River',
    subtitle: 'Golden leaves and brisk currents',
    description: 'Drift through glorious autumn foliage where golden leaves glide across the water.',
    baseSpeed: 5.2,
    audioTheme: 'autumn',
    splinePoints: [
      { position: new pc.Vec3(0, 0, 0), width: 9.0, current: 5.2 },
      { position: new pc.Vec3(11, 0, 75), width: 8.6, current: 5.4 },
      { position: new pc.Vec3(-12, 0, 160), width: 8.0, current: 5.6 },
      { position: new pc.Vec3(13, 0, 255), width: 8.4, current: 5.3 },
      { position: new pc.Vec3(-11, 0, 350), width: 7.8, current: 5.5 },
      { position: new pc.Vec3(8, 0, 430), width: 8.5, current: 5.0 },
      { position: new pc.Vec3(0, 0, 495), width: 9.0, current: 4.5 }
    ],
    obstacles: [
      { distance: 80, lateralOffset: 2.0, type: 'rock', radius: 1.0 },
      { distance: 155, lateralOffset: -2.0, type: 'log', radius: 1.3 },
      { distance: 220, lateralOffset: 1.8, type: 'branch', radius: 1.2 },
      { distance: 290, lateralOffset: 0.0, type: 'waterfall_zone', radius: 2.8 },
      { distance: 360, lateralOffset: -1.9, type: 'whirlpool', radius: 2.2 },
      { distance: 415, lateralOffset: 1.8, type: 'whirlpool', radius: 2.2 },
      { distance: 455, lateralOffset: -1.7, type: 'rock', radius: 0.95 }
    ],
    collectibles: [
      { distance: 40, lateralOffset: -1.2, type: 'golden_leaf' },
      { distance: 80, lateralOffset: 1.4, type: 'golden_leaf' },
      { distance: 125, lateralOffset: -1.8, type: 'golden_leaf' },
      { distance: 175, lateralOffset: 0.0, type: 'golden_leaf' },
      { distance: 220, lateralOffset: 1.8, type: 'golden_leaf' },
      { distance: 270, lateralOffset: -1.5, type: 'golden_leaf' },
      { distance: 320, lateralOffset: 1.6, type: 'golden_leaf' },
      { distance: 370, lateralOffset: 0.0, type: 'golden_leaf' },
      { distance: 415, lateralOffset: -1.6, type: 'golden_leaf' },
      { distance: 465, lateralOffset: 1.2, type: 'golden_leaf' }
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
      sunIntensity: 1.2,
      waterTint: new pc.Color(0.28, 0.58, 0.65),
      bankTint: new pc.Color(0.58, 0.45, 0.25)
    }
  },

  // ==========================================
  // LEVEL 06 — OLD WOODEN BRIDGE (CHALLENGING)
  // Length: ~490m (2x extended)
  // Narrow stone channels under rustic bridges, pillars and slalom
  // ==========================================
  6: {
    id: 6,
    title: 'Old Wooden Bridge',
    subtitle: 'Rustic timbers and historic pathways',
    description: 'Steer through narrow stone-lined channels beneath charming wooden country bridges.',
    baseSpeed: 4.8,
    audioTheme: 'garden',
    bridgeDistances: [140, 320],
    splinePoints: [
      { position: new pc.Vec3(0, 0, 0), width: 8.0, current: 4.8 },
      { position: new pc.Vec3(-6, 0, 65), width: 7.2, current: 4.8 },
      { position: new pc.Vec3(0, 0, 140), width: 5.8, current: 5.2 }, // Under bridge 1
      { position: new pc.Vec3(9, 0, 230), width: 7.8, current: 4.9 },
      { position: new pc.Vec3(0, 0, 320), width: 5.6, current: 5.3 }, // Under bridge 2
      { position: new pc.Vec3(-8, 0, 410), width: 7.6, current: 4.8 },
      { position: new pc.Vec3(0, 0, 490), width: 8.5, current: 4.4 }
    ],
    obstacles: [
      { distance: 70, lateralOffset: 1.5, type: 'rock', radius: 0.9 },
      { distance: 136, lateralOffset: -1.7, type: 'rock', radius: 0.8 }, // Near Bridge 1 pillar
      { distance: 195, lateralOffset: 1.8, type: 'duck', radius: 0.8 },
      { distance: 260, lateralOffset: -1.6, type: 'branch', radius: 1.2 },
      { distance: 316, lateralOffset: 1.6, type: 'rock', radius: 0.8 }, // Near Bridge 2 pillar
      { distance: 375, lateralOffset: -1.8, type: 'whirlpool', radius: 2.0 },
      { distance: 430, lateralOffset: 1.5, type: 'frog', radius: 0.7 }
    ],
    collectibles: [
      { distance: 35, lateralOffset: 0.0, type: 'golden_leaf' },
      { distance: 85, lateralOffset: -1.2, type: 'golden_leaf' },
      { distance: 140, lateralOffset: 0.0, type: 'golden_leaf' }, // Center under Bridge 1
      { distance: 185, lateralOffset: 1.5, type: 'golden_leaf' },
      { distance: 235, lateralOffset: -1.4, type: 'golden_leaf' },
      { distance: 280, lateralOffset: 1.2, type: 'golden_leaf' },
      { distance: 320, lateralOffset: 0.0, type: 'golden_leaf' }, // Center under Bridge 2
      { distance: 370, lateralOffset: -1.5, type: 'golden_leaf' },
      { distance: 420, lateralOffset: 1.4, type: 'golden_leaf' },
      { distance: 465, lateralOffset: 0.0, type: 'golden_leaf' }
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
      sunIntensity: 1.15,
      waterTint: new pc.Color(0.22, 0.62, 0.72),
      bankTint: new pc.Color(0.38, 0.58, 0.35)
    }
  },

  // ==========================================
  // LEVEL 07 — LITTLE FRIENDS (CHALLENGING)
  // Length: ~480m (2x extended)
  // Swirling currents, animal friends, 2 whirlpools
  // ==========================================
  7: {
    id: 7,
    title: 'Little Friends',
    subtitle: 'Playful ducks and curious companions',
    description: 'Delight in river animals sharing the water, swimming and leaping along your path.',
    baseSpeed: 5.0,
    audioTheme: 'morning',
    splinePoints: [
      { position: new pc.Vec3(0, 0, 0), width: 8.5, current: 4.8 },
      { position: new pc.Vec3(8, 0, 65), width: 8.2, current: 5.0 },
      { position: new pc.Vec3(-10, 0, 145), width: 8.6, current: 4.8 },
      { position: new pc.Vec3(11, 0, 230), width: 8.0, current: 5.1 },
      { position: new pc.Vec3(-9, 0, 315), width: 8.4, current: 4.9 },
      { position: new pc.Vec3(7, 0, 395), width: 8.6, current: 4.8 },
      { position: new pc.Vec3(0, 0, 480), width: 9.0, current: 4.3 }
    ],
    obstacles: [
      { distance: 55, lateralOffset: 0.6, type: 'duck', radius: 0.8 },
      { distance: 115, lateralOffset: -1.6, type: 'frog', radius: 0.7 },
      { distance: 175, lateralOffset: 1.8, type: 'whirlpool', radius: 2.2 },
      { distance: 235, lateralOffset: -1.2, type: 'duck', radius: 0.8 },
      { distance: 295, lateralOffset: 1.5, type: 'frog', radius: 0.7 },
      { distance: 355, lateralOffset: -1.8, type: 'whirlpool', radius: 2.2 },
      { distance: 415, lateralOffset: 1.4, type: 'duck', radius: 0.8 }
    ],
    collectibles: [
      { distance: 35, lateralOffset: -1.2, type: 'lily_flower' },
      { distance: 75, lateralOffset: 1.6, type: 'lily_flower' },
      { distance: 125, lateralOffset: 0.0, type: 'lily_flower' },
      { distance: 175, lateralOffset: -1.8, type: 'lily_flower' },
      { distance: 220, lateralOffset: 1.4, type: 'lily_flower' },
      { distance: 265, lateralOffset: 0.0, type: 'lily_flower' },
      { distance: 315, lateralOffset: -1.5, type: 'lily_flower' },
      { distance: 365, lateralOffset: 1.6, type: 'lily_flower' },
      { distance: 415, lateralOffset: 0.0, type: 'lily_flower' },
      { distance: 455, lateralOffset: -1.2, type: 'lily_flower' }
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
      sunIntensity: 1.15,
      waterTint: new pc.Color(0.24, 0.65, 0.78),
      bankTint: new pc.Color(0.35, 0.62, 0.35)
    }
  },

  // ==========================================
  // LEVEL 08 — FIREFLY VALLEY (HARD)
  // Length: ~490m (2x extended)
  // Deep twilight, 3 whirlpools, dark water, rocks
  // ==========================================
  8: {
    id: 8,
    title: 'Firefly Valley',
    subtitle: 'Twilight glow and dancing stars',
    description: 'Drift serenely under purple twilight skies illuminated by swarms of magical fireflies.',
    baseSpeed: 4.8,
    audioTheme: 'twilight',
    splinePoints: [
      { position: new pc.Vec3(0, 0, 0), width: 8.5, current: 4.8 },
      { position: new pc.Vec3(-10, 0, 70), width: 8.0, current: 4.8 },
      { position: new pc.Vec3(11, 0, 156), width: 7.8, current: 5.1 },
      { position: new pc.Vec3(-12, 0, 244), width: 8.2, current: 4.9 },
      { position: new pc.Vec3(10, 0, 336), width: 7.8, current: 5.0 },
      { position: new pc.Vec3(-6, 0, 416), width: 8.2, current: 4.7 },
      { position: new pc.Vec3(0, 0, 490), width: 8.8, current: 4.3 }
    ],
    obstacles: [
      { distance: 80, lateralOffset: 1.8, type: 'rock', radius: 0.9 },
      { distance: 150, lateralOffset: -1.8, type: 'whirlpool', radius: 2.2 },
      { distance: 230, lateralOffset: 1.5, type: 'fish', radius: 0.7 },
      { distance: 305, lateralOffset: -1.8, type: 'whirlpool', radius: 2.2 },
      { distance: 375, lateralOffset: 1.7, type: 'branch', radius: 1.2 },
      { distance: 435, lateralOffset: -1.7, type: 'whirlpool', radius: 2.2 }
    ],
    collectibles: [
      { distance: 35, lateralOffset: 0.0, type: 'starlight' },
      { distance: 75, lateralOffset: -1.5, type: 'starlight' },
      { distance: 115, lateralOffset: 1.6, type: 'starlight' },
      { distance: 165, lateralOffset: 0.0, type: 'starlight' },
      { distance: 210, lateralOffset: -1.8, type: 'starlight' },
      { distance: 260, lateralOffset: 1.7, type: 'starlight' },
      { distance: 305, lateralOffset: 0.0, type: 'starlight' },
      { distance: 355, lateralOffset: -1.5, type: 'starlight' },
      { distance: 405, lateralOffset: 1.4, type: 'starlight' },
      { distance: 455, lateralOffset: 0.0, type: 'starlight' }
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
  // LEVEL 09 — WHISPERING FALLS (VERY HARD)
  // Length: ~510m (2x extended)
  // Fast rapids (6.2 m/s), 3 whirlpools, waterfall zones
  // ==========================================
  9: {
    id: 9,
    title: 'Whispering Falls',
    subtitle: 'Misty currents and refreshing rapids',
    description: 'Ride faster sparkling currents past misty river alcoves and bubbling whirlpool eddies.',
    baseSpeed: 5.6,
    audioTheme: 'rapids',
    splinePoints: [
      { position: new pc.Vec3(0, 0, 0), width: 9.0, current: 5.5 },
      { position: new pc.Vec3(12, 0, 76), width: 8.5, current: 5.8 },
      { position: new pc.Vec3(-13, 0, 160), width: 7.8, current: 6.2 },
      { position: new pc.Vec3(14, 0, 256), width: 8.0, current: 6.0 },
      { position: new pc.Vec3(-11, 0, 350), width: 8.2, current: 5.8 },
      { position: new pc.Vec3(8, 0, 436), width: 8.6, current: 5.5 },
      { position: new pc.Vec3(0, 0, 510), width: 9.0, current: 4.8 }
    ],
    obstacles: [
      { distance: 72, lateralOffset: -2.0, type: 'whirlpool', radius: 2.2 },
      { distance: 138, lateralOffset: 1.8, type: 'rock', radius: 1.0 },
      { distance: 198, lateralOffset: 0.0, type: 'waterfall_zone', radius: 3.0 },
      { distance: 265, lateralOffset: -2.0, type: 'whirlpool', radius: 2.2 },
      { distance: 330, lateralOffset: 2.0, type: 'branch', radius: 1.3 },
      { distance: 395, lateralOffset: -1.6, type: 'rock', radius: 1.0 },
      { distance: 450, lateralOffset: 0.0, type: 'waterfall_zone', radius: 2.8 }
    ],
    collectibles: [
      { distance: 35, lateralOffset: 1.2, type: 'starlight' },
      { distance: 85, lateralOffset: -1.4, type: 'starlight' },
      { distance: 140, lateralOffset: 0.0, type: 'starlight' },
      { distance: 190, lateralOffset: 1.8, type: 'starlight' },
      { distance: 238, lateralOffset: -1.6, type: 'starlight' },
      { distance: 290, lateralOffset: 0.0, type: 'starlight' },
      { distance: 340, lateralOffset: 1.5, type: 'starlight' },
      { distance: 388, lateralOffset: -1.6, type: 'starlight' },
      { distance: 435, lateralOffset: 1.2, type: 'starlight' },
      { distance: 480, lateralOffset: 0.0, type: 'starlight' }
    ],
    environment: {
      seed: 909,
      treeDensity: 1.2,
      rockDensity: 1.6,
      lilyPadDensity: 0.4,
      isAutumn: false,
      weather: 'sunny',
      skyColor: new pc.Color(0.68, 0.88, 0.94),
      sunColor: new pc.Color(0.98, 0.98, 1.0),
      sunIntensity: 1.2,
      waterTint: new pc.Color(0.20, 0.68, 0.82),
      bankTint: new pc.Color(0.32, 0.58, 0.34)
    }
  },

  // ==========================================
  // LEVEL 10 — THE ENDLESS JOURNEY (MASTER / GRAND FINALE)
  // Length: ~660m (2x extended)
  // The ultimate voyage: 4 whirlpools, 2 bridges, gauntlets, grand ocean bay
  // ==========================================
  10: {
    id: 10,
    title: 'The Endless Journey',
    subtitle: 'A sunset voyage across all realms',
    description: 'A grand master journey uniting friends, bridges, fireflies, and peaceful golden sunset vistas.',
    baseSpeed: 5.2,
    audioTheme: 'twilight',
    bridgeDistances: [180, 410],
    splinePoints: [
      { position: new pc.Vec3(0, 0, 0), width: 8.5, current: 5.0 },
      { position: new pc.Vec3(10, 0, 84), width: 8.2, current: 5.2 },
      { position: new pc.Vec3(-12, 0, 180), width: 6.8, current: 5.4 }, // Under Bridge 1
      { position: new pc.Vec3(11, 0, 284), width: 8.5, current: 5.0 },
      { position: new pc.Vec3(-13, 0, 390), width: 7.2, current: 5.2 }, // Under Bridge 2
      { position: new pc.Vec3(10, 0, 496), width: 8.2, current: 5.0 },
      { position: new pc.Vec3(-8, 0, 584), width: 8.8, current: 4.8 },
      { position: new pc.Vec3(0, 0, 660), width: 9.5, current: 4.2 }
    ],
    obstacles: [
      { distance: 75, lateralOffset: 1.8, type: 'duck', radius: 0.8 },
      { distance: 145, lateralOffset: -1.9, type: 'whirlpool', radius: 2.2 },
      { distance: 215, lateralOffset: 1.6, type: 'frog', radius: 0.7 },
      { distance: 284, lateralOffset: -2.0, type: 'branch', radius: 1.3 },
      { distance: 345, lateralOffset: 1.8, type: 'whirlpool', radius: 2.2 },
      { distance: 425, lateralOffset: -1.7, type: 'fish', radius: 0.7 },
      { distance: 495, lateralOffset: 1.8, type: 'rock', radius: 1.0 },
      { distance: 560, lateralOffset: -1.8, type: 'whirlpool', radius: 2.2 },
      { distance: 615, lateralOffset: 0.0, type: 'waterfall_zone', radius: 2.8 }
    ],
    collectibles: [
      { distance: 40, lateralOffset: 0.0, type: 'golden_leaf' },
      { distance: 90, lateralOffset: -1.5, type: 'lily_flower' },
      { distance: 140, lateralOffset: 1.8, type: 'starlight' },
      { distance: 180, lateralOffset: 0.0, type: 'golden_leaf' }, // Center under Bridge 1
      { distance: 235, lateralOffset: -1.6, type: 'lily_flower' },
      { distance: 285, lateralOffset: 1.5, type: 'starlight' },
      { distance: 335, lateralOffset: 0.0, type: 'golden_leaf' },
      { distance: 385, lateralOffset: -1.8, type: 'starlight' },
      { distance: 410, lateralOffset: 0.0, type: 'golden_leaf' }, // Center under Bridge 2
      { distance: 470, lateralOffset: 1.6, type: 'lily_flower' },
      { distance: 530, lateralOffset: -1.4, type: 'starlight' },
      { distance: 590, lateralOffset: 1.5, type: 'golden_leaf' },
      { distance: 630, lateralOffset: 0.0, type: 'starlight' }
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
      sunIntensity: 1.25,
      waterTint: new pc.Color(0.28, 0.62, 0.72),
      bankTint: new pc.Color(0.48, 0.55, 0.32)
    }
  }
};

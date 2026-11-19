import * as pc from 'playcanvas';
import { LevelConfig } from './LevelConfig';

export const LEVEL_DATA: { [id: number]: LevelConfig } = {
  // ==========================================
  // LEVEL 01 — MORNING CREEK (EASY / TUTORIAL)
  // Length: ~390m
  // Peaceful, wide, gentle current, active obstacles to dodge
  // ==========================================
  1: {
    id: 1,
    title: 'Morning Creek',
    subtitle: 'A gentle dawn awakening',
    description: 'Crisp morning sunshine, bright green meadows, and gentle murmuring waters with playful wildlife.',
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
      { distance: 25, lateralOffset: 1.2, type: 'duck', radius: 0.8 },
      { distance: 48, lateralOffset: -1.4, type: 'lily_pads', radius: 1.3 },
      { distance: 72, lateralOffset: 1.0, type: 'frog', radius: 0.7 },
      { distance: 95, lateralOffset: -1.6, type: 'rock', radius: 0.85 },
      { distance: 120, lateralOffset: 0.8, type: 'fish', radius: 0.7 },
      { distance: 145, lateralOffset: -1.2, type: 'duck', radius: 0.8 },
      { distance: 170, lateralOffset: 1.5, type: 'frog', radius: 0.7 },
      { distance: 195, lateralOffset: -1.0, type: 'lily_pads', radius: 1.3 },
      { distance: 220, lateralOffset: 1.4, type: 'rock', radius: 0.85 },
      { distance: 245, lateralOffset: -1.5, type: 'duck', radius: 0.8 },
      { distance: 270, lateralOffset: 1.0, type: 'fish', radius: 0.7 },
      { distance: 295, lateralOffset: -1.2, type: 'frog', radius: 0.7 },
      { distance: 320, lateralOffset: 1.5, type: 'lily_pads', radius: 1.3 },
      { distance: 345, lateralOffset: 0.0, type: 'waterfall_zone', radius: 2.8 },
      { distance: 365, lateralOffset: -1.4, type: 'duck', radius: 0.8 }
    ],
    collectibles: [
      { distance: 20, lateralOffset: 0.0, type: 'golden_leaf' },
      { distance: 45, lateralOffset: 1.4, type: 'golden_leaf' },
      { distance: 80, lateralOffset: -1.2, type: 'golden_leaf' },
      { distance: 115, lateralOffset: 1.2, type: 'golden_leaf' },
      { distance: 155, lateralOffset: -1.4, type: 'golden_leaf' },
      { distance: 185, lateralOffset: 0.0, type: 'golden_leaf' },
      { distance: 230, lateralOffset: 1.4, type: 'golden_leaf' },
      { distance: 265, lateralOffset: -1.0, type: 'golden_leaf' },
      { distance: 305, lateralOffset: 1.2, type: 'golden_leaf' },
      { distance: 350, lateralOffset: 0.0, type: 'golden_leaf' },
      { distance: 372, lateralOffset: 1.0, type: 'golden_leaf' }
    ],
    environment: {
      seed: 101,
      treeDensity: 1.1,
      rockDensity: 0.8,
      lilyPadDensity: 0.6,
      flowerDensity: 1.3,
      isAutumn: false,
      weather: 'sunny',
      skyColor: new pc.Color(0.659, 0.847, 0.910),
      sunColor: new pc.Color(1.0, 0.898, 0.639),
      sunIntensity: 1.2,
      waterTint: new pc.Color(0.545, 0.827, 0.910),
      bankTint: new pc.Color(0.471, 0.725, 0.420)
    }
  },

  // ==========================================
  // LEVEL 02 — LILY GARDEN (FIRST ISLAND FORK!)
  // Length: ~455m
  // Features a lush central river island splitting the channel into 2 paths!
  // ==========================================
  2: {
    id: 2,
    title: 'Lily Garden',
    subtitle: 'Floating blossoms & the twin channels',
    description: 'Wander through calm botanical curves and navigate around the grand garden island.',
    baseSpeed: 4.6,
    audioTheme: 'garden',
    splinePoints: [
      { position: new pc.Vec3(0, 0, 0), width: 8.8, current: 4.5 },
      { position: new pc.Vec3(-8, 0, 65), width: 8.5, current: 4.5 },
      { position: new pc.Vec3(9, 0, 135), width: 9.5, current: 4.3 },
      { position: new pc.Vec3(-2, 0, 185), width: 14.5, current: 4.5 }, // Widening for island fork
      { position: new pc.Vec3(0, 0, 220), width: 16.5, current: 4.6 },  // Peak split around island
      { position: new pc.Vec3(3, 0, 258), width: 13.0, current: 4.5 },  // Rejoining channels
      { position: new pc.Vec3(8, 0, 310), width: 8.5, current: 4.5 },
      { position: new pc.Vec3(-5, 0, 385), width: 8.8, current: 4.4 },
      { position: new pc.Vec3(0, 0, 455), width: 9.2, current: 4.2 }
    ],
    islands: [
      {
        startDistance: 190,
        endDistance: 248,
        islandWidth: 6.2,
        islandHeight: 1.9,
        treeType: 'birch',
        hasSignpost: true,
        hasProwRock: true,
        flowerColor: 'pink'
      }
    ],
    obstacles: [
      // Approach to first bend
      { distance: 30, lateralOffset: -1.5, type: 'duck', radius: 0.8 },
      { distance: 55, lateralOffset: 1.6, type: 'lily_pads', radius: 1.3 },
      { distance: 80, lateralOffset: -1.4, type: 'rock', radius: 0.85 },
      { distance: 105, lateralOffset: 1.8, type: 'whirlpool', radius: 2.0 },
      { distance: 130, lateralOffset: -1.2, type: 'frog', radius: 0.7 },
      { distance: 155, lateralOffset: 1.4, type: 'fish', radius: 0.7 },
      { distance: 175, lateralOffset: -1.6, type: 'lily_pads', radius: 1.3 },

      // Island Split Zone (190m - 248m): Left channel (-5.2m) vs Right channel (+5.2m)
      { distance: 205, lateralOffset: -5.2, type: 'lily_pads', radius: 1.2 }, // Left channel: peaceful lily pads
      { distance: 215, lateralOffset: 5.2, type: 'whirlpool', radius: 2.1 },  // Right channel: whirlpool eddy!
      { distance: 228, lateralOffset: -5.0, type: 'duck', radius: 0.8 },       // Left channel: swimming duck
      { distance: 236, lateralOffset: 5.0, type: 'fish', radius: 0.7 },        // Right channel: leaping trout

      // Post-Island Slalom & Rapids
      { distance: 265, lateralOffset: 0.0, type: 'waterfall_zone', radius: 2.8 },
      { distance: 285, lateralOffset: -1.8, type: 'rock', radius: 0.9 },
      { distance: 308, lateralOffset: 1.7, type: 'frog', radius: 0.7 },
      { distance: 330, lateralOffset: -1.5, type: 'whirlpool', radius: 2.0 },
      { distance: 355, lateralOffset: 1.8, type: 'rock', radius: 0.9 },
      { distance: 378, lateralOffset: -1.4, type: 'fish', radius: 0.7 },
      { distance: 400, lateralOffset: 1.5, type: 'lily_pads', radius: 1.3 },
      { distance: 420, lateralOffset: -1.2, type: 'duck', radius: 0.8 },
      { distance: 438, lateralOffset: 1.2, type: 'frog', radius: 0.7 }
    ],
    collectibles: [
      { distance: 25, lateralOffset: -1.0, type: 'lily_flower' },
      { distance: 65, lateralOffset: 1.5, type: 'lily_flower' },
      { distance: 110, lateralOffset: -1.2, type: 'lily_flower' },
      { distance: 145, lateralOffset: 1.6, type: 'lily_flower' },
      // Fork Collectibles (Rewards in both channels)
      { distance: 200, lateralOffset: -5.0, type: 'lily_flower' }, // Left channel flower
      { distance: 210, lateralOffset: 5.2, type: 'lily_flower' },  // Right channel flower (risk/reward near whirlpool!)
      { distance: 230, lateralOffset: -5.2, type: 'lily_flower' }, // Left channel flower
      { distance: 242, lateralOffset: 5.0, type: 'lily_flower' },  // Right channel flower
      // Downstream
      { distance: 280, lateralOffset: 0.0, type: 'lily_flower' },
      { distance: 325, lateralOffset: -1.6, type: 'lily_flower' },
      { distance: 365, lateralOffset: 1.5, type: 'lily_flower' },
      { distance: 410, lateralOffset: -1.0, type: 'lily_flower' },
      { distance: 442, lateralOffset: 1.2, type: 'lily_flower' }
    ],
    environment: {
      seed: 202,
      treeDensity: 1.0,
      rockDensity: 0.6,
      lilyPadDensity: 1.8,
      flowerDensity: 1.5,
      isAutumn: false,
      weather: 'sunny',
      skyColor: new pc.Color(0.68, 0.87, 0.93),
      sunColor: new pc.Color(1.0, 0.92, 0.72),
      sunIntensity: 1.18,
      waterTint: new pc.Color(0.52, 0.83, 0.91),
      bankTint: new pc.Color(0.604, 0.796, 0.447)
    }
  },

  // ==========================================
  // LEVEL 03 — MOSSY FOREST (MODERATE / GAUNTLET)
  // Length: ~475m
  // Timber slaloms, sunken branches and mossy stone gates
  // ==========================================
  3: {
    id: 3,
    title: 'Mossy Forest',
    subtitle: 'Emerald canopies and ancient stones',
    description: 'Navigate beneath deep moss-covered forest boughs, dodging ancient timber and rock slaloms.',
    baseSpeed: 4.8,
    audioTheme: 'forest',
    splinePoints: [
      { position: new pc.Vec3(0, 0, 0), width: 8.2, current: 4.8 },
      { position: new pc.Vec3(9, 0, 70), width: 7.8, current: 5.0 },
      { position: new pc.Vec3(-10, 0, 150), width: 7.5, current: 5.2 },
      { position: new pc.Vec3(10, 0, 235), width: 7.6, current: 5.0 },
      { position: new pc.Vec3(-9, 0, 318), width: 7.8, current: 4.9 },
      { position: new pc.Vec3(7, 0, 398), width: 8.2, current: 4.7 },
      { position: new pc.Vec3(0, 0, 475), width: 8.8, current: 4.3 }
    ],
    obstacles: [
      { distance: 30, lateralOffset: 1.4, type: 'branch', radius: 1.2 },
      { distance: 50, lateralOffset: -1.5, type: 'rock', radius: 0.9 },
      { distance: 72, lateralOffset: 1.6, type: 'log', radius: 1.3 },
      { distance: 95, lateralOffset: -1.7, type: 'branch', radius: 1.2 },
      // Rock gate chokepoint
      { distance: 118, lateralOffset: -1.8, type: 'rock', radius: 0.9 },
      { distance: 122, lateralOffset: 1.8, type: 'rock', radius: 0.9 },
      { distance: 145, lateralOffset: 0.8, type: 'frog', radius: 0.7 },
      { distance: 168, lateralOffset: -1.5, type: 'log', radius: 1.3 },
      { distance: 190, lateralOffset: 1.6, type: 'rock', radius: 1.0 },
      { distance: 212, lateralOffset: -1.6, type: 'branch', radius: 1.2 },
      { distance: 235, lateralOffset: 1.4, type: 'fish', radius: 0.7 },
      { distance: 255, lateralOffset: -1.7, type: 'log', radius: 1.3 },
      { distance: 278, lateralOffset: 1.5, type: 'rock', radius: 0.95 },
      { distance: 300, lateralOffset: -1.4, type: 'lily_pads', radius: 1.2 },
      // Double rock gate
      { distance: 322, lateralOffset: -1.8, type: 'rock', radius: 0.9 },
      { distance: 325, lateralOffset: 1.7, type: 'rock', radius: 0.9 },
      { distance: 348, lateralOffset: -1.2, type: 'branch', radius: 1.2 },
      { distance: 370, lateralOffset: 1.6, type: 'log', radius: 1.3 },
      { distance: 395, lateralOffset: -1.5, type: 'frog', radius: 0.7 },
      { distance: 418, lateralOffset: 1.4, type: 'rock', radius: 0.95 },
      { distance: 438, lateralOffset: -1.4, type: 'branch', radius: 1.2 },
      { distance: 456, lateralOffset: 1.2, type: 'lily_pads', radius: 1.2 }
    ],
    collectibles: [
      { distance: 22, lateralOffset: 0.0, type: 'golden_leaf' },
      { distance: 60, lateralOffset: -1.2, type: 'golden_leaf' },
      { distance: 105, lateralOffset: 1.4, type: 'golden_leaf' },
      { distance: 135, lateralOffset: 0.0, type: 'golden_leaf' },
      { distance: 178, lateralOffset: -1.4, type: 'golden_leaf' },
      { distance: 220, lateralOffset: 1.5, type: 'golden_leaf' },
      { distance: 268, lateralOffset: 0.0, type: 'golden_leaf' },
      { distance: 310, lateralOffset: -1.2, type: 'golden_leaf' },
      { distance: 358, lateralOffset: 1.4, type: 'golden_leaf' },
      { distance: 405, lateralOffset: 0.0, type: 'golden_leaf' },
      { distance: 450, lateralOffset: -1.2, type: 'golden_leaf' }
    ],
    environment: {
      seed: 303,
      treeDensity: 1.5,
      rockDensity: 1.4,
      lilyPadDensity: 0.5,
      flowerDensity: 0.9,
      isAutumn: false,
      weather: 'sunny',
      skyColor: new pc.Color(0.60, 0.80, 0.88),
      sunColor: new pc.Color(1.0, 0.88, 0.62),
      sunIntensity: 1.15,
      waterTint: new pc.Color(0.50, 0.80, 0.89),
      bankTint: new pc.Color(0.278, 0.486, 0.322)
    }
  },

  // ==========================================
  // LEVEL 04 — GENTLE RAIN (MODERATE / WHIRLPOOLS)
  // Length: ~470m
  // Bad weather rain ripples, 3 whirlpools, floating timber
  // ==========================================
  4: {
    id: 4,
    title: 'Gentle Rain',
    subtitle: 'Soft drops and swirling eddies',
    description: 'Listen to tranquil raindrops tap dancing on the water as you dodge swirling whirlpools.',
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
      { distance: 30, lateralOffset: -1.2, type: 'duck', radius: 0.8 },
      { distance: 52, lateralOffset: 1.5, type: 'rock', radius: 0.9 },
      { distance: 75, lateralOffset: -1.8, type: 'whirlpool', radius: 2.1 },
      { distance: 100, lateralOffset: 1.6, type: 'branch', radius: 1.2 },
      { distance: 125, lateralOffset: -1.5, type: 'lily_pads', radius: 1.3 },
      { distance: 148, lateralOffset: 1.8, type: 'rock', radius: 0.95 },
      { distance: 172, lateralOffset: -1.4, type: 'fish', radius: 0.7 },
      { distance: 195, lateralOffset: 1.7, type: 'whirlpool', radius: 2.2 },
      { distance: 220, lateralOffset: -1.6, type: 'log', radius: 1.3 },
      { distance: 245, lateralOffset: 1.4, type: 'frog', radius: 0.7 },
      { distance: 270, lateralOffset: -1.5, type: 'rock', radius: 0.9 },
      { distance: 292, lateralOffset: 1.6, type: 'duck', radius: 0.8 },
      { distance: 315, lateralOffset: -1.8, type: 'whirlpool', radius: 2.2 },
      { distance: 340, lateralOffset: 1.5, type: 'branch', radius: 1.2 },
      { distance: 362, lateralOffset: -1.4, type: 'rock', radius: 0.9 },
      { distance: 385, lateralOffset: 1.7, type: 'lily_pads', radius: 1.3 },
      { distance: 410, lateralOffset: -1.6, type: 'whirlpool', radius: 2.0 },
      { distance: 432, lateralOffset: 1.4, type: 'log', radius: 1.3 },
      { distance: 450, lateralOffset: -1.2, type: 'duck', radius: 0.8 }
    ],
    collectibles: [
      { distance: 20, lateralOffset: 0.0, type: 'starlight' },
      { distance: 60, lateralOffset: -1.4, type: 'starlight' },
      { distance: 90, lateralOffset: 1.4, type: 'starlight' },
      { distance: 135, lateralOffset: -1.2, type: 'starlight' },
      { distance: 180, lateralOffset: 1.5, type: 'starlight' },
      { distance: 210, lateralOffset: 0.0, type: 'starlight' },
      { distance: 255, lateralOffset: -1.5, type: 'starlight' },
      { distance: 300, lateralOffset: 1.4, type: 'starlight' },
      { distance: 350, lateralOffset: 0.0, type: 'starlight' },
      { distance: 395, lateralOffset: -1.4, type: 'starlight' },
      { distance: 442, lateralOffset: 1.2, type: 'starlight' }
    ],
    environment: {
      seed: 404,
      treeDensity: 1.2,
      rockDensity: 1.0,
      lilyPadDensity: 0.7,
      flowerDensity: 0.9,
      isAutumn: false,
      weather: 'rain',
      skyColor: new pc.Color(0.60, 0.72, 0.80),
      sunColor: new pc.Color(0.88, 0.92, 0.96),
      sunIntensity: 0.98,
      waterTint: new pc.Color(0.48, 0.75, 0.84),
      bankTint: new pc.Color(0.35, 0.56, 0.36)
    }
  },

  // ==========================================
  // LEVEL 05 — AUTUMN RIVER (SECOND ISLAND FORK!)
  // Length: ~495m
  // Brisk golden current, amber foliage island fork & whirlpools
  // ==========================================
  5: {
    id: 5,
    title: 'Autumn River',
    subtitle: 'Golden leaves & the split river',
    description: 'Drift through glorious autumn foliage and steer around the majestic amber island.',
    baseSpeed: 5.2,
    audioTheme: 'autumn',
    splinePoints: [
      { position: new pc.Vec3(0, 0, 0), width: 9.0, current: 5.2 },
      { position: new pc.Vec3(11, 0, 75), width: 8.6, current: 5.4 },
      { position: new pc.Vec3(-10, 0, 145), width: 8.5, current: 5.5 },
      { position: new pc.Vec3(-1, 0, 195), width: 14.5, current: 5.4 }, // Widening for island fork
      { position: new pc.Vec3(2, 0, 235), width: 17.5, current: 5.3 },  // Island peak split
      { position: new pc.Vec3(6, 0, 275), width: 12.5, current: 5.2 },  // Rejoining
      { position: new pc.Vec3(-11, 0, 350), width: 7.8, current: 5.5 },
      { position: new pc.Vec3(8, 0, 430), width: 8.5, current: 5.0 },
      { position: new pc.Vec3(0, 0, 495), width: 9.0, current: 4.5 }
    ],
    islands: [
      {
        startDistance: 200,
        endDistance: 265,
        islandWidth: 6.8,
        islandHeight: 2.0,
        treeType: 'autumn',
        hasSignpost: true,
        hasProwRock: true,
        flowerColor: 'yellow'
      }
    ],
    obstacles: [
      { distance: 35, lateralOffset: 1.5, type: 'rock', radius: 1.0 },
      { distance: 60, lateralOffset: -1.6, type: 'log', radius: 1.3 },
      { distance: 88, lateralOffset: 1.8, type: 'whirlpool', radius: 2.1 },
      { distance: 115, lateralOffset: -1.7, type: 'branch', radius: 1.2 },
      { distance: 140, lateralOffset: 1.5, type: 'rock', radius: 0.95 },
      { distance: 168, lateralOffset: -1.6, type: 'log', radius: 1.3 },

      // Island Split Zone (200m - 265m): Left channel (-5.5m) vs Right channel (+5.5m)
      { distance: 215, lateralOffset: -5.5, type: 'waterfall_zone', radius: 2.8 }, // Left channel: foaming rapids boost!
      { distance: 220, lateralOffset: 5.5, type: 'whirlpool', radius: 2.1 },       // Right channel: whirlpool eddy to evade!
      { distance: 240, lateralOffset: -5.4, type: 'duck', radius: 0.8 },           // Left channel: swimming duck
      { distance: 248, lateralOffset: 5.4, type: 'rock', radius: 0.95 },          // Right channel: river boulder

      // Downstream Slaloms & Whirlpools
      { distance: 285, lateralOffset: 0.0, type: 'waterfall_zone', radius: 2.8 },
      { distance: 310, lateralOffset: -1.8, type: 'log', radius: 1.3 },
      { distance: 335, lateralOffset: 1.7, type: 'rock', radius: 1.0 },
      { distance: 360, lateralOffset: -1.9, type: 'whirlpool', radius: 2.2 },
      { distance: 385, lateralOffset: 1.8, type: 'branch', radius: 1.2 },
      { distance: 410, lateralOffset: -1.6, type: 'log', radius: 1.3 },
      { distance: 432, lateralOffset: 1.8, type: 'whirlpool', radius: 2.2 },
      { distance: 455, lateralOffset: -1.7, type: 'rock', radius: 0.95 },
      { distance: 475, lateralOffset: 1.3, type: 'duck', radius: 0.8 }
    ],
    collectibles: [
      { distance: 25, lateralOffset: -1.2, type: 'golden_leaf' },
      { distance: 75, lateralOffset: 1.4, type: 'golden_leaf' },
      { distance: 125, lateralOffset: -1.5, type: 'golden_leaf' },
      { distance: 175, lateralOffset: 0.0, type: 'golden_leaf' },
      // Fork Collectibles
      { distance: 212, lateralOffset: -5.5, type: 'golden_leaf' },
      { distance: 225, lateralOffset: 5.5, type: 'golden_leaf' },
      { distance: 245, lateralOffset: -5.5, type: 'golden_leaf' },
      { distance: 255, lateralOffset: 5.5, type: 'golden_leaf' },
      // Downstream
      { distance: 295, lateralOffset: 0.0, type: 'golden_leaf' },
      { distance: 345, lateralOffset: -1.5, type: 'golden_leaf' },
      { distance: 395, lateralOffset: 1.6, type: 'golden_leaf' },
      { distance: 445, lateralOffset: -1.2, type: 'golden_leaf' },
      { distance: 480, lateralOffset: 1.0, type: 'golden_leaf' }
    ],
    environment: {
      seed: 505,
      treeDensity: 1.4,
      rockDensity: 0.9,
      lilyPadDensity: 0.4,
      flowerDensity: 1.0,
      isAutumn: true,
      weather: 'autumn_leaves',
      skyColor: new pc.Color(0.74, 0.86, 0.94),
      sunColor: new pc.Color(1.0, 0.84, 0.58),
      sunIntensity: 1.2,
      waterTint: new pc.Color(0.54, 0.82, 0.90),
      bankTint: new pc.Color(0.768, 0.572, 0.258)
    }
  },

  // ==========================================
  // LEVEL 06 — OLD WOODEN BRIDGE (CHALLENGING / PILLARS)
  // Length: ~490m
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
      { position: new pc.Vec3(0, 0, 140), width: 6.2, current: 5.2 }, // Under bridge 1
      { position: new pc.Vec3(9, 0, 230), width: 7.8, current: 4.9 },
      { position: new pc.Vec3(0, 0, 320), width: 6.0, current: 5.3 }, // Under bridge 2
      { position: new pc.Vec3(-8, 0, 410), width: 7.6, current: 4.8 },
      { position: new pc.Vec3(0, 0, 490), width: 8.5, current: 4.4 }
    ],
    obstacles: [
      { distance: 30, lateralOffset: 1.4, type: 'rock', radius: 0.9 },
      { distance: 52, lateralOffset: -1.5, type: 'branch', radius: 1.2 },
      { distance: 75, lateralOffset: 1.6, type: 'duck', radius: 0.8 },
      { distance: 98, lateralOffset: -1.6, type: 'log', radius: 1.3 },
      { distance: 120, lateralOffset: 1.5, type: 'rock', radius: 0.85 },
      // Under Bridge 1: Pillar obstacles on flanks
      { distance: 136, lateralOffset: -1.7, type: 'rock', radius: 0.8 },
      { distance: 144, lateralOffset: 1.7, type: 'rock', radius: 0.8 },
      // Slalom between bridges
      { distance: 170, lateralOffset: -1.5, type: 'branch', radius: 1.2 },
      { distance: 195, lateralOffset: 1.8, type: 'duck', radius: 0.8 },
      { distance: 220, lateralOffset: -1.6, type: 'whirlpool', radius: 2.0 },
      { distance: 245, lateralOffset: 1.5, type: 'frog', radius: 0.7 },
      { distance: 268, lateralOffset: -1.6, type: 'log', radius: 1.3 },
      { distance: 292, lateralOffset: 1.4, type: 'rock', radius: 0.9 },
      // Under Bridge 2: Pillar obstacles on flanks
      { distance: 316, lateralOffset: 1.6, type: 'rock', radius: 0.8 },
      { distance: 324, lateralOffset: -1.6, type: 'rock', radius: 0.8 },
      // Post Bridge 2 gauntlet
      { distance: 350, lateralOffset: 1.5, type: 'branch', radius: 1.2 },
      { distance: 375, lateralOffset: -1.8, type: 'whirlpool', radius: 2.0 },
      { distance: 400, lateralOffset: 1.6, type: 'log', radius: 1.3 },
      { distance: 422, lateralOffset: -1.5, type: 'rock', radius: 0.9 },
      { distance: 445, lateralOffset: 1.3, type: 'frog', radius: 0.7 },
      { distance: 468, lateralOffset: -1.2, type: 'duck', radius: 0.8 }
    ],
    collectibles: [
      { distance: 20, lateralOffset: 0.0, type: 'golden_leaf' },
      { distance: 60, lateralOffset: -1.2, type: 'golden_leaf' },
      { distance: 105, lateralOffset: 1.4, type: 'golden_leaf' },
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
      flowerDensity: 1.4,
      isAutumn: false,
      weather: 'sunny',
      skyColor: new pc.Color(0.66, 0.85, 0.92),
      sunColor: new pc.Color(1.0, 0.90, 0.68),
      sunIntensity: 1.18,
      waterTint: new pc.Color(0.53, 0.82, 0.90),
      bankTint: new pc.Color(0.471, 0.725, 0.420)
    }
  },

  // ==========================================
  // LEVEL 07 — LITTLE FRIENDS (THIRD ISLAND FORK - ANIMAL SANCTUARY!)
  // Length: ~480m
  // Playful animal companions, duck roosting island fork, lively rapids
  // ==========================================
  7: {
    id: 7,
    title: 'Little Friends',
    subtitle: 'Playful ducks & the sanctuary island',
    description: 'Delight in river animals sharing the water, steering past the duck sanctuary island.',
    baseSpeed: 5.0,
    audioTheme: 'morning',
    splinePoints: [
      { position: new pc.Vec3(0, 0, 0), width: 8.5, current: 4.8 },
      { position: new pc.Vec3(8, 0, 65), width: 8.2, current: 5.0 },
      { position: new pc.Vec3(-10, 0, 140), width: 8.6, current: 4.8 },
      { position: new pc.Vec3(-2, 0, 185), width: 14.5, current: 5.0 }, // Widening for island
      { position: new pc.Vec3(1, 0, 225), width: 17.0, current: 5.1 },  // Sanctuary island split
      { position: new pc.Vec3(6, 0, 265), width: 12.0, current: 5.0 },  // Rejoining
      { position: new pc.Vec3(-9, 0, 325), width: 8.4, current: 4.9 },
      { position: new pc.Vec3(7, 0, 400), width: 8.6, current: 4.8 },
      { position: new pc.Vec3(0, 0, 480), width: 9.0, current: 4.3 }
    ],
    islands: [
      {
        startDistance: 190,
        endDistance: 250,
        islandWidth: 6.4,
        islandHeight: 1.9,
        treeType: 'birch',
        hasSignpost: true,
        hasProwRock: true,
        flowerColor: 'white'
      }
    ],
    obstacles: [
      { distance: 28, lateralOffset: 1.2, type: 'duck', radius: 0.8 },
      { distance: 50, lateralOffset: -1.4, type: 'frog', radius: 0.7 },
      { distance: 75, lateralOffset: 1.6, type: 'fish', radius: 0.7 },
      { distance: 100, lateralOffset: -1.5, type: 'lily_pads', radius: 1.3 },
      { distance: 125, lateralOffset: 1.4, type: 'duck', radius: 0.8 },
      { distance: 150, lateralOffset: -1.6, type: 'frog', radius: 0.7 },
      { distance: 172, lateralOffset: 1.7, type: 'whirlpool', radius: 2.1 },

      // Sanctuary Island Split (190m - 250m): Left channel (-5.3m) vs Right channel (+5.3m)
      { distance: 205, lateralOffset: -5.3, type: 'duck', radius: 0.8 },      // Left channel: swimming duck family
      { distance: 215, lateralOffset: 5.3, type: 'fish', radius: 0.7 },       // Right channel: leaping koi
      { distance: 228, lateralOffset: -5.2, type: 'lily_pads', radius: 1.2 }, // Left channel: water lilies
      { distance: 238, lateralOffset: 5.2, type: 'frog', radius: 0.7 },       // Right channel: hopping frog

      // Downstream Animal Slalom
      { distance: 275, lateralOffset: 0.0, type: 'waterfall_zone', radius: 2.8 },
      { distance: 298, lateralOffset: -1.7, type: 'duck', radius: 0.8 },
      { distance: 320, lateralOffset: 1.6, type: 'frog', radius: 0.7 },
      { distance: 345, lateralOffset: -1.8, type: 'whirlpool', radius: 2.2 },
      { distance: 370, lateralOffset: 1.5, type: 'fish', radius: 0.7 },
      { distance: 395, lateralOffset: -1.4, type: 'lily_pads', radius: 1.3 },
      { distance: 418, lateralOffset: 1.6, type: 'duck', radius: 0.8 },
      { distance: 440, lateralOffset: -1.5, type: 'frog', radius: 0.7 },
      { distance: 460, lateralOffset: 1.2, type: 'duck', radius: 0.8 }
    ],
    collectibles: [
      { distance: 22, lateralOffset: -1.0, type: 'lily_flower' },
      { distance: 65, lateralOffset: 1.4, type: 'lily_flower' },
      { distance: 110, lateralOffset: -1.2, type: 'lily_flower' },
      { distance: 160, lateralOffset: 1.5, type: 'lily_flower' },
      // Fork Collectibles
      { distance: 202, lateralOffset: -5.2, type: 'lily_flower' },
      { distance: 212, lateralOffset: 5.3, type: 'lily_flower' },
      { distance: 232, lateralOffset: -5.3, type: 'lily_flower' },
      { distance: 242, lateralOffset: 5.2, type: 'lily_flower' },
      // Downstream
      { distance: 285, lateralOffset: 0.0, type: 'lily_flower' },
      { distance: 335, lateralOffset: -1.5, type: 'lily_flower' },
      { distance: 385, lateralOffset: 1.6, type: 'lily_flower' },
      { distance: 430, lateralOffset: -1.2, type: 'lily_flower' },
      { distance: 465, lateralOffset: 1.0, type: 'lily_flower' }
    ],
    environment: {
      seed: 707,
      treeDensity: 1.1,
      rockDensity: 0.8,
      lilyPadDensity: 1.4,
      flowerDensity: 1.6,
      isAutumn: false,
      weather: 'sunny',
      skyColor: new pc.Color(0.66, 0.86, 0.93),
      sunColor: new pc.Color(1.0, 0.91, 0.66),
      sunIntensity: 1.2,
      waterTint: new pc.Color(0.55, 0.83, 0.91),
      bankTint: new pc.Color(0.51, 0.77, 0.45)
    }
  },

  // ==========================================
  // LEVEL 08 — FIREFLY VALLEY (HARD / 4 WHIRLPOOLS)
  // Length: ~490m
  // Deep twilight, 4 whirlpools, dark water slaloms, boulders
  // ==========================================
  8: {
    id: 8,
    title: 'Firefly Valley',
    subtitle: 'Twilight glow & vortex eddies',
    description: 'Drift under purple twilight skies illuminated by fireflies, navigating tight whirlpool slaloms.',
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
      { distance: 30, lateralOffset: 1.5, type: 'rock', radius: 0.9 },
      { distance: 55, lateralOffset: -1.6, type: 'branch', radius: 1.2 },
      { distance: 80, lateralOffset: 1.8, type: 'whirlpool', radius: 2.1 },
      { distance: 105, lateralOffset: -1.7, type: 'rock', radius: 0.95 },
      { distance: 130, lateralOffset: 1.5, type: 'log', radius: 1.3 },
      { distance: 152, lateralOffset: -1.8, type: 'whirlpool', radius: 2.2 },
      { distance: 178, lateralOffset: 1.6, type: 'fish', radius: 0.7 },
      { distance: 202, lateralOffset: -1.5, type: 'rock', radius: 0.9 },
      { distance: 228, lateralOffset: 1.7, type: 'whirlpool', radius: 2.1 },
      { distance: 252, lateralOffset: -1.6, type: 'branch', radius: 1.2 },
      { distance: 275, lateralOffset: 1.5, type: 'log', radius: 1.3 },
      { distance: 300, lateralOffset: -1.8, type: 'whirlpool', radius: 2.2 },
      { distance: 325, lateralOffset: 1.6, type: 'rock', radius: 1.0 },
      { distance: 350, lateralOffset: -1.5, type: 'fish', radius: 0.7 },
      { distance: 375, lateralOffset: 1.7, type: 'branch', radius: 1.2 },
      { distance: 400, lateralOffset: -1.6, type: 'rock', radius: 0.95 },
      { distance: 422, lateralOffset: 1.8, type: 'whirlpool', radius: 2.2 },
      { distance: 445, lateralOffset: -1.4, type: 'log', radius: 1.3 },
      { distance: 468, lateralOffset: 1.3, type: 'duck', radius: 0.8 }
    ],
    collectibles: [
      { distance: 20, lateralOffset: 0.0, type: 'starlight' },
      { distance: 65, lateralOffset: -1.4, type: 'starlight' },
      { distance: 115, lateralOffset: 1.5, type: 'starlight' },
      { distance: 165, lateralOffset: 0.0, type: 'starlight' },
      { distance: 212, lateralOffset: -1.6, type: 'starlight' },
      { distance: 262, lateralOffset: 1.6, type: 'starlight' },
      { distance: 310, lateralOffset: 0.0, type: 'starlight' },
      { distance: 360, lateralOffset: -1.5, type: 'starlight' },
      { distance: 410, lateralOffset: 1.4, type: 'starlight' },
      { distance: 455, lateralOffset: 0.0, type: 'starlight' },
      { distance: 472, lateralOffset: -1.2, type: 'starlight' }
    ],
    environment: {
      seed: 808,
      treeDensity: 1.4,
      rockDensity: 0.8,
      lilyPadDensity: 0.9,
      flowerDensity: 1.2,
      isAutumn: false,
      weather: 'fireflies',
      skyColor: new pc.Color(0.32, 0.28, 0.48),
      sunColor: new pc.Color(0.72, 0.76, 1.0),
      sunIntensity: 0.82,
      waterTint: new pc.Color(0.42, 0.68, 0.82),
      bankTint: new pc.Color(0.24, 0.42, 0.32)
    }
  },

  // ==========================================
  // LEVEL 09 — WHISPERING FALLS (VERY HARD / RAPIDS & ISLAND FORK!)
  // Length: ~510m
  // Fast rapids (6.2 m/s), rapids splitter island, 4 whirlpools
  // ==========================================
  9: {
    id: 9,
    title: 'Whispering Falls',
    subtitle: 'Raging torrents & the rapids splitter',
    description: 'Ride blazing white-water currents and make a split-second choice at the craggy rapids island.',
    baseSpeed: 5.6,
    audioTheme: 'rapids',
    splinePoints: [
      { position: new pc.Vec3(0, 0, 0), width: 9.0, current: 5.5 },
      { position: new pc.Vec3(12, 0, 76), width: 8.5, current: 5.8 },
      { position: new pc.Vec3(-13, 0, 150), width: 8.2, current: 6.2 },
      { position: new pc.Vec3(-1, 0, 200), width: 15.0, current: 6.0 }, // Widening for rapids island
      { position: new pc.Vec3(2, 0, 240), width: 18.0, current: 6.0 },  // Island peak split
      { position: new pc.Vec3(7, 0, 280), width: 12.5, current: 5.8 },  // Rejoining
      { position: new pc.Vec3(-11, 0, 360), width: 8.2, current: 5.8 },
      { position: new pc.Vec3(8, 0, 440), width: 8.6, current: 5.5 },
      { position: new pc.Vec3(0, 0, 510), width: 9.0, current: 4.8 }
    ],
    islands: [
      {
        startDistance: 205,
        endDistance: 270,
        islandWidth: 7.0,
        islandHeight: 2.2,
        treeType: 'pine',
        hasSignpost: true,
        hasProwRock: true,
        flowerColor: 'white'
      }
    ],
    obstacles: [
      { distance: 30, lateralOffset: -1.7, type: 'rock', radius: 1.0 },
      { distance: 55, lateralOffset: 1.8, type: 'whirlpool', radius: 2.2 },
      { distance: 80, lateralOffset: -1.8, type: 'branch', radius: 1.3 },
      { distance: 105, lateralOffset: 1.7, type: 'log', radius: 1.3 },
      { distance: 130, lateralOffset: -1.9, type: 'whirlpool', radius: 2.2 },
      { distance: 155, lateralOffset: 1.6, type: 'rock', radius: 1.0 },
      { distance: 178, lateralOffset: 0.0, type: 'waterfall_zone', radius: 3.0 },

      // Rapids Splitter Island (205m - 270m): Left channel (-5.8m) vs Right channel (+5.8m)
      { distance: 218, lateralOffset: -5.8, type: 'waterfall_zone', radius: 3.0 }, // Left channel: roaring booster rapids!
      { distance: 225, lateralOffset: 5.8, type: 'whirlpool', radius: 2.2 },       // Right channel: whirlpool eddy hazard!
      { distance: 245, lateralOffset: -5.6, type: 'rock', radius: 0.95 },          // Left channel: rock slalom
      { distance: 255, lateralOffset: 5.6, type: 'branch', radius: 1.2 },         // Right channel: floating branch

      // Downstream Torrent Gauntlet
      { distance: 290, lateralOffset: 0.0, type: 'waterfall_zone', radius: 3.0 },
      { distance: 315, lateralOffset: -1.9, type: 'whirlpool', radius: 2.2 },
      { distance: 340, lateralOffset: 1.9, type: 'rock', radius: 1.0 },
      { distance: 365, lateralOffset: -1.8, type: 'branch', radius: 1.3 },
      { distance: 390, lateralOffset: 1.8, type: 'log', radius: 1.3 },
      { distance: 415, lateralOffset: -1.9, type: 'whirlpool', radius: 2.2 },
      { distance: 440, lateralOffset: 1.7, type: 'rock', radius: 1.0 },
      { distance: 465, lateralOffset: 0.0, type: 'waterfall_zone', radius: 2.8 },
      { distance: 488, lateralOffset: -1.4, type: 'duck', radius: 0.8 }
    ],
    collectibles: [
      { distance: 22, lateralOffset: 1.2, type: 'starlight' },
      { distance: 70, lateralOffset: -1.5, type: 'starlight' },
      { distance: 120, lateralOffset: 1.6, type: 'starlight' },
      { distance: 170, lateralOffset: 0.0, type: 'starlight' },
      // Fork Collectibles
      { distance: 215, lateralOffset: -5.8, type: 'starlight' },
      { distance: 232, lateralOffset: 5.8, type: 'starlight' },
      { distance: 250, lateralOffset: -5.8, type: 'starlight' },
      { distance: 262, lateralOffset: 5.8, type: 'starlight' },
      // Downstream
      { distance: 300, lateralOffset: 0.0, type: 'starlight' },
      { distance: 352, lateralOffset: -1.6, type: 'starlight' },
      { distance: 402, lateralOffset: 1.5, type: 'starlight' },
      { distance: 452, lateralOffset: 0.0, type: 'starlight' },
      { distance: 492, lateralOffset: 1.2, type: 'starlight' }
    ],
    environment: {
      seed: 909,
      treeDensity: 1.2,
      rockDensity: 1.6,
      lilyPadDensity: 0.4,
      flowerDensity: 1.1,
      isAutumn: false,
      weather: 'sunny',
      skyColor: new pc.Color(0.65, 0.85, 0.92),
      sunColor: new pc.Color(1.0, 0.94, 0.72),
      sunIntensity: 1.22,
      waterTint: new pc.Color(0.52, 0.82, 0.91),
      bankTint: new pc.Color(0.42, 0.68, 0.38)
    }
  },

  // ==========================================
  // LEVEL 10 — THE ENDLESS JOURNEY (MASTER FINALE / GRAND ARCHIPELAGO)
  // Length: ~660m
  // The ultimate voyage: 4 whirlpools, 2 bridges, grand island fork, sunset vistas
  // ==========================================
  10: {
    id: 10,
    title: 'The Endless Journey',
    subtitle: 'The sunset archipelago & grand voyage',
    description: 'A master odyssey uniting bridges, fireflies, rushing whirlpools, and the grand sunset island.',
    baseSpeed: 5.2,
    audioTheme: 'twilight',
    bridgeDistances: [160, 430],
    splinePoints: [
      { position: new pc.Vec3(0, 0, 0), width: 8.5, current: 5.0 },
      { position: new pc.Vec3(10, 0, 80), width: 8.2, current: 5.2 },
      { position: new pc.Vec3(-12, 0, 160), width: 6.8, current: 5.4 }, // Under Bridge 1
      { position: new pc.Vec3(-2, 0, 215), width: 15.0, current: 5.2 },  // Widening for Grand Island
      { position: new pc.Vec3(1, 0, 255), width: 18.5, current: 5.2 },   // Grand Island peak split
      { position: new pc.Vec3(8, 0, 300), width: 12.5, current: 5.1 },   // Rejoining
      { position: new pc.Vec3(11, 0, 365), width: 8.0, current: 5.2 },
      { position: new pc.Vec3(-13, 0, 430), width: 7.0, current: 5.3 }, // Under Bridge 2
      { position: new pc.Vec3(10, 0, 510), width: 8.2, current: 5.0 },
      { position: new pc.Vec3(-8, 0, 590), width: 8.8, current: 4.8 },
      { position: new pc.Vec3(0, 0, 660), width: 9.5, current: 4.2 }
    ],
    islands: [
      {
        startDistance: 220,
        endDistance: 288,
        islandWidth: 7.2,
        islandHeight: 2.2,
        treeType: 'autumn',
        hasSignpost: true,
        hasProwRock: true,
        flowerColor: 'pink'
      }
    ],
    obstacles: [
      // Section 1: Approach to Bridge 1
      { distance: 32, lateralOffset: 1.5, type: 'duck', radius: 0.8 },
      { distance: 60, lateralOffset: -1.7, type: 'rock', radius: 0.95 },
      { distance: 88, lateralOffset: 1.8, type: 'whirlpool', radius: 2.2 },
      { distance: 115, lateralOffset: -1.6, type: 'log', radius: 1.3 },
      { distance: 140, lateralOffset: 1.5, type: 'branch', radius: 1.2 },
      // Under Bridge 1: Pillars
      { distance: 156, lateralOffset: -1.8, type: 'rock', radius: 0.85 },
      { distance: 164, lateralOffset: 1.8, type: 'rock', radius: 0.85 },
      { distance: 190, lateralOffset: -1.6, type: 'frog', radius: 0.7 },

      // Section 2: Grand Sunset Island Split (220m - 288m): Left (-6.0m) vs Right (+6.0m)
      { distance: 232, lateralOffset: -6.0, type: 'waterfall_zone', radius: 3.0 }, // Left channel: sunset rapids!
      { distance: 240, lateralOffset: 6.0, type: 'whirlpool', radius: 2.2 },       // Right channel: golden whirlpool!
      { distance: 260, lateralOffset: -5.8, type: 'rock', radius: 0.95 },          // Left channel: mossy boulder
      { distance: 270, lateralOffset: 5.8, type: 'log', radius: 1.3 },             // Right channel: driftwood trunk

      // Section 3: Between Island and Bridge 2
      { distance: 310, lateralOffset: 0.0, type: 'waterfall_zone', radius: 2.8 },
      { distance: 335, lateralOffset: -1.8, type: 'whirlpool', radius: 2.2 },
      { distance: 360, lateralOffset: 1.7, type: 'rock', radius: 1.0 },
      { distance: 385, lateralOffset: -1.7, type: 'branch', radius: 1.3 },
      { distance: 408, lateralOffset: 1.6, type: 'log', radius: 1.3 },
      // Under Bridge 2: Pillars
      { distance: 426, lateralOffset: -1.8, type: 'rock', radius: 0.85 },
      { distance: 434, lateralOffset: 1.8, type: 'rock', radius: 0.85 },

      // Section 4: Final Ocean Approach Gauntlet
      { distance: 460, lateralOffset: -1.6, type: 'fish', radius: 0.7 },
      { distance: 485, lateralOffset: 1.8, type: 'whirlpool', radius: 2.2 },
      { distance: 512, lateralOffset: -1.8, type: 'rock', radius: 1.0 },
      { distance: 538, lateralOffset: 1.7, type: 'log', radius: 1.3 },
      { distance: 565, lateralOffset: -1.9, type: 'whirlpool', radius: 2.2 },
      { distance: 590, lateralOffset: 1.6, type: 'duck', radius: 0.8 },
      { distance: 615, lateralOffset: 0.0, type: 'waterfall_zone', radius: 2.8 },
      { distance: 638, lateralOffset: -1.4, type: 'frog', radius: 0.7 }
    ],
    collectibles: [
      { distance: 25, lateralOffset: 0.0, type: 'golden_leaf' },
      { distance: 75, lateralOffset: -1.4, type: 'lily_flower' },
      { distance: 125, lateralOffset: 1.6, type: 'starlight' },
      { distance: 160, lateralOffset: 0.0, type: 'golden_leaf' }, // Center under Bridge 1
      // Grand Island Collectibles
      { distance: 228, lateralOffset: -6.0, type: 'golden_leaf' },
      { distance: 242, lateralOffset: 6.0, type: 'starlight' },
      { distance: 265, lateralOffset: -5.8, type: 'lily_flower' },
      { distance: 278, lateralOffset: 5.8, type: 'golden_leaf' },
      // Post Island & Bridge 2
      { distance: 320, lateralOffset: 0.0, type: 'starlight' },
      { distance: 375, lateralOffset: -1.6, type: 'lily_flower' },
      { distance: 430, lateralOffset: 0.0, type: 'golden_leaf' }, // Center under Bridge 2
      { distance: 495, lateralOffset: 1.6, type: 'starlight' },
      { distance: 550, lateralOffset: -1.5, type: 'lily_flower' },
      { distance: 605, lateralOffset: 1.4, type: 'golden_leaf' },
      { distance: 645, lateralOffset: 0.0, type: 'starlight' }
    ],
    environment: {
      seed: 1010,
      treeDensity: 1.3,
      rockDensity: 1.0,
      lilyPadDensity: 1.2,
      flowerDensity: 1.5,
      isAutumn: true,
      weather: 'fireflies',
      skyColor: new pc.Color(0.88, 0.66, 0.58),
      sunColor: new pc.Color(1.0, 0.82, 0.62),
      sunIntensity: 1.25,
      waterTint: new pc.Color(0.52, 0.78, 0.88),
      bankTint: new pc.Color(0.588, 0.658, 0.384)
    }
  }
};

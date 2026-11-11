export interface LevelRecord {
  unlocked: boolean;
  completed: boolean;
  stars: number;
  bestCollectibles: number;
}

export interface PlayerData {
  levels: { [levelId: number]: LevelRecord };
  musicVolume: number;
  ambientVolume: number;
  sfxVolume: number;
  tutorialSeen: boolean;
}

export class ProgressionManager {
  private static STORAGE_KEY = 'little_paper_boat_save_v1';
  private static data: PlayerData;

  public static init(): void {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (raw) {
      try {
        this.data = JSON.parse(raw);
      } catch (e) {
        this.resetDefaults();
      }
    } else {
      this.resetDefaults();
    }

    // Ensure Level 1 is always unlocked
    if (!this.data.levels[1]) {
      this.data.levels[1] = { unlocked: true, completed: false, stars: 0, bestCollectibles: 0 };
    }
    this.data.levels[1].unlocked = true;
  }

  private static resetDefaults(): void {
    this.data = {
      levels: {
        1: { unlocked: true, completed: false, stars: 0, bestCollectibles: 0 }
      },
      musicVolume: 0.6,
      ambientVolume: 0.7,
      sfxVolume: 0.8,
      tutorialSeen: false
    };
    this.save();
  }

  public static hasSeenTutorial(): boolean {
    return !!this.data.tutorialSeen;
  }

  public static markTutorialSeen(): void {
    this.data.tutorialSeen = true;
    this.save();
  }

  public static resetTutorial(): void {
    this.data.tutorialSeen = false;
    this.save();
  }

  public static isLevelUnlocked(levelId: number): boolean {
    if (levelId === 1) return true;
    return !!this.data.levels[levelId]?.unlocked;
  }

  public static getLevelRecord(levelId: number): LevelRecord {
    return this.data.levels[levelId] || {
      unlocked: levelId === 1,
      completed: false,
      stars: 0,
      bestCollectibles: 0
    };
  }

  public static completeLevel(levelId: number, collectiblesFound: number, totalCollectibles: number): { stars: number; isNewUnlock: boolean } {
    const ratio = totalCollectibles > 0 ? (collectiblesFound / totalCollectibles) : 1;
    let stars = 1;
    if (ratio >= 0.85) {
      stars = 3;
    } else if (ratio >= 0.5) {
      stars = 2;
    }

    const currentRec = this.getLevelRecord(levelId);
    const updatedRec: LevelRecord = {
      unlocked: true,
      completed: true,
      stars: Math.max(currentRec.stars, stars),
      bestCollectibles: Math.max(currentRec.bestCollectibles, collectiblesFound)
    };
    this.data.levels[levelId] = updatedRec;

    // Unlock next level (up to 10)
    let isNewUnlock = false;
    const nextLevelId = levelId + 1;
    if (nextLevelId <= 10) {
      if (!this.data.levels[nextLevelId] || !this.data.levels[nextLevelId].unlocked) {
        this.data.levels[nextLevelId] = {
          unlocked: true,
          completed: false,
          stars: 0,
          bestCollectibles: 0
        };
        isNewUnlock = true;
      }
    }

    this.save();
    return { stars, isNewUnlock };
  }

  public static getVolumes(): { music: number; ambient: number; sfx: number } {
    return {
      music: this.data.musicVolume,
      ambient: this.data.ambientVolume,
      sfx: this.data.sfxVolume
    };
  }

  public static setVolumes(music: number, ambient: number, sfx: number): void {
    this.data.musicVolume = music;
    this.data.ambientVolume = ambient;
    this.data.sfxVolume = sfx;
    this.save();
  }

  private static save(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }
}

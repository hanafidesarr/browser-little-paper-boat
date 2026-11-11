import { ProgressionManager } from '../progression/ProgressionManager';
import { AudioManager } from '../audio/AudioManager';
import { LEVEL_DATA } from '../levels/LevelData';

export type GameState = 'MAIN_MENU' | 'LEVEL_SELECT' | 'PLAYING' | 'PAUSED' | 'RESULT';

export class UIManager {
  private container: HTMLElement;
  private audio: AudioManager;

  // UI Screen containers
  private mainMenuEl!: HTMLElement;
  private levelSelectEl!: HTMLElement;
  private hudEl!: HTMLElement;
  private pauseModalEl!: HTMLElement;
  private resultModalEl!: HTMLElement;
  private settingsModalEl!: HTMLElement;
  private howToPlayModalEl!: HTMLElement;
  private creditsModalEl!: HTMLElement;

  // HUD elements
  private hudLevelTitle!: HTMLElement;
  private hudLevelSubtitle!: HTMLElement;
  private hudCollectibleBadge!: HTMLElement;
  private hudProgressBar!: HTMLElement;
  private hudIntegrityEl!: HTMLElement;
  private hudCheckpointBannerEl!: HTMLElement;
  private bannerTimeout: any = null;

  // Result elements
  private resultStarsEl!: HTMLElement;
  private resultScoreEl!: HTMLElement;

  // Callbacks
  public onPlayClicked: ((levelId: number) => void) | null = null;
  public onRestartLevel: (() => void) | null = null;
  public onResumeGame: (() => void) | null = null;
  public onExitToLevelSelect: (() => void) | null = null;
  public onNextLevel: (() => void) | null = null;

  constructor(audio: AudioManager) {
    this.audio = audio;
    this.container = document.getElementById('ui-container') as HTMLElement;
    this.buildScreens();
  }

  private buildScreens(): void {
    this.container.innerHTML = `
      <!-- MAIN MENU -->
      <div id="screen-main-menu" class="ui-screen">
        <div class="paper-card">
          <h1 class="game-title">⛵ Little Paper Boat</h1>
          <p class="game-tagline">"A little boat. A wonderful journey."</p>
          <div class="btn-stack">
            <button id="btn-play" class="cozy-btn">Start Journey</button>
            <button id="btn-levels" class="cozy-btn secondary">Level Selection</button>
            <button id="btn-how" class="cozy-btn secondary">How to Play</button>
            <button id="btn-settings" class="cozy-btn secondary">Settings</button>
            <button id="btn-credits" class="cozy-btn secondary">Credits</button>
          </div>
        </div>
      </div>

      <!-- LEVEL SELECT -->
      <div id="screen-level-select" class="ui-screen hidden">
        <div class="paper-card" style="max-width: 680px; width: 92%;">
          <h2 style="font-size: 1.8rem; color: #2b583f; margin-bottom: 4px;">River Journeys</h2>
          <p style="color: #6c8c72; margin-bottom: 12px;">Choose a peaceful river to navigate</p>
          <div id="level-grid-container" class="level-grid"></div>
          <button id="btn-back-menu" class="cozy-btn secondary" style="margin-top: 10px;">Back to Menu</button>
        </div>
      </div>

      <!-- IN-GAME HUD -->
      <div id="hud-overlay" class="hidden">
        <div class="hud-top">
          <div class="hud-level-info">
            <div id="hud-title" class="hud-level-title">Level 01 — Morning Creek</div>
            <div id="hud-subtitle" class="hud-level-subtitle">A gentle dawn awakening</div>
          </div>
          <div class="hud-badges">
            <div id="hud-integrity" class="hud-integrity">⛵ ⛵ ⛵</div>
            <div id="hud-collectible" class="hud-badge">🌸 0 / 10</div>
            <button id="btn-pause" class="hud-pause-btn" title="Pause">⏸</button>
          </div>
        </div>
        <div id="hud-checkpoint-banner" class="hud-checkpoint-banner">🏮 Lantern Checkpoint Reached</div>
        <div class="hud-bottom">
          <div class="progress-container">
            <div id="hud-progress-bar" class="progress-bar"></div>
          </div>
          <div class="touch-hint">Drag screen or use A / D / Arrow Keys to steer</div>
        </div>
      </div>

      <!-- PAUSE MODAL -->
      <div id="modal-pause" class="modal-overlay hidden">
        <div class="paper-card" style="width: 320px;">
          <h2 style="margin-bottom: 18px; color: #2b583f;">Drifting at Rest</h2>
          <div class="btn-stack" style="width: 100%;">
            <button id="btn-resume" class="cozy-btn">Resume Drift</button>
            <button id="btn-restart" class="cozy-btn secondary">Restart Level</button>
            <button id="btn-pause-levels" class="cozy-btn secondary">Level Select</button>
            <button id="btn-pause-settings" class="cozy-btn secondary">Settings</button>
          </div>
        </div>
      </div>

      <!-- RESULT MODAL -->
      <div id="modal-result" class="modal-overlay hidden">
        <div class="paper-card" style="width: 360px;">
          <h2 style="font-size: 1.7rem; color: #2b583f; margin-bottom: 2px;">Journey Completed!</h2>
          <p style="color: #6c8c72; font-size: 0.95rem;">You arrived safely at the harbor</p>
          <div id="result-stars" class="result-stars">⭐⭐⭐</div>
          <p id="result-score" style="font-weight: 700; color: #d97706; margin-bottom: 20px; font-size: 1.15rem;">Treasures: 10 / 10</p>
          <div class="btn-stack" style="width: 100%;">
            <button id="btn-next-level" class="cozy-btn">Next Journey ➔</button>
            <button id="btn-replay" class="cozy-btn secondary">Sail Again</button>
            <button id="btn-result-levels" class="cozy-btn secondary">Level Select</button>
          </div>
        </div>
      </div>

      <!-- SETTINGS MODAL -->
      <div id="modal-settings" class="modal-overlay hidden">
        <div class="paper-card" style="width: 360px;">
          <h2 style="color: #2b583f; margin-bottom: 16px;">Audio Settings</h2>
          <div class="slider-group">
            <span>Music:</span>
            <input type="range" id="slider-music" min="0" max="1" step="0.05" value="0.6">
          </div>
          <div class="slider-group">
            <span>River Ambient:</span>
            <input type="range" id="slider-ambient" min="0" max="1" step="0.05" value="0.7">
          </div>
          <div class="slider-group">
            <span>Sound Effects:</span>
            <input type="range" id="slider-sfx" min="0" max="1" step="0.05" value="0.8">
          </div>
          <button id="btn-close-settings" class="cozy-btn" style="margin-top: 18px;">Apply & Close</button>
        </div>
      </div>

      <!-- HOW TO PLAY MODAL -->
      <div id="modal-how" class="modal-overlay hidden">
        <div class="paper-card" style="max-width: 440px; text-align: left;">
          <h2 style="color: #2b583f; margin-bottom: 12px; text-align: center;">How to Sail</h2>
          <p style="margin-bottom: 10px; line-height: 1.5;">⛵ <strong>Gentle Navigation:</strong> Your paper boat drifts forward automatically with the river flow.</p>
          <p style="margin-bottom: 10px; line-height: 1.5;">⌨️ <strong>Desktop Controls:</strong> Press <code>A</code> / <code>D</code> or <code>Left</code> / <code>Right</code> arrow keys, or click & drag with your mouse to steer across the river.</p>
          <p style="margin-bottom: 10px; line-height: 1.5;">📱 <strong>Mobile Controls:</strong> Touch and drag anywhere on the screen horizontally.</p>
          <p style="margin-bottom: 10px; line-height: 1.5;">🌸 <strong>Collectibles:</strong> Gather floating golden leaves, blossoms, and star motes to earn 3-star ratings!</p>
          <p style="margin-bottom: 16px; line-height: 1.5;">🍃 <strong>Peaceful Spirit:</strong> Rocks and logs produce soft bumps, not game overs. Enjoy the scenery!</p>
          <div style="text-align: center;">
            <button id="btn-close-how" class="cozy-btn">Understood</button>
          </div>
        </div>
      </div>

      <!-- CREDITS MODAL -->
      <div id="modal-credits" class="modal-overlay hidden">
        <div class="paper-card" style="max-width: 400px;">
          <h2 style="color: #2b583f; margin-bottom: 10px;">Little Paper Boat</h2>
          <p style="font-family: 'Yomogi', cursive; font-size: 1.15rem; color: #5f7470; margin-bottom: 14px;">"A little boat. A wonderful journey."</p>
          <p style="font-size: 0.95rem; line-height: 1.6; color: #42584e; margin-bottom: 20px;">
            Engine: PlayCanvas 3D<br>
            Audio: Procedural Ambient Soundscapes<br>
            A cozy tribute to classic animated stories and peaceful exploration.
          </p>
          <button id="btn-close-credits" class="cozy-btn">Close</button>
        </div>
      </div>
    `;

    // Grab elements
    this.mainMenuEl = document.getElementById('screen-main-menu')!;
    this.levelSelectEl = document.getElementById('screen-level-select')!;
    this.hudEl = document.getElementById('hud-overlay')!;
    this.pauseModalEl = document.getElementById('modal-pause')!;
    this.resultModalEl = document.getElementById('modal-result')!;
    this.settingsModalEl = document.getElementById('modal-settings')!;
    this.howToPlayModalEl = document.getElementById('modal-how')!;
    this.creditsModalEl = document.getElementById('modal-credits')!;

    this.hudLevelTitle = document.getElementById('hud-title')!;
    this.hudLevelSubtitle = document.getElementById('hud-subtitle')!;
    this.hudCollectibleBadge = document.getElementById('hud-collectible')!;
    this.hudProgressBar = document.getElementById('hud-progress-bar')!;
    this.hudIntegrityEl = document.getElementById('hud-integrity')!;
    this.hudCheckpointBannerEl = document.getElementById('hud-checkpoint-banner')!;

    this.resultStarsEl = document.getElementById('result-stars')!;
    this.resultScoreEl = document.getElementById('result-score')!;

    this.bindEvents();
  }

  private bindEvents(): void {
    // Main menu buttons
    document.getElementById('btn-play')?.addEventListener('click', () => {
      this.audio.init();
      this.audio.resume();
      if (this.onPlayClicked) {
        // Find highest unlocked uncompleted level, or level 1
        let targetLevel = 1;
        for (let i = 1; i <= 10; i++) {
          if (ProgressionManager.isLevelUnlocked(i)) {
            targetLevel = i;
            if (!ProgressionManager.getLevelRecord(i).completed) break;
          }
        }
        this.onPlayClicked(targetLevel);
      }
    });

    document.getElementById('btn-levels')?.addEventListener('click', () => {
      this.audio.init();
      this.showLevelSelect();
    });

    document.getElementById('btn-back-menu')?.addEventListener('click', () => {
      this.showMainMenu();
    });

    document.getElementById('btn-how')?.addEventListener('click', () => {
      this.howToPlayModalEl.classList.remove('hidden');
    });
    document.getElementById('btn-close-how')?.addEventListener('click', () => {
      this.howToPlayModalEl.classList.add('hidden');
    });

    document.getElementById('btn-credits')?.addEventListener('click', () => {
      this.creditsModalEl.classList.remove('hidden');
    });
    document.getElementById('btn-close-credits')?.addEventListener('click', () => {
      this.creditsModalEl.classList.add('hidden');
    });

    // Settings
    const openSettings = () => {
      const vols = ProgressionManager.getVolumes();
      (document.getElementById('slider-music') as HTMLInputElement).value = vols.music.toString();
      (document.getElementById('slider-ambient') as HTMLInputElement).value = vols.ambient.toString();
      (document.getElementById('slider-sfx') as HTMLInputElement).value = vols.sfx.toString();
      this.settingsModalEl.classList.remove('hidden');
    };

    document.getElementById('btn-settings')?.addEventListener('click', openSettings);
    document.getElementById('btn-pause-settings')?.addEventListener('click', openSettings);

    document.getElementById('btn-close-settings')?.addEventListener('click', () => {
      const music = parseFloat((document.getElementById('slider-music') as HTMLInputElement).value);
      const ambient = parseFloat((document.getElementById('slider-ambient') as HTMLInputElement).value);
      const sfx = parseFloat((document.getElementById('slider-sfx') as HTMLInputElement).value);
      this.audio.setVolumes(music, ambient, sfx);
      this.settingsModalEl.classList.add('hidden');
    });

    // Pause Modal
    document.getElementById('btn-pause')?.addEventListener('click', () => {
      this.showPauseModal();
    });

    document.getElementById('btn-resume')?.addEventListener('click', () => {
      this.pauseModalEl.classList.add('hidden');
      if (this.onResumeGame) this.onResumeGame();
    });

    document.getElementById('btn-restart')?.addEventListener('click', () => {
      this.pauseModalEl.classList.add('hidden');
      if (this.onRestartLevel) this.onRestartLevel();
    });

    document.getElementById('btn-pause-levels')?.addEventListener('click', () => {
      this.pauseModalEl.classList.add('hidden');
      if (this.onExitToLevelSelect) this.onExitToLevelSelect();
    });

    // Result Modal
    document.getElementById('btn-replay')?.addEventListener('click', () => {
      this.resultModalEl.classList.add('hidden');
      if (this.onRestartLevel) this.onRestartLevel();
    });

    document.getElementById('btn-next-level')?.addEventListener('click', () => {
      this.resultModalEl.classList.add('hidden');
      if (this.onNextLevel) this.onNextLevel();
    });

    document.getElementById('btn-result-levels')?.addEventListener('click', () => {
      this.resultModalEl.classList.add('hidden');
      if (this.onExitToLevelSelect) this.onExitToLevelSelect();
    });
  }

  public showMainMenu(): void {
    this.mainMenuEl.classList.remove('hidden');
    this.levelSelectEl.classList.add('hidden');
    this.hudEl.classList.add('hidden');
    this.pauseModalEl.classList.add('hidden');
    this.resultModalEl.classList.add('hidden');
  }

  public showLevelSelect(): void {
    this.mainMenuEl.classList.add('hidden');
    this.levelSelectEl.classList.remove('hidden');
    this.hudEl.classList.add('hidden');
    this.pauseModalEl.classList.add('hidden');
    this.resultModalEl.classList.add('hidden');

    // Populate level cards
    const grid = document.getElementById('level-grid-container')!;
    grid.innerHTML = '';

    for (let id = 1; id <= 10; id++) {
      const cfg = LEVEL_DATA[id];
      const record = ProgressionManager.getLevelRecord(id);
      const isUnlocked = ProgressionManager.isLevelUnlocked(id);

      const card = document.createElement('div');
      card.className = `level-card ${isUnlocked ? '' : 'locked'}`;

      let starDisplay = '';
      for (let s = 1; s <= 3; s++) {
        starDisplay += s <= record.stars ? '⭐' : '✩';
      }

      card.innerHTML = `
        <div class="level-card-number">${isUnlocked ? `0${id}`.slice(-2) : '🔒'}</div>
        <div class="level-card-name">${cfg.title}</div>
        <div class="level-card-stars">${isUnlocked ? starDisplay : 'Locked'}</div>
      `;

      if (isUnlocked) {
        card.addEventListener('click', () => {
          this.audio.init();
          this.audio.resume();
          if (this.onPlayClicked) {
            this.onPlayClicked(id);
          }
        });
      }

      grid.appendChild(card);
    }
  }

  public showHUD(title: string, subtitle: string, totalCollectibles: number): void {
    this.mainMenuEl.classList.add('hidden');
    this.levelSelectEl.classList.add('hidden');
    this.hudEl.classList.remove('hidden');
    this.pauseModalEl.classList.add('hidden');
    this.resultModalEl.classList.add('hidden');

    this.hudLevelTitle.textContent = title;
    this.hudLevelSubtitle.textContent = subtitle;
    this.updateCollectibles(0, totalCollectibles);
    this.updateIntegrity(3, 3);
    this.updateProgress(0);
  }

  public updateIntegrity(current: number, max: number): void {
    let str = '';
    for (let i = 1; i <= max; i++) {
      str += i <= current ? '⛵ ' : '🤍 ';
    }
    this.hudIntegrityEl.textContent = str.trim();
  }

  public showCheckpointBanner(text: string = '🏮 Lantern Checkpoint Reached'): void {
    this.hudCheckpointBannerEl.textContent = text;
    this.hudCheckpointBannerEl.classList.add('show');

    if (this.bannerTimeout) clearTimeout(this.bannerTimeout);
    this.bannerTimeout = setTimeout(() => {
      this.hudCheckpointBannerEl.classList.remove('show');
    }, 2400);
  }

  public updateCollectibles(collected: number, total: number): void {
    this.hudCollectibleBadge.textContent = `🌸 ${collected} / ${total}`;
  }

  public updateProgress(progressRatio: number): void {
    const pct = Math.max(0, Math.min(100, Math.floor(progressRatio * 100)));
    this.hudProgressBar.style.width = `${pct}%`;
  }

  public showPauseModal(): void {
    this.pauseModalEl.classList.remove('hidden');
  }

  public showResultModal(stars: number, collected: number, total: number, hasNextLevel: boolean): void {
    this.pauseModalEl.classList.add('hidden');
    this.resultModalEl.classList.remove('hidden');

    let starsStr = '';
    for (let i = 1; i <= 3; i++) {
      starsStr += i <= stars ? '⭐' : '✩';
    }
    this.resultStarsEl.textContent = starsStr;
    this.resultScoreEl.textContent = `Treasures: ${collected} / ${total}`;

    const nextBtn = document.getElementById('btn-next-level') as HTMLElement;
    if (!hasNextLevel) {
      nextBtn.style.display = 'none';
    } else {
      nextBtn.style.display = 'inline-flex';
    }
  }
}

import { ProgressionManager } from '../progression/ProgressionManager';
import { AudioManager } from '../audio/AudioManager';
import { LEVEL_DATA } from '../levels/LevelData';

export type GameState =
  | 'MAIN_MENU'
  | 'LEVEL_SELECTION'
  | 'TUTORIAL'
  | 'PLAYING'
  | 'PAUSED'
  | 'LEVEL_COMPLETE'
  | 'GAME_OVER';

export type ModalType =
  | 'NONE'
  | 'TUTORIAL'
  | 'ABOUT'
  | 'SETTINGS'
  | 'PAUSE'
  | 'LEVEL_COMPLETE'
  | 'GAME_OVER';

export class UIManager {
  private container: HTMLElement;
  private audio: AudioManager;

  // Primary screen views
  private mainMenuEl!: HTMLElement;
  private levelSelectEl!: HTMLElement;
  private hudEl!: HTMLElement;

  // Single centralized modal layer & cards
  private modalLayerEl!: HTMLElement;
  private modalCardTutorial!: HTMLElement;
  private modalCardAbout!: HTMLElement;
  private modalCardSettings!: HTMLElement;
  private modalCardPause!: HTMLElement;
  private modalCardLevelComplete!: HTMLElement;
  private modalCardGameOver!: HTMLElement;

  // Active state tracking
  private activeModal: ModalType = 'NONE';
  private modalReturnState: GameState = 'MAIN_MENU';

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
  public onTutorialUnderstood: (() => void) | null = null;
  public onRestartLevel: (() => void) | null = null;
  public onResumeGame: (() => void) | null = null;
  public onExitToLevelSelect: (() => void) | null = null;
  public onOpenLevelSelect: (() => void) | null = null;
  public onBackToMenu: (() => void) | null = null;
  public onNextLevel: (() => void) | null = null;
  public onGameOverRespawn: (() => void) | null = null;
  public onModalStateChange: ((modal: ModalType, isOpen: boolean) => void) | null = null;

  constructor(audio: AudioManager) {
    this.audio = audio;
    this.container = document.getElementById('ui-container') as HTMLElement;
    this.buildScreens();
  }

  private buildScreens(): void {
    this.container.innerHTML = `
      <!-- MAIN MENU SCREEN -->
      <div id="screen-main-menu" class="ui-screen">
        <div class="paper-card">
          <h1 class="game-title">⛵ Little Paper Boat</h1>
          <p class="game-tagline">"A little boat. A wonderful journey."</p>
          <div class="btn-stack">
            <button id="btn-play" class="cozy-btn">Start Journey</button>
            <button id="btn-levels" class="cozy-btn secondary">Level Selection</button>
            <button id="btn-how" class="cozy-btn secondary">How to Sail</button>
            <button id="btn-settings" class="cozy-btn secondary">Audio Settings</button>
            <button id="btn-about" class="cozy-btn secondary">About</button>
          </div>
        </div>
      </div>

      <!-- LEVEL SELECT SCREEN -->
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

      <!-- SINGLE CENTRALIZED MODAL LAYER -->
      <div id="modal-layer" class="modal-layer hidden">
        <!-- 1. TUTORIAL / HOW TO SAIL CARD -->
        <div id="modal-card-tutorial" class="paper-card modal-card hidden" style="max-width: 460px; text-align: left;">
          <h2 style="color: #2b583f; margin-bottom: 12px; text-align: center;">How to Sail</h2>
          <p style="margin-bottom: 10px; line-height: 1.5;">⛵ <strong>Gentle Navigation:</strong> Your paper boat drifts forward automatically with the river flow.</p>
          <p style="margin-bottom: 10px; line-height: 1.5;">⌨️ <strong>Desktop Controls:</strong> Press <code>A</code> / <code>D</code> or <code>Left</code> / <code>Right</code> arrow keys, or click & drag with your mouse to steer across the river.</p>
          <p style="margin-bottom: 10px; line-height: 1.5;">📱 <strong>Mobile Controls:</strong> Touch and drag anywhere on the screen horizontally, or use the touch joystick.</p>
          <p style="margin-bottom: 10px; line-height: 1.5;">🌸 <strong>Collectibles:</strong> Gather floating golden leaves, blossoms, and star motes to earn 3-star ratings!</p>
          <p style="margin-bottom: 16px; line-height: 1.5;">🍃 <strong>Peaceful Spirit:</strong> Rocks and logs produce soft bumps, not game overs. Enjoy the scenery!</p>
          <div style="text-align: center;">
            <button id="btn-tutorial-understood" class="cozy-btn">Understood</button>
          </div>
        </div>

        <!-- 2. ABOUT CARD -->
        <div id="modal-card-about" class="paper-card modal-card hidden" style="max-width: 420px;">
          <h2 style="color: #2b583f; margin-bottom: 8px;">Little Paper Boat</h2>
          <p style="font-family: 'Yomogi', cursive; font-size: 1.2rem; color: #5f7470; margin-bottom: 16px;">"A little boat. A wonderful journey."</p>
          <p style="font-size: 1.0rem; font-weight: 700; color: #2b583f; margin-bottom: 8px;">Engine: PlayCanvas 3D</p>
          <p style="font-size: 0.95rem; line-height: 1.6; color: #42584e; margin-bottom: 22px;">
            A cozy adventure about peaceful exploration.
          </p>
          <button id="btn-close-about" class="cozy-btn">Close</button>
        </div>

        <!-- 3. SETTINGS CARD -->
        <div id="modal-card-settings" class="paper-card modal-card hidden" style="width: 360px;">
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

        <!-- 4. PAUSE CARD -->
        <div id="modal-card-pause" class="paper-card modal-card hidden" style="width: 320px;">
          <h2 style="margin-bottom: 18px; color: #2b583f;">Drifting at Rest</h2>
          <div class="btn-stack" style="width: 100%;">
            <button id="btn-resume" class="cozy-btn">Resume Drift</button>
            <button id="btn-pause-how" class="cozy-btn secondary">How to Sail</button>
            <button id="btn-restart" class="cozy-btn secondary">Restart Level</button>
            <button id="btn-pause-levels" class="cozy-btn secondary">Level Select</button>
            <button id="btn-pause-settings" class="cozy-btn secondary">Audio Settings</button>
          </div>
        </div>

        <!-- 5. LEVEL COMPLETE CARD -->
        <div id="modal-card-level-complete" class="paper-card modal-card hidden" style="width: 360px;">
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

        <!-- 6. GAME OVER CARD -->
        <div id="modal-card-game-over" class="paper-card modal-card hidden" style="width: 340px;">
          <h2 style="font-size: 1.5rem; color: #b91c1c; margin-bottom: 6px;">Origami Unfolded</h2>
          <p style="color: #6c8c72; font-size: 0.95rem; margin-bottom: 18px;">The paper absorbed too much river mist.</p>
          <div class="btn-stack" style="width: 100%;">
            <button id="btn-gameover-respawn" class="cozy-btn">Respawn at Lantern</button>
            <button id="btn-gameover-restart" class="cozy-btn secondary">Restart Level</button>
            <button id="btn-gameover-levels" class="cozy-btn secondary">Level Select</button>
          </div>
        </div>
      </div>
    `;

    // Grab screen views
    this.mainMenuEl = document.getElementById('screen-main-menu')!;
    this.levelSelectEl = document.getElementById('screen-level-select')!;
    this.hudEl = document.getElementById('hud-overlay')!;

    // Grab single modal layer & cards
    this.modalLayerEl = document.getElementById('modal-layer')!;
    this.modalCardTutorial = document.getElementById('modal-card-tutorial')!;
    this.modalCardAbout = document.getElementById('modal-card-about')!;
    this.modalCardSettings = document.getElementById('modal-card-settings')!;
    this.modalCardPause = document.getElementById('modal-card-pause')!;
    this.modalCardLevelComplete = document.getElementById('modal-card-level-complete')!;
    this.modalCardGameOver = document.getElementById('modal-card-game-over')!;

    // Grab HUD elements
    this.hudLevelTitle = document.getElementById('hud-title')!;
    this.hudLevelSubtitle = document.getElementById('hud-subtitle')!;
    this.hudCollectibleBadge = document.getElementById('hud-collectible')!;
    this.hudProgressBar = document.getElementById('hud-progress-bar')!;
    this.hudIntegrityEl = document.getElementById('hud-integrity')!;
    this.hudCheckpointBannerEl = document.getElementById('hud-checkpoint-banner')!;

    // Grab Result elements
    this.resultStarsEl = document.getElementById('result-stars')!;
    this.resultScoreEl = document.getElementById('result-score')!;

    this.bindEvents();
  }

  // ==========================================
  // CENTRALIZED MODAL MANAGEMENT
  // ==========================================

  public openModal(modal: ModalType, returnState: GameState = 'MAIN_MENU'): void {
    // 1. Hide all modal cards first to guarantee no stacked dialogs
    this.hideAllModalCards();

    this.activeModal = modal;
    this.modalReturnState = returnState;

    if (modal === 'NONE') {
      this.modalLayerEl.classList.add('hidden');
      if (this.onModalStateChange) this.onModalStateChange('NONE', false);
      return;
    }

    // 2. Unhide only the requested modal card
    switch (modal) {
      case 'TUTORIAL':
        this.modalCardTutorial.classList.remove('hidden');
        break;
      case 'ABOUT':
        this.modalCardAbout.classList.remove('hidden');
        break;
      case 'SETTINGS':
        const vols = ProgressionManager.getVolumes();
        (document.getElementById('slider-music') as HTMLInputElement).value = vols.music.toString();
        (document.getElementById('slider-ambient') as HTMLInputElement).value = vols.ambient.toString();
        (document.getElementById('slider-sfx') as HTMLInputElement).value = vols.sfx.toString();
        this.modalCardSettings.classList.remove('hidden');
        break;
      case 'PAUSE':
        this.modalCardPause.classList.remove('hidden');
        break;
      case 'LEVEL_COMPLETE':
        this.modalCardLevelComplete.classList.remove('hidden');
        break;
      case 'GAME_OVER':
        this.modalCardGameOver.classList.remove('hidden');
        break;
    }

    // 3. Unhide the single centralized modal backdrop
    this.modalLayerEl.classList.remove('hidden');
    if (this.onModalStateChange) this.onModalStateChange(modal, true);
  }

  public closeModal(): GameState {
    this.hideAllModalCards();
    this.modalLayerEl.classList.add('hidden');
    const previous = this.activeModal;
    this.activeModal = 'NONE';

    if (this.onModalStateChange) this.onModalStateChange(previous, false);
    return this.modalReturnState;
  }

  private hideAllModalCards(): void {
    this.modalCardTutorial.classList.add('hidden');
    this.modalCardAbout.classList.add('hidden');
    this.modalCardSettings.classList.add('hidden');
    this.modalCardPause.classList.add('hidden');
    this.modalCardLevelComplete.classList.add('hidden');
    this.modalCardGameOver.classList.add('hidden');
  }

  public getActiveModal(): ModalType {
    return this.activeModal;
  }

  public isModalOpen(): boolean {
    return this.activeModal !== 'NONE';
  }

  // ==========================================
  // EVENT BINDINGS
  // ==========================================

  private bindEvents(): void {
    // Main Menu: Start Journey
    document.getElementById('btn-play')?.addEventListener('click', () => {
      this.audio.init();
      this.audio.resume();
      if (this.onPlayClicked) {
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

    // Main Menu: Level Selection
    document.getElementById('btn-levels')?.addEventListener('click', () => {
      this.audio.init();
      this.showLevelSelection();
      if (this.onOpenLevelSelect) this.onOpenLevelSelect();
    });

    // Level Selection: Back to Menu
    document.getElementById('btn-back-menu')?.addEventListener('click', () => {
      this.showMainMenu();
      if (this.onBackToMenu) this.onBackToMenu();
    });

    // Main Menu: How to Sail
    document.getElementById('btn-how')?.addEventListener('click', () => {
      this.openModal('TUTORIAL', 'MAIN_MENU');
    });

    // Main Menu: Audio Settings
    document.getElementById('btn-settings')?.addEventListener('click', () => {
      this.openModal('SETTINGS', 'MAIN_MENU');
    });

    // Main Menu: About
    document.getElementById('btn-about')?.addEventListener('click', () => {
      this.openModal('ABOUT', 'MAIN_MENU');
    });

    // Modal: Understood (Tutorial)
    document.getElementById('btn-tutorial-understood')?.addEventListener('click', () => {
      ProgressionManager.markTutorialSeen();
      this.closeModal();
      if (this.onTutorialUnderstood) {
        this.onTutorialUnderstood();
      }
    });

    // Modal: Close About
    document.getElementById('btn-close-about')?.addEventListener('click', () => {
      this.closeModal();
    });

    // Modal: Close Audio Settings
    document.getElementById('btn-close-settings')?.addEventListener('click', () => {
      const music = parseFloat((document.getElementById('slider-music') as HTMLInputElement).value);
      const ambient = parseFloat((document.getElementById('slider-ambient') as HTMLInputElement).value);
      const sfx = parseFloat((document.getElementById('slider-sfx') as HTMLInputElement).value);
      this.audio.setVolumes(music, ambient, sfx);
      this.closeModal();
    });

    // In-game Pause button
    document.getElementById('btn-pause')?.addEventListener('click', () => {
      this.openModal('PAUSE', 'PLAYING');
    });

    // Pause Modal: Resume Drift
    document.getElementById('btn-resume')?.addEventListener('click', () => {
      this.closeModal();
      if (this.onResumeGame) this.onResumeGame();
    });

    // Pause Modal: How to Sail
    document.getElementById('btn-pause-how')?.addEventListener('click', () => {
      this.openModal('TUTORIAL', 'PAUSED');
    });

    // Pause Modal: Restart Level
    document.getElementById('btn-restart')?.addEventListener('click', () => {
      this.closeModal();
      if (this.onRestartLevel) this.onRestartLevel();
    });

    // Pause Modal: Level Selection
    document.getElementById('btn-pause-levels')?.addEventListener('click', () => {
      this.closeModal();
      if (this.onExitToLevelSelect) this.onExitToLevelSelect();
    });

    // Pause Modal: Settings
    document.getElementById('btn-pause-settings')?.addEventListener('click', () => {
      this.openModal('SETTINGS', 'PAUSED');
    });

    // Level Complete Modal: Next Journey
    document.getElementById('btn-next-level')?.addEventListener('click', () => {
      this.closeModal();
      if (this.onNextLevel) this.onNextLevel();
    });

    // Level Complete Modal: Sail Again (Replay)
    document.getElementById('btn-replay')?.addEventListener('click', () => {
      this.closeModal();
      if (this.onRestartLevel) this.onRestartLevel();
    });

    // Level Complete Modal: Level Select
    document.getElementById('btn-result-levels')?.addEventListener('click', () => {
      this.closeModal();
      if (this.onExitToLevelSelect) this.onExitToLevelSelect();
    });

    // Game Over Modal
    document.getElementById('btn-gameover-respawn')?.addEventListener('click', () => {
      this.closeModal();
      if (this.onGameOverRespawn) this.onGameOverRespawn();
    });

    document.getElementById('btn-gameover-restart')?.addEventListener('click', () => {
      this.closeModal();
      if (this.onRestartLevel) this.onRestartLevel();
    });

    document.getElementById('btn-gameover-levels')?.addEventListener('click', () => {
      this.closeModal();
      if (this.onExitToLevelSelect) this.onExitToLevelSelect();
    });
  }

  // ==========================================
  // SCREEN VIEW CONTROLS
  // ==========================================

  public showMainMenu(notify: boolean = true): void {
    this.closeModal();
    this.mainMenuEl.classList.remove('hidden');
    this.levelSelectEl.classList.add('hidden');
    this.hudEl.classList.add('hidden');
    if (notify && this.onBackToMenu) this.onBackToMenu();
  }

  public showLevelSelection(notify: boolean = true): void {
    this.closeModal();
    this.mainMenuEl.classList.add('hidden');
    this.levelSelectEl.classList.remove('hidden');
    this.hudEl.classList.add('hidden');
    if (notify && this.onOpenLevelSelect) this.onOpenLevelSelect();

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

  public showLevelSelect(): void {
    this.showLevelSelection();
  }

  public showHUD(title: string, subtitle: string, totalCollectibles: number): void {
    this.mainMenuEl.classList.add('hidden');
    this.levelSelectEl.classList.add('hidden');
    this.hudEl.classList.remove('hidden');

    this.hudLevelTitle.textContent = title;
    this.hudLevelSubtitle.textContent = subtitle;
    this.updateCollectibles(0, totalCollectibles);
    this.updateIntegrity(3, 3);
    this.updateProgress(0);
  }

  public hideHUD(): void {
    this.hudEl.classList.add('hidden');
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

  public showResultModal(stars: number, collected: number, total: number, hasNextLevel: boolean): void {
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

    this.openModal('LEVEL_COMPLETE', 'LEVEL_SELECTION');
  }

  public showGameOverModal(): void {
    this.openModal('GAME_OVER', 'PLAYING');
  }
}

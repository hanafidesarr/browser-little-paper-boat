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

const REALM_ICONS: { [id: number]: string } = {
  1: '🌿',
  2: '🌲',
  3: '🪨',
  4: '🌉',
  5: '🍂',
  6: '🌧️',
  7: '🌸',
  8: '🌄',
  9: '🪵',
  10: '🌊'
};

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
  private hudBoatMarker!: HTMLElement;
  private hudIntegrityEl!: HTMLElement;
  private hudCheckpointBannerEl!: HTMLElement;
  private bannerTimeout: any = null;

  // Result elements
  private resultStarsEl!: HTMLElement;
  private resultScoreEl!: HTMLElement;

  // Map elements
  private mapScrollViewport!: HTMLElement;
  private mapTotalStarsEl!: HTMLElement;
  private mapTotalCollectiblesEl!: HTMLElement;
  private portraitAdvisoryEl!: HTMLElement;

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
    this.setupOrientationAdvisory();
  }

  private buildScreens(): void {
    this.container.innerHTML = `
      <!-- MAIN MENU SCREEN -->
      <div id="screen-main-menu" class="ui-screen">
        <div class="paper-card" style="max-width: 440px;">
          <h1 class="game-title">⛵ Little Paper Boat</h1>
          <p class="game-tagline">"A little boat. A wonderful journey."</p>
          <div class="btn-stack">
            <button id="btn-play" class="cozy-btn">Start Journey</button>
            <button id="btn-levels" class="cozy-btn secondary">River Map 🗺️</button>
            <button id="btn-how" class="cozy-btn secondary">How to Sail ⛵</button>
            <button id="btn-settings" class="cozy-btn secondary">Audio Settings 🎵</button>
            <button id="btn-about" class="cozy-btn secondary">About 📖</button>
          </div>
          <p style="margin-top: 18px; font-size: 0.75rem; color: #769380; font-family: 'Yomogi', cursive;">
            A cozy 3D browser adventure • Powered by PlayCanvas
          </p>
        </div>
      </div>

      <!-- ILLUSTRATED TEN-LEVEL RIVER MAP SCREEN -->
      <div id="screen-level-select" class="ui-screen hidden">
        <div class="map-page-layout">
          <!-- MAP HEADER -->
          <div class="map-header">
            <button id="btn-back-menu" class="cozy-btn secondary" style="padding: 8px 18px; font-size: 0.9rem;">
              ◀ Menu
            </button>
            <div class="map-title-block">
              <h2 class="map-title">River Journeys 🗺️</h2>
              <span class="map-subtitle">Follow the gentle currents through 10 tranquil realms</span>
            </div>
            <div class="map-stats-pill">
              <span>⭐ <strong id="map-total-stars">0</strong>/30</span>
              <span>🌸 <strong id="map-total-collectibles">0</strong>/100</span>
            </div>
          </div>

          <!-- MAP SCROLL VIEWPORT -->
          <div id="map-scroll-viewport" class="map-scroll-viewport">
            <button id="btn-map-left" class="map-nav-arrow left" title="Scroll Left">◀</button>
            <button id="btn-map-right" class="map-nav-arrow right" title="Scroll Right">▶</button>
            <div id="level-grid-container" class="map-river-track"></div>
          </div>
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
            <div id="hud-integrity" class="hud-integrity" title="Paper Boat Condition">⛵ ⛵ ⛵</div>
            <div id="hud-collectible" class="hud-badge">🌸 0 / 10</div>
            <button id="btn-pause" class="hud-pause-btn" title="Pause [Esc]">⏸</button>
          </div>
        </div>
        <div id="hud-checkpoint-banner" class="hud-checkpoint-banner">🏮 Lantern Checkpoint Reached</div>
        <div class="hud-bottom">
          <div class="progress-container">
            <div id="hud-progress-bar" class="progress-bar"></div>
            <div id="hud-boat-marker" class="progress-boat-icon">⛵</div>
          </div>
          <div id="hud-touch-hint" class="touch-hint">Drag screen or use A / D / Arrow Keys to steer</div>
        </div>
      </div>

      <!-- SINGLE CENTRALIZED MODAL LAYER -->
      <div id="modal-layer" class="modal-layer hidden">
        <!-- 1. TUTORIAL / HOW TO SAIL CARD -->
        <div id="modal-card-tutorial" class="paper-card modal-card hidden" style="max-width: 500px; text-align: left;">
          <h2 style="color: #2b583f; margin-bottom: 14px; text-align: center; font-size: 1.6rem;">How to Sail ⛵</h2>
          <div style="background: rgba(238, 247, 241, 0.7); border-radius: 14px; padding: 12px 16px; margin-bottom: 12px;">
            <p style="margin-bottom: 8px; font-weight: 700; color: #2e6040;">⌨️ Desktop Keyboard:</p>
            <p style="font-size: 0.9rem; line-height: 1.5; color: #3b5b48;">
              • Steer: <code>A</code> / <code>D</code> or <code>←</code> / <code>→</code><br>
              • Speed: <code>W</code> / <code>↑</code> Surge forward • <code>S</code> / <code>↓</code> Gentle brake<br>
              • Pause: <code>P</code> or <code>Escape</code>
            </p>
          </div>
          <div style="background: rgba(238, 247, 241, 0.7); border-radius: 14px; padding: 12px 16px; margin-bottom: 12px;">
            <p style="margin-bottom: 8px; font-weight: 700; color: #2e6040;">🖱️ Mouse & 📱 Touch:</p>
            <p style="font-size: 0.9rem; line-height: 1.5; color: #3b5b48;">
              • Drag horizontally across the water to guide the rudder.<br>
              • On mobile, use the floating thumb joystick on the left.
            </p>
          </div>
          <div style="background: rgba(254, 243, 199, 0.5); border-radius: 14px; padding: 12px 16px; margin-bottom: 16px;">
            <p style="margin-bottom: 6px; font-weight: 700; color: #92400e;">🌸 Goal of the River:</p>
            <p style="font-size: 0.88rem; line-height: 1.5; color: #78350f;">
              Collect blossoms and golden leaves to earn 3 stars. Pass lantern checkpoints and glide through the finish arch!
            </p>
          </div>
          <div style="text-align: center;">
            <button id="btn-tutorial-understood" class="cozy-btn">Understood</button>
          </div>
        </div>

        <!-- 2. ABOUT CARD -->
        <div id="modal-card-about" class="paper-card modal-card hidden" style="max-width: 420px;">
          <h2 style="color: #2b583f; margin-bottom: 6px;">Little Paper Boat</h2>
          <p style="font-family: 'Yomogi', cursive; font-size: 1.25rem; color: #5f7470; margin-bottom: 16px;">"A little boat. A wonderful journey."</p>
          <div style="background: #eef7f1; border-radius: 12px; padding: 10px 16px; margin-bottom: 16px;">
            <p style="font-size: 1.05rem; font-weight: 700; color: #2b583f;">Engine: PlayCanvas 3D</p>
            <p style="font-size: 0.85rem; color: #577360;">WebGL Procedural Spline Adventure</p>
          </div>
          <p style="font-size: 0.95rem; line-height: 1.6; color: #42584e; margin-bottom: 22px;">
            A cozy adventure about peaceful exploration. Follow winding rivers, listen to tranquil bird calls, gather riverside treasures, and discover serene fantasy worlds.
          </p>
          <button id="btn-close-about" class="cozy-btn">Close</button>
        </div>

        <!-- 3. AUDIO SETTINGS CARD -->
        <div id="modal-card-settings" class="paper-card modal-card hidden" style="width: 400px; max-width: 92%;">
          <h2 style="color: #2b583f; margin-bottom: 16px;">Audio Settings 🎵</h2>
          
          <div class="slider-group">
            <label for="slider-master">Master Volume:</label>
            <input type="range" id="slider-master" min="0" max="1" step="0.05" value="0.8">
            <span id="val-master" class="slider-val-badge">80%</span>
          </div>

          <div class="slider-group">
            <label for="slider-music">Music Volume:</label>
            <input type="range" id="slider-music" min="0" max="1" step="0.05" value="0.65">
            <span id="val-music" class="slider-val-badge">65%</span>
          </div>

          <div class="slider-group">
            <label for="slider-ambient">River & Nature:</label>
            <input type="range" id="slider-ambient" min="0" max="1" step="0.05" value="0.75">
            <span id="val-ambient" class="slider-val-badge">75%</span>
          </div>

          <div class="slider-group">
            <label for="slider-sfx">Sound Effects:</label>
            <input type="range" id="slider-sfx" min="0" max="1" step="0.05" value="0.8">
            <span id="val-sfx" class="slider-val-badge">80%</span>
          </div>

          <div style="display: flex; justify-content: center; gap: 10px; margin-top: 14px;">
            <button id="btn-toggle-mute" class="cozy-btn secondary" style="padding: 8px 16px; font-size: 0.9rem;">
              🔊 Sound On
            </button>
            <button id="btn-reset-progress" class="cozy-btn danger" style="padding: 8px 16px; font-size: 0.9rem;">
              ↺ Reset Progress
            </button>
          </div>

          <button id="btn-close-settings" class="cozy-btn" style="margin-top: 16px; width: 100%;">
            Save & Close
          </button>
        </div>

        <!-- 4. PAUSE CARD -->
        <div id="modal-card-pause" class="paper-card modal-card hidden" style="width: 340px;">
          <h2 style="margin-bottom: 4px; color: #2b583f;">Drifting at Rest ⏸️</h2>
          <p id="pause-level-info" style="font-size: 0.85rem; color: #6a8870; margin-bottom: 16px;">Level 01 — Morning Creek</p>
          <div class="btn-stack" style="width: 100%;">
            <button id="btn-resume" class="cozy-btn">Resume Drift ⛵</button>
            <button id="btn-restart" class="cozy-btn secondary">Restart Level ↺</button>
            <button id="btn-pause-how" class="cozy-btn secondary">How to Sail 📖</button>
            <button id="btn-pause-settings" class="cozy-btn secondary">Audio Settings 🎵</button>
            <button id="btn-pause-levels" class="cozy-btn secondary">River Map 🗺️</button>
          </div>
        </div>

        <!-- 5. LEVEL COMPLETE CARD -->
        <div id="modal-card-level-complete" class="paper-card modal-card hidden" style="width: 380px;">
          <h2 style="font-size: 1.7rem; color: #2b583f; margin-bottom: 2px;">Journey Completed! 🌸</h2>
          <p id="result-rating-title" style="color: #6c8c72; font-size: 0.95rem; font-family: 'Yomogi', cursive;">
            You arrived safely at the harbor
          </p>
          <div id="result-stars" class="result-stars">⭐⭐⭐</div>
          <p id="result-score" style="font-weight: 700; color: #d97706; margin-bottom: 18px; font-size: 1.15rem;">
            Treasures: 10 / 10
          </p>
          <div class="btn-stack" style="width: 100%;">
            <button id="btn-next-level" class="cozy-btn">Next Journey ➔</button>
            <button id="btn-replay" class="cozy-btn secondary">Sail Again ↺</button>
            <button id="btn-result-levels" class="cozy-btn secondary">River Map 🗺️</button>
          </div>
        </div>

        <!-- 6. GAME OVER CARD -->
        <div id="modal-card-game-over" class="paper-card modal-card hidden" style="width: 350px;">
          <h2 style="font-size: 1.5rem; color: #b91c1c; margin-bottom: 6px;">Origami Unfolded 🍃</h2>
          <p style="color: #6c8c72; font-size: 0.95rem; margin-bottom: 18px;">
            The paper boat took on gentle water.<br>Every peaceful river has calm shores.
          </p>
          <div class="btn-stack" style="width: 100%;">
            <button id="btn-gameover-respawn" class="cozy-btn">Respawn at Lantern 🏮</button>
            <button id="btn-gameover-restart" class="cozy-btn secondary">Restart Level ↺</button>
            <button id="btn-gameover-levels" class="cozy-btn secondary">River Map 🗺️</button>
          </div>
        </div>
      </div>

      <!-- PORTRAIT ORIENTATION ADVISORY -->
      <div id="portrait-advisory" class="portrait-advisory hidden">
        <div class="portrait-box">
          <div class="rotate-icon">📱</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 8px;">Please Rotate to Landscape</h3>
          <p style="font-size: 0.9rem; line-height: 1.5; color: #c4d7cd;">
            Little Paper Boat is designed for a wonderful widescreen river journey.
          </p>
        </div>
      </div>
    `;

    // Grab screen views
    this.mainMenuEl = document.getElementById('screen-main-menu')!;
    this.levelSelectEl = document.getElementById('screen-level-select')!;
    this.hudEl = document.getElementById('hud-overlay')!;
    this.portraitAdvisoryEl = document.getElementById('portrait-advisory')!;

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
    this.hudBoatMarker = document.getElementById('hud-boat-marker')!;
    this.hudIntegrityEl = document.getElementById('hud-integrity')!;
    this.hudCheckpointBannerEl = document.getElementById('hud-checkpoint-banner')!;

    // Grab Result elements
    this.resultStarsEl = document.getElementById('result-stars')!;
    this.resultScoreEl = document.getElementById('result-score')!;

    // Grab Map elements
    this.mapScrollViewport = document.getElementById('map-scroll-viewport')!;
    this.mapTotalStarsEl = document.getElementById('map-total-stars')!;
    this.mapTotalCollectiblesEl = document.getElementById('map-total-collectibles')!;

    this.bindEvents();
    this.updateMainMenuButtonText();
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

    this.audio.playPaperRustle();

    // 2. Unhide only the requested modal card
    switch (modal) {
      case 'TUTORIAL':
        this.modalCardTutorial.classList.remove('hidden');
        break;
      case 'ABOUT':
        this.modalCardAbout.classList.remove('hidden');
        break;
      case 'SETTINGS':
        this.syncSettingsSliders();
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

    this.audio.playPaperRustle();
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

  private syncSettingsSliders(): void {
    const vols = ProgressionManager.getVolumes();
    const setVal = (id: string, badgeId: string, val: number) => {
      const slider = document.getElementById(id) as HTMLInputElement;
      const badge = document.getElementById(badgeId);
      if (slider) slider.value = val.toString();
      if (badge) badge.textContent = `${Math.round(val * 100)}%`;
    };

    setVal('slider-master', 'val-master', vols.master);
    setVal('slider-music', 'val-music', vols.music);
    setVal('slider-ambient', 'val-ambient', vols.ambient);
    setVal('slider-sfx', 'val-sfx', vols.sfx);

    const muteBtn = document.getElementById('btn-toggle-mute');
    if (muteBtn) {
      muteBtn.textContent = this.audio.isSoundMuted() ? '🔇 Unmute' : '🔊 Sound On';
    }
  }

  // ==========================================
  // EVENT BINDINGS
  // ==========================================

  private bindEvents(): void {
    // Helper to attach click with cozy audio tap
    const clickWithAudio = (id: string, fn: () => void) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          this.audio.init();
          this.audio.resume();
          this.audio.playButtonClick();
          fn();
        });
      }
    };

    // Main Menu: Start Journey
    clickWithAudio('btn-play', () => {
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

    // Main Menu: Level Selection (River Map)
    clickWithAudio('btn-levels', () => {
      this.showLevelSelection();
      if (this.onOpenLevelSelect) this.onOpenLevelSelect();
    });

    // Level Selection: Back to Menu
    clickWithAudio('btn-back-menu', () => {
      this.showMainMenu();
      if (this.onBackToMenu) this.onBackToMenu();
    });

    // Map scroll arrows
    clickWithAudio('btn-map-left', () => {
      this.mapScrollViewport.scrollBy({ left: -260, behavior: 'smooth' });
    });

    clickWithAudio('btn-map-right', () => {
      this.mapScrollViewport.scrollBy({ left: 260, behavior: 'smooth' });
    });

    // Main Menu: How to Sail
    clickWithAudio('btn-how', () => {
      this.openModal('TUTORIAL', 'MAIN_MENU');
    });

    // Main Menu: Audio Settings
    clickWithAudio('btn-settings', () => {
      this.openModal('SETTINGS', 'MAIN_MENU');
    });

    // Main Menu: About
    clickWithAudio('btn-about', () => {
      this.openModal('ABOUT', 'MAIN_MENU');
    });

    // Modal: Understood (Tutorial)
    clickWithAudio('btn-tutorial-understood', () => {
      ProgressionManager.markTutorialSeen();
      this.closeModal();
      if (this.onTutorialUnderstood) {
        this.onTutorialUnderstood();
      }
    });

    // Modal: Close About
    clickWithAudio('btn-close-about', () => {
      this.closeModal();
    });

    // Settings Sliders Live Input Listeners
    const bindSlider = (id: string, badgeId: string) => {
      const slider = document.getElementById(id) as HTMLInputElement;
      const badge = document.getElementById(badgeId);
      if (slider && badge) {
        slider.addEventListener('input', () => {
          const val = parseFloat(slider.value);
          badge.textContent = `${Math.round(val * 100)}%`;
          this.applySettingsFromSliders();
          this.audio.playSliderTick();
        });
      }
    };

    bindSlider('slider-master', 'val-master');
    bindSlider('slider-music', 'val-music');
    bindSlider('slider-ambient', 'val-ambient');
    bindSlider('slider-sfx', 'val-sfx');

    // Settings: Toggle Mute
    clickWithAudio('btn-toggle-mute', () => {
      const muted = this.audio.toggleMute();
      const muteBtn = document.getElementById('btn-toggle-mute');
      if (muteBtn) {
        muteBtn.textContent = muted ? '🔇 Unmute' : '🔊 Sound On';
      }
    });

    // Settings: Reset Progress
    clickWithAudio('btn-reset-progress', () => {
      if (window.confirm('Reset all river journeys and return to Level 1?')) {
        ProgressionManager.resetAllProgress();
        this.updateMainMenuButtonText();
        this.showLevelSelection(false);
        this.closeModal();
      }
    });

    // Settings: Close
    clickWithAudio('btn-close-settings', () => {
      this.applySettingsFromSliders();
      this.closeModal();
    });

    // In-game Pause button
    clickWithAudio('btn-pause', () => {
      this.openModal('PAUSE', 'PLAYING');
    });

    // Pause Modal: Resume Drift
    clickWithAudio('btn-resume', () => {
      this.closeModal();
      if (this.onResumeGame) this.onResumeGame();
    });

    // Pause Modal: How to Sail
    clickWithAudio('btn-pause-how', () => {
      this.openModal('TUTORIAL', 'PAUSED');
    });

    // Pause Modal: Restart Level
    clickWithAudio('btn-restart', () => {
      this.closeModal();
      if (this.onRestartLevel) this.onRestartLevel();
    });

    // Pause Modal: Level Selection
    clickWithAudio('btn-pause-levels', () => {
      this.closeModal();
      if (this.onExitToLevelSelect) this.onExitToLevelSelect();
    });

    // Pause Modal: Settings
    clickWithAudio('btn-pause-settings', () => {
      this.openModal('SETTINGS', 'PAUSED');
    });

    // Level Complete Modal: Next Journey
    clickWithAudio('btn-next-level', () => {
      this.closeModal();
      if (this.onNextLevel) this.onNextLevel();
    });

    // Level Complete Modal: Sail Again (Replay)
    clickWithAudio('btn-replay', () => {
      this.closeModal();
      if (this.onRestartLevel) this.onRestartLevel();
    });

    // Level Complete Modal: Level Select
    clickWithAudio('btn-result-levels', () => {
      this.closeModal();
      if (this.onExitToLevelSelect) this.onExitToLevelSelect();
    });

    // Game Over Modal
    clickWithAudio('btn-gameover-respawn', () => {
      this.closeModal();
      if (this.onGameOverRespawn) this.onGameOverRespawn();
    });

    clickWithAudio('btn-gameover-restart', () => {
      this.closeModal();
      if (this.onRestartLevel) this.onRestartLevel();
    });

    clickWithAudio('btn-gameover-levels', () => {
      this.closeModal();
      if (this.onExitToLevelSelect) this.onExitToLevelSelect();
    });

    // Global keyboard map navigation (Left / Right arrows in level select)
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (!this.levelSelectEl.classList.contains('hidden') && this.activeModal === 'NONE') {
        if (e.key === 'ArrowRight') {
          this.mapScrollViewport.scrollBy({ left: 200, behavior: 'smooth' });
        } else if (e.key === 'ArrowLeft') {
          this.mapScrollViewport.scrollBy({ left: -200, behavior: 'smooth' });
        } else if (e.key === 'Escape') {
          this.showMainMenu();
          if (this.onBackToMenu) this.onBackToMenu();
        }
      }
    });
  }

  private applySettingsFromSliders(): void {
    const master = parseFloat((document.getElementById('slider-master') as HTMLInputElement)?.value || '0.8');
    const music = parseFloat((document.getElementById('slider-music') as HTMLInputElement)?.value || '0.65');
    const ambient = parseFloat((document.getElementById('slider-ambient') as HTMLInputElement)?.value || '0.75');
    const sfx = parseFloat((document.getElementById('slider-sfx') as HTMLInputElement)?.value || '0.8');
    this.audio.setVolumes(music, ambient, sfx, master);
  }

  private setupOrientationAdvisory(): void {
    const checkOrientation = () => {
      const isPortrait = window.innerHeight > window.innerWidth && window.innerWidth <= 768;
      if (isPortrait) {
        this.portraitAdvisoryEl.classList.remove('hidden');
      } else {
        this.portraitAdvisoryEl.classList.add('hidden');
      }
    };

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    checkOrientation();
  }

  public updateMainMenuButtonText(): void {
    const playBtn = document.getElementById('btn-play');
    if (!playBtn) return;

    let highestUnlocked = 1;
    let anyCompleted = false;
    for (let i = 1; i <= 10; i++) {
      const rec = ProgressionManager.getLevelRecord(i);
      if (rec.unlocked) highestUnlocked = i;
      if (rec.completed) anyCompleted = true;
    }

    if (!anyCompleted && highestUnlocked === 1) {
      playBtn.textContent = 'Start Journey';
    } else {
      const title = LEVEL_DATA[highestUnlocked]?.title || `Level ${highestUnlocked}`;
      playBtn.textContent = `Continue (0${highestUnlocked}: ${title})`;
    }
  }

  // ==========================================
  // SCREEN VIEW CONTROLS
  // ==========================================

  public showMainMenu(notify: boolean = true): void {
    this.closeModal();
    this.updateMainMenuButtonText();
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

    // Populate 10-level illustrated river map
    const track = document.getElementById('level-grid-container')!;
    track.innerHTML = '';

    let totalStars = 0;
    let totalCollectibles = 0;
    let latestUnlockedElement: HTMLElement | null = null;

    for (let id = 1; id <= 10; id++) {
      const cfg = LEVEL_DATA[id];
      const record = ProgressionManager.getLevelRecord(id);
      const isUnlocked = ProgressionManager.isLevelUnlocked(id);
      const isCompleted = record.completed;

      totalStars += record.stars;
      totalCollectibles += record.bestCollectibles;

      const card = document.createElement('div');
      card.id = `realm-node-${id}`;
      card.className = `realm-card ${isUnlocked ? (isCompleted ? 'completed' : 'unlocked') : 'locked'}`;
      card.tabIndex = isUnlocked ? 0 : -1;

      let starDisplay = '';
      for (let s = 1; s <= 3; s++) {
        starDisplay += s <= record.stars ? '⭐' : '✩';
      }

      const icon = REALM_ICONS[id] || '⛵';

      card.innerHTML = `
        <div class="realm-icon-badge">${isUnlocked ? icon : '🔒'}</div>
        <div class="realm-number">REALM 0${id}</div>
        <div class="realm-title">${cfg.title}</div>
        <div class="realm-subtitle">${cfg.subtitle}</div>
        <div class="realm-stars">${isUnlocked ? starDisplay : 'Locked'}</div>
        <div class="realm-collectible">${isUnlocked ? `🌸 ${record.bestCollectibles} / ${cfg.collectibles.length}` : `Requires Level ${id - 1}`}</div>
        <button class="realm-action-btn">
          ${isUnlocked ? (isCompleted ? 'Replay ↺' : 'Sail River ⛵') : 'Locked 🔒'}
        </button>
      `;

      if (isUnlocked) {
        latestUnlockedElement = card;
        const launchLevel = () => {
          this.audio.init();
          this.audio.resume();
          this.audio.playButtonClick();
          if (this.onPlayClicked) {
            this.onPlayClicked(id);
          }
        };

        card.addEventListener('click', launchLevel);
        card.addEventListener('keydown', (e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            launchLevel();
          }
        });
      }

      track.appendChild(card);
    }

    if (this.mapTotalStarsEl) this.mapTotalStarsEl.textContent = totalStars.toString();
    if (this.mapTotalCollectiblesEl) this.mapTotalCollectiblesEl.textContent = totalCollectibles.toString();

    // Auto-scroll into view for the latest unlocked level
    if (latestUnlockedElement) {
      setTimeout(() => {
        latestUnlockedElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }, 100);
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

    const pauseInfo = document.getElementById('pause-level-info');
    if (pauseInfo) {
      pauseInfo.textContent = `${title} • ${subtitle}`;
    }

    // Auto-fade steering hint after 4 seconds
    const hint = document.getElementById('hud-touch-hint');
    if (hint) {
      hint.style.opacity = '1';
      setTimeout(() => {
        if (hint) hint.style.opacity = '0';
      }, 4000);
    }
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

    // Visual shake animation on damage
    if (current < max) {
      this.hudIntegrityEl.classList.add('shake');
      setTimeout(() => {
        this.hudIntegrityEl.classList.remove('shake');
      }, 400);
    }
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
    this.hudCollectibleBadge.classList.add('bounce');
    setTimeout(() => {
      this.hudCollectibleBadge.classList.remove('bounce');
    }, 220);
  }

  public updateProgress(progressRatio: number): void {
    const pct = Math.max(0, Math.min(100, Math.floor(progressRatio * 100)));
    this.hudProgressBar.style.width = `${pct}%`;
    if (this.hudBoatMarker) {
      this.hudBoatMarker.style.left = `${pct}%`;
    }
  }

  public showResultModal(stars: number, collected: number, total: number, hasNextLevel: boolean): void {
    let starsStr = '';
    for (let i = 1; i <= 3; i++) {
      starsStr += i <= stars ? '⭐' : '✩';
    }
    this.resultStarsEl.textContent = starsStr;
    this.resultScoreEl.textContent = `Treasures: ${collected} / ${total}`;

    const ratingEl = document.getElementById('result-rating-title');
    if (ratingEl) {
      if (stars === 3) {
        ratingEl.textContent = 'Master Explorer! Pristine journey 🌸';
      } else if (stars === 2) {
        ratingEl.textContent = 'Skilled Navigator! Beautiful drift 🍃';
      } else {
        ratingEl.textContent = 'Safe Passage! Peaceful arrival ⛵';
      }
    }

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

import { ProgressionManager } from '../progression/ProgressionManager';

export class AudioManager {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;

  // Running nodes
  private isMuted: boolean = false;
  private musicInterval: any = null;
  private birdInterval: any = null;
  private rainNoiseNode: AudioNode | null = null;
  private rainGainNode: GainNode | null = null;
  private riverNoiseNode: AudioNode | null = null;
  private riverFilterNode: BiquadFilterNode | null = null;
  private currentChords: number[][] = [
    [261.63, 329.63, 392.00, 493.88], // C E G B
    [220.00, 261.63, 329.63, 392.00], // A C E G
    [174.61, 261.63, 329.63, 349.23], // F C E F
    [196.00, 261.63, 293.66, 392.00]  // G C D G
  ];

  constructor() {
    this.setupAutoplayUnlock();
  }

  /**
   * Browser autoplay policy handler:
   * Resumes Web Audio context on the first user interaction (touch, pointer, click, key).
   */
  private setupAutoplayUnlock(): void {
    const unlockHandler = () => {
      this.init();
      this.resume();
      ['pointerdown', 'touchstart', 'mousedown', 'keydown', 'click'].forEach(evt => {
        window.removeEventListener(evt, unlockHandler);
      });
    };

    ['pointerdown', 'touchstart', 'mousedown', 'keydown', 'click'].forEach(evt => {
      window.addEventListener(evt, unlockHandler, { passive: true, once: true });
    });
  }

  public init(): void {
    if (this.ctx) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.ambientGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.musicGain.connect(this.masterGain);
      this.ambientGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);

      const vols = ProgressionManager.getVolumes();
      this.masterGain.gain.setValueAtTime(vols.master, this.ctx.currentTime);
      this.musicGain.gain.setValueAtTime(vols.music * 0.35, this.ctx.currentTime);
      this.ambientGain.gain.setValueAtTime(vols.ambient * 0.4, this.ctx.currentTime);
      this.sfxGain.gain.setValueAtTime(vols.sfx * 0.5, this.ctx.currentTime);

      this.startRiverAmbience();
      this.startBirdCalls();
      this.startMusic();
    } catch (e) {
      console.warn('WebAudio not supported or blocked:', e);
    }
  }

  public resume(): void {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(e => console.warn('Audio resume failed:', e));
    }
  }

  public setVolumes(music: number, ambient: number, sfx: number, master?: number): void {
    ProgressionManager.setVolumes(music, ambient, sfx, master);
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    if (master !== undefined && this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : master, t + 0.05);
    }
    if (this.musicGain) this.musicGain.gain.linearRampToValueAtTime(music * 0.35, t + 0.05);
    if (this.ambientGain) this.ambientGain.gain.linearRampToValueAtTime(ambient * 0.4, t + 0.05);
    if (this.sfxGain) this.sfxGain.gain.linearRampToValueAtTime(sfx * 0.5, t + 0.05);
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.ctx && this.masterGain) {
      const vols = ProgressionManager.getVolumes();
      const target = this.isMuted ? 0 : vols.master;
      this.masterGain.gain.linearRampToValueAtTime(target, this.ctx.currentTime + 0.05);
    }
    return this.isMuted;
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }

  // ==========================================
  // AMBIENCE: River Water Murmur
  // ==========================================
  private startRiverAmbience(): void {
    if (!this.ctx || !this.ambientGain) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Pink / Brown noise for river rush
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Resonant bandpass for bubbling stream texture
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(420, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.ambientGain);
    whiteNoise.start();
    this.riverNoiseNode = whiteNoise;
    this.riverFilterNode = filter;
  }

  // ==========================================
  // AMBIENCE: Occasional Soft Birdsong
  // ==========================================
  private startBirdCalls(): void {
    this.birdInterval = setInterval(() => {
      if (!this.ctx || this.ctx.state !== 'running') return;
      if (Math.random() > 0.4) {
        this.playBirdChirp();
      }
    }, 6000);
  }

  private playBirdChirp(): void {
    if (!this.ctx || !this.ambientGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const baseFreq = 2200 + Math.random() * 800;
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq + 700, t + 0.08);
    osc.frequency.exponentialRampToValueAtTime(baseFreq - 300, t + 0.18);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.06, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.ambientGain);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  // ==========================================
  // COZY BACKGROUND MUSIC: Ambient Arpeggio Chords
  // ==========================================
  private startMusic(): void {
    if (!this.ctx || !this.musicGain) return;

    let chordIdx = 0;
    let noteIdx = 0;

    this.musicInterval = setInterval(() => {
      if (!this.ctx || this.ctx.state !== 'running' || !this.musicGain) return;

      const chords = this.currentChords;
      const chord = chords[chordIdx % chords.length];
      const freq = chord[noteIdx % chord.length];
      this.playMusicNote(freq);

      noteIdx++;
      if (noteIdx >= chord.length) {
        noteIdx = 0;
        chordIdx = (chordIdx + 1) % chords.length;
      }
    }, 750);
  }

  public setTheme(theme: string): void {
    if (theme === 'rain') {
      // Level 06: Misty Hollow — Dm7 / Fmaj7 peaceful rain
      this.currentChords = [
        [220.00, 261.63, 293.66, 349.23], // Dm7
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [196.00, 246.94, 293.66, 349.23]  // G7
      ];
      if (this.ctx && this.riverFilterNode) {
        this.riverFilterNode.frequency.setTargetAtTime(320, this.ctx.currentTime, 0.5);
      }
    } else if (theme === 'autumn') {
      // Level 05: Autumn Glow — Warm golden G major / Em9
      this.currentChords = [
        [196.00, 246.94, 293.66, 392.00], // G
        [164.81, 196.00, 246.94, 293.66], // Em7
        [220.00, 261.63, 329.63, 392.00]  // Am7
      ];
      if (this.ctx && this.riverFilterNode) {
        this.riverFilterNode.frequency.setTargetAtTime(450, this.ctx.currentTime, 0.5);
      }
    } else if (theme === 'twilight') {
      // Level 08: Twilight Valley — Mystical Am / Fmaj7 dreamy
      this.currentChords = [
        [220.00, 261.63, 329.63, 440.00], // Am
        [174.61, 220.00, 261.63, 349.23], // Fmaj7
        [164.81, 196.00, 246.94, 329.63]  // Em
      ];
      if (this.ctx && this.riverFilterNode) {
        this.riverFilterNode.frequency.setTargetAtTime(360, this.ctx.currentTime, 0.5);
      }
    } else if (theme === 'rapids') {
      // Level 03: Pebble Rapids — Dynamic E minor / G brisk stream
      this.currentChords = [
        [164.81, 196.00, 246.94, 329.63], // Em
        [196.00, 246.94, 293.66, 392.00], // G
        [220.00, 261.63, 329.63, 440.00]  // Am
      ];
      if (this.ctx && this.riverFilterNode) {
        this.riverFilterNode.frequency.setTargetAtTime(580, this.ctx.currentTime, 0.5);
      }
    } else if (theme === 'woods') {
      // Level 02: Whispering Woods — Lush D Dorian / G major
      this.currentChords = [
        [146.83, 220.00, 293.66, 369.99], // D / F#
        [196.00, 246.94, 293.66, 392.00], // G
        [220.00, 261.63, 329.63, 440.00]  // Am
      ];
      if (this.ctx && this.riverFilterNode) {
        this.riverFilterNode.frequency.setTargetAtTime(400, this.ctx.currentTime, 0.5);
      }
    } else if (theme === 'bridge') {
      // Level 04: Willow Bridge — Nostalgic Fmaj7 / Cmaj7
      this.currentChords = [
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [261.63, 329.63, 392.00, 523.25], // Cmaj7
        [220.00, 261.63, 329.63, 392.00]  // Am7
      ];
      if (this.ctx && this.riverFilterNode) {
        this.riverFilterNode.frequency.setTargetAtTime(390, this.ctx.currentTime, 0.5);
      }
    } else if (theme === 'lotus') {
      // Level 07: Lotus Sanctuary — Zen Pentatonic C-D-F-G-A
      this.currentChords = [
        [261.63, 293.66, 349.23, 392.00, 440.00], // Pentatonic
        [293.66, 349.23, 392.00, 440.00, 523.25],
        [349.23, 392.00, 440.00, 523.25, 587.33]
      ];
      if (this.ctx && this.riverFilterNode) {
        this.riverFilterNode.frequency.setTargetAtTime(350, this.ctx.currentTime, 0.5);
      }
    } else if (theme === 'ravine') {
      // Level 09: Pine Ravine — Deep mountain resonance Em / Bm
      this.currentChords = [
        [164.81, 246.94, 329.63, 392.00], // Em
        [123.47, 185.00, 246.94, 293.66], // Bm
        [130.81, 196.00, 261.63, 329.63]  // C
      ];
      if (this.ctx && this.riverFilterNode) {
        this.riverFilterNode.frequency.setTargetAtTime(480, this.ctx.currentTime, 0.5);
      }
    } else if (theme === 'falls') {
      // Level 10: Emerald Falls — Triumphant cascading C / F / G
      this.currentChords = [
        [261.63, 329.63, 392.00, 523.25], // C
        [174.61, 261.63, 349.23, 523.25], // F
        [196.00, 293.66, 392.00, 587.33]  // G
      ];
      if (this.ctx && this.riverFilterNode) {
        this.riverFilterNode.frequency.setTargetAtTime(620, this.ctx.currentTime, 0.5);
      }
    } else {
      // Level 01: Morning Creek / Default
      this.currentChords = [
        [261.63, 329.63, 392.00, 493.88], // C E G B
        [220.00, 261.63, 329.63, 392.00], // A C E G
        [174.61, 261.63, 329.63, 349.23], // F C E F
        [196.00, 261.63, 293.66, 392.00]  // G C D G
      ];
      if (this.ctx && this.riverFilterNode) {
        this.riverFilterNode.frequency.setTargetAtTime(420, this.ctx.currentTime, 0.5);
      }
    }
  }

  // ==========================================
  // UI SOUND EFFECTS: Button Click, Paper Rustle, Slider Tick
  // ==========================================

  public playButtonClick(): void {
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.04);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.08, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.06);
  }

  public playPaperRustle(): void {
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.08);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.15;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.Q.setValueAtTime(1.2, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.04, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    whiteNoise.start(t);
  }

  public playSliderTick(): void {
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);

    gain.gain.setValueAtTime(0.03, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.035);
  }

  private playMusicNote(freq: number): void {
    if (!this.ctx || !this.musicGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.08, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);

    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(t);
    osc.stop(t + 1.9);
  }

  // ==========================================
  // SFX: Collectible Picked Up (Sparkling Chime)
  // ==========================================
  public playCollectSound(): void {
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const notes = [587.33, 783.99, 1046.50]; // D5, G5, C6 sweet chime

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.06);

      gain.gain.setValueAtTime(0.001, t + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.12, t + idx * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.45);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t + idx * 0.06);
      osc.stop(t + idx * 0.06 + 0.5);
    });
  }

  // ==========================================
  // SFX: Soft Water Splash / River Bank Bump
  // ==========================================
  public playWaterSplash(): void {
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.25);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, t);

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  // ==========================================
  // SFX: Checkpoint Bell / Lantern Chime
  // ==========================================
  public playCheckpointSound(): void {
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    // Warm Tibetan Singing Bowl / Temple Bell Chord (A4, E5, A5)
    const freqs = [440.0, 659.25, 880.0];

    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.14 / (idx + 1), t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + 2.3);
    });
  }

  // ==========================================
  // SFX: Obstacle Impact / Soft Damage Thud
  // ==========================================
  public playDamageThud(): void {
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const noise = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();

    // Low hollow water thud
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.22);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.26);
  }

  // ==========================================
  // SFX: Cute Animal Voices (Duck / Frog / Fish)
  // ==========================================
  public playAnimalQuack(): void {
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(480, t);
    osc.frequency.linearRampToValueAtTime(320, t + 0.12);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, t);
    filter.Q.setValueAtTime(3.0, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.08, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.16);
  }

  public playAnimalRibbit(): void {
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(260, t + 0.06);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.14);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.09, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.18);
  }

  // ==========================================
  // SFX: Level Completed Fanfare
  // ==========================================
  public playWinFanfare(): void {
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.50]; // C5 E5 G5 C6

    chord.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.12);

      gain.gain.setValueAtTime(0.001, t + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.18, t + idx * 0.12 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.12 + 1.2);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t + idx * 0.12);
      osc.stop(t + idx * 0.12 + 1.3);
    });
  }

  public destroy(): void {
    if (this.musicInterval) clearInterval(this.musicInterval);
    if (this.birdInterval) clearInterval(this.birdInterval);
    if (this.ctx) this.ctx.close();
  }
}

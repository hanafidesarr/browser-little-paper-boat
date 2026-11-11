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
  private riverNoiseNode: AudioNode | null = null;

  constructor() {
    // Initialized on first user interaction
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
      this.ctx.resume();
    }
  }

  public setVolumes(music: number, ambient: number, sfx: number): void {
    ProgressionManager.setVolumes(music, ambient, sfx);
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    if (this.musicGain) this.musicGain.gain.linearRampToValueAtTime(music * 0.35, t + 0.05);
    if (this.ambientGain) this.ambientGain.gain.linearRampToValueAtTime(ambient * 0.4, t + 0.05);
    if (this.sfxGain) this.sfxGain.gain.linearRampToValueAtTime(sfx * 0.5, t + 0.05);
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

    // Peaceful Pentatonic Chord Progression in C Major (Cmaj7 -> Am9 -> Fmaj7 -> Gsus4)
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // C E G B
      [220.00, 261.63, 329.63, 392.00], // A C E G
      [174.61, 261.63, 329.63, 349.23], // F C E F
      [196.00, 261.63, 293.66, 392.00]  // G C D G
    ];

    let chordIdx = 0;
    let noteIdx = 0;

    this.musicInterval = setInterval(() => {
      if (!this.ctx || this.ctx.state !== 'running' || !this.musicGain) return;

      const chord = chords[chordIdx];
      const freq = chord[noteIdx];
      this.playMusicNote(freq);

      noteIdx++;
      if (noteIdx >= chord.length) {
        noteIdx = 0;
        chordIdx = (chordIdx + 1) % chords.length;
      }
    }, 750);
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

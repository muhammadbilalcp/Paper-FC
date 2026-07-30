// Web Audio API Synthesizer Engine for FC Mobile Soundtrack
// Includes tracks: "Soothing Bliss", "Osama", "Feet Don't Fail Me Now"

export interface TrackInfo {
  id: string;
  title: string;
  artist: string;
  album: string;
  bpm: number;
  genre: string;
  gradient: string;
  icon: string;
}

export const FC_MOBILE_TRACKS: TrackInfo[] = [
  {
    id: 'soothing-bliss',
    title: 'Soothing Bliss',
    artist: 'FC Mobile Lounge',
    album: 'EA Sports FC Soundtrack',
    bpm: 78,
    genre: 'Chill Ambient Vibe',
    gradient: 'from-emerald-600 via-teal-700 to-cyan-900',
    icon: '✨'
  },
  {
    id: 'osama',
    title: 'Osama',
    artist: 'Zakes Bantwini & Kasango',
    album: 'FC Mobile Afrobeat Hits',
    bpm: 108,
    genre: 'High Energy Afrobeat',
    gradient: 'from-amber-500 via-orange-600 to-red-900',
    icon: '🔥'
  },
  {
    id: 'feet-dont-fail-me-now',
    title: "Feet Don't Fail Me Now",
    artist: 'Joy Crookes / FC Mobile OST',
    album: 'FC Mobile Dance Anthem',
    bpm: 122,
    genre: 'Upbeat Dance Anthem',
    gradient: 'from-purple-600 via-indigo-700 to-blue-950',
    icon: '⚽'
  }
];

class FCMusicEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private isMuted: boolean = false;
  private volume: number = 0.3; // Default low/comfortable background volume (30%)
  private currentTrackIndex: number = 0;
  private timerId: number | null = null;
  private step: number = 0;
  private listeners: Set<() => void> = new Set();

  constructor() {
    // Lazy init
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public subscribe(callback: () => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  public getCurrentTrack(): TrackInfo {
    return FC_MOBILE_TRACKS[this.currentTrackIndex];
  }

  public getCurrentTrackIndex(): number {
    return this.currentTrackIndex;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    this.notify();
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    this.notify();
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    this.notify();
  }

  public selectTrack(index: number) {
    if (index >= 0 && index < FC_MOBILE_TRACKS.length) {
      this.currentTrackIndex = index;
      this.step = 0;
      this.notify();
    }
  }

  public nextTrack() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % FC_MOBILE_TRACKS.length;
    this.step = 0;
    this.notify();
  }

  public prevTrack() {
    this.currentTrackIndex = (this.currentTrackIndex - 1 + FC_MOBILE_TRACKS.length) % FC_MOBILE_TRACKS.length;
    this.step = 0;
    this.notify();
  }

  public play() {
    this.initCtx();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.notify();
    this.scheduleNextBeat();
  }

  public pause() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.notify();
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  private scheduleNextBeat() {
    if (!this.isPlaying) return;

    const track = this.getCurrentTrack();
    const bpm = track.bpm;
    const stepDurationMs = (60 / bpm / 4) * 1000; // 16th note timing

    if (!this.isMuted && this.volume > 0) {
      this.playBeatStep(track.id, this.step);
    }

    this.step = (this.step + 1) % 64; // 4-bar loop

    this.timerId = window.setTimeout(() => {
      this.scheduleNextBeat();
    }, stepDurationMs);
  }

  private playBeatStep(trackId: string, step: number) {
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const vol = this.volume;

    if (trackId === 'soothing-bliss') {
      // TRACK 1: "Soothing Bliss" (Ambient Lounge)
      // Soft kick on 0, 8, 16, 24, 32, 40, 48, 56
      if (step % 8 === 0) {
        this.synthKick(now, 60, 0.25 * vol, 0.3);
      }
      // Soft Rimshot / snare on 4, 12, 20, 28, 36, 44, 52, 60
      if (step % 8 === 4) {
        this.synthSnare(now, 0.12 * vol);
      }
      // Gentle Hi-hats
      if (step % 2 === 0) {
        this.synthHiHat(now, 0.05 * vol, false);
      }
      // Ambient Chord Melody Pads every 16 steps
      if (step % 16 === 0) {
        const chordIndex = Math.floor(step / 16) % 4;
        const chords = [
          [261.63, 329.63, 392.00, 493.88], // Cmaj7
          [220.00, 261.63, 329.63, 392.00], // Am7
          [174.61, 220.00, 261.63, 329.63], // Fmaj7
          [196.00, 246.94, 293.66, 349.23]  // G7
        ];
        this.synthPadChord(now, chords[chordIndex], 0.12 * vol, 1.8);
      }
      // Smooth Synth Lead Pluck
      if ([0, 3, 6, 10, 14, 18, 22, 27, 30, 34, 38, 42, 46, 51, 54, 58].includes(step)) {
        const notes = [523.25, 659.25, 783.99, 880.00, 987.77, 1046.50];
        const note = notes[step % notes.length];
        this.synthPluck(now, note, 0.08 * vol, 0.25);
      }

    } else if (trackId === 'osama') {
      // TRACK 2: "Osama" (High Energy Afrobeat)
      // Afrobeat syncopated kick
      if ([0, 6, 10, 16, 22, 26, 32, 38, 42, 48, 54, 58].includes(step)) {
        this.synthKick(now, 90, 0.4 * vol, 0.2);
      }
      // Afro Snare/Shaker
      if ([4, 12, 20, 28, 36, 44, 52, 60].includes(step)) {
        this.synthSnare(now, 0.25 * vol);
      }
      if (step % 2 === 1) {
        this.synthHiHat(now, 0.08 * vol, step % 4 === 3);
      }
      // Afro Percussion/Shaker syncopation
      if ([2, 5, 9, 13, 18, 21, 25, 29, 34, 37, 41, 45, 50, 53, 57, 61].includes(step)) {
        this.synthPerc(now, 450 + (step % 8) * 60, 0.1 * vol);
      }
      // Deep Afro Bassline
      if (step % 4 === 0) {
        const bassNotes = [110.00, 110.00, 130.81, 146.83, 98.00, 110.00, 130.81, 123.47];
        const bNote = bassNotes[Math.floor(step / 8) % bassNotes.length];
        this.synthBass(now, bNote, 0.35 * vol, 0.3);
      }
      // Vibrant Brass / Organ Hook
      if ([0, 3, 6, 8, 12, 14, 16, 19, 22, 24, 28, 30, 32, 35, 38, 40, 44, 46, 48, 51, 54, 56, 60, 62].includes(step)) {
        const brassNotes = [440.00, 523.25, 659.25, 587.33, 659.25, 783.99];
        const note = brassNotes[step % brassNotes.length];
        this.synthBrass(now, note, 0.18 * vol, 0.18);
      }

    } else if (trackId === 'feet-dont-fail-me-now') {
      // TRACK 3: "Feet Don't Fail Me Now" (Upbeat Dance Anthem)
      // Four on the floor dance kick
      if (step % 4 === 0) {
        this.synthKick(now, 120, 0.45 * vol, 0.22);
      }
      // Clapped Snare on 4, 12, 20, 28, 36, 44, 52, 60
      if (step % 8 === 4) {
        this.synthSnare(now, 0.3 * vol);
      }
      // Off-beat open hi-hat
      if (step % 4 === 2) {
        this.synthHiHat(now, 0.15 * vol, true);
      } else if (step % 2 === 0) {
        this.synthHiHat(now, 0.08 * vol, false);
      }
      // Driving Dance Bassline
      if (step % 2 === 0) {
        const bassProg = [65.41, 65.41, 87.31, 87.31, 97.99, 97.99, 73.42, 73.42]; // C F G D
        const note = bassProg[Math.floor(step / 8) % bassProg.length];
        this.synthBass(now, note, 0.35 * vol, 0.15);
      }
      // Arpeggiated Dance Hook
      const danceNotes = [523.25, 659.25, 783.99, 1046.50, 880.00, 783.99, 659.25, 523.25];
      const hookNote = danceNotes[step % danceNotes.length];
      this.synthPluck(now, hookNote, 0.12 * vol, 0.12);
    }
  }

  // --- SYNTHESIZER SOUND GENERATORS ---

  private synthKick(time: number, freq: number, gainVal: number, duration: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(25, time + duration);

    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  private synthSnare(time: number, gainVal: number) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(time);
  }

  private synthHiHat(time: number, gainVal: number, isOpen: boolean) {
    if (!this.ctx) return;
    const duration = isOpen ? 0.15 : 0.04;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(time);
  }

  private synthBass(time: number, freq: number, gainVal: number, duration: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  private synthPadChord(time: number, freqs: number[], gainVal: number, duration: number) {
    if (!this.ctx) return;
    freqs.forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(gainVal, time + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(time);
      osc.stop(time + duration);
    });
  }

  private synthPluck(time: number, freq: number, gainVal: number, duration: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  private synthBrass(time: number, freq: number, gainVal: number, duration: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  private synthPerc(time: number, freq: number, gainVal: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(100, time + 0.08);

    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.08);
  }
}

export const fcMusicEngine = new FCMusicEngine();

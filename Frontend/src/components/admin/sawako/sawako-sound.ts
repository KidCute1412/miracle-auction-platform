/**
 * SawakoSoundManager - Procedural Kawaii Anime Audio Synthesizer
 * 
 * Features:
 * - Rich acoustic-like harmonics (fundamental + subtle overtones)
 * - Warm Biquad lowpass filtering to eliminate harsh digital edges (pleasant & soft on ears)
 * - Click/pop-free gain envelopes with micro-attack ramps
 * - Rich diversity: 5 distinct poke variations and 4 dreamy anime dialogue chime arpeggios
 * - Zero external mp3/wav dependencies (100% lightweight, instant load, zero network latency)
 */
class SawakoSoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private lastPokeIndex: number = -1;
  private lastChimeIndex: number = -1;

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (typeof window === "undefined") return null;

    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  /**
   * Helper: Play a warm acoustic tone with fundamental + harmonic overtone through a gentle lowpass filter
   */
  private playWarmTone(
    ctx: AudioContext,
    freq: number,
    startTime: number,
    duration: number,
    volume: number = 0.1,
    type: OscillatorType = "sine",
  ) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(3600, startTime);

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    // Micro attack (4ms) to eliminate audio clicks, then natural exponential decay
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  /**
   * Diverse Cute Pokes: 5 randomly alternating sound profiles
   */
  public playPoke() {
    const ctx = this.getContext();
    if (!ctx) return;

    // Pick non-repeating random poke variant
    let index = Math.floor(Math.random() * 5);
    if (index === this.lastPokeIndex) {
      index = (index + 1) % 5;
    }
    this.lastPokeIndex = index;

    try {
      const now = ctx.currentTime;

      switch (index) {
        // 1. Warm Marimba/Kalimba Pop (gentle wooden chime)
        case 0: {
          this.playWarmTone(ctx, 587.33, now, 0.16, 0.14, "sine"); // D5
          this.playWarmTone(ctx, 1174.66, now, 0.12, 0.05, "triangle"); // D6 overtone
          break;
        }

        // 2. Playful Water Drop / Bubble Bloop
        case 1: {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          filter.type = "lowpass";
          filter.frequency.setValueAtTime(2800, now);

          osc.type = "sine";
          osc.frequency.setValueAtTime(420, now);
          osc.frequency.exponentialRampToValueAtTime(960, now + 0.09);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.15, now + 0.005);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.16);
          break;
        }

        // 3. Crystal Music Box Note (sweet high celesta)
        case 2: {
          this.playWarmTone(ctx, 880, now, 0.22, 0.11, "triangle"); // A5
          this.playWarmTone(ctx, 1318.51, now + 0.03, 0.18, 0.08, "sine"); // E6
          break;
        }

        // 4. Shy Anime Vocal Chirp (rising two-tone chirp)
        case 3: {
          this.playWarmTone(ctx, 659.25, now, 0.09, 0.12, "sine"); // E5
          this.playWarmTone(ctx, 987.77, now + 0.06, 0.14, 0.13, "sine"); // B5
          break;
        }

        // 5. Delicate Star Sparkle Ping (soft glockenspiel)
        case 4:
        default: {
          this.playWarmTone(ctx, 1046.5, now, 0.2, 0.1, "sine"); // C6
          this.playWarmTone(ctx, 1567.98, now + 0.02, 0.16, 0.06, "triangle"); // G6
          break;
        }
      }
    } catch {
      // Audio fallback
    }
  }

  /**
   * Diverse Dialogue Chimes: 4 dreamy anime arpeggios & chords
   */
  public playChime() {
    const ctx = this.getContext();
    if (!ctx) return;

    let index = Math.floor(Math.random() * 4);
    if (index === this.lastChimeIndex) {
      index = (index + 1) % 4;
    }
    this.lastChimeIndex = index;

    try {
      const now = ctx.currentTime;

      switch (index) {
        // 1. Fairy Wish Arpeggio (C5 -> E5 -> G5 -> C6 ascending celesta)
        case 0: {
          const notes = [523.25, 659.25, 783.99, 1046.5];
          notes.forEach((freq, idx) => {
            const start = now + idx * 0.05;
            this.playWarmTone(ctx, freq, start, 0.28, 0.07, "triangle");
            this.playWarmTone(ctx, freq * 1.5, start, 0.18, 0.025, "sine");
          });
          break;
        }

        // 2. Sweet Lullaby Duo (Soft peaceful third-interval chord)
        case 1: {
          this.playWarmTone(ctx, 659.25, now, 0.35, 0.07, "triangle"); // E5
          this.playWarmTone(ctx, 783.99, now + 0.03, 0.35, 0.07, "sine"); // G5
          this.playWarmTone(ctx, 1046.5, now + 0.12, 0.32, 0.08, "triangle"); // C6
          break;
        }

        // 3. Starlight Glissando (D5 -> G5 -> B5 -> D6 cheerful breeze)
        case 2: {
          const notes = [587.33, 783.99, 987.77, 1174.66];
          notes.forEach((freq, idx) => {
            const start = now + idx * 0.045;
            this.playWarmTone(ctx, freq, start, 0.25, 0.065, "sine");
          });
          break;
        }

        // 4. Romantic Music Box Chime (A5 -> C#6 -> E6 sparkling shoujo anime chime)
        case 3:
        default: {
          const notes = [880.0, 1108.73, 1318.51];
          notes.forEach((freq, idx) => {
            const start = now + idx * 0.06;
            this.playWarmTone(ctx, freq, start, 0.3, 0.07, "triangle");
          });
          break;
        }
      }
    } catch {
      // Audio fallback
    }
  }

  /**
   * Dizzy Wobble Chirp (@.@)
   */
  public playDizzy() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2200, ctx.currentTime);

      osc.type = "sine";
      const now = ctx.currentTime;

      // Wobbly oscillating cartoon pitch
      osc.frequency.setValueAtTime(480, now);
      for (let i = 0; i < 6; i++) {
        const t = now + i * 0.06;
        osc.frequency.linearRampToValueAtTime(i % 2 === 0 ? 640 : 390, t);
      }

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // Audio fallback
    }
  }

  /**
   * Playful Soft Pop
   */
  public playBounce() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      this.playWarmTone(ctx, 440, ctx.currentTime, 0.15, 0.1, "sine");
    } catch {
      // Audio fallback
    }
  }
}

export const sawakoSound = new SawakoSoundManager();

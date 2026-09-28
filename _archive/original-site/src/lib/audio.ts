// Synthesized Web Audio API sound designer for zero-latency, tactile interactive feedback

let audioCtx: AudioContext | null = null;
let isMuted: boolean = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const SoundEngine = {
  get isMuted() {
    return isMuted;
  },

  setMuted(muted: boolean) {
    isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('kinetik_sound_muted', muted ? '1' : '0');
    }
  },

  toggleMute(): boolean {
    isMuted = !isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('kinetik_sound_muted', isMuted ? '1' : '0');
    }
    if (!isMuted) {
      this.playTick();
    }
    return isMuted;
  },

  initFromStorage() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kinetik_sound_muted');
      if (stored !== null) {
        isMuted = stored === '1';
      }
    }
  },

  playTick(frequency = 1200) {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(frequency * 0.4, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // AudioContext might be blocked until user gesture
    }
  },

  playHover() {
    if (isMuted) return;
    this.playTick(1600);
  },

  playSwoosh() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(480, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch {
      // Silence
    }
  },

  playBlast() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      // Sub-bass hit
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(32, ctx.currentTime + 0.4);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.42);

      // Shimmer accent
      const chime = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      chime.type = 'sine';
      chime.frequency.setValueAtTime(880, ctx.currentTime);
      chime.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.3);

      chimeGain.gain.setValueAtTime(0.04, ctx.currentTime);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);

      chime.connect(chimeGain);
      chimeGain.connect(ctx.destination);
      chime.start();
      chime.stop(ctx.currentTime + 0.32);
    } catch {
      // Silence
    }
  },

  playLightningThunder() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // 1. Sharp electric crack (white noise burst)
      const bufferSize = Math.floor(ctx.sampleRate * 0.12);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.025));
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.1);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.22, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      whiteNoise.start(now);

      // 2. Electric arc zaps (rapidly frequency modulated oscillator)
      const zapOsc = ctx.createOscillator();
      const zapGain = ctx.createGain();
      zapOsc.type = 'sawtooth';
      zapOsc.frequency.setValueAtTime(980, now);
      zapOsc.frequency.exponentialRampToValueAtTime(65, now + 0.18);

      zapGain.gain.setValueAtTime(0.15, now);
      zapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

      zapOsc.connect(zapGain);
      zapGain.connect(ctx.destination);
      zapOsc.start(now);
      zapOsc.stop(now + 0.22);

      // 3. Deep rolling thunder reverberation (low frequency rumble)
      const thunderOsc = ctx.createOscillator();
      const thunderGain = ctx.createGain();
      thunderOsc.type = 'triangle';
      thunderOsc.frequency.setValueAtTime(80, now + 0.04);
      thunderOsc.frequency.exponentialRampToValueAtTime(34, now + 0.9);

      thunderGain.gain.setValueAtTime(0.001, now);
      thunderGain.gain.exponentialRampToValueAtTime(0.18, now + 0.06);
      thunderGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);

      thunderOsc.connect(thunderGain);
      thunderGain.connect(ctx.destination);
      thunderOsc.start(now);
      thunderOsc.stop(now + 1.15);
    } catch {
      // AudioContext might be blocked until gesture
    }
  },

  playVoicenote() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      // Play an elegant ambient harmonic chord
      const freqs = [330, 440, 554.37, 659.25];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);

        gain.gain.setValueAtTime(0.02, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + 1.3);
      });
    } catch {
      // Silence
    }
  }
};

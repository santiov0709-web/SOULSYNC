let audioCtx = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const playSound = (type) => {
  try {
    const ctx = initAudio();
    const now = ctx.currentTime;

    if (type === 'pop') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } 
    else if (type === 'sparkle') {
      const freqs = [880, 1108, 1318, 1760]; // Romantic A major arpeggio
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = f;
        const startTime = now + i * 0.05;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.1, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
        osc.start(startTime);
        osc.stop(startTime + 0.3);
      });
    }
    else if (type === 'heartbeat') {
      const playBeat = (time, intensity) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(55, time);
        osc.frequency.exponentialRampToValueAtTime(35, time + 0.15);
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(intensity, time + 0.05);
        gain.gain.linearRampToValueAtTime(0, time + 0.2);
        osc.start(time);
        osc.stop(time + 0.25);
      };
      playBeat(now, 0.8);
      playBeat(now + 0.25, 0.6);
    }
  } catch (e) {
    console.warn("Audio playback failed", e);
  }
};

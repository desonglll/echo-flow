// Web Audio Synth to create high fidelity sound cues
export const playSynthSound = (freqs: number[], duration: number = 0.1, type: OscillatorType = 'sine') => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    freqs.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.value = freq;
      
      const startTime = ctx.currentTime + (index * 0.08);
      const endTime = startTime + duration;
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, endTime);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(endTime + 0.05);
    });
  } catch (e) {
    console.warn("Audio Context blocked: ", e);
  }
};

// Helper to parse "MM:SS.SS" timestamps into numbers representing total seconds
export const parseTimestamp = (timeStr: string) => {
  const parts = timeStr.split(':');
  const minutes = parseInt(parts[0], 10);
  const seconds = parseFloat(parts[1]);
  return minutes * 60 + seconds;
};

// Convert array of wave values into a smooth Bezier SVG path
export const getPathFromPoints = (points: number[]) => {
  const width = 100;
  const step = width / (points.length - 1);
  let path = `M 0 ${points[0]}`;
  for (let i = 1; i < points.length; i++) {
    const x = i * step;
    const y = points[i];
    const prevX = (i - 1) * step;
    const prevY = points[i - 1];
    const cpX = prevX + step / 2;
    path += ` C ${cpX} ${prevY}, ${cpX} ${y}, ${x} ${y}`;
  }
  return path;
};

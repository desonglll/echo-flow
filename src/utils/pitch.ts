import type { WordItem } from '../types';
import { getPathFromPoints } from './audio';

export interface PitchMarker {
  wordIndex: number;
  wordText: string;
  x: number;
  y: number;
  type: 'flat' | 'high' | 'low' | 'correct';
  text: string;
  tip: string;
}

const FUNCTION_WORDS = new Set([
  'the', 'of', 'and', 'will', 'we', 'can', 'with', 'this', 'to', 'our', 'for', 'a', 'in',
  'is', 'are', 'was', 'were', 'that', 'it', 'its', 'as', 'at', 'by', 'an', 'be', 'or', 'on', 'about'
]);

export const generatePitchData = (words: WordItem[]) => {
  const N = words.length;
  if (N === 0) {
    return {
      nativePitchPath: '',
      userPitchPath: '',
      pitchMarkers: [] as PitchMarker[]
    };
  }

  const M = 40; // Number of points in the F0 curve
  const nativePoints: number[] = [];
  const userPoints: number[] = [];
  const pitchMarkers: PitchMarker[] = [];

  // Step 1: Generate native target F0 pitch points (low y is high pitch, high y is low pitch)
  for (let j = 0; j < M; j++) {
    const wIdx = Math.min(Math.floor((j / M) * N), N - 1);
    const word = words[wIdx];
    const cleanWord = word.text.toLowerCase().replace(/[^a-z]/g, '');
    
    // Default F0 height (y goes from 0 at top to 24 at bottom in viewBox)
    let nativeY = 12; // Middle range
    
    if (FUNCTION_WORDS.has(cleanWord)) {
      nativeY = 15; // Low pitch for function words
    } else {
      nativeY = 7; // High pitch for content words (stressed vowels)
    }

    // Add natural phrase curve shape:
    // Sentence-initial rise (first 15% of points)
    const progress = j / M;
    if (progress < 0.15) {
      const factor = progress / 0.15;
      nativeY = 12 * (1 - factor) + nativeY * factor;
    }
    // Sentence-final drop (last 15% of points)
    if (progress > 0.85) {
      const factor = (progress - 0.85) / 0.15;
      // Intonation drops to low pitch (y = 17) at declarative sentence ends
      nativeY = nativeY * (1 - factor) + 17 * factor;
    }

    nativePoints.push(nativeY);
  }

  // Smooth the points with moving average box filter
  const smoothPoints = (pts: number[], passes: number = 3) => {
    let smoothed = [...pts];
    for (let p = 0; p < passes; p++) {
      const temp = [...smoothed];
      for (let i = 1; i < temp.length - 1; i++) {
        temp[i] = (smoothed[i - 1] + smoothed[i] + smoothed[i + 1]) / 3;
      }
      smoothed = temp;
    }
    return smoothed;
  };

  const smoothedNativePoints = smoothPoints(nativePoints, 3);

  // Step 2: Generate user F0 points (mirror native but add errors/deviations based on word items)
  for (let j = 0; j < M; j++) {
    const wIdx = Math.min(Math.floor((j / M) * N), N - 1);
    const word = words[wIdx];
    const nativeY = smoothedNativePoints[j];
    
    let userY = nativeY;

    if (word.accuracy === 'average' || word.accuracy === 'poor') {
      if (word.type === 'flat') {
        // Flat intonation: lock user pitch to a static horizontal line
        userY = 13.5;
      } else if (word.type === 'liaison') {
        // Liaison pitch crack: introduce a break/dip
        userY = nativeY + 4; // Shift lower
      } else if (wIdx === N - 1) {
        // Sentence-final word intonation error: rising tone instead of falling
        const progressInWord = (j % (M / N)) / (M / N);
        // Instead of falling, make it rise (smaller y value)
        userY = 12 - (progressInWord * 6);
      } else {
        // General poor articulation deviation: add high jitter or shift
        userY = nativeY + (Math.sin(j) * 2);
      }
    } else {
      // Good matches get a realistic slight variance
      const variance = Math.sin(j * 1.5) * 0.4;
      userY = nativeY + variance;
    }

    userPoints.push(userY);
  }

  const smoothedUserPoints = smoothPoints(userPoints, 2);

  // Step 3: Generate specific coaching pitch markers
  words.forEach((word, idx) => {
    const x = ((idx + 0.5) / N) * 100;
    
    // Find corresponding y in smoothedUserPoints
    const ptIdx = Math.min(Math.floor(((idx + 0.5) / N) * M), M - 1);
    const y = smoothedUserPoints[ptIdx];

    if (word.accuracy === 'poor' || word.accuracy === 'average') {
      if (word.type === 'flat') {
        pitchMarkers.push({
          wordIndex: idx,
          wordText: word.text,
          x,
          y,
          type: 'flat',
          text: 'Flat ➔',
          tip: `"${word.text}": Your pitch was flat. Try emphasizing the stressed syllable by raising your tone.`
        });
      } else if (word.type === 'liaison') {
        pitchMarkers.push({
          wordIndex: idx,
          wordText: word.text,
          x,
          y: Math.min(y + 2, 22), // offset marker slightly below
          type: 'low',
          text: 'Break ⤈',
          tip: `"${word.text}": Liaison mismatch. Maintain vocal energy and slide pitch smoothly to link consonants.`
        });
      } else if (idx === N - 1) {
        pitchMarkers.push({
          wordIndex: idx,
          wordText: word.text,
          x,
          y: Math.max(y - 2, 2), // offset marker slightly above
          type: 'high',
          text: 'Rising ↗',
          tip: `"${word.text}": Incorrect rising intonation. Declarative sentences should end with a falling tone (↘) to sound natural.`
        });
      } else {
        pitchMarkers.push({
          wordIndex: idx,
          wordText: word.text,
          x,
          y,
          type: 'low',
          text: 'Unsteady ∿',
          tip: `"${word.text}": Tone is unstable here. Focus on breath support and keeping your vocal chords steady.`
        });
      }
    } else if (word.type === 'liaison' && word.accuracy === 'good') {
      // Highlight successfully performed liaisons!
      pitchMarkers.push({
        wordIndex: idx,
        wordText: word.text,
        x,
        y,
        type: 'correct',
        text: 'Liaison ✓',
        tip: `"${word.text}": Excellent smooth pitch link! Very natural transition.`
      });
    }
  });

  return {
    nativePitchPath: getPathFromPoints(smoothedNativePoints),
    userPitchPath: getPathFromPoints(smoothedUserPoints),
    pitchMarkers
  };
};

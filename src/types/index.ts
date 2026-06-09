export interface WordItem {
  text: string;
  type: 'perfect' | 'liaison' | 'flat' | 'none';
  ipa: string;
  tip: string;
  definition: string;
  timestamp: string; // timestamp for podcast visual alignment
  accuracy: 'good' | 'average' | 'poor';
}

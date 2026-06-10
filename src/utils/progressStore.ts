// ─── EchoFlow Progress Persistence Engine ───
// Saves user progress (XP, level, streaks, sessions) to localStorage

const STORAGE_KEY = 'echoflow_progress';
const STARRED_KEY = 'echoflow_starred_words';

// Level thresholds: XP required to reach each level (index = level)
export const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500];
export const LEVEL_TITLES = [
  "Novice",      // 0
  "Beginner",    // 1
  "Speaker",     // 2
  "Articulator", // 3
  "Fluent",      // 4
  "Orator",      // 5
  "Virtuoso",    // 6
  "Master",      // 7
  "Legend",       // 8
  "Godlike"      // 9
];

export interface UserProgress {
  xp: number;
  level: number;
  totalSessions: number;
  streakDays: number;
  lastPracticeDate: string; // ISO date string (YYYY-MM-DD)
  streakCalendar: string[]; // Array of ISO date strings
  bestScore: number;
  wordsLearned: string[];   // All words ever starred
}

const DEFAULT_PROGRESS: UserProgress = {
  xp: 0,
  level: 0,
  totalSessions: 0,
  streakDays: 0,
  lastPracticeDate: '',
  streakCalendar: [],
  bestScore: 0,
  wordsLearned: []
};

// ─── Core CRUD ───

export const loadProgress = (): UserProgress => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<UserProgress>;
      return { ...DEFAULT_PROGRESS, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to load progress from localStorage:', e);
  }
  return { ...DEFAULT_PROGRESS };
};

export const saveProgress = (progress: UserProgress): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn('Failed to save progress to localStorage:', e);
  }
};

// ─── Starred Words Persistence ───

export const loadStarredWords = (): string[] => {
  try {
    const raw = localStorage.getItem(STARRED_KEY);
    if (raw) {
      return JSON.parse(raw) as string[];
    }
  } catch (e) {
    console.warn('Failed to load starred words:', e);
  }
  return [];
};

export const saveStarredWords = (words: string[]): void => {
  try {
    localStorage.setItem(STARRED_KEY, JSON.stringify(words));
  } catch (e) {
    console.warn('Failed to save starred words:', e);
  }
};

// ─── Level Calculation ───

export const getLevelFromXP = (xp: number): number => {
  let level = 0;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i;
      break;
    }
  }
  return level;
};

export const getXPForNextLevel = (level: number): number => {
  if (level + 1 < LEVEL_THRESHOLDS.length) {
    return LEVEL_THRESHOLDS[level + 1];
  }
  return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]; // Max level
};

export const getLevelProgress = (xp: number, level: number): number => {
  const currentThreshold = LEVEL_THRESHOLDS[level] || 0;
  const nextThreshold = getXPForNextLevel(level);
  const range = nextThreshold - currentThreshold;
  if (range <= 0) return 1; // Max level
  return Math.min((xp - currentThreshold) / range, 1);
};

// ─── Session Recording ───

const getTodayISO = (): string => {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
};

const getYesterdayISO = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

export interface SessionResult {
  xpEarned: number;
  newLevel: number;
  previousLevel: number;
  leveledUp: boolean;
  newStreak: number;
  isNewBest: boolean;
}

export const recordSession = (
  progress: UserProgress,
  score: number
): { updatedProgress: UserProgress; result: SessionResult } => {
  const today = getTodayISO();
  const yesterday = getYesterdayISO();

  // Calculate XP reward: score * 0.4, minimum 10 XP per session
  const xpEarned = Math.max(10, Math.round(score * 0.4));
  const previousLevel = progress.level;
  const newXP = progress.xp + xpEarned;
  const newLevel = getLevelFromXP(newXP);
  const leveledUp = newLevel > previousLevel;

  // Update streak
  let newStreak = progress.streakDays;
  if (progress.lastPracticeDate === today) {
    // Already practiced today, streak stays the same
  } else if (progress.lastPracticeDate === yesterday) {
    // Continued streak from yesterday
    newStreak += 1;
  } else if (progress.lastPracticeDate === '') {
    // First ever session
    newStreak = 1;
  } else {
    // Streak broken (missed a day)
    newStreak = 1;
  }

  // Update calendar (last 30 days max)
  const newCalendar = [...progress.streakCalendar];
  if (!newCalendar.includes(today)) {
    newCalendar.push(today);
  }
  // Keep only last 30 entries
  while (newCalendar.length > 30) {
    newCalendar.shift();
  }

  // Update best score
  const isNewBest = score > progress.bestScore;

  // Merge learned words
  const updatedProgress: UserProgress = {
    xp: newXP,
    level: newLevel,
    totalSessions: progress.totalSessions + 1,
    streakDays: newStreak,
    lastPracticeDate: today,
    streakCalendar: newCalendar,
    bestScore: isNewBest ? score : progress.bestScore,
    wordsLearned: progress.wordsLearned
  };

  const result: SessionResult = {
    xpEarned,
    newLevel,
    previousLevel,
    leveledUp,
    newStreak,
    isNewBest
  };

  return { updatedProgress, result };
};

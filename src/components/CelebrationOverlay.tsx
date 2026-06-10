import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Zap, Flame, ChevronRight, Star } from 'lucide-react';
import { LEVEL_TITLES } from '../utils/progressStore';

interface CelebrationOverlayProps {
  score: number;
  xpEarned: number;
  level: number;
  leveledUp: boolean;
  previousLevel: number;
  streak: number;
  isNewBest: boolean;
  onContinue: () => void;
}

// Individual confetti particle
interface ConfettiPiece {
  id: number;
  left: number;     // % from left
  delay: number;     // animation delay in ms
  duration: number;  // animation duration in ms
  size: number;      // px
  color: string;
  shape: 'square' | 'circle' | 'triangle';
  rotation: number;  // initial rotation deg
  swayAmount: number; // horizontal sway range in px
}

const CONFETTI_COLORS = [
  '#10b981', '#34d399', '#6ee7b7', // emerald
  '#f59e0b', '#fbbf24', '#fcd34d', // amber/gold
  '#818cf8', '#a78bfa',            // violet
  '#ffffff', '#e4e4e7',            // white
  '#f472b6',                        // pink
];

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
  score,
  xpEarned,
  level,
  leveledUp,
  previousLevel: _previousLevel,
  streak,
  isNewBest,
  onContinue
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showXP, setShowXP] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [ringProgress, setRingProgress] = useState(0);

  // Generate confetti pieces deterministically
  const confettiPieces: ConfettiPiece[] = useMemo(() => {
    return Array.from({ length: 65 }, (_, i) => ({
      id: i,
      left: (i * 17 + 7) % 100,
      delay: (i * 43) % 2000,
      duration: 2200 + (i * 37) % 1800,
      size: 4 + (i * 13) % 8,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      shape: (['square', 'circle', 'triangle'] as const)[i % 3],
      rotation: (i * 67) % 360,
      swayAmount: 20 + (i * 11) % 40
    }));
  }, []);

  // Staggered reveal animations
  useEffect(() => {
    // Score count-up
    const duration = 1000;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress * (2 - progress); // ease-out quad
      setAnimatedScore(Math.floor(eased * score));
      setRingProgress(eased * (score / 100));
      if (progress < 1) requestAnimationFrame(animate);
      else {
        setAnimatedScore(score);
        setRingProgress(score / 100);
      }
    };
    requestAnimationFrame(animate);

    // XP pop after 600ms
    const t1 = setTimeout(() => setShowXP(true), 600);
    // Stats after 1000ms
    const t2 = setTimeout(() => setShowStats(true), 1000);
    // Button after 1400ms
    const t3 = setTimeout(() => setShowButton(true), 1400);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [score]);

  // SVG ring dimensions
  const ringRadius = 58;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - ringProgress);

  // Score color
  const scoreColor = score >= 90 ? '#10b981' : score >= 70 ? '#f59e0b' : '#ef4444';
  const scoreLabel = score >= 90 ? 'Excellent!' : score >= 70 ? 'Good Job!' : 'Keep Practicing!';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-xl" />

      {/* Confetti Layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confettiPieces.map((piece) => (
          <div
            key={piece.id}
            className="absolute animate-confetti-fall"
            style={{
              left: `${piece.left}%`,
              top: '-20px',
              animationDelay: `${piece.delay}ms`,
              animationDuration: `${piece.duration}ms`,
              '--sway': `${piece.swayAmount}px`,
            } as React.CSSProperties}
          >
            {piece.shape === 'circle' ? (
              <div
                className="rounded-full"
                style={{
                  width: piece.size,
                  height: piece.size,
                  backgroundColor: piece.color,
                  transform: `rotate(${piece.rotation}deg)`,
                }}
              />
            ) : piece.shape === 'triangle' ? (
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: `${piece.size / 2}px solid transparent`,
                  borderRight: `${piece.size / 2}px solid transparent`,
                  borderBottom: `${piece.size}px solid ${piece.color}`,
                  transform: `rotate(${piece.rotation}deg)`,
                }}
              />
            ) : (
              <div
                style={{
                  width: piece.size,
                  height: piece.size,
                  backgroundColor: piece.color,
                  transform: `rotate(${piece.rotation}deg)`,
                  borderRadius: '1px',
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Level-up golden burst */}
      {leveledUp && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="animate-level-burst rounded-full" style={{
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, rgba(251, 191, 36, 0.05) 40%, transparent 70%)',
          }} />
        </div>
      )}

      {/* Main Content Card */}
      <div className="relative z-10 flex flex-col items-center gap-5 max-w-[360px] w-full mx-4">

        {/* Score Ring */}
        <div className="relative w-[150px] h-[150px] flex items-center justify-center">
          {/* Outer glow pulse */}
          <div className="absolute inset-0 rounded-full" style={{
            boxShadow: `0 0 40px ${scoreColor}33, 0 0 80px ${scoreColor}11`,
          }} />

          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 130 130">
            {/* Background ring */}
            <circle cx="65" cy="65" r={ringRadius} fill="none" stroke="#27272a" strokeWidth="6" />
            {/* Progress ring */}
            <circle
              cx="65" cy="65" r={ringRadius}
              fill="none"
              stroke={scoreColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={ringCircumference}
              strokeDashoffset={ringOffset}
              style={{ transition: 'stroke-dashoffset 0.1s linear', filter: `drop-shadow(0 0 6px ${scoreColor}66)` }}
            />
          </svg>

          {/* Center content */}
          <div className="relative flex flex-col items-center gap-0">
            <span className="text-4xl font-black text-white font-mono" style={{ textShadow: `0 0 20px ${scoreColor}44` }}>
              {animatedScore}%
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest font-mono" style={{ color: scoreColor }}>
              {scoreLabel}
            </span>
          </div>
        </div>

        {/* XP Reward Pop */}
        {showXP && (
          <div className="animate-xp-pop flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-5 py-2.5 shadow-lg shadow-emerald-500/10">
              <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400/30" />
              <span className="text-xl font-black text-emerald-400 font-mono">+{xpEarned} XP</span>
            </div>

            {/* Level-up badge */}
            {leveledUp && (
              <div className="animate-xp-pop flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 rounded-full px-4 py-2 shadow-lg shadow-amber-500/10" style={{ animationDelay: '200ms' }}>
                <Trophy className="w-4 h-4 text-amber-400 fill-amber-400/30" />
                <span className="text-sm font-black text-amber-400">
                  Level Up! → Lv.{level} {LEVEL_TITLES[level]}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Stats Row */}
        {showStats && (
          <div className="animate-slide-up flex items-center justify-center gap-3 w-full">
            {/* Streak */}
            <div className="flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-800 rounded-xl px-3 py-2 shadow-md">
              <Flame className="w-4 h-4 text-orange-400 animate-streak-flame" />
              <div className="flex flex-col">
                <span className="text-xs font-black text-white font-mono">{streak} Day{streak !== 1 ? 's' : ''}</span>
                <span className="text-[8px] text-zinc-500 uppercase tracking-wider font-bold">Streak</span>
              </div>
            </div>

            {/* New Best */}
            {isNewBest && (
              <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2 shadow-md">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <div className="flex flex-col">
                  <span className="text-xs font-black text-amber-400 font-mono">New Best!</span>
                  <span className="text-[8px] text-zinc-500 uppercase tracking-wider font-bold">Record</span>
                </div>
              </div>
            )}

            {/* Level */}
            {!leveledUp && (
              <div className="flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-800 rounded-xl px-3 py-2 shadow-md">
                <Trophy className="w-4 h-4 text-emerald-400" />
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white font-mono">Lv.{level}</span>
                  <span className="text-[8px] text-zinc-500 uppercase tracking-wider font-bold">{LEVEL_TITLES[level]}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Continue Button */}
        {showButton && (
          <button
            onClick={onContinue}
            className="animate-slide-up w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-sm transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.03] hover:-translate-y-0.5 flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 mt-2"
          >
            Next Drill
            <ChevronRight className="w-4.5 h-4.5" />
          </button>
        )}
      </div>
    </div>
  );
};

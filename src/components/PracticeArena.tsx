import React, { useState, useEffect } from 'react';
import { Mic, RotateCcw } from 'lucide-react';
import type { WordItem } from '../types';
import { parseTimestamp, getPathFromPoints } from '../utils/audio';

interface PracticeArenaProps {
  shadowState: 'ready' | 'recording' | 'analyzing' | 'result';
  recordingMillis: number;
  recordLimitPercent: number;
  currentActiveWordIndex: number;
  activeAudioWord: number | null;
  selectedWordIndex: number | null;
  slideTranslateX: number;
  wavePoints: number[];
  analyzingProgress: number;
  analyzingMessage: string;
  transcriptWords: WordItem[];
  handleWordClick: (e: React.MouseEvent<HTMLButtonElement>, item: WordItem, index: number, cardId: number) => void;
  handleMainActionClick: () => void;
  nativeReferencePath: string;
  userResultPath: string;
}

export const PracticeArena: React.FC<PracticeArenaProps> = ({
  shadowState,
  recordingMillis,
  recordLimitPercent,
  currentActiveWordIndex,
  activeAudioWord,
  selectedWordIndex,
  slideTranslateX,
  wavePoints,
  analyzingProgress,
  analyzingMessage,
  transcriptWords,
  handleWordClick,
  handleMainActionClick,
  nativeReferencePath,
  userResultPath
}) => {
  const [isLargeScreen, setIsLargeScreen] = useState(true);
  const transcriptContainerRef = React.useRef<HTMLDivElement>(null);
  const activeWordRef = React.useRef<HTMLSpanElement>(null);
  const activeIdx = shadowState === 'recording' ? currentActiveWordIndex : activeAudioWord;

  useEffect(() => {
    const checkScreen = () => setIsLargeScreen(window.innerWidth >= 1024);
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  useEffect(() => {
    if (activeIdx !== null && activeIdx !== -1 && transcriptContainerRef.current && activeWordRef.current) {
      const container = transcriptContainerRef.current;
      const element = activeWordRef.current;
      
      const containerHeight = container.clientHeight;
      const elementTop = element.offsetTop;
      const elementHeight = element.clientHeight;
      
      const targetScrollTop = elementTop - (containerHeight / 2) + (elementHeight / 2);
      
      container.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: 'smooth'
      });
    }
  }, [activeIdx]);

  return (
    <div className="h-auto lg:h-[200vh] relative w-full border-b border-[#222226]/20 py-12 lg:py-0">
      <div className="relative lg:sticky lg:top-0 h-auto lg:h-screen w-full flex items-center justify-center px-4 sm:px-6 lg:px-12 py-6 lg:py-0 overflow-visible lg:overflow-hidden">
        
        {/* Grid Container for Left Content and Right sliding-in recorder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-[1400px] items-center relative">
          
          {/* Left Column - Transcript Material */}
          <div className="premium-card premium-card-emerald rounded-2xl p-8 flex flex-col gap-6 shadow-2xl relative h-[450px]">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-4 shrink-0">
              <div className="flex flex-col gap-1">
                {shadowState === 'recording' ? (
                  <>
                    <span className="text-[11px] tracking-[0.2em] text-red-400 font-extrabold uppercase font-mono flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-red-500 rounded-full inline-block animate-pulse" />
                      ASR DECODER ACTIVE
                    </span>
                    <h2 className="text-base font-bold text-zinc-100">Real-time Recognition Feed</h2>
                  </>
                ) : (
                  <>
                    <span className="text-[11px] tracking-[0.2em] text-[#10b981] font-extrabold uppercase font-mono">STEP 01 / target text</span>
                    <h2 className="text-base font-bold text-zinc-100">Speech Target Material</h2>
                  </>
                )}
              </div>
              {shadowState === 'recording' ? (
                <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-300 bg-zinc-950 px-2.5 py-0.5 border border-zinc-800 rounded-lg">
                  <span className="text-[#10b981] font-extrabold">16KHz</span>
                  <span className="text-zinc-700">|</span>
                  <span>ACCURACY CODED</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-300 bg-zinc-950 px-2.5 py-0.5 border border-zinc-800 rounded-lg">
                  <span>TIMELINE ACTIVE</span>
                </div>
              )}
            </div>

            {/* Podcast Timed Transcript Layout */}
            <div ref={transcriptContainerRef} className="flex-1 py-2 overflow-y-auto no-scrollbar flex items-start gap-4 pr-2 select-text max-h-[280px] relative">
              
              {/* Podcasting Line Timestamps */}
              <div className="flex flex-col gap-[34px] text-[11px] font-mono text-zinc-400 w-12 pt-1 shrink-0 border-r border-zinc-800 pr-3.5">
                <div className="h-6 flex items-center justify-end">00:00</div>
                <div className="h-6 flex items-center justify-end">00:03</div>
                <div className="h-6 flex items-center justify-end">00:07</div>
                <div className="h-6 flex items-center justify-end">00:10</div>
                <div className="h-6 flex items-center justify-end">00:13</div>
              </div>

              {/* Words Paragraph (Lora Serif size, spacing, and bold contrast) */}
              <div className="flex-1 leading-[3.3rem] tracking-wide text-[24px] font-serif font-bold text-zinc-100 text-left">
                {transcriptWords.map((item, idx) => {
                  const isSelected = selectedWordIndex === idx;
                  
                  // Default styling with premium springy hover transformations
                  let textClass = "text-zinc-100 hover:text-white hover:bg-[#27272a] hover:scale-105 hover:-translate-y-0.5 active:scale-95 px-2 py-0.5 rounded cursor-pointer transition-all duration-350 ease-out transform inline-block";
                  
                  // Highlight logic during active recording
                  if (shadowState === 'recording') {
                    const wordTime = parseTimestamp(item.timestamp);
                    const isSpoken = recordingMillis >= wordTime;
                    const isActive = idx === currentActiveWordIndex;
                    
                    if (isActive) {
                      // Currently speaking word: active glow with spring pop
                      textClass = "text-white bg-zinc-850 px-2 py-0.5 rounded cursor-pointer ring-2 ring-emerald-450 shadow-[0_0_15px_rgba(16,185,129,0.35)] font-bold transition-all duration-300 ease-out inline-block animate-active-pop";
                    } else if (isSpoken) {
                      // Already spoken: accuracy color coding (Duolingo-inspired high contrast)
                      if (item.accuracy === 'good') {
                        textClass = "text-[#58cc02] bg-[#58cc02]/15 px-2 py-0.5 rounded cursor-pointer border-b-2 border-[#58cc02] font-black inline-block";
                      } else if (item.accuracy === 'average') {
                        textClass = "text-[#ff9600] bg-[#ff9600]/15 px-2 py-0.5 rounded cursor-pointer border-b-2 border-dashed border-[#ff9600] font-black inline-block";
                      } else {
                        textClass = "text-[#ea2b2b] bg-[#ea2b2b]/15 px-2 py-0.5 rounded cursor-pointer border-b-2 border-dotted border-[#ea2b2b] font-black inline-block";
                      }
                    } else {
                      // Future upcoming words: dimmed but readable without blur
                      textClass = "text-zinc-500 opacity-50 px-2 py-0.5 rounded cursor-not-allowed transition-all duration-300 inline-block";
                    }
                  }

                  if (isSelected) {
                    if (item.type === 'liaison') {
                      textClass += " ring-2 ring-[#fbbf24]/50 bg-[#fbbf24]/10 shadow-[0_0_12px_rgba(251,191,36,0.15)]";
                    } else {
                      textClass += " ring-2 ring-zinc-750 bg-zinc-850 shadow-[0_0_10px_rgba(255,255,255,0.04)] text-white";
                    }
                  }

                  return (
                    <span key={idx} ref={idx === activeIdx ? activeWordRef : null} className="relative inline-block mx-0.5">
                      <button
                        onClick={(e) => handleWordClick(e, item, idx, 1)}
                        disabled={shadowState === 'recording'}
                        className={`${textClass} focus:outline-none`}
                      >
                        {item.text}
                        {shadowState === 'recording' && idx === currentActiveWordIndex && (
                          <span className="relative inline-flex h-2 w-2 ml-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]"></span>
                          </span>
                        )}
                      </button>

                      {/* Speech Wave Ripple Indicator */}
                      {activeAudioWord === idx && (
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#10b981]"></span>
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Live ASR Telemetry Console */}
            {shadowState === 'recording' ? (
              <div className="mt-2 bg-[#121214]/90 border border-zinc-800/80 rounded-xl p-3 flex flex-col gap-2 font-sans text-left animate-slide-up shrink-0">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-extrabold font-mono">ASR Engine Live Feed</span>
                  <span className="text-[11px] text-[#10b981] font-bold flex items-center gap-1.5 font-mono">
                    <span className="w-1.5 h-1.5 bg-[#10b981] rounded-full inline-block animate-pulse" />
                    <span className="text-zinc-300">STREAMING DECODE</span>
                    <div className="flex items-center gap-0.5 h-2.5">
                      <div className="w-0.5 h-full bg-[#10b981] rounded-full animate-audio-bar-1" />
                      <div className="w-0.5 h-full bg-[#10b981] rounded-full animate-audio-bar-2" />
                      <div className="w-0.5 h-full bg-[#10b981] rounded-full animate-audio-bar-3" />
                    </div>
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 items-center min-h-6">
                  {currentActiveWordIndex >= 0 ? (
                    transcriptWords.slice(0, currentActiveWordIndex + 1).map((w, wIdx) => {
                      const isLast = wIdx === currentActiveWordIndex;
                      return (
                        <span 
                          key={wIdx} 
                          className={`px-2 py-0.5 rounded-md text-[12px] font-medium font-sans transition-all duration-300 ${
                            isLast 
                              ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 shadow-[0_0_12px_rgba(16,185,129,0.25)] animate-word-pop' 
                              : 'bg-zinc-900/60 text-zinc-300 border border-zinc-800/40'
                          }`}
                        >
                          {w.text}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-zinc-400 italic text-[12px] font-sans">Listening for speech tokens...</span>
                  )}
                </div>
              </div>
            ) : shadowState === 'result' ? (
              <div className="mt-2 bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex items-center justify-between font-mono text-left shrink-0">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-extrabold">ASR Session summary</span>
                <span className="text-[11px] text-[#10b981] font-bold">13/13 WORDS PROCESSED</span>
              </div>
            ) : (
              <div className="mt-2 bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex items-center justify-between font-mono text-left shrink-0">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-extrabold">ASR DECODER</span>
                <span className="text-[11px] text-zinc-400">READY FOR VOICE INPUT</span>
              </div>
            )}

          </div>

          {/* Right Column - Recording Visualizer Console (Slides in from the right edge) */}
          <div 
            style={{ 
              transform: isLargeScreen ? `translateX(${slideTranslateX}%)` : 'none',
              transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            className="h-[450px] w-full"
          >
            <div className="premium-card premium-card-emerald rounded-2xl p-8 flex flex-col gap-6 shadow-2xl relative h-full">
              
              {/* Scanner laser overlay during analyzing state */}
              {shadowState === 'analyzing' && <div className="animate-scan-laser" />}
              
              {/* Record Limit progress bar */}
              {shadowState === 'recording' && (
                <div 
                  className="absolute top-0 left-0 h-[3px] bg-gradient-to-r from-emerald-500 via-[#10b981] to-emerald-400 transition-all duration-100 ease-linear"
                  style={{ width: `${recordLimitPercent}%` }}
                />
              )}

              <div className="flex items-center justify-between border-b border-zinc-800/40 pb-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] tracking-[0.2em] text-[#10b981] font-bold uppercase font-mono">STEP 02 / SHADOW CAPTURE</span>
                  <h2 className="text-sm font-semibold text-zinc-300 text-left font-sans">Acoustic Console</h2>
                </div>
                <div className="text-[10px] font-mono text-zinc-550 uppercase">
                  Status: {shadowState.toUpperCase()}
                </div>
              </div>

              {/* Waveform graphic */}
              <div className="h-[120px] w-full bg-zinc-950 border border-zinc-800/60 rounded-xl relative flex flex-col justify-end p-4 overflow-hidden">
                
                {/* High precision oscilloscope alignment grid lines */}
                <div className="absolute inset-0 pointer-events-none opacity-20">
                  <svg className="w-full h-full" viewBox="0 0 100 24">
                    <line x1="0" y1="6" x2="100" y2="6" stroke="#27272a" strokeWidth="0.1" />
                    <line x1="0" y1="12" x2="100" y2="12" stroke="#27272a" strokeWidth="0.15" />
                    <line x1="0" y1="18" x2="100" y2="18" stroke="#27272a" strokeWidth="0.1" />
                    <line x1="25" y1="0" x2="25" y2="24" stroke="#27272a" strokeWidth="0.1" />
                    <line x1="50" y1="0" x2="50" y2="24" stroke="#27272a" strokeWidth="0.15" />
                    <line x1="75" y1="0" x2="75" y2="24" stroke="#27272a" strokeWidth="0.1" />
                  </svg>
                </div>

                {shadowState === 'recording' && (
                  <div className="absolute top-3 right-3 bg-red-950/20 border border-red-500/30 text-red-400 font-mono text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full inline-block animate-ping" />
                    <span>REC {recordingMillis.toFixed(1)}s</span>
                  </div>
                )}

                <div className="w-full h-full relative flex items-end">
                  {shadowState === 'ready' && (
                    <svg className="w-full h-full opacity-35" viewBox="0 0 100 24" preserveAspectRatio="none">
                      <path d={nativeReferencePath} fill="none" stroke="#52525b" strokeWidth="1.5" strokeDasharray="3 2" />
                    </svg>
                  )}

                  {shadowState === 'recording' && (
                    <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="liquidGlowArena" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path d={`${getPathFromPoints(wavePoints)} L 100 24 L 0 24 Z`} fill="url(#liquidGlowArena)" />
                      <path d={getPathFromPoints(wavePoints)} fill="none" stroke="#10b981" strokeWidth="2" filter="url(#neonGlowEmerald)" />
                    </svg>
                  )}

                  {shadowState === 'analyzing' && (
                    <div className="absolute inset-0 w-full h-full shimmer-wave opacity-50 flex items-center">
                      <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                        <path d={nativeReferencePath} fill="none" stroke="#222226" strokeWidth="1.5" />
                      </svg>
                    </div>
                  )}
                  
                  {shadowState === 'result' && (
                    <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                      <path d={userResultPath} fill="none" stroke="#10b981" strokeWidth="2" filter="url(#neonGlowEmerald)" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Recorder Control Dial Button */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  {shadowState === 'recording' && (
                    <div className="absolute -inset-4 rounded-full border border-emerald-500/10 ring-glow-active" />
                  )}
                  <button
                    onClick={handleMainActionClick}
                    className={`w-16 h-16 rounded-full flex flex-col items-center justify-center border transition-all duration-500 relative z-10 focus:outline-none cursor-pointer group ${
                      shadowState === 'ready'
                        ? 'bg-zinc-900 border-zinc-800/80 hover:border-emerald-500/40 text-zinc-400 hover:text-white shadow-lg'
                        : shadowState === 'recording'
                          ? 'bg-zinc-950 border-emerald-500 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]'
                          : shadowState === 'analyzing'
                            ? 'bg-zinc-950 border-zinc-850 text-zinc-650'
                            : 'bg-zinc-900 border-emerald-500/50 text-[#10b981]'
                    }`}
                  >
                    {shadowState === 'ready' && (
                      <>
                        <Mic className="w-5 h-5 text-zinc-400 group-hover:text-white" />
                        <span className="text-[7px] font-mono tracking-wider text-zinc-500 mt-0.5 uppercase font-bold">SPACE</span>
                      </>
                    )}
                    {shadowState === 'recording' && (
                      <>
                        <div className="w-2.5 h-2.5 bg-emerald-400 rounded-sm animate-pulse" />
                        <span className="text-[7px] font-mono tracking-wider text-emerald-400 mt-0.5 uppercase font-bold">STOP</span>
                      </>
                    )}
                    {shadowState === 'analyzing' && (
                      <span className="text-[10px] font-mono text-[#10b981] font-bold">{analyzingProgress}%</span>
                    )}
                    {shadowState === 'result' && (
                      <>
                        <RotateCcw className="w-5 h-5" />
                        <span className="text-[7px] font-mono tracking-wider text-emerald-400 mt-0.5 uppercase font-bold">RETRY</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-col items-center text-center">
                  <span className="text-xs font-semibold text-zinc-350">
                    {shadowState === 'ready' && "Click or Press Spacebar to Record"}
                    {shadowState === 'recording' && "Capturing Speech Signal..."}
                    {shadowState === 'analyzing' && analyzingMessage}
                    {shadowState === 'result' && "Voice Captured Successfully"}
                  </span>
                </div>

                {/* Pulsing prompt to continue scrolling after recording complete */}
                {shadowState === 'result' && (
                  <div className="mt-2 bg-[#10b981]/5 border border-[#10b981]/20 rounded-lg py-2 px-3 text-[10px] text-[#10b981] font-semibold animate-pulse">
                    Scroll down to view detailed AI diagnostics & connected speech matching!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

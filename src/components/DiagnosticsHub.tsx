import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import type { WordItem } from '../types';

interface DiagnosticsHubProps {
  selectedWordIndex: number | null;
  diagnosticSlideX: number;
  scoreCount: number;
  metricsVisible: boolean;
  transcriptWords: WordItem[];
  activeAudioWord: number | null;
  handleWordClick: (e: React.MouseEvent<HTMLButtonElement>, item: WordItem, index: number, cardId: number) => void;
  playWordAudio: (word: WordItem, index: number, source: 'native' | 'user') => void;
  nativeReferencePath: string;
  userResultPath: string;
  hasFinishedRecording: boolean;
}

export const DiagnosticsHub: React.FC<DiagnosticsHubProps> = ({
  selectedWordIndex,
  diagnosticSlideX,
  scoreCount,
  metricsVisible,
  transcriptWords,
  activeAudioWord,
  handleWordClick,
  playWordAudio,
  nativeReferencePath,
  userResultPath,
  hasFinishedRecording
}) => {
  const [isLargeScreen, setIsLargeScreen] = useState(true);

  useEffect(() => {
    const checkScreen = () => setIsLargeScreen(window.innerWidth >= 1024);
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  if (!hasFinishedRecording) return null;

  return (
    <div className="h-auto lg:h-[200vh] relative w-full border-b border-[#222226]/20 py-12 lg:py-0">
      <div className="relative lg:sticky lg:top-0 h-auto lg:h-screen w-full flex items-center justify-center px-4 sm:px-6 lg:px-12 py-6 lg:py-0 overflow-visible lg:overflow-hidden">
        
        {/* Grid Container for Left and Right Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-[1400px] items-center relative">
          
          {/* Left Column - Interactive drills & Coach tips (originally Step 4) */}
          <div className="premium-card premium-card-amber rounded-2xl p-8 flex flex-col gap-6 shadow-2xl relative h-[450px]">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-4 shrink-0">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] tracking-[0.2em] text-[#10b981] font-extrabold uppercase font-mono">STEP 03 / DIAGNOSTIC DRILLS</span>
                <h2 className="text-base font-bold text-zinc-100">Speech Diagnostic & Practice Hub</h2>
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-950 px-2.5 py-0.5 rounded-lg border border-zinc-800 text-[11px] text-zinc-300 font-mono">
                COACH ONLINE
              </div>
            </div>

            {/* Diagnostic coaches report */}
            <div className="bg-[#fbbf24]/10 border border-[#fbbf24]/20 rounded-xl p-4 flex items-start gap-3 text-left shrink-0">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1.5 text-sm">
                <span className="font-bold text-white text-[13px]">AI Coach Diagnostic Summary</span>
                <p className="text-zinc-200 leading-relaxed text-[12px] font-medium">
                  "Practice combining final consonants with initial vowels. Try linking the final <strong className="text-white">/k/</strong> sound in <strong className="text-amber-400 font-bold">'agentic'</strong> directly into the <strong className="text-white">/w/</strong> of <strong className="text-amber-400 font-bold">'workflows'</strong>."
                </p>
              </div>
            </div>

            {/* Highlighted text mapping for lookup drills (Duolingo-inspired size, weight, and contrast) */}
            <div className="flex-1 py-1 overflow-y-auto no-scrollbar select-text text-left leading-[3.0rem] tracking-wide text-[21px] font-serif font-bold text-zinc-200">
              {transcriptWords.map((item, idx) => {
                const isSelected = selectedWordIndex === idx;
                
                let highlightClass = "text-zinc-300 hover:text-white hover:bg-[#27272a] hover:scale-105 hover:-translate-y-0.5 px-2 py-0.5 rounded cursor-pointer transition-all duration-350 ease-out transform inline-block";
                let underlineClass = "";
                
                if (item.accuracy === 'good') {
                  highlightClass = "text-[#58cc02] bg-[#58cc02]/15 px-2 py-0.5 rounded cursor-pointer border-b-2 border-[#58cc02] font-black transition-all duration-300 inline-block";
                } else if (item.accuracy === 'average') {
                  highlightClass = "text-[#ff9600] bg-[#ff9600]/15 px-2 py-0.5 rounded cursor-pointer border-b-2 border-dashed border-[#ff9600] font-black transition-all duration-300 inline-block";
                  underlineClass = "pb-0.5";
                } else if (item.accuracy === 'poor') {
                  highlightClass = "text-[#ea2b2b] bg-[#ea2b2b]/15 px-2 py-0.5 rounded cursor-pointer border-b-2 border-[#ea2b2b] font-black transition-all duration-300 inline-block";
                  underlineClass = "pb-0.5";
                }

                if (isSelected) {
                  if (item.type === 'liaison') {
                    highlightClass += " ring-2 ring-[#fbbf24]/50 bg-[#fbbf24]/10 shadow-[0_0_12px_rgba(251,191,36,0.15)]";
                  } else if (item.type === 'flat') {
                    highlightClass += " ring-2 ring-[#ef4444]/50 bg-[#ef4444]/10 shadow-[0_0_12px_rgba(239,68,68,0.15)] text-white";
                  } else {
                    highlightClass += " ring-2 ring-zinc-750 bg-zinc-850 shadow-[0_0_10px_rgba(255,255,255,0.04)] text-white";
                  }
                }

                return (
                  <span key={idx} className="relative inline-block mx-0.5">
                    <button
                      onClick={(e) => {
                        if (item.type === 'liaison' || item.type === 'flat' || isSelected) {
                          handleWordClick(e, item, idx, 3);
                        } else {
                          playWordAudio(item, idx, 'native');
                        }
                      }}
                      className={`${highlightClass} ${underlineClass} focus:outline-none`}
                    >
                      {item.text}
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

          {/* Right Column - Amplitude overlays & Scores (originally Step 3) */}
          <div 
            style={{ 
              transform: isLargeScreen ? `translateX(${diagnosticSlideX}%)` : 'none',
              transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            className="h-[450px] w-full"
          >
            <div className="premium-card premium-card-emerald rounded-2xl p-8 flex flex-col gap-6 shadow-2xl relative h-full">
              <div className="flex items-center justify-between border-b border-zinc-800/40 pb-4 shrink-0">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] tracking-[0.2em] text-[#10b981] font-bold uppercase font-mono">STEP 04 / COMPARISON RESULTS</span>
                  <h2 className="text-sm font-semibold text-zinc-300 text-left font-sans">Continuous Amplitude Overlays</h2>
                </div>
                <div className="flex items-center gap-1.5 bg-[#10b981]/5 border border-[#10b981]/25 rounded-full px-2.5 py-0.5 text-[10px] text-[#10b981] font-semibold font-mono">
                  OVERALL MATCH: {scoreCount}%
                </div>
              </div>

              {/* Overlapping wave box */}
              <div className="h-[150px] w-full bg-zinc-950 border border-zinc-800/60 rounded-xl relative flex flex-col justify-end p-4 overflow-hidden shrink-0">
                <div className="absolute top-3 left-3 flex flex-col gap-0.5 text-[9px] font-mono text-zinc-500 text-left">
                  <span className="text-zinc-500">Grey Dashed = Native reference</span>
                  <span className="text-[#10b981]">Green Solid = Your voice spectrum</span>
                </div>

                <div className="w-full h-full relative flex items-end">
                  <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 100 24" preserveAspectRatio="none">
                    <path d={nativeReferencePath} fill="none" stroke="#66666f" strokeWidth="1.5" strokeDasharray="3 1.5" />
                  </svg>

                  <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="userResultGlowScrolly" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path d={`${userResultPath} L 100 24 L 0 24 Z`} fill="url(#userResultGlowScrolly)" />
                    <path d={userResultPath} fill="none" stroke="#10b981" strokeWidth="2" filter="url(#neonGlowEmerald)" />
                    
                    {/* Highlight correction sections */}
                    <path d="M 34 12 L 42 12" fill="none" stroke="#fbbf24" strokeWidth="2.5" filter="url(#neonGlowAmber)" />
                    <path d="M 72 12 L 78 12" fill="none" stroke="#fbbf24" strokeWidth="2.5" filter="url(#neonGlowAmber)" />
                  </svg>

                  {/* Hotspot overlays */}
                  <button 
                    onClick={(e) => {
                      handleWordClick(e, transcriptWords[5], 5, 4);
                    }}
                    className="absolute bottom-0 left-[34%] w-[8%] h-full border-x border-t border-dashed border-amber-500/20 bg-amber-500/[0.01] hover:bg-amber-500/[0.04] transition-colors flex items-start justify-center pt-2 cursor-pointer focus:outline-none group/gate"
                  >
                    <span className="text-[8px] font-mono text-[#fbbf24] bg-zinc-950 border border-amber-500/20 px-1 rounded-sm uppercase font-semibold">LINK 1</span>
                  </button>

                  <button 
                    onClick={(e) => {
                      handleWordClick(e, transcriptWords[10], 10, 4);
                    }}
                    className="absolute bottom-0 left-[72%] w-[6%] h-full border-x border-t border-dashed border-amber-500/20 bg-amber-500/[0.01] hover:bg-amber-500/[0.04] transition-colors flex items-start justify-center pt-2 cursor-pointer focus:outline-none group/gate"
                  >
                    <span className="text-[8px] font-mono text-[#fbbf24] bg-zinc-950 border border-amber-500/20 px-1 rounded-sm uppercase font-semibold">LINK 2</span>
                  </button>
                </div>
              </div>

              {/* Progress bars metrics */}
              <div className="grid grid-cols-3 gap-4 shrink-0">
                <div className="bg-zinc-950/40 border border-zinc-800/50 rounded-xl p-4 flex flex-col gap-1.5 text-left justify-center h-full">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-zinc-500 uppercase">Pronunciation</span>
                    <span className="text-white font-bold">94%</span>
                  </div>
                  <div className="w-full bg-zinc-800/60 h-1 rounded-full overflow-hidden mt-1">
                    <div 
                      className="bg-[#10b981] h-full rounded-full" 
                      style={{ 
                        width: metricsVisible ? '94%' : '0%',
                        transition: 'width 1.4s cubic-bezier(0.34, 1.56, 0.64, 1) 150ms'
                      }}
                    />
                  </div>
                </div>

                <div className="bg-zinc-950/40 border border-zinc-800/50 rounded-xl p-4 flex flex-col gap-1.5 text-left justify-center h-full">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-zinc-500 uppercase">Liaisons</span>
                    <span className="text-white font-bold">89%</span>
                  </div>
                  <div className="w-full bg-zinc-800/60 h-1 rounded-full overflow-hidden mt-1">
                    <div 
                      className="bg-[#fbbf24] h-full rounded-full" 
                      style={{ 
                        width: metricsVisible ? '89%' : '0%',
                        transition: 'width 1.4s cubic-bezier(0.34, 1.56, 0.64, 1) 350ms'
                      }}
                    />
                  </div>
                </div>

                <div className="bg-zinc-950/40 border border-zinc-800/50 rounded-xl p-4 flex flex-col gap-1.5 text-left justify-center h-full">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-zinc-500 uppercase">Intonation</span>
                    <span className="text-white font-bold">91%</span>
                  </div>
                  <div className="w-full bg-zinc-800/60 h-1 rounded-full overflow-hidden mt-1">
                    <div 
                      className="bg-[#10b981] h-full rounded-full" 
                      style={{ 
                        width: metricsVisible ? '91%' : '0%',
                        transition: 'width 1.4s cubic-bezier(0.34, 1.56, 0.64, 1) 550ms'
                      }}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

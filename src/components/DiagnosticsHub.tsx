import React, { useState, useEffect } from 'react';
import { Sparkles, Volume2, Play, Info } from 'lucide-react';
import type { WordItem } from '../types';
import type { PitchMarker } from '../utils/pitch';

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
  playNativeSentence: () => void;
  playUserRecording: () => void;
  userAudioUrl: string | null;
  nativePitchPath: string;
  userPitchPath: string;
  pitchMarkers: PitchMarker[];
  dynamicScore: number;
  dynamicPronunciation: number;
  dynamicLiaisons: number;
  dynamicIntonation: number;
}

export const DiagnosticsHub: React.FC<DiagnosticsHubProps> = ({
  selectedWordIndex,
  diagnosticSlideX,
  scoreCount: _scoreCount,
  metricsVisible,
  transcriptWords,
  activeAudioWord,
  handleWordClick,
  playWordAudio,
  nativeReferencePath,
  userResultPath,
  hasFinishedRecording,
  playNativeSentence,
  playUserRecording,
  userAudioUrl,
  nativePitchPath,
  userPitchPath,
  pitchMarkers,
  dynamicScore,
  dynamicPronunciation,
  dynamicLiaisons,
  dynamicIntonation
}) => {
  const [isLargeScreen, setIsLargeScreen] = useState(true);
  const [activeChartTab, setActiveChartTab] = useState<'amplitude' | 'pitch' | 'fluency'>('amplitude');
  const [activePitchMarkerIndex, setActivePitchMarkerIndex] = useState<number | null>(null);

  const handleTabChange = (tab: 'amplitude' | 'pitch' | 'fluency') => {
    setActiveChartTab(tab);
    setActivePitchMarkerIndex(null);
  };

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
            className="h-[450px] w-full animate-fade-in"
          >
            <div className="premium-card premium-card-emerald rounded-2xl p-8 flex flex-col gap-6 shadow-2xl relative h-full">
              <div className="flex items-center justify-between border-b border-zinc-800/40 pb-4 shrink-0">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] tracking-[0.2em] text-[#10b981] font-bold uppercase font-mono">STEP 04 / COMPARISON RESULTS</span>
                  <h2 className="text-sm font-semibold text-zinc-300 text-left font-sans">
                    {activeChartTab === 'amplitude' 
                      ? "Continuous Amplitude Overlays" 
                      : activeChartTab === 'pitch' 
                        ? "Pitch Intonation Curves (F0)" 
                        : "Fluency & Phrasing Dashboard"}
                  </h2>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playNativeSentence();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300 hover:text-white font-mono transition-all cursor-pointer hover:scale-105 active:scale-95"
                    title="Play Native Sentence"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Native</span>
                  </button>
                  {userAudioUrl && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playUserRecording();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-500/30 text-[10px] text-[#10b981] font-mono transition-all cursor-pointer hover:scale-105 active:scale-95"
                      title="Play Your Attempt"
                    >
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      <span>You</span>
                    </button>
                  )}
                  <span className="flex items-center gap-1.5 bg-[#10b981]/5 border border-[#10b981]/25 rounded-full px-2.5 py-1 text-[10px] text-[#10b981] font-bold font-mono">
                    OVERALL MATCH: {dynamicScore}%
                  </span>
                </div>
              </div>

              {/* Tab Selector */}
              <div className="flex items-center justify-between border-b border-zinc-800/20 pb-3 shrink-0">
                <span className="text-[10px] text-zinc-400 font-medium font-sans">Select analysis visualization:</span>
                <div className="flex bg-zinc-950 p-0.5 rounded-lg border border-zinc-900">
                  <button
                    onClick={() => handleTabChange('amplitude')}
                    className={`px-3 py-1 text-[9px] font-mono rounded-md font-bold transition-all cursor-pointer ${
                      activeChartTab === 'amplitude'
                        ? 'bg-emerald-500/15 text-[#10b981] border border-emerald-500/20'
                        : 'text-zinc-500 border border-transparent hover:text-zinc-400'
                    }`}
                  >
                    AMPLITUDE
                  </button>
                  <button
                    onClick={() => handleTabChange('pitch')}
                    className={`px-3 py-1 text-[9px] font-mono rounded-md font-bold transition-all cursor-pointer ${
                      activeChartTab === 'pitch'
                        ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                        : 'text-zinc-500 border border-transparent hover:text-zinc-400'
                    }`}
                  >
                    PITCH (F0)
                  </button>
                  <button
                    onClick={() => handleTabChange('fluency')}
                    className={`px-3 py-1 text-[9px] font-mono rounded-md font-bold transition-all cursor-pointer ${
                      activeChartTab === 'fluency'
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                        : 'text-zinc-500 border border-transparent hover:text-zinc-400'
                    }`}
                  >
                    FLUENCY & PACE
                  </button>
                </div>
              </div>

              {/* Overlapping wave box */}
              <div className="h-[150px] w-full bg-zinc-950 border border-zinc-800/60 rounded-xl relative flex flex-col justify-end p-4 overflow-hidden shrink-0">
                <div className="absolute top-3 left-3 flex flex-col gap-0.5 text-[9px] font-mono text-zinc-500 text-left z-10">
                  {activeChartTab === 'amplitude' ? (
                    <>
                      <span className="text-zinc-500">Grey Dashed = Native reference</span>
                      <span className="text-[#10b981]">Green Solid = Your voice spectrum</span>
                    </>
                  ) : activeChartTab === 'pitch' ? (
                    <>
                      <span className="text-zinc-500">Indigo Dashed = Native F0 intonation</span>
                      <span className="text-[#10b981]">Green Solid = Your pitch contour</span>
                    </>
                  ) : null}
                </div>

                {activeChartTab === 'amplitude' ? (
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
                ) : activeChartTab === 'pitch' ? (
                  <div className="w-full h-full relative flex items-end">
                    {/* Native Pitch curve (Dashed Indigo) */}
                    <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 100 24" preserveAspectRatio="none">
                      <path d={nativePitchPath} fill="none" stroke="#818cf8" strokeWidth="1.5" strokeDasharray="3 1.5" />
                    </svg>

                    {/* User Pitch curve (Solid green/blue with neon glow) */}
                    <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="userPitchGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path d={`${userPitchPath} L 100 24 L 0 24 Z`} fill="url(#userPitchGlow)" />
                      <path d={userPitchPath} fill="none" stroke="#10b981" strokeWidth="2" filter="url(#neonGlowEmerald)" />
                    </svg>

                    {/* Interactive Marker Dots overlay */}
                    {pitchMarkers.map((marker, mIdx) => {
                      const isHovered = activePitchMarkerIndex === mIdx;
                      
                      let dotColor = "bg-[#10b981] border-[#10b981]/40";
                      let textColor = "text-[#10b981]";
                      
                      if (marker.type === 'flat') {
                        dotColor = "bg-[#fbbf24] border-[#fbbf24]/40 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.5)]";
                        textColor = "text-[#fbbf24]";
                      } else if (marker.type === 'low' || marker.type === 'high') {
                        dotColor = "bg-[#ef4444] border-[#ef4444]/40 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]";
                        textColor = "text-[#ef4444]";
                      } else if (marker.type === 'correct') {
                        dotColor = "bg-emerald-500 border-emerald-500/30";
                        textColor = "text-emerald-400";
                      }

                      return (
                        <div
                          key={mIdx}
                          style={{
                            position: 'absolute',
                            left: `${marker.x}%`,
                            top: `${(marker.y / 24) * 100}%`,
                            transform: 'translate(-50%, -50%)',
                            zIndex: 20
                          }}
                          className="group"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePitchMarkerIndex(activePitchMarkerIndex === mIdx ? null : mIdx);
                            }}
                            className={`w-3.5 h-3.5 rounded-full border-[3px] ${dotColor} cursor-pointer hover:scale-125 hover:border-white transition-all focus:outline-none ${isHovered ? 'scale-125 border-white ring-2 ring-emerald-500/50' : ''}`}
                            title={marker.text}
                          />
                          
                          {/* Hover Label */}
                          <span className={`absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-mono font-bold ${textColor} bg-zinc-950 px-1 rounded border border-zinc-800/80 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md whitespace-nowrap`}>
                            {marker.text}
                          </span>
                        </div>
                      );
                    })}

                    {/* Active tooltip popover overlay */}
                    {activePitchMarkerIndex !== null && pitchMarkers[activePitchMarkerIndex] && (
                      <div className="absolute inset-x-2 bottom-2 bg-zinc-950/95 border border-zinc-800 rounded-xl p-3 backdrop-blur-md z-30 shadow-2xl flex items-start gap-2.5 text-left animate-fade-in">
                        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <div className="flex-1 flex flex-col gap-0.5">
                          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
                            Intonation Advice • {pitchMarkers[activePitchMarkerIndex].text}
                          </span>
                          <p className="text-[11px] text-zinc-200 font-medium leading-relaxed">
                            {pitchMarkers[activePitchMarkerIndex].tip}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActivePitchMarkerIndex(null);
                          }}
                          className="text-zinc-500 hover:text-white font-bold text-xs focus:outline-none px-1 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-between gap-4 p-1 text-left z-10 select-none">
                    
                    {/* Left: Radar Chart (110x110px) */}
                    <div className="w-[110px] h-[110px] shrink-0 relative flex items-center justify-center bg-zinc-950 border border-zinc-900 rounded-xl p-1.5 shadow-inner">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 110 110">
                        {/* Pentagon Grid lines */}
                        <polygon points="55,15 93,43 78.5,87.4 31.5,87.4 17,43" fill="none" stroke="#27272a" strokeWidth="1" />
                        <polygon points="55,33 76,48.4 68,72.8 42,72.8 34,48.4" fill="none" stroke="#1f1f23" strokeWidth="0.8" />
                        
                        {/* Axes lines */}
                        <line x1="55" y1="55" x2="55" y2="15" stroke="#27272a" strokeWidth="0.8" strokeDasharray="1.5 1" />
                        <line x1="55" y1="55" x2="93" y2="43" stroke="#27272a" strokeWidth="0.8" strokeDasharray="1.5 1" />
                        <line x1="55" y1="55" x2="78.5" y2="87.4" stroke="#27272a" strokeWidth="0.8" strokeDasharray="1.5 1" />
                        <line x1="55" y1="55" x2="31.5" y2="87.4" stroke="#27272a" strokeWidth="0.8" strokeDasharray="1.5 1" />
                        <line x1="55" y1="55" x2="17" y2="43" stroke="#27272a" strokeWidth="0.8" strokeDasharray="1.5 1" />

                        {/* User Performance polygon */}
                        <polygon 
                          points="55,17.4 88.9,44 76.4,84.4 33.4,84.4 18.9,43.3" 
                          fill="rgba(245, 158, 11, 0.12)" 
                          stroke="#f59e0b" 
                          strokeWidth="1.8" 
                          filter="url(#neonGlowAmber)"
                        />
                        
                        {/* Axes labels */}
                        <text x="55" y="11" fill="#71717a" fontSize="6.5" textAnchor="middle" fontWeight="bold" fontFamily="monospace">PRN</text>
                        <text x="96" y="44" fill="#71717a" fontSize="6.5" textAnchor="start" fontWeight="bold" fontFamily="monospace">LSN</text>
                        <text x="81" y="93" fill="#71717a" fontSize="6.5" textAnchor="start" fontWeight="bold" fontFamily="monospace">INT</text>
                        <text x="29" y="93" fill="#71717a" fontSize="6.5" textAnchor="end" fontWeight="bold" fontFamily="monospace">FLN</text>
                        <text x="14" y="44" fill="#71717a" fontSize="6.5" textAnchor="end" fontWeight="bold" fontFamily="monospace">PAC</text>
                      </svg>
                    </div>

                    {/* Right: Speech Rhythm & Statistics */}
                    <div className="flex-1 h-full flex flex-col justify-between py-1 gap-2.5">
                      
                      {/* Syllable-level rhythm matching curve */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[8px] font-mono text-zinc-500">
                          <span>SPEECH RHYTHM MATCHING</span>
                          <span className="text-amber-400 font-bold">STEADY RHYTHM</span>
                        </div>
                        <div className="w-full h-[40px] bg-zinc-950/40 border border-zinc-900 rounded-lg p-1 overflow-hidden relative">
                          <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                            {/* Native rhythm beats (dashed gray) */}
                            <path 
                              d="M 0 22 Q 8 4, 16 22 Q 24 8, 32 22 Q 40 4, 48 22 Q 56 6, 64 22 Q 72 4, 80 22 Q 88 12, 96 22" 
                              fill="none" 
                              stroke="#52525b" 
                              strokeWidth="1" 
                              strokeDasharray="2 1.5" 
                            />
                            {/* User rhythm beats (solid amber) */}
                            <path 
                              d="M 0 22 Q 7 3, 15.5 22 Q 25 9, 33 22 Q 41.5 3, 49 22 Q 57 7, 65 22 Q 71.5 3, 79 22 Q 87 11, 96 22" 
                              fill="none" 
                              stroke="#f59e0b" 
                              strokeWidth="1.5" 
                              filter="url(#neonGlowAmber)" 
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Stats grid */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-zinc-950/50 border border-zinc-900 rounded-lg p-1.5 text-left flex flex-col gap-0.5 shadow-sm">
                          <span className="text-[7.5px] font-mono text-zinc-500 uppercase tracking-wider">Speed</span>
                          <span className="text-xs font-bold text-zinc-100 font-mono">142 WPM</span>
                          <span className="text-[7px] text-amber-400 font-semibold">Optimal</span>
                        </div>
                        <div className="bg-zinc-950/50 border border-zinc-900 rounded-lg p-1.5 text-left flex flex-col gap-0.5 shadow-sm">
                          <span className="text-[7.5px] font-mono text-zinc-500 uppercase tracking-wider">Pauses</span>
                          <span className="text-xs font-bold text-zinc-100 font-mono">1 Pause</span>
                          <span className="text-[7px] text-amber-400 font-semibold">Natural</span>
                        </div>
                        <div className="bg-zinc-950/50 border border-zinc-900 rounded-lg p-1.5 text-left flex flex-col gap-0.5 shadow-sm">
                          <span className="text-[7.5px] font-mono text-zinc-500 uppercase tracking-wider">Consistency</span>
                          <span className="text-xs font-bold text-zinc-100 font-mono">93.5%</span>
                          <span className="text-[7px] text-amber-400 font-semibold">Excellent</span>
                        </div>
                      </div>

                    </div>

                  </div>
                )}
              </div>

              {/* Progress bars metrics */}
              <div className="grid grid-cols-3 gap-4 shrink-0">
                <div className="bg-zinc-950/40 border border-zinc-800/50 rounded-xl p-4 flex flex-col gap-1.5 text-left justify-center h-full">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-zinc-500 uppercase">Pronunciation</span>
                    <span className="text-white font-bold">{dynamicPronunciation}%</span>
                  </div>
                  <div className="w-full bg-zinc-800/60 h-1 rounded-full overflow-hidden mt-1">
                    <div 
                      className="bg-[#10b981] h-full rounded-full" 
                      style={{ 
                        width: metricsVisible ? `${dynamicPronunciation}%` : '0%',
                        transition: 'width 1.4s cubic-bezier(0.34, 1.56, 0.64, 1) 150ms'
                      }}
                    />
                  </div>
                </div>

                <div className="bg-zinc-950/40 border border-zinc-800/50 rounded-xl p-4 flex flex-col gap-1.5 text-left justify-center h-full">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-zinc-500 uppercase">Liaisons</span>
                    <span className="text-white font-bold">{dynamicLiaisons}%</span>
                  </div>
                  <div className="w-full bg-zinc-800/60 h-1 rounded-full overflow-hidden mt-1">
                    <div 
                      className="bg-[#fbbf24] h-full rounded-full" 
                      style={{ 
                        width: metricsVisible ? `${dynamicLiaisons}%` : '0%',
                        transition: 'width 1.4s cubic-bezier(0.34, 1.56, 0.64, 1) 350ms'
                      }}
                    />
                  </div>
                </div>

                <div className="bg-zinc-950/40 border border-zinc-800/50 rounded-xl p-4 flex flex-col gap-1.5 text-left justify-center h-full">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-zinc-500 uppercase">Intonation</span>
                    <span className="text-white font-bold">{dynamicIntonation}%</span>
                  </div>
                  <div className="w-full bg-zinc-800/60 h-1 rounded-full overflow-hidden mt-1">
                    <div 
                      className="bg-[#10b981] h-full rounded-full" 
                      style={{ 
                        width: metricsVisible ? `${dynamicIntonation}%` : '0%',
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

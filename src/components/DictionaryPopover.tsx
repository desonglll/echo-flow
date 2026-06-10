import React from 'react';
import { X, Play, Star } from 'lucide-react';
import type { WordItem } from '../types';

interface DictionaryPopoverProps {
  word: WordItem;
  popoverDirection: 'top' | 'bottom';
  popoverPosition: { top: number; left: number; height: number };
  onClose: () => void;
  onPlayAudio: (source: 'native' | 'user') => void;
  isStarred: boolean;
  onToggleStar: (wordText: string) => void;
}

export const DictionaryPopover: React.FC<DictionaryPopoverProps> = ({
  word,
  popoverDirection,
  popoverPosition,
  onClose,
  onPlayAudio,
  isStarred,
  onToggleStar
}) => {
  const popoverWidth = Math.min(300, window.innerWidth - 32);
  const halfWidth = popoverWidth / 2;
  const margin = 16;
  const clampedLeft = Math.max(
    halfWidth + margin,
    Math.min(window.innerWidth - halfWidth - margin, popoverPosition.left)
  );

  return (
    <div 
      className={`fixed ${
        popoverDirection === 'top' 
          ? 'animate-spring-in-above' 
          : 'animate-spring-in-below'
      } z-50 w-[calc(100vw-32px)] max-w-[300px] max-h-[calc(100vh-32px)] bg-[#09090b]/95 backdrop-blur-xl border border-zinc-800 rounded-xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.75)] flex flex-col text-left`}
      style={{
        left: `${clampedLeft}px`,
        top: popoverDirection === 'top' ? `${popoverPosition.top - 12}px` : `${popoverPosition.top + popoverPosition.height + 12}px`,
      }}
    >
      {/* Popover Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3.5 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-white text-base font-sans">
            {word.text.replace(/[^a-zA-Z]/g, "")}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar(word.text);
            }}
            className="p-1 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-yellow-400 cursor-pointer transition-colors"
            title={isStarred ? "Remove from Vocabulary" : "Add to Vocabulary"}
          >
            <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-400'}`} />
          </button>
          <span className="text-[12px] text-zinc-350 font-mono bg-zinc-900 px-1.5 py-0.5 rounded">
            {word.ipa}
          </span>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-1 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3.5 pr-0.5">
        {/* Dictionary translation */}
        <div className="bg-[#121214] border border-zinc-800 rounded-lg p-3 flex flex-col gap-1.5 text-left shrink-0">
          <span className="text-[10px] uppercase tracking-[0.1em] text-zinc-400 font-extrabold font-mono">Translation</span>
          <span className="text-[13px] text-zinc-100 leading-relaxed font-semibold">
            {word.definition}
          </span>
        </div>

        {/* Interactive Wave Comparison */}
        {(word.type === 'liaison' || word.type === 'flat') && (
          <div className="flex flex-col gap-2.5 bg-[#121214] border border-zinc-800 rounded-lg p-3 shrink-0">
            <span className="text-[10px] uppercase tracking-[0.1em] text-zinc-400 font-extrabold font-mono">Pitch Contour Comparison</span>
            
            {/* Native Waveform */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-400 font-mono font-bold w-12 shrink-0">Native:</span>
              <div className="flex-1 h-6 flex items-center relative overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                  <path 
                    d="M0 12 C15 4, 25 2, 40 12 C55 20, 65 20, 80 12 T100 12" 
                    fill="none" 
                    stroke="#52525b" 
                    strokeWidth="2.0" 
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayAudio('native');
                }}
                className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
              </button>
            </div>

            {/* User Waveform */}
            <div className="flex items-center gap-2">
              <span className={`text-[10px] ${word.type === 'liaison' ? 'text-amber-400' : 'text-red-400'} font-mono font-bold w-12 shrink-0`}>You:</span>
              <div className="flex-1 h-6 flex items-center relative overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                  {word.type === 'liaison' ? (
                    <>
                      <path 
                        d="M0 12 C15 4, 25 2, 40 12 M58 12 C65 20, 80 12 T100 12" 
                        fill="none" 
                        stroke="#f59e0b" 
                        strokeWidth="2.0" 
                        strokeDasharray="4 2.5"
                        strokeLinecap="round"
                      />
                      <circle cx="49" cy="12" r="2.5" fill="#ef4444" className="animate-ping" />
                    </>
                  ) : (
                    <path 
                      d="M0 12 C25 6, 50 18, 75 6 T100 12" 
                      fill="none" 
                      stroke="#ef4444" 
                      strokeWidth="1.8" 
                      strokeDasharray="3 2"
                      strokeLinecap="round"
                    />
                  )}
                </svg>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayAudio('user');
                }}
                className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
              </button>
            </div>
          </div>
        )}

        {/* Mouth Position Guide */}
        {(word.type === 'liaison' || word.type === 'flat') && (
          <div className="bg-[#121214] border border-zinc-800 rounded-lg p-3 flex flex-col gap-2 shrink-0">
            <span className="text-[10px] uppercase tracking-[0.1em] text-zinc-400 font-extrabold font-mono block">
              Mouth Position Guide
            </span>
            
            <div className="w-full flex items-center justify-center py-1 bg-zinc-950/60 rounded-md border border-zinc-900 overflow-hidden">
              {word.type === 'liaison' ? (
                <svg className="w-full h-[80px]" viewBox="0 0 140 70">
                  <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
                    </marker>
                  </defs>
                  {/* Palate (upper roof) */}
                  <path d="M 15 10 Q 55 10 65 25 T 85 45" fill="none" stroke="#52525b" strokeWidth="2.5" />
                  {/* Throat / Lower mouth */}
                  <path d="M 15 60 Q 55 60 70 58 T 95 60" fill="none" stroke="#52525b" strokeWidth="2.5" />
                  {/* Teeth */}
                  <line x1="63" y1="23" x2="63" y2="29" stroke="#71717a" strokeWidth="2" />
                  <line x1="68" y1="58" x2="68" y2="52" stroke="#71717a" strokeWidth="2" />
                  {/* Tongue (in touch position) */}
                  <path d="M 25 60 Q 45 58 58 50 Q 64 42 62 26 Q 59 40 50 50 Z" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth="2" />
                  
                  {/* Tongue slide arrow (release path) */}
                  <path d="M 60 30 Q 56 42 45 46" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 2" markerEnd="url(#arrow)" />
                  
                  {/* Annotations */}
                  <text x="72" y="18" fill="#a1a1aa" fontSize="7" fontFamily="monospace">Alveolar Ridge</text>
                  <line x1="70" y1="17" x2="63" y2="22" stroke="#52525b" strokeWidth="0.5" />
                  
                  <text x="18" y="38" fill="#a1a1aa" fontSize="7" fontFamily="monospace">Tongue Contact</text>
                  <line x1="36" y1="40" x2="55" y2="44" stroke="#52525b" strokeWidth="0.5" />
                </svg>
              ) : (
                <svg className="w-full h-[80px]" viewBox="0 0 140 70">
                  <defs>
                    <marker id="arrowGreen" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
                    </marker>
                  </defs>
                  
                  {/* Left Side: Flat Lips */}
                  <g transform="translate(-10, 0)">
                    <text x="45" y="15" fill="#ef4444" fontSize="7" fontFamily="monospace" textAnchor="middle" fontWeight="bold">Flat (Incorrect)</text>
                    <ellipse cx="45" cy="40" rx="24" ry="7" fill="rgba(239, 68, 68, 0.05)" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2" />
                    {/* Horizontal tension lines */}
                    <line x1="16" y1="40" x2="8" y2="40" stroke="#ef4444" strokeWidth="1" />
                    <line x1="74" y1="40" x2="82" y2="40" stroke="#ef4444" strokeWidth="1" />
                    <text x="45" y="60" fill="#71717a" fontSize="6.5" textAnchor="middle">Lips pulled back</text>
                  </g>

                  {/* Right Side: Open Lips */}
                  <g transform="translate(10, 0)">
                    <text x="95" y="15" fill="#10b981" fontSize="7" fontFamily="monospace" textAnchor="middle" fontWeight="bold">Open & Rounded</text>
                    <ellipse cx="95" cy="40" rx="16" ry="14" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth="2" />
                    
                    {/* Vertical expansion indicators */}
                    <path d="M 95 22 L 95 14" fill="none" stroke="#10b981" strokeWidth="1.2" markerEnd="url(#arrowGreen)" />
                    <path d="M 95 58 L 95 66" fill="none" stroke="#10b981" strokeWidth="1.2" markerEnd="url(#arrowGreen)" />
                    
                    <text x="95" y="60" fill="#a1a1aa" fontSize="6.5" textAnchor="middle">Drop jaw vertically ↕</text>
                  </g>
                </svg>
              )}
            </div>
          </div>
        )}

        {/* AI Tip Box */}
        <div className="bg-[#121214] border border-zinc-800 rounded-lg p-3 text-[12px] text-zinc-200 leading-relaxed shrink-0">
          <span className="text-[10px] uppercase tracking-[0.1em] text-zinc-400 font-extrabold font-mono block mb-1.5">AI Speech Coach Tip</span>
          {(word.type === 'liaison' || word.type === 'flat') 
            ? word.tip 
            : "Focus on maintaining clean vocal articulation during connected speech."}
        </div>
      </div>
    </div>
  );
};

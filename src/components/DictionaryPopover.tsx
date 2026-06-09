import React from 'react';
import { X, Play } from 'lucide-react';
import type { WordItem } from '../types';

interface DictionaryPopoverProps {
  word: WordItem;
  popoverDirection: 'top' | 'bottom';
  popoverPosition: { top: number; left: number; height: number };
  onClose: () => void;
  onPlayAudio: (source: 'native' | 'user') => void;
}

export const DictionaryPopover: React.FC<DictionaryPopoverProps> = ({
  word,
  popoverDirection,
  popoverPosition,
  onClose,
  onPlayAudio
}) => {
  return (
    <div 
      className={`absolute ${
        popoverDirection === 'top' 
          ? 'animate-spring-in-above' 
          : 'animate-spring-in-below'
      } z-50 w-[300px] bg-[#09090b]/95 backdrop-blur-xl border border-zinc-800 rounded-xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.75)] flex flex-col gap-3.5 text-left`}
      style={{
        left: `${popoverPosition.left}px`,
        top: popoverDirection === 'top' ? `${popoverPosition.top - 12}px` : `${popoverPosition.top + popoverPosition.height + 12}px`,
      }}
    >
      {/* Popover Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-white text-base font-sans">
            {word.text.replace(/[^a-zA-Z]/g, "")}
          </span>
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

      {/* Dictionary translation */}
      <div className="bg-[#121214] border border-zinc-800 rounded-lg p-3 flex flex-col gap-1.5 text-left">
        <span className="text-[10px] uppercase tracking-[0.1em] text-zinc-400 font-extrabold font-mono">Translation</span>
        <span className="text-[13px] text-zinc-100 leading-relaxed font-semibold">
          {word.definition}
        </span>
      </div>

      {/* Interactive Wave Comparison */}
      {(word.type === 'liaison' || word.type === 'flat') && (
        <div className="flex flex-col gap-2.5 bg-[#121214] border border-zinc-800 rounded-lg p-3">
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

      {/* AI Tip Box */}
      <div className="bg-[#121214] border border-zinc-800 rounded-lg p-3 text-[12px] text-zinc-200 leading-relaxed">
        <span className="text-[10px] uppercase tracking-[0.1em] text-zinc-400 font-extrabold font-mono block mb-1.5">AI Speech Coach Tip</span>
        {(word.type === 'liaison' || word.type === 'flat') 
          ? word.tip 
          : "Focus on maintaining clean vocal articulation during connected speech."}
      </div>
    </div>
  );
};

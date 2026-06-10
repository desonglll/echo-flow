import React from 'react';
import { ChevronRight, Zap, Sparkles, Star } from 'lucide-react';

interface SidebarProps {
  activeSection: number;
  hasFinishedRecording: boolean;
  starredWords: string[];
  onToggleStar: (wordText: string) => void;
  onGenerateSentence: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeSection, 
  hasFinishedRecording,
  starredWords,
  onToggleStar,
  onGenerateSentence
}) => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] border-r border-zinc-800/80 bg-[#09090b]/95 backdrop-blur-md flex flex-col justify-between shrink-0 z-30 font-sans shadow-2xl">
      <div className="flex flex-col">
        {/* Logo */}
        <div className="p-6 flex flex-col gap-1.5 border-b border-zinc-900/60">
          <span className="text-xl font-black tracking-tight text-premium-gradient flex items-center gap-2 font-sans">
            EchoFlow
            <span className="text-[9px] tracking-widest font-mono text-[#10b981] bg-[#10b981]/15 px-2 py-0.5 border border-[#10b981]/25 rounded-md uppercase font-bold">PRO</span>
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex h-2 w-2 rounded-full bg-[#10b981] relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#10b981] font-extrabold font-mono">Engine Status: Active</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 flex flex-col gap-1.5">
          <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-black px-3.5 mb-1.5 font-mono">Tour Roadmap</span>
          
          {[
            { label: "1. Acoustic Intro", section: 0, scrollTop: 0, show: true },
            { label: "2. Practice Arena", section: 1, scrollTop: 1, show: true },
            { label: "3. AI Diagnostics", section: 2, scrollTop: 3, show: hasFinishedRecording }
          ].map((item, idx) => {
            if (!item.show) return null;
            const isActive = activeSection === item.section;
            return (
              <button 
                key={idx}
                onClick={() => {
                  window.scrollTo({
                    top: item.scrollTop * window.innerHeight,
                    behavior: 'smooth'
                  });
                }}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-[13px] font-bold transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-zinc-900 text-white border border-zinc-800 shadow-[0_4px_12px_rgba(0,0,0,0.4)] scale-102'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40 hover:translate-x-1'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full transition-all duration-300 ${isActive ? 'bg-[#10b981] shadow-[0_0_8px_#10b981]' : 'bg-zinc-700'}`} />
                  {item.label}
                </span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#10b981] animate-pulse" />}
              </button>
            );
          })}
        </nav>

        {/* Vocabulary Section */}
        <div className="px-4 py-4 border-t border-zinc-900/60 flex flex-col gap-3">
          <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-black px-3.5 font-mono">Vocabulary Box ({starredWords.length})</span>
          
          <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-3 flex flex-col gap-3.5 shadow-inner">
            {starredWords.length > 0 ? (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1 no-scrollbar">
                  {starredWords.map((word, idx) => (
                    <span 
                      key={idx} 
                      className="px-2.5 py-1 rounded-lg bg-zinc-900/90 border border-zinc-800 text-[12px] text-zinc-200 font-semibold flex items-center gap-1.5 hover:border-zinc-700 transition-all hover:scale-102 hover:bg-zinc-900 shadow-sm animate-word-pop"
                    >
                      {word.replace(/[^a-zA-Z]/g, "")}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStar(word);
                        }}
                        className="text-zinc-500 hover:text-red-400 focus:outline-none ml-0.5 font-black text-sm cursor-pointer transition-colors"
                        title="Remove word"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                
                <button
                  onClick={onGenerateSentence}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-450 hover:to-teal-450 text-white font-extrabold text-xs transition-all duration-300 shadow-lg shadow-emerald-950/40 hover:scale-102 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 fill-current" />
                  AI Generate Custom Drill
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                <div className="border border-dashed border-zinc-800/80 rounded-xl p-4 text-center flex flex-col items-center justify-center gap-2 bg-zinc-900/10">
                  <div className="p-2 rounded-full bg-zinc-900 border border-zinc-850 text-zinc-500 shadow-inner">
                    <Star className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-[11px] text-zinc-300 font-bold">Vocabulary List Empty</span>
                  <p className="text-[10px] text-zinc-400 leading-relaxed max-w-[170px]">
                    Click target words in the arena and star them to generate a custom practice drill.
                  </p>
                </div>
                
                <button
                  onClick={onGenerateSentence}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-450 hover:to-violet-450 text-white font-extrabold text-xs transition-all duration-300 shadow-lg shadow-indigo-950/40 hover:scale-102 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 fill-current animate-pulse" />
                  AI Generate Random Drill
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Card */}
      <div className="p-4 border-t border-zinc-900/60 bg-[#09090b]/85 flex flex-col gap-3">
        <div className="flex items-center justify-between text-[10px] bg-zinc-950/80 border border-zinc-850 px-3 py-2 rounded-xl text-zinc-350 font-semibold font-mono shadow-inner">
          <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-[#10b981] fill-[#10b981]/15" /> Practice Goal</span>
          <span className="font-extrabold text-white">15 / 20 min</span>
        </div>
        <div className="flex items-center gap-3 px-1.5 py-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#10b981] to-zinc-900 flex items-center justify-center border border-zinc-800 text-white font-black text-xs shadow-md">C</div>
          <div className="flex flex-col overflow-hidden text-left">
            <span className="text-[12px] font-bold text-zinc-200 truncate">Carl (Shadowing)</span>
            <span className="text-[9px] text-zinc-450 font-mono truncate">carl@echoflow.ai</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

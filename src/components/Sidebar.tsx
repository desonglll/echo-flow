import React from 'react';
import { ChevronRight, Zap } from 'lucide-react';

interface SidebarProps {
  activeSection: number;
  hasFinishedRecording: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, hasFinishedRecording }) => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] border-r border-[#222226]/40 bg-[#09090b]/80 backdrop-blur-md flex flex-col justify-between shrink-0 z-30">
      <div className="flex flex-col">
        {/* Logo */}
        <div className="p-6 flex flex-col gap-1">
          <span className="text-lg font-bold tracking-tight text-premium-gradient flex items-center gap-1.5 font-sans">
            EchoFlow
            <span className="text-[9px] tracking-widest font-mono text-[#10b981] bg-[#10b981]/10 px-1.5 py-0.5 rounded-sm uppercase font-semibold">PRO</span>
          </span>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="flex h-1.5 w-1.5 rounded-full bg-[#10b981] relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
            </span>
            <span className="text-[9px] uppercase tracking-[0.18em] text-zinc-500 font-semibold font-mono">Engine: Active</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 flex flex-col gap-1">
          <span className="text-[9px] uppercase tracking-[0.18em] text-zinc-600 font-semibold px-3 mb-2 font-mono">Scrollytelling Tour</span>
          
          {[
            { label: "1. Acoustic Intro", section: 0, scrollTop: 0, show: true },
            { label: "2. Practice Arena", section: 1, scrollTop: 1, show: true },
            { label: "3. AI Diagnostics", section: 2, scrollTop: 3, show: hasFinishedRecording }
          ].map((item, idx) => {
            if (!item.show) return null;
            return (
              <button 
                key={idx}
                onClick={() => {
                  window.scrollTo({
                    top: item.scrollTop * window.innerHeight,
                    behavior: 'smooth'
                  });
                }}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs font-medium transition-all cursor-pointer ${
                  activeSection === item.section
                    ? 'bg-zinc-900 text-white border border-zinc-800/60 shadow-lg'
                    : 'text-zinc-500 hover:text-zinc-350 hover:bg-zinc-900/20'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${activeSection === item.section ? 'bg-[#10b981]' : 'bg-zinc-700'}`} />
                  {item.label}
                </span>
                {activeSection === item.section && <ChevronRight className="w-3 h-3 text-[#10b981] animate-pulse" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Card */}
      <div className="p-4 border-t border-[#222226]/40 bg-[#09090b]/85 flex flex-col gap-3">
        <div className="flex items-center justify-between text-[10px] bg-zinc-950/80 border border-zinc-800/50 px-2.5 py-1.5 rounded-lg text-zinc-400 font-mono">
          <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-[#10b981] fill-[#10b981]/10" /> Practice Goal</span>
          <span className="font-semibold text-white">15 / 20 min</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#10b981] to-zinc-900 flex items-center justify-center border border-zinc-850 text-white font-semibold text-xs">C</div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-semibold text-zinc-350 truncate">Carl (Shadowing)</span>
            <span className="text-[9px] text-zinc-500 font-mono truncate">carl@echoflow.ai</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

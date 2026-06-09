import React from 'react';

interface NavigationDotsProps {
  activeSection: number;
  hasFinishedRecording: boolean;
}

export const NavigationDots: React.FC<NavigationDotsProps> = ({ activeSection, hasFinishedRecording }) => {
  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3.5 z-45">
      {[
        { label: 'Intro', scrollTop: 0, section: 0, show: true },
        { label: 'Arena', scrollTop: 1, section: 1, show: true },
        { label: 'Diagnostics', scrollTop: 3, section: 2, show: hasFinishedRecording }
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
            className="group flex items-center justify-end gap-2.5 focus:outline-none cursor-pointer"
          >
            <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pr-1">
              {item.label}
            </span>
            <span className={`w-2 h-2 rounded-full border transition-all duration-300 ${
              activeSection === item.section 
                ? 'bg-[#10b981] border-[#10b981] scale-125 shadow-[0_0_8px_rgba(16,185,129,0.8)]' 
                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-500'
            }`} />
          </button>
        );
      })}
    </div>
  );
};

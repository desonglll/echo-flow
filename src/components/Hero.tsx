import React from 'react';
import { Sparkles } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="h-screen w-full flex flex-col items-center justify-center relative p-8 border-b border-[#222226]/20">
      <div className="max-w-[800px] text-center flex flex-col items-center gap-6 animate-slide-up">
        <div className="inline-flex items-center gap-2.5 bg-zinc-900 border border-zinc-800/80 rounded-full px-3.5 py-1 text-[10px] tracking-[0.15em] text-zinc-400 font-mono uppercase">
          <Sparkles className="w-3.5 h-3.5 text-[#10b981]" />
          <span>AI Connected Speech Shadowing</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-extralight tracking-tighter text-white leading-tight">
          Capture the flow of <br />
          <span className="text-[#10b981] font-normal bg-gradient-to-r from-emerald-400 to-[#10b981] bg-clip-text text-transparent">native rhythm.</span>
        </h1>
        
        <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-[550px] font-light">
          EchoFlow maps the fluid, connected boundaries of speech that spelling apps ignore, turning pronunciation liaisons into actionable visual coaching cards.
        </p>
        
        <div className="mt-8 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#10b981] font-mono font-bold">SCROLL DOWN TO ACCESS THE SHADOWING ARENA</span>
          <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
        </div>
      </div>
    </section>
  );
};

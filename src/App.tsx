import { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Sparkles,
  X,
  ChevronRight,
  Play,
  RotateCcw,
  Zap
} from 'lucide-react';
import './App.css';

// Type definitions
interface WordItem {
  text: string;
  type: 'perfect' | 'liaison' | 'flat' | 'none';
  ipa: string;
  tip: string;
  definition: string;
  timestamp: string; // timestamp for podcast visual alignment
  accuracy: 'good' | 'average' | 'poor';
}

// Data for the tech podcast transcript (with timestamps and full translations)
const transcriptWords: WordItem[] = [
  { text: "The", type: "none", ipa: "ðə", tip: "Standard weak form definite article.", definition: "art. 这，那（用于特指所指的人、物或事物）", timestamp: "0:00", accuracy: "good" },
  { text: "future", type: "perfect", ipa: "ˈfjuː.tʃər", tip: "Perfect vowel duration and clean release.", definition: "n. 未来，前途 | adj. 将来的，未来的", timestamp: "0:01.2", accuracy: "good" },
  { text: "of", type: "none", ipa: "əv", tip: "Standard weak form preposition.", definition: "prep. 属于……的，关于，由……制成", timestamp: "0:02.0", accuracy: "good" },
  { text: "LLMs", type: "perfect", ipa: "el.el.emz", tip: "Crisp pronunciation of initials with correct nasal final sound.", definition: "n. 大语言模型 (Large Language Models 的缩写)", timestamp: "0:02.8", accuracy: "good" },
  { text: "and", type: "none", ipa: "ænd", tip: "Standard coordinating conjunction.", definition: "conj. 和，与，而且，然后", timestamp: "0:04.2", accuracy: "good" },
  { 
    text: "agentic", 
    type: "liaison", 
    ipa: "əˈdʒen.tɪk", 
    tip: "✨ Mouth Tip: Link the 'c' sound into the next vowel 'w' (agentic-workflows) without a hard glottal stop.", 
    definition: "adj. (语言学/AI) 代理的，有主动权的；(计算机) 智能体的",
    timestamp: "0:05.0",
    accuracy: "average"
  },
  { 
    text: "workflows", 
    type: "flat", 
    ipa: "ˈwɜːk.fləʊz", 
    tip: "❌ Pronunciation Error: The final consonant '/z/' was omitted and the vowel '/ɜː/' sound was too flat.", 
    definition: "n. 工作流，工作步骤的序列",
    timestamp: "0:06.5",
    accuracy: "poor"
  },
  { text: "will", type: "none", ipa: "wɪl", tip: "Modal verb indicating future action.", definition: "v. 将，会；愿意，要 | n. 意志，遗嘱", timestamp: "0:08.0", accuracy: "good" },
  { text: "require", type: "perfect", ipa: "rɪˈkwaɪər", tip: "Excellent rhotic vowel transition.", definition: "v. 需要，要求，命令", timestamp: "0:08.8", accuracy: "good" },
  { text: "human-in-the-loop", type: "perfect", ipa: "ˌhjuː.mən.ɪn.ðə.luːp", tip: "Superb liaison linking. Sounded exactly like 'human-in-the-loop'.", definition: "n. 人机协同，人机回环控制（指AI流程中引入人类审核）", timestamp: "0:10.0", accuracy: "good" },
  { 
    text: "autonomous", 
    type: "liaison", 
    ipa: "ɔːˈtɒn.ə.məs", 
    tip: "✨ Mouth Tip: Blend the final 's' sound directly into the 'f' of 'feedback' for a seamless transition.", 
    definition: "adj. 自治的，自主的，独立存在的",
    timestamp: "0:11.8",
    accuracy: "average"
  },
  { text: "feedback", type: "perfect", ipa: "ˈfiːd.bæk", tip: "Clean stop consonant articulation.", definition: "n. 反馈，反馈信息", timestamp: "0:13.0", accuracy: "good" },
  { 
    text: "loops.", 
    type: "flat", 
    ipa: "luːps", 
    tip: "❌ Pronunciation Error: Vowel sound '/uː/' was distorted and the final stop was too heavy.", 
    definition: "n. 循环，回路，圈",
    timestamp: "0:14.0",
    accuracy: "poor"
  }
];

export default function App() {
  // Scrollytelling active state tracker
  const [activeSection, setActiveSection] = useState<number>(0);
  const [arenaProgress, setArenaProgress] = useState<number>(0);
  
  // Application State
  const [shadowState, setShadowState] = useState<'ready' | 'recording' | 'analyzing' | 'result'>('ready');
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);
  const [popoverDirection, setPopoverDirection] = useState<'top' | 'bottom'>('top');
  
  // Mouse Follower Coordinates
  const [mousePos, setMousePos] = useState({ x: -450, y: -450 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Audio playback simulation states
  const [activeAudioWord, setActiveAudioWord] = useState<number | null>(null);
  
  // Time and Milisecond counters for recording state
  const [recordingMillis, setRecordingMillis] = useState<number>(0);
  const millisIntervalRef = useRef<any>(null);
  
  // Score details with animated count-up states
  const [scoreCount, setScoreCount] = useState<number>(0);
  const [metricsVisible, setMetricsVisible] = useState<boolean>(false);
  const [analyzingProgress, setAnalyzingProgress] = useState<number>(0);
  
  // Dynamic Liquid Wave Path Points
  const [wavePoints, setWavePoints] = useState<number[]>(Array.from({ length: 30 }, () => 12));
  const wavePointsRef = useRef<any>(null);
  
  // Analyzing state sub-text updates
  const [analyzingMessage, setAnalyzingMessage] = useState<string>("Analyzing voice alignment...");

  // Capture mouse move for dynamic spotlight glow
  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  // Scroll tracker logic
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const height = window.innerHeight;
      
      // Calculate active section index based on scroll offsets
      let index = 0;
      if (scrollTop < height) {
        index = 0;
      } else if (scrollTop < 3 * height) {
        index = 1;
      } else if (scrollTop < 4 * height) {
        index = 2;
      } else {
        index = 3;
      }
      setActiveSection(index);
      
      // Calculate scroll progress specifically within the 200vh Practice Arena track
      if (scrollTop >= height && scrollTop < 3 * height) {
        const progress = (scrollTop - height) / (2 * height);
        setArenaProgress(progress);
      } else {
        setArenaProgress(0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Web Audio Synth to create high fidelity sound cues
  const playSynthSound = (freqs: number[], duration: number = 0.1, type: OscillatorType = 'sine') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      freqs.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = type;
        osc.frequency.value = freq;
        
        const startTime = ctx.currentTime + (index * 0.08);
        const endTime = startTime + duration;
        
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, endTime);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(startTime);
        osc.stop(endTime + 0.05);
      });
    } catch (e) {
      console.warn("Audio Context blocked: ", e);
    }
  };

  // Keyboard spacebar listener (only active on the Practice Arena [Section 1])
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && activeSection === 1) {
        e.preventDefault();
        handleMainActionClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shadowState, activeSection]);

  // Audio liquid waveform animation when recording
  useEffect(() => {
    if (shadowState === 'recording') {
      const startTime = Date.now();
      wavePointsRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        setWavePoints(prev => prev.map((_, idx) => {
          const baseWave = Math.sin(idx * 0.6 + elapsed * 12) * 7;
          const secondaryWave = Math.cos(idx * 0.3 - elapsed * 18) * 3;
          const noise = Math.random() * 2.5;
          return Math.max(2, Math.min(22, 12 + baseWave + secondaryWave + noise));
        }));
      }, 40);
    } else {
      if (wavePointsRef.current) {
        clearInterval(wavePointsRef.current);
      }
    }
    return () => {
      if (wavePointsRef.current) clearInterval(wavePointsRef.current);
    };
  }, [shadowState]);

  // Subsecond counter when recording (0 to 15 seconds)
  useEffect(() => {
    if (shadowState === 'recording') {
      setRecordingMillis(0);
      const start = Date.now();
      millisIntervalRef.current = setInterval(() => {
        const diff = (Date.now() - start) / 1000;
        setRecordingMillis(diff);
        if (diff >= 15) {
          handleMainActionClick();
        }
      }, 100);
    } else {
      if (millisIntervalRef.current) {
        clearInterval(millisIntervalRef.current);
      }
    }
    return () => {
      if (millisIntervalRef.current) clearInterval(millisIntervalRef.current);
    };
  }, [shadowState]);

  // Section 3 (Analysis Results, activeSection === 2) Auto-Score Count-up activation
  useEffect(() => {
    if (activeSection === 2) {
      setShadowState('result');
      
      // Score count up animation
      setScoreCount(0);
      const end = 92;
      const duration = 1200; // ms
      const startTime = performance.now();
      
      const animateScore = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = progress * (2 - progress);
        const currentScore = Math.floor(easedProgress * end);
        setScoreCount(currentScore);
        
        if (progress < 1) {
          requestAnimationFrame(animateScore);
        } else {
          setScoreCount(end);
        }
      };
      requestAnimationFrame(animateScore);
      
      // Trigger metric loading bars
      const timer = setTimeout(() => {
        setMetricsVisible(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setScoreCount(0);
      setMetricsVisible(false);
    }
  }, [activeSection]);

  // Digital progress loader calculation
  useEffect(() => {
    if (shadowState === 'analyzing') {
      setAnalyzingProgress(0);
      const timer = setInterval(() => {
        setAnalyzingProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prev + 2;
        });
      }, 22);
      return () => clearInterval(timer);
    } else {
      setAnalyzingProgress(0);
    }
  }, [shadowState]);

  // Handle flow transitions
  const handleMainActionClick = () => {
    if (shadowState === 'ready') {
      playSynthSound([523.25, 659.25], 0.15, 'triangle');
      setShadowState('recording');
      setSelectedWordIndex(null);
    } else if (shadowState === 'recording') {
      playSynthSound([659.25, 523.25], 0.15, 'triangle');
      setShadowState('analyzing');
      setAnalyzingMessage("Aligning phonetic structures...");
      
      setTimeout(() => {
        setAnalyzingMessage("Evaluating speech liaisons...");
      }, 750);
      
      setTimeout(() => {
        setAnalyzingMessage("Calculating pitch contours...");
      }, 1400);

      // Finish analyzing and automatically scroll user to Section 3 (Analysis, scroll offset 300vh)
      setTimeout(() => {
        setShadowState('result');
        playSynthSound([523.25, 659.25, 783.99, 1046.50], 0.4, 'sine');
        
        // Smooth scroll to Section 3 (Index 2, 300vh)
        window.scrollTo({
          top: 3 * window.innerHeight,
          behavior: 'smooth'
        });
      }, 2200);
    } else if (shadowState === 'result') {
      setShadowState('ready');
      setSelectedWordIndex(null);
      setRecordingMillis(0);
      setWavePoints(Array.from({ length: 30 }, () => 12));
    }
  };

  // Convert array of wave values into a smooth Bezier SVG path
  const getPathFromPoints = (points: number[]) => {
    const width = 100;
    const step = width / (points.length - 1);
    let path = `M 0 ${points[0]}`;
    for (let i = 1; i < points.length; i++) {
      const x = i * step;
      const y = points[i];
      const prevX = (i - 1) * step;
      const prevY = points[i - 1];
      const cpX = prevX + step / 2;
      path += ` C ${cpX} ${prevY}, ${cpX} ${y}, ${x} ${y}`;
    }
    return path;
  };

  // Play isolated audio for clicked word
  const playWordAudio = (_word: WordItem, index: number, source: 'native' | 'user') => {
    setActiveAudioWord(index);
    if (source === 'native') {
      playSynthSound([440, 554.37], 0.22, 'sine');
    } else {
      playSynthSound([420, 520], 0.22, 'sawtooth');
    }
    setTimeout(() => {
      setActiveAudioWord(null);
    }, 280);
  };

  // Helper to parse "MM:SS.SS" timestamps into numbers representing total seconds
  const parseTimestamp = (timeStr: string) => {
    const parts = timeStr.split(':');
    const minutes = parseInt(parts[0], 10);
    const seconds = parseFloat(parts[1]);
    return minutes * 60 + seconds;
  };

  // Find index of the currently spoken/transcribed word during recording
  const currentActiveWordIndex = shadowState === 'recording'
    ? transcriptWords.findIndex((item, idx) => {
        const wordTime = parseTimestamp(item.timestamp);
        const nextWordTime = idx < transcriptWords.length - 1 
          ? parseTimestamp(transcriptWords[idx + 1].timestamp) 
          : 999;
        return recordingMillis >= wordTime && recordingMillis < nextWordTime;
      })
    : -1;

  // Wave paths for results and reference curves
  const nativeReferencePath = "M 0 12 C 12 5, 20 3, 30 12 C 40 21, 48 21, 58 12 C 68 3, 76 3, 86 12 C 92 19, 96 19, 100 12";
  const userResultPath = "M 0 12 C 12 6, 20 4, 30 12 C 34 12, 38 12, 42 12 C 46 12, 48 21, 58 12 C 68 4, 72 12, 75 12 C 78 12, 80 12, 86 12 C 92 18, 96 18, 100 12";

  // Progress percentage out of 15 seconds
  const recordLimitPercent = Math.min((recordingMillis / 15) * 100, 100);

  // Scrollytelling parameters:
  // Right panel slides in during progress 0 to 0.45
  const slideTranslateX = activeSection === 1
    ? Math.max(0, (0.45 - arenaProgress) / 0.45 * 125)
    : activeSection > 1 ? 0 : 125;

  const hasFinishedRecording = shadowState === 'result';

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="w-full bg-[#09090b] text-[#ededef] font-sans relative"
    >
      {/* Fixed Mouse Follower Spotlight Glow */}
      <div 
        className="fixed pointer-events-none rounded-full blur-[120px] opacity-30 transition-all duration-300 hidden md:block"
        style={{
          left: `${mousePos.x - 250}px`,
          top: `${mousePos.y - 250}px`,
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)',
          zIndex: 0,
        }}
      />

      {/* Fixed Left Sidebar Panel */}
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
            <span className="text-[9px] uppercase tracking-[0.18em] text-zinc-655 font-semibold px-3 mb-2 font-mono">Scrollytelling Tour</span>
            
            {[
              { label: "1. Acoustic Intro", section: 0, scrollTop: 0, show: true },
              { label: "2. Practice Arena", section: 1, scrollTop: 1, show: true },
              { label: "3. Liaison Mapping", section: 2, scrollTop: 3, show: hasFinishedRecording },
              { label: "4. Speech Diagnosis", section: 3, scrollTop: 4, show: hasFinishedRecording }
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
              <span className="text-[9px] text-zinc-655 font-mono truncate">carl@echoflow.ai</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Right Side Navigation Dots Indicator */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3.5 z-45">
        {[
          { label: 'Intro', scrollTop: 0, section: 0, show: true },
          { label: 'Arena', scrollTop: 1, section: 1, show: true },
          { label: 'Analysis', scrollTop: 3, section: 2, show: hasFinishedRecording },
          { label: 'Diagnostic', scrollTop: 4, section: 3, show: hasFinishedRecording }
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
                  : 'bg-zinc-900 border-zinc-850 hover:border-zinc-500'
              }`} />
            </button>
          );
        })}
      </div>

      {/* Scrollable Viewports stack */}
      <div className="pl-[260px] w-full min-h-screen relative z-10">
        
        {/* SECTION 1: The Intro/Hero Screen */}
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

        {/* SECTION 2 & 3: Sticky Practice Arena (h-[200vh]) */}
        <div className="h-[200vh] relative w-full border-b border-[#222226]/20">
          <div className="sticky top-0 h-screen w-full flex items-center justify-center px-12 overflow-hidden">
            
            {/* Grid Container for Left Content and Right sliding-in recorder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-[1400px] items-center relative">
              
              {/* Left Column - Transcript Material */}
              <div className="premium-card rounded-2xl p-8 flex flex-col gap-6 shadow-2xl relative h-[450px]">
                <div className="flex items-center justify-between border-b border-zinc-800/40 pb-4 shrink-0">
                  <div className="flex flex-col gap-0.5">
                    {shadowState === 'recording' ? (
                      <>
                        <span className="text-[9px] tracking-[0.2em] text-red-400 font-bold uppercase font-mono flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-red-505 rounded-full inline-block animate-pulse bg-red-500" />
                          ASR DECODER ACTIVE
                        </span>
                        <h2 className="text-sm font-semibold text-zinc-200">Real-time Recognition Feed</h2>
                      </>
                    ) : (
                      <>
                        <span className="text-[9px] tracking-[0.2em] text-[#10b981] font-bold uppercase font-mono">STEP 01 / target text</span>
                        <h2 className="text-sm font-semibold text-zinc-300">Speech Target Material</h2>
                      </>
                    )}
                  </div>
                  {shadowState === 'recording' ? (
                    <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 border border-zinc-850 rounded">
                      <span className="text-[#10b981] font-bold">16KHz</span>
                      <span className="text-zinc-600">|</span>
                      <span>ACCURACY CODED</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-550 bg-zinc-950 px-2 py-0.5 border border-zinc-850 rounded">
                      <span>TIMELINE ACTIVE</span>
                    </div>
                  )}
                </div>

                {/* Podcast Timed Transcript Layout */}
                <div className="flex-1 py-2 overflow-y-auto flex items-start gap-4 pr-2 select-text">
                  
                  {/* Podcasting Line Timestamps */}
                  <div className="flex flex-col gap-8 text-[9px] font-mono text-zinc-600 w-10 pt-1 shrink-0 border-r border-zinc-800/40 pr-2.5">
                    <div className="h-6 flex items-center justify-end">00:00</div>
                    <div className="h-6 flex items-center justify-end">00:03</div>
                    <div className="h-6 flex items-center justify-end">00:07</div>
                    <div className="h-6 flex items-center justify-end">00:10</div>
                    <div className="h-6 flex items-center justify-end">00:13</div>
                  </div>

                  {/* Words Paragraph */}
                  <div className="flex-1 leading-[2.9rem] tracking-wide text-[19px] font-sans font-light text-zinc-300">
                    {transcriptWords.map((item, idx) => {
                      const isSelected = selectedWordIndex === idx;
                      
                      // Default styling
                      let textClass = "text-zinc-300 hover:text-white hover:bg-zinc-800/60 px-1.5 py-0.5 rounded cursor-pointer transition-all duration-200";
                      
                      // Highlight logic during active recording
                      if (shadowState === 'recording') {
                        const wordTime = parseTimestamp(item.timestamp);
                        const isSpoken = recordingMillis >= wordTime;
                        const isActive = idx === currentActiveWordIndex;
                        
                        if (isActive) {
                          // Currently speaking word: active glow
                          textClass = "text-white bg-zinc-850 px-1.5 py-0.5 rounded cursor-pointer ring-1 ring-zinc-700 shadow-[0_0_8px_rgba(255,255,255,0.08)] font-normal transition-all duration-150";
                        } else if (isSpoken) {
                          // Already spoken: accuracy color coding
                          if (item.accuracy === 'good') {
                            textClass = "text-[#34d399] bg-[#10b981]/8 px-1.5 py-0.5 rounded cursor-pointer border-b border-[#10b981]/30 transition-colors duration-300";
                          } else if (item.accuracy === 'average') {
                            textClass = "text-[#fbbf24] bg-[#fbbf24]/8 px-1.5 py-0.5 rounded cursor-pointer border-b border-dashed border-[#fbbf24]/40 transition-colors duration-300";
                          } else {
                            textClass = "text-[#ef4444] bg-[#ef4444]/8 px-1.5 py-0.5 rounded cursor-pointer underline decoration-wavy decoration-[#ef4444]/50 underline-offset-4 transition-colors duration-300";
                          }
                        } else {
                          // Future upcoming words: dimmed and blurred
                          textClass = "text-zinc-650 opacity-30 blur-[0.5px] px-1.5 py-0.5 rounded cursor-not-allowed transition-all duration-300";
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
                        <span key={idx} className="relative inline-block mx-0.5">
                          <button
                            onClick={(e) => {
                              // Prevent lookup during recording to keep focus on speaking
                              if (shadowState === 'recording') return;
                              
                              playWordAudio(item, idx, 'native');
                              if (isSelected) {
                                setSelectedWordIndex(null);
                              } else {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const showBelow = rect.top < 280;
                                setPopoverDirection(showBelow ? 'bottom' : 'top');
                                setSelectedWordIndex(idx);
                              }
                            }}
                            disabled={shadowState === 'recording'}
                            className={`${textClass} focus:outline-none`}
                          >
                            {item.text}
                            {shadowState === 'recording' && idx === currentActiveWordIndex && (
                              <span className="text-[#10b981] ml-0.5 animate-cursor font-semibold">|</span>
                            )}
                          </button>

                          {/* Speech Wave Ripple Indicator */}
                          {activeAudioWord === idx && (
                            <span className="absolute -top-1 -right-1 flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#10b981]"></span>
                            </span>
                          )}

                          {/* Floating Dictionary Tooltip */}
                          {isSelected && (
                            <div className={`absolute left-1/2 ${
                              popoverDirection === 'top' 
                                ? 'bottom-full mb-3.5 animate-spring-in' 
                                : 'top-full mt-3.5 animate-spring-in-below'
                            } z-50 w-[270px] bg-[#09090b]/95 backdrop-blur-xl border border-zinc-800/80 rounded-xl p-4 shadow-2xl flex flex-col gap-3 text-left`}>
                              <div className="flex items-center justify-between border-b border-zinc-800/50 pb-1.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-white text-sm font-mono">{item.text.replace(/[^a-zA-Z]/g, "")}</span>
                                  <span className="text-[10px] text-zinc-500 font-mono">{item.ipa}</span>
                                </div>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedWordIndex(null);
                                  }}
                                  className="p-0.5 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-white cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className="bg-[#121214]/85 border border-zinc-850 rounded p-2 text-xs text-zinc-250 leading-relaxed font-light">
                                {item.definition}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedWordIndex(null);
                                  playWordAudio(item, idx, 'native');
                                }}
                                className="w-full bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 text-zinc-300 text-xs py-1.5 rounded transition-all flex items-center justify-center gap-1 cursor-pointer font-medium"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                <span>Hear Native Syllable</span>
                              </button>
                            </div>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Live ASR Telemetry Console */}
                {shadowState === 'recording' ? (
                  <div className="mt-2 bg-[#121214]/90 border border-zinc-800/80 rounded-xl p-3 flex flex-col gap-1.5 font-mono text-left animate-slide-up shrink-0">
                    <div className="flex items-center justify-between border-b border-zinc-800/50 pb-1">
                      <span className="text-[8px] uppercase tracking-wider text-zinc-550 font-bold">ASR Engine Telemetry Log</span>
                      <span className="text-[8px] text-[#10b981] font-semibold flex items-center gap-1.5">
                        <span className="w-1 h-1 bg-[#10b981] rounded-full inline-block animate-pulse" />
                        <span className="text-zinc-400">STREAMING DECODE</span>
                        <div className="flex items-center gap-0.5 h-2.5">
                          <div className="w-0.5 h-full bg-[#10b981] rounded-full animate-audio-bar-1" />
                          <div className="w-0.5 h-full bg-[#10b981] rounded-full animate-audio-bar-2" />
                          <div className="w-0.5 h-full bg-[#10b981] rounded-full animate-audio-bar-3" />
                        </div>
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-300 leading-normal flex items-start gap-1">
                      <span className="text-[#10b981] shrink-0 font-bold">&gt;_ ASR:</span>
                      <span className="text-zinc-200">
                        {currentActiveWordIndex >= 0 ? (
                          <>
                            {transcriptWords.slice(0, currentActiveWordIndex + 1).map(w => w.text).join(" ")}
                            <span className="inline-block w-1.5 h-3 bg-[#10b981] ml-0.5 animate-cursor" />
                          </>
                        ) : (
                          <span className="text-zinc-600 italic">Listening for speech tokens...</span>
                        )}
                      </span>
                    </div>
                  </div>
                ) : shadowState === 'result' ? (
                  <div className="mt-2 bg-zinc-950/40 border border-zinc-905 rounded-xl p-3 flex items-center justify-between font-mono text-left shrink-0">
                    <span className="text-[8px] uppercase tracking-wider text-zinc-550 font-bold">ASR Session summary</span>
                    <span className="text-[9px] text-[#10b981] font-semibold">13/13 WORDS PROCESSED</span>
                  </div>
                ) : (
                  <div className="mt-2 bg-zinc-950/40 border border-zinc-905 rounded-xl p-3 flex items-center justify-between font-mono text-left shrink-0">
                    <span className="text-[8px] uppercase tracking-wider text-zinc-550 font-bold">ASR DECODER</span>
                    <span className="text-[9px] text-zinc-555">READY FOR VOICE INPUT</span>
                  </div>
                )}
              </div>

              {/* Right Column - Recording Visualizer Console (Slides in from the right edge) */}
              <div 
                className="premium-card rounded-2xl p-8 flex flex-col gap-6 shadow-2xl relative h-[450px] transition-transform duration-100 ease-out"
                style={{ transform: `translateX(${slideTranslateX}%)` }}
              >
                
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
                    <h2 className="text-sm font-semibold text-zinc-300">Acoustic Console</h2>
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
                        <path d={getPathFromPoints(wavePoints)} fill="none" stroke="#10b981" strokeWidth="2" />
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
                        <path d={userResultPath} fill="none" stroke="#10b981" strokeWidth="2" />
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
                    <div className="mt-2 bg-[#10b981]/5 border border-[#10b981]/20 rounded-lg py-2 px-3 text-[10px] text-[#10b981] font-semibold flex items-center gap-1.5 animate-bounce shadow-md">
                      <Sparkles className="w-3.5 h-3.5 text-[#10b981] animate-pulse" />
                      <span>Recording complete. Scroll down for AI results!</span>
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        </div>

        {/* SECTION 4: Rhythmic Alignment Analysis (Comparison Wave & Score counts, scroll offset 300vh) */}
        {hasFinishedRecording && (
          <section className="h-screen w-full flex items-center justify-center p-8 border-b border-[#222226]/20 relative">
            <div className="max-w-[800px] w-full flex flex-col gap-6 premium-card rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center justify-between border-b border-zinc-800/40 pb-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] tracking-[0.2em] text-[#10b981] font-bold uppercase font-mono">STEP 03 / COMPARISON RESULTS</span>
                  <h2 className="text-sm font-semibold text-zinc-300">Continuous Amplitude Overlays</h2>
                </div>
                <div className="flex items-center gap-1.5 bg-[#10b981]/5 border border-[#10b981]/25 rounded-full px-2.5 py-0.5 text-[10px] text-[#10b981] font-semibold font-mono">
                  OVERALL MATCH: {scoreCount}%
                </div>
              </div>

              {/* Overlapping wave box */}
              <div className="h-[150px] w-full bg-zinc-950 border border-zinc-800/60 rounded-xl relative flex flex-col justify-end p-4 overflow-hidden">
                <div className="absolute top-3 left-3 flex flex-col gap-0.5 text-[9px] font-mono text-zinc-500">
                  <span className="text-zinc-650">Grey Dashed = Native reference</span>
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
                    <path d={userResultPath} fill="none" stroke="#10b981" strokeWidth="2" />
                    
                    {/* Highlight correction sections */}
                    <path d="M 34 12 L 42 12" fill="none" stroke="#fbbf24" strokeWidth="2.5" />
                    <path d="M 72 12 L 78 12" fill="none" stroke="#fbbf24" strokeWidth="2.5" />
                  </svg>

                  {/* Hotspot overlays */}
                  <button 
                    onClick={() => {
                      setSelectedWordIndex(5);
                      playWordAudio(transcriptWords[5], 5, 'native');
                    }}
                    className="absolute bottom-0 left-[34%] w-[8%] h-full border-x border-t border-dashed border-amber-500/20 bg-amber-500/[0.01] hover:bg-amber-500/[0.04] transition-colors flex items-start justify-center pt-2 cursor-pointer focus:outline-none group/gate"
                  >
                    <span className="text-[8px] font-mono text-[#fbbf24] bg-zinc-950 border border-amber-500/20 px-1 rounded-sm uppercase font-semibold">LINK 1</span>
                  </button>

                  <button 
                    onClick={() => {
                      setSelectedWordIndex(10);
                      playWordAudio(transcriptWords[10], 10, 'native');
                    }}
                    className="absolute bottom-0 left-[72%] w-[6%] h-full border-x border-t border-dashed border-amber-500/20 bg-amber-500/[0.01] hover:bg-amber-500/[0.04] transition-colors flex items-start justify-center pt-2 cursor-pointer focus:outline-none group/gate"
                  >
                    <span className="text-[8px] font-mono text-[#fbbf24] bg-zinc-950 border border-amber-500/20 px-1 rounded-sm uppercase font-semibold">LINK 2</span>
                  </button>
                </div>
              </div>

              {/* Score slide-out bars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-950/40 border border-zinc-800/50 rounded-xl p-4 flex flex-col gap-1.5 text-left">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-zinc-550 uppercase">Pronunciation</span>
                    <span className="text-white font-bold">94%</span>
                  </div>
                  <div className="w-full bg-zinc-800/60 h-1 rounded-full overflow-hidden mt-1">
                    <div 
                      className="bg-[#10b981] h-full rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: metricsVisible ? '94%' : '0%' }}
                    />
                  </div>
                </div>

                <div className="bg-zinc-950/40 border border-zinc-800/50 rounded-xl p-4 flex flex-col gap-1.5 text-left">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-amber-500 uppercase">Liaison (Flow)</span>
                    <span className="text-amber-500 font-bold">89%</span>
                  </div>
                  <div className="w-full bg-zinc-800/60 h-1 rounded-full overflow-hidden mt-1">
                    <div 
                      className="bg-[#fbbf24] h-full rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: metricsVisible ? '89%' : '0%' }}
                    />
                  </div>
                </div>

                <div className="bg-zinc-950/40 border border-zinc-800/50 rounded-xl p-4 flex flex-col gap-1.5 text-left">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-zinc-555 uppercase">Intonation</span>
                    <span className="text-white font-bold">91%</span>
                  </div>
                  <div className="w-full bg-zinc-800/60 h-1 rounded-full overflow-hidden mt-1">
                    <div 
                      className="bg-[#10b981] h-full rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: metricsVisible ? '91%' : '0%' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 5: AI Coach Diagnostic (Mouth tips, popover lookup explorations) */}
        {hasFinishedRecording && (
          <section className="h-screen w-full flex items-center justify-center p-8 relative">
            <div className="max-w-[800px] w-full flex flex-col gap-6 premium-card rounded-2xl p-8 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-zinc-800/40 pb-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] tracking-[0.2em] text-[#10b981] font-bold uppercase font-mono">STEP 04 / INTERACTIVE DRILLS</span>
                  <h2 className="text-sm font-semibold text-zinc-350">Speech Diagnostic & Practice Hub</h2>
                </div>
                <div className="flex items-center gap-1 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850 text-[10px] text-zinc-500 font-mono">
                  COACH ONLINE
                </div>
              </div>

              {/* Diagnostic coaches report */}
              <div className="bg-[#fbbf24]/5 border border-[#fbbf24]/10 rounded-xl p-4 flex items-start gap-3 text-left">
                <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1 text-xs">
                  <span className="font-semibold text-white">AI Coach Diagnostic Summary</span>
                  <p className="text-zinc-400 leading-relaxed">
                    "Practice combining final consonants with initial vowels. Try linking the final <strong className="text-white">/k/</strong> sound in <strong className="text-amber-400">'agentic'</strong> directly into the <strong className="text-white">/w/</strong> of <strong className="text-amber-400">'workflows'</strong>. Scroll back up to the Arena to practice this liaison directly."
                  </p>
                </div>
              </div>

              {/* Highlighted text mapping for lookup drills */}
              <div className="bg-zinc-950/40 border border-zinc-850 rounded-xl p-5 text-left leading-[2.5rem] tracking-wide text-lg text-zinc-455 font-sans font-light">
                {transcriptWords.map((item, idx) => {
                  const isSelected = selectedWordIndex === idx;
                  
                  let highlightClass = "text-zinc-400 hover:bg-zinc-800/40 px-1.5 py-0.5 rounded cursor-pointer transition-all duration-300";
                  let underlineClass = "";
                  
                  if (item.accuracy === 'good') {
                    highlightClass = "text-[#34d399] bg-[#10b981]/5 px-1.5 py-0.5 rounded cursor-pointer border-b border-[#10b981]/20 transition-all duration-300";
                  } else if (item.accuracy === 'average') {
                    highlightClass = "text-[#fbbf24] bg-[#fbbf24]/5 px-1.5 py-0.5 rounded cursor-pointer border-b border-dashed border-[#fbbf24]/30 pulse-correction transition-all duration-300";
                    underlineClass = "pb-0.5";
                  } else if (item.accuracy === 'poor') {
                    highlightClass = "text-[#ef4444] bg-[#ef4444]/5 px-1.5 py-0.5 rounded cursor-pointer underline decoration-wavy decoration-[#ef4444]/50 underline-offset-4 border border-[#ef4444]/10 transition-all duration-300";
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
                          playWordAudio(item, idx, 'native');
                          if (item.type === 'liaison' || item.type === 'flat' || isSelected) {
                            if (isSelected) {
                              setSelectedWordIndex(null);
                            } else {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const showBelow = rect.top < 280;
                              setPopoverDirection(showBelow ? 'bottom' : 'top');
                              setSelectedWordIndex(idx);
                            }
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

                      {/* Floating Diagnostic popover */}
                      {isSelected && (
                        <div className={`absolute left-1/2 ${
                          popoverDirection === 'top' 
                            ? 'bottom-full mb-3.5 animate-spring-in' 
                            : 'top-full mt-3.5 animate-spring-in-below'
                        } z-50 w-[300px] bg-[#09090b]/95 backdrop-blur-xl border border-zinc-800/80 rounded-xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.75)] flex flex-col gap-3.5`}>
                          
                          {/* Popover Header */}
                          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white text-base font-mono">{item.text.replace(/[^a-zA-Z]/g, "")}</span>
                              <span className="text-[10px] text-zinc-500 font-mono">{item.ipa}</span>
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedWordIndex(null);
                              }}
                              className="p-0.5 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-white cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Dictionary translation */}
                          <div className="bg-[#121214]/80 border border-zinc-800/60 rounded-lg p-2.5 flex flex-col gap-1 text-left">
                            <span className="text-[9px] uppercase tracking-[0.1em] text-zinc-500 font-bold font-mono">Translation</span>
                            <span className="text-xs text-zinc-200 leading-normal font-normal">{item.definition}</span>
                          </div>

                          {/* Interactive Wave Comparison */}
                          {(item.type === 'liaison' || item.type === 'flat') && (
                            <div className="flex flex-col gap-2.5 bg-[#121214]/60 border border-zinc-800/60 rounded-lg p-2.5">
                              <span className="text-[9px] uppercase tracking-[0.1em] text-zinc-500 font-bold font-mono font-sans">Pitch Contour Comparison</span>
                              
                              {/* Native Waveform */}
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] text-zinc-500 font-mono w-10 shrink-0">Native:</span>
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
                                    playWordAudio(item, idx, 'native');
                                  }}
                                  className="p-1.5 rounded bg-zinc-800/50 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer"
                                >
                                  <Play className="w-3 h-3 fill-current" />
                                </button>
                              </div>

                              {/* User Waveform */}
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] ${item.type === 'liaison' ? 'text-amber-400' : 'text-red-400'} font-mono w-10 shrink-0`}>You:</span>
                                <div className="flex-1 h-6 flex items-center relative overflow-hidden">
                                  <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                                    {item.type === 'liaison' ? (
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
                                    playWordAudio(item, idx, 'user');
                                  }}
                                  className="p-1.5 rounded bg-zinc-800/50 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer"
                                >
                                  <Play className="w-3 h-3 fill-current" />
                                </button>
                              </div>
                            </div>
                          )}

                          {/* AI Tip Box */}
                          <div className="bg-zinc-950/50 border border-zinc-850 rounded-lg p-3 text-[11px] text-zinc-400 leading-relaxed">
                            <span className="text-[9px] uppercase tracking-[0.1em] text-zinc-500 font-bold font-mono block mb-1">AI Speech Coach Tip</span>
                            {(item.type === 'liaison' || item.type === 'flat') ? item.tip : "Focus on maintaining clean vocal articulation during connected speech."}
                          </div>
                        </div>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}

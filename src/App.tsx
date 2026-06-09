import { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Sparkles,
  CheckCircle2,
  Volume2,
  Lock,
  RotateCcw,
  Info,
  X,
  ChevronRight,
  Activity,
  Play,
  TrendingUp,
  Award,
  Layers,
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
}

// Data for the tech podcast transcript (with full definitions)
const transcriptWords: WordItem[] = [
  { 
    text: "The", 
    type: "none", 
    ipa: "ðə", 
    tip: "Standard weak form definite article.", 
    definition: "art. 这，那（用于特指所指的人、物或事物）" 
  },
  { 
    text: "future", 
    type: "perfect", 
    ipa: "ˈfjuː.tʃər", 
    tip: "Perfect vowel duration and clean release.", 
    definition: "n. 未来，前途 | adj. 将来的，未来的" 
  },
  { 
    text: "of", 
    type: "none", 
    ipa: "əv", 
    tip: "Standard weak form preposition.", 
    definition: "prep. 属于……的，关于，由……制成" 
  },
  { 
    text: "LLMs", 
    type: "perfect", 
    ipa: "el.el.emz", 
    tip: "Crisp pronunciation of initials with correct nasal final sound.", 
    definition: "n. 大语言模型 (Large Language Models 的缩写)" 
  },
  { 
    text: "and", 
    type: "none", 
    ipa: "ænd", 
    tip: "Standard coordinating conjunction.", 
    definition: "conj. 和，与，而且，然后" 
  },
  { 
    text: "agentic", 
    type: "liaison", 
    ipa: "əˈdʒen.tɪk", 
    tip: "✨ Mouth Tip: Link the 'c' sound into the next vowel 'w' (agentic-workflows) without a hard glottal stop.", 
    definition: "adj. (语言学/AI) 代理的，有主动权的；(计算机) 智能体的" 
  },
  { 
    text: "workflows", 
    type: "flat", 
    ipa: "ˈwɜːk.fləʊz", 
    tip: "Pitch Drop: Stress the first syllable 'work-' and let '-flows' drop in pitch to sound natural.", 
    definition: "n. 工作流，工作步骤的序列" 
  },
  { 
    text: "will", 
    type: "none", 
    ipa: "wɪl", 
    tip: "Modal verb indicating future action.", 
    definition: "v. 将，会；愿意，要 | n. 意志，遗嘱" 
  },
  { 
    text: "require", 
    type: "perfect", 
    ipa: "rɪˈkwaɪər", 
    tip: "Excellent rhotic vowel transition.", 
    definition: "v. 需要，要求，命令" 
  },
  { 
    text: "human-in-the-loop", 
    type: "perfect", 
    ipa: "ˌhjuː.mən.ɪn.ðə.luːp", 
    tip: "Superb liaison linking. Sounded exactly like 'human-in-the-loop'.", 
    definition: "n. 人机协同，人机回环控制（指AI流程中引入人类审核）" 
  },
  { 
    text: "autonomous", 
    type: "liaison", 
    ipa: "ɔːˈtɒn.ə.məs", 
    tip: "✨ Mouth Tip: Blend the final 's' sound directly into the 'f' of 'feedback' for a seamless transition.", 
    definition: "adj. 自治的，自主的，独立存在的" 
  },
  { 
    text: "feedback", 
    type: "perfect", 
    ipa: "ˈfiːd.bæk", 
    tip: "Clean stop consonant articulation.", 
    definition: "n. 反馈，反馈信息" 
  },
  { 
    text: "loops.", 
    type: "flat", 
    ipa: "luːps", 
    tip: "Flat Intonation: Raise pitch slightly at 'loops' to indicate continuation of the clause.", 
    definition: "n. 循环，回路，圈" 
  }
];

export default function App() {
  // Application State
  const [shadowState, setShadowState] = useState<'ready' | 'recording' | 'analyzing' | 'result'>('ready');
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);
  const [popoverDirection, setPopoverDirection] = useState<'top' | 'bottom'>('top');
  
  // Mouse Follower Coordinates
  const [mousePos, setMousePos] = useState({ x: -400, y: -400 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Audio playback simulation states
  const [isPlayingNative, setIsPlayingNative] = useState<boolean>(false);
  const [isPlayingUser, setIsPlayingUser] = useState<boolean>(false);
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

  // Keyboard spacebar listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleMainActionClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shadowState]);

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

  // State transitions: count-up & metrics expansion triggers
  useEffect(() => {
    if (shadowState === 'result') {
      // 1. Score count up animation
      setScoreCount(0);
      const end = 92;
      const duration = 1000; // ms
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
      
      // 2. Trigger metric loading bars slightly after score counts up
      const timer = setTimeout(() => {
        setMetricsVisible(true);
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setScoreCount(0);
      setMetricsVisible(false);
    }
  }, [shadowState]);

  // Digital progress loader state calculation
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
      // Start recording
      playSynthSound([523.25, 659.25], 0.15, 'triangle');
      setShadowState('recording');
      setShowFeedback(false);
      setSelectedWordIndex(null);
    } else if (shadowState === 'recording') {
      // Stop recording and start analyzing
      playSynthSound([659.25, 523.25], 0.15, 'triangle');
      setShadowState('analyzing');
      setAnalyzingMessage("Aligning phonetic structures...");
      
      setTimeout(() => {
        setAnalyzingMessage("Evaluating speech liaisons...");
      }, 750);
      
      setTimeout(() => {
        setAnalyzingMessage("Calculating pitch contours...");
      }, 1400);

      // Finish analyzing
      setTimeout(() => {
        setShadowState('result');
        setShowFeedback(true);
        playSynthSound([523.25, 659.25, 783.99, 1046.50], 0.4, 'sine');
      }, 2200);
    } else if (shadowState === 'result') {
      // Reset back to ready
      setShadowState('ready');
      setShowFeedback(false);
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

  // Play whole audio mock
  const playFullAudio = (source: 'native' | 'user') => {
    if (source === 'native') {
      setIsPlayingNative(true);
      playSynthSound([440, 480, 520, 580, 640], 0.6, 'sine');
      setTimeout(() => setIsPlayingNative(false), 700);
    } else {
      setIsPlayingUser(true);
      playSynthSound([430, 470, 410, 560, 600], 0.65, 'triangle');
      setTimeout(() => setIsPlayingUser(false), 750);
    }
  };


  // Wave paths for results and reference curves
  const nativeReferencePath = "M 0 12 C 12 5, 20 3, 30 12 C 40 21, 48 21, 58 12 C 68 3, 76 3, 86 12 C 92 19, 96 19, 100 12";
  const userResultPath = "M 0 12 C 12 6, 20 4, 30 12 C 34 12, 38 12, 42 12 C 46 12, 48 21, 58 12 C 68 4, 72 12, 75 12 C 78 12, 80 12, 86 12 C 92 18, 96 18, 100 12";

  // Progress percentage out of 15 seconds
  const recordLimitPercent = Math.min((recordingMillis / 15) * 100, 100);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="flex h-screen w-full bg-[#09090b] text-[#ededef] font-sans overflow-hidden select-none animate-slide-up relative"
    >
      {/* Mouse Follower Glow Layer */}
      <div 
        className="absolute pointer-events-none rounded-full blur-[110px] opacity-40 transition-all duration-300 hidden md:block"
        style={{
          left: `${mousePos.x - 200}px`,
          top: `${mousePos.y - 200}px`,
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
          zIndex: 0,
        }}
      />

      {/* Sidebar Navigation */}
      <aside className="w-[260px] border-r border-[#222226]/40 bg-[#09090b] flex flex-col justify-between shrink-0 z-10">
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
              <span className="text-[9px] uppercase tracking-[0.18em] text-zinc-500 font-semibold font-mono">Engine: Online</span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="p-4 flex flex-col gap-1">
            <span className="text-[9px] uppercase tracking-[0.18em] text-zinc-600 font-semibold px-3 mb-2">Practice Rooms</span>
            
            <button className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900/60 text-zinc-100 border border-zinc-800/40 text-xs font-medium transition-all cursor-pointer">
              <span className="flex items-center gap-2.5">
                <Activity className="w-3.5 h-3.5 text-[#10b981]" />
                Shadowing Analyst
              </span>
              <ChevronRight className="w-3 h-3 text-zinc-600 animate-pulse" />
            </button>

            <button className="flex items-center justify-between px-3 py-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30 text-xs font-medium transition-all group cursor-not-allowed">
              <span className="flex items-center gap-2.5">
                <Award className="w-3.5 h-3.5 text-zinc-700 group-hover:text-zinc-600" />
                Intonation Trainer
              </span>
              <Lock className="w-3.5 h-3.5 text-zinc-800" />
            </button>

            <button className="flex items-center justify-between px-3 py-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30 text-xs font-medium transition-all group cursor-not-allowed">
              <span className="flex items-center gap-2.5">
                <Layers className="w-3.5 h-3.5 text-zinc-700 group-hover:text-zinc-600" />
                Liaison Masterclass
              </span>
              <Lock className="w-3.5 h-3.5 text-zinc-800" />
            </button>

            <button className="flex items-center justify-between px-3 py-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30 text-xs font-medium transition-all group cursor-pointer">
              <span className="flex items-center gap-2.5">
                <TrendingUp className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400" />
                Performance Dashboard
              </span>
              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-zinc-600 transition-all" />
            </button>
          </nav>

          {/* Daily Goals */}
          <div className="px-6 py-4 mt-2 flex flex-col gap-2.5">
            <span className="text-[9px] uppercase tracking-[0.18em] text-zinc-600 font-semibold">Today's Focus</span>
            <div className="bg-zinc-900/20 border border-zinc-800/40 rounded-xl p-3.5 flex flex-col gap-3">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-zinc-400">Time Shadowed</span>
                <span className="text-white font-mono font-semibold">15 / 20m</span>
              </div>
              <div className="w-full bg-zinc-800/50 h-1 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-[#10b981] h-full rounded-full w-[75%] transition-all duration-1000 ease-out" />
              </div>
              <div className="flex items-center gap-1.5 text-[9px] text-zinc-500">
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500/20" />
                <span>3-day streak active. Keep rolling!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer User Profile */}
        <div className="p-4 border-t border-[#222226]/40 bg-[#09090b]/80 backdrop-blur-sm flex flex-col gap-3">
          <div className="flex items-center justify-between text-[10px] bg-zinc-950/80 border border-zinc-800/50 px-2.5 py-1.5 rounded-lg text-zinc-400 font-mono">
            <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-[#10b981] fill-[#10b981]/10 animate-bounce" /> Practice Time</span>
            <span className="font-semibold text-white">120m left</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-zinc-900 flex items-center justify-center border border-zinc-800 text-white font-medium text-xs">
                C
              </div>
              <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#10b981] border border-[#09090b] rounded-full animate-pulse"></div>
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-semibold text-white truncate">Carl (Beta User)</span>
              <span className="text-[9px] text-zinc-500 font-mono truncate">carl@echoflow.ai</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto z-10">
        
        {/* Workspace Top Header Bar */}
        <header className="h-[60px] border-b border-[#222226]/40 bg-[#09090b]/60 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 tracking-wider">
            <span>VAULT</span>
            <ChevronRight className="w-3 h-3 text-zinc-700" />
            <span>PODCASTS</span>
            <ChevronRight className="w-3 h-3 text-zinc-700" />
            <span className="text-zinc-100 font-semibold transition-colors duration-300">EP42: LLMS & AGENTIC WORKFLOWS</span>
          </div>

          <div className="flex items-center gap-4">
            {shadowState === 'result' && (
              <div className="flex items-center gap-1.5 bg-[#10b981]/5 border border-[#10b981]/20 rounded-full px-3 py-1 text-xs text-[#10b981] font-medium animate-pulse">
                <Sparkles className="w-3 h-3" />
                <span>Overall Accuracy: {scoreCount}%</span>
              </div>
            )}
            
            <button 
              onClick={() => {
                if (shadowState === 'result') {
                  setShowFeedback(!showFeedback);
                  setSelectedWordIndex(null);
                  playSynthSound([587.33], 0.1, 'sine');
                } else {
                  handleMainActionClick();
                }
              }}
              className={`text-xs px-3.5 py-1.5 rounded-lg border font-medium transition-all duration-300 cursor-pointer ${
                shadowState !== 'result' 
                  ? 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/60 text-zinc-400 hover:text-white'
                  : showFeedback 
                    ? 'border-[#10b981]/30 bg-[#10b981]/15 text-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.12)]'
                    : 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:text-white hover:border-zinc-700'
              }`}
            >
              {shadowState !== 'result' 
                ? 'Simulate Evaluation Flow' 
                : showFeedback 
                  ? '✨ Overlay: Active' 
                  : 'Show Overlay'
              }
            </button>
          </div>
        </header>

        {/* Dashboard Panels Grid Container */}
        <div className="flex-1 p-8 grid grid-cols-1 xl:grid-cols-2 gap-8 items-start max-w-[1600px] w-full mx-auto">
          
          {/* LEFT PANEL - The Speech Material Transcript */}
          <section className="premium-card rounded-2xl p-8 flex flex-col gap-6 shadow-2xl relative min-h-[480px]">
            {/* Laser scan animation line (active during analysis) */}
            {shadowState === 'analyzing' && <div className="animate-scan-laser" />}

            {/* Header info */}
            <div className="flex items-center justify-between border-b border-zinc-800/40 pb-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] tracking-[0.2em] text-zinc-500 font-bold uppercase font-sans">Shadowing Text</span>
                <h2 className="text-sm font-semibold text-zinc-300">Speech Target Material</h2>
              </div>
              <button 
                onClick={() => playFullAudio('native')}
                disabled={isPlayingNative}
                className="flex items-center gap-2 text-[11px] text-zinc-400 hover:text-zinc-100 bg-zinc-900/40 border border-zinc-800/60 rounded-lg px-3 py-1.5 transition-all duration-300 disabled:opacity-50 cursor-pointer min-w-[120px] justify-center"
              >
                {isPlayingNative ? (
                  // Bouncing visualizer animation
                  <div className="flex items-end gap-[1.5px] h-3 w-3.5 shrink-0 mb-0.5">
                    <span className="w-[2px] h-full bg-[#10b981] rounded-full animate-audio-bar-1" />
                    <span className="w-[2px] h-full bg-[#10b981] rounded-full animate-audio-bar-2" />
                    <span className="w-[2px] h-full bg-[#10b981] rounded-full animate-audio-bar-3" />
                  </div>
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
                <span>{isPlayingNative ? 'Playing...' : 'Hear Speaker'}</span>
              </button>
            </div>

            {/* Instruction tooltip */}
            <div className="bg-zinc-950/40 border border-zinc-800/50 rounded-xl p-3.5 flex items-start gap-3 text-xs text-zinc-400">
              <Info className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Click **any word** below to check its phonetic definition and translation. Switch on the **Overlay** to see AI speech linkage logs.
              </p>
            </div>

            {/* Transcript Word Board */}
            <div className="flex-1 py-4 leading-[3.2rem] tracking-wide text-[21px] text-zinc-400 select-text font-sans font-light">
              {transcriptWords.map((item, idx) => {
                const isSelected = selectedWordIndex === idx;
                const isEvaluating = showFeedback && shadowState === 'result';
                
                // Color configuration depending on type
                let highlightClass = "text-zinc-300 hover:bg-zinc-800/40 px-1.5 py-0.5 rounded cursor-pointer transition-all duration-300";
                let underlineClass = "";
                let inlineStyle = {};
                
                if (isEvaluating) {
                  inlineStyle = { 
                    animationDelay: `${idx * 60}ms`,
                    animationFillMode: 'both' 
                  };
                  
                  if (item.type === 'perfect') {
                    highlightClass = "text-[#10b981] bg-[#10b981]/5 px-1.5 py-0.5 rounded cursor-pointer transition-all duration-300 animate-slide-up";
                  } else if (item.type === 'liaison') {
                    highlightClass = "text-[#fbbf24] bg-[#fbbf24]/5 px-1.5 py-0.5 rounded cursor-pointer transition-all duration-300 border border-[#fbbf24]/10 pulse-correction animate-slide-up";
                    underlineClass = "border-b-2 border-dashed border-[#fbbf24]/60 pb-0.5";
                  } else if (item.type === 'flat') {
                    highlightClass = "text-zinc-500 bg-zinc-500/5 px-1.5 py-0.5 rounded cursor-pointer transition-all duration-300 animate-slide-up";
                    underlineClass = "border-b border-zinc-700";
                  }
                }

                if (isSelected) {
                  if (item.type === 'liaison') {
                    highlightClass += " ring-2 ring-[#fbbf24]/50 bg-[#fbbf24]/10 shadow-[0_0_12px_rgba(251,191,36,0.15)]";
                  } else {
                    highlightClass += " ring-2 ring-zinc-750 bg-zinc-850 shadow-[0_0_10px_rgba(255,255,255,0.04)] text-white";
                  }
                }

                return (
                  <span key={idx} className="relative inline-block mx-0.5" style={inlineStyle}>
                    <button
                      onClick={(e) => {
                        playWordAudio(item, idx, 'native');
                        if (isSelected) {
                          setSelectedWordIndex(null);
                        } else {
                          const rect = e.currentTarget.getBoundingClientRect();
                          // If the word's top is less than 280px from the top of the screen, open popover below
                          const showBelow = rect.top < 280;
                          setPopoverDirection(showBelow ? 'bottom' : 'top');
                          setSelectedWordIndex(idx);
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

                    {/* Floating Glassmorphism Lookup Tooltip */}
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
                            className="p-0.5 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Dictionary definition */}
                        <div className="bg-[#121214]/80 border border-zinc-800/60 rounded-lg p-2.5 flex flex-col gap-1.5 text-left">
                          <span className="text-[9px] uppercase tracking-[0.1em] text-zinc-500 font-bold font-mono">Dictionary Definition</span>
                          <span className="text-xs text-zinc-200 leading-relaxed font-normal">{item.definition}</span>
                        </div>

                        {/* Speech Correction Wave Comparison (only active in result overlay mode for liaisons/flats) */}
                        {isEvaluating && (item.type === 'liaison' || item.type === 'flat') && (
                          <div className="flex flex-col gap-2.5 bg-[#121214]/60 border border-zinc-800/60 rounded-lg p-2.5">
                            <span className="text-[9px] uppercase tracking-[0.1em] text-zinc-500 font-bold font-mono">Pitch Contour Comparison</span>
                            
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
                              <span className="text-[9px] text-amber-400 font-mono w-10 shrink-0">You:</span>
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
                                      d="M0 12 H100" 
                                      fill="none" 
                                      stroke="#44444a" 
                                      strokeWidth="1.5" 
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
                        <div className="bg-zinc-950/50 border border-zinc-850 rounded-lg p-3 text-[11px] text-zinc-400 leading-relaxed text-left">
                          <span className="text-[9px] uppercase tracking-[0.1em] text-zinc-500 font-bold font-mono block mb-1">Acoustic Guidance</span>
                          {isEvaluating && (item.type === 'liaison' || item.type === 'flat') ? item.tip : "Focus on maintaining clean vocal articulation during connected speech."}
                        </div>

                        {/* Practice Specific Word CTA */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedWordIndex(null);
                            setShadowState('ready');
                            setTimeout(() => {
                              handleMainActionClick();
                            }, 300);
                          }}
                          className="w-full bg-zinc-900 border border-zinc-800/80 hover:border-emerald-500/40 hover:text-white text-zinc-300 text-xs font-semibold py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer group/cta"
                        >
                          <Mic className="w-3.5 h-3.5 group-hover/cta:animate-bounce" />
                          <span>Practice Isolating This Word</span>
                        </button>
                      </div>
                    )}
                  </span>
                );
              })}
            </div>

            {/* Overall stats list at bottom of left panel */}
            {shadowState === 'result' && (
              <div className="mt-4 border-t border-zinc-800/60 pt-4 flex items-center justify-between text-xs text-zinc-500 animate-slide-up">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                  <span>Matching Flow: <strong>92% Perfect</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" /> Perfect (9)</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Liaison (2)</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-zinc-600" /> Flat (2)</span>
                </div>
              </div>
            )}
          </section>

          {/* RIGHT PANEL - The AI Interactive Waveform Visualizer */}
          <section className="flex flex-col gap-6 w-full">
            
            {/* The Visualizer Card */}
            <div className="premium-card rounded-2xl p-8 shadow-2xl relative flex flex-col gap-6 overflow-hidden">
              
              {/* Recording progress timeline bar (active when recording) */}
              {shadowState === 'recording' && (
                <div 
                  className="absolute top-0 left-0 h-[3px] bg-gradient-to-r from-emerald-500 via-[#10b981] to-emerald-400 transition-all duration-100 ease-linear"
                  style={{ width: `${recordLimitPercent}%` }}
                />
              )}

              {/* Title Header */}
              <div className="flex items-center justify-between border-b border-zinc-800/40 pb-4 z-10">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] tracking-[0.2em] text-[#10b981] font-bold uppercase">RHYTHMIC MATCH</span>
                  <h2 className="text-sm font-semibold text-zinc-300">Continuous Amplitude Overlays</h2>
                </div>
                <div className="flex items-center gap-1.5 bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-850 text-[10px] text-zinc-500 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] relative">
                    {shadowState === 'recording' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>}
                  </span>
                  <span>{shadowState.toUpperCase()}</span>
                </div>
              </div>

              {/* Overlapping Waveform Visualization Area */}
              <div className="h-[210px] w-full bg-zinc-950 border border-zinc-800/60 rounded-xl relative flex flex-col justify-end p-5 overflow-hidden z-10">
                
                {/* Visualizer Status Labels inside graph */}
                <div className="absolute top-4 left-4 flex flex-col gap-1 z-20">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-0.5 bg-zinc-650 rounded-full inline-block" />
                    <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono">Native Speaker Reference</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-0.5 bg-emerald-500 rounded-full inline-block" />
                    <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-mono">Your Voice Amplitude</span>
                  </div>
                </div>

                {/* Duration Timer Badge */}
                {shadowState === 'recording' && (
                  <div className="absolute top-4 right-4 bg-red-950/20 border border-red-500/30 text-red-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full inline-block animate-ping" />
                    <span>REC {recordingMillis.toFixed(1)}s</span>
                  </div>
                )}

                {/* Soundwaves display */}
                <div className="w-full h-full relative flex items-end">
                  
                  {/* READY STATE: Render static native curve path */}
                  {shadowState === 'ready' && (
                    <svg className="w-full h-full opacity-35" viewBox="0 0 100 24" preserveAspectRatio="none">
                      <path 
                        d={nativeReferencePath} 
                        fill="none" 
                        stroke="#52525b" 
                        strokeWidth="1.5" 
                        strokeDasharray="3 2"
                        strokeLinecap="round" 
                      />
                    </svg>
                  )}

                  {/* RECORDING STATE: Fluid dynamic voice wave */}
                  {shadowState === 'recording' && (
                    <>
                      {/* Background Native wave guide */}
                      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 24" preserveAspectRatio="none">
                        <path d={nativeReferencePath} fill="none" stroke="#52525b" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>

                      {/* Active Morphing Liquid Wave */}
                      <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="liquidGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path 
                          d={`${getPathFromPoints(wavePoints)} L 100 24 L 0 24 Z`} 
                          fill="url(#liquidGlow)" 
                          className="transition-all duration-40"
                        />
                        <path 
                          d={getPathFromPoints(wavePoints)} 
                          fill="none" 
                          stroke="#10b981" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          className="transition-all duration-40"
                        />
                      </svg>
                    </>
                  )}

                  {/* ANALYZING STATE: Shimmering wave overlay */}
                  {shadowState === 'analyzing' && (
                    <div className="absolute inset-0 w-full h-full shimmer-wave opacity-50 flex items-center justify-center">
                      <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                        <path d={nativeReferencePath} fill="none" stroke="#222226" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                  )}

                  {/* RESULT REVEALED STATE: Clean dual waveform overlays */}
                  {shadowState === 'result' && (
                    <>
                      {/* Native Reference (Muted Zinc line) */}
                      <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 100 24" preserveAspectRatio="none">
                        <path d={nativeReferencePath} fill="none" stroke="#66666f" strokeWidth="1.5" strokeDasharray="3 1.5" strokeLinecap="round" />
                      </svg>

                      {/* User Evaluated Wave Path */}
                      <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="userResultGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path d={`${userResultPath} L 100 24 L 0 24 Z`} fill="url(#userResultGlow)" />
                        <path d={userResultPath} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                        
                        {/* Highlight correction sections */}
                        <path d="M 34 12 L 42 12" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M 72 12 L 78 12" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>

                      {/* Bracket overlay buttons on the vector interface */}
                      <button 
                        onClick={() => {
                          setSelectedWordIndex(5);
                          playWordAudio(transcriptWords[5], 5, 'native');
                        }}
                        className="absolute bottom-0 left-[34%] w-[8%] h-full border-x border-t border-dashed border-amber-500/20 bg-amber-500/[0.01] hover:bg-amber-500/[0.04] transition-colors flex items-start justify-center pt-2 cursor-pointer focus:outline-none group/gate"
                      >
                        <span className="text-[8px] font-mono text-[#fbbf24] bg-zinc-950 border border-amber-500/20 px-1 rounded-sm tracking-wider uppercase font-semibold group-hover/gate:scale-105 transition-all">LINK 1</span>
                      </button>

                      <button 
                        onClick={() => {
                          setSelectedWordIndex(10);
                          playWordAudio(transcriptWords[10], 10, 'native');
                        }}
                        className="absolute bottom-0 left-[72%] w-[6%] h-full border-x border-t border-dashed border-amber-500/20 bg-amber-500/[0.01] hover:bg-amber-500/[0.04] transition-colors flex items-start justify-center pt-2 cursor-pointer focus:outline-none group/gate"
                      >
                        <span className="text-[8px] font-mono text-[#fbbf24] bg-zinc-950 border border-amber-500/20 px-1 rounded-sm tracking-wider uppercase font-semibold group-hover/gate:scale-105 transition-all">LINK 2</span>
                      </button>
                    </>
                  )}
                </div>

                {/* Grid baseline */}
                <div className="w-full h-[0.5px] bg-zinc-800/80 z-10" />
              </div>

              {/* Central Audio Capture Record Action Button */}
              <div className="flex flex-col items-center gap-4 z-10">
                <div className="relative">
                  {/* Dynamic pulse glow ring behind active state */}
                  {shadowState === 'recording' && (
                    <>
                      <div className="absolute -inset-4 rounded-full border border-emerald-500/10 ring-glow-active" />
                      <div className="absolute -inset-2 rounded-full border border-emerald-500/20 animate-pulse" />
                    </>
                  )}
                  {shadowState === 'result' && (
                    <div className="absolute inset-0 rounded-full bg-[#10b981]/5 blur-lg" />
                  )}

                  {/* Main Action Circle Button */}
                  <button
                    onClick={handleMainActionClick}
                    className={`w-20 h-20 rounded-full flex flex-col items-center justify-center border transition-all duration-500 relative z-10 focus:outline-none cursor-pointer group ${
                      shadowState === 'ready' 
                        ? 'bg-zinc-900 border-zinc-800/80 hover:border-emerald-500/40 text-zinc-400 hover:text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_16px_-4px_rgba(0,0,0,0.5)]'
                        : shadowState === 'recording'
                          ? 'bg-zinc-950 border-emerald-500 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]'
                          : shadowState === 'analyzing'
                            ? 'bg-zinc-950 border-zinc-850 text-zinc-600 cursor-not-allowed'
                            : 'bg-zinc-900 border-emerald-500/50 hover:border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                    }`}
                  >
                    {shadowState === 'ready' && (
                      <>
                        <Mic className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors" />
                        <span className="text-[8px] font-mono tracking-widest text-zinc-500 mt-1 uppercase font-bold">SPACE</span>
                      </>
                    )}
                    {shadowState === 'recording' && (
                      <>
                        <div className="w-3.5 h-3.5 bg-emerald-400 rounded-sm animate-pulse" />
                        <span className="text-[8px] font-mono tracking-widest text-emerald-400 mt-1 uppercase font-bold">STOP</span>
                      </>
                    )}
                    {shadowState === 'analyzing' && (
                      <span className="text-xs font-mono text-[#10b981] font-bold">{analyzingProgress}%</span>
                    )}
                    {shadowState === 'result' && (
                      <>
                        <RotateCcw className="w-6 h-6" />
                        <span className="text-[8px] font-mono tracking-widest text-emerald-400 mt-1.5 uppercase font-bold">RETRY</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Subtext description underneath trigger button */}
                <div className="flex flex-col items-center text-center gap-1">
                  <span className="text-xs font-semibold tracking-wide text-zinc-300">
                    {shadowState === 'ready' && "Click or Press Spacebar to Record"}
                    {shadowState === 'recording' && "Capturing Speech Signal..."}
                    {shadowState === 'analyzing' && analyzingMessage}
                    {shadowState === 'result' && "Analysis Complete"}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono tracking-wider">
                    {shadowState === 'ready' && "MAX TARGET RECORDING: 15 SECONDS"}
                    {shadowState === 'recording' && "TAP THE SPACEBAR TO PROCESS FEEDBACK"}
                    {shadowState === 'analyzing' && "RESOLVING SIGNAL TIMELINES"}
                    {shadowState === 'result' && "PRESS SPACEBAR TO RESET BOARD"}
                  </span>
                </div>
              </div>
            </div>

            {/* AI SCORE SUMMARY CARD (Revealed in result state) */}
            <div className={`transition-all duration-500 ${
              shadowState === 'result' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none h-0 overflow-hidden'
            }`}>
              <div className="premium-card rounded-2xl p-6 shadow-2xl flex flex-col gap-6">
                
                {/* Section Header */}
                <div className="flex items-center justify-between border-b border-zinc-800/40 pb-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] tracking-widest text-[#10b981] font-bold uppercase">Coaching metrics</span>
                    <h2 className="text-sm font-semibold text-zinc-300">AI Scoring Metrics</h2>
                  </div>
                  <button
                    onClick={() => playFullAudio('user')}
                    disabled={isPlayingUser}
                    className="flex items-center gap-2 text-[11px] text-zinc-400 hover:text-zinc-100 bg-zinc-900/40 border border-zinc-800/60 rounded-lg px-3 py-1.5 transition-all duration-300 disabled:opacity-50 cursor-pointer min-w-[120px] justify-center"
                  >
                    {isPlayingUser ? (
                      <div className="flex items-end gap-[1.5px] h-3 w-3.5 shrink-0 mb-0.5">
                        <span className="w-[2px] h-full bg-[#10b981] rounded-full animate-audio-bar-1" />
                        <span className="w-[2px] h-full bg-[#10b981] rounded-full animate-audio-bar-2" />
                        <span className="w-[2px] h-full bg-[#10b981] rounded-full animate-audio-bar-3" />
                      </div>
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                    <span>{isPlayingUser ? 'Playing...' : 'Play Attempt'}</span>
                  </button>
                </div>

                {/* Score Grid layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Metric Block 1 - Pronunciation */}
                  <div className="bg-zinc-950/40 border border-zinc-800/50 rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] uppercase font-mono tracking-wider text-zinc-500">Pronunciation</span>
                      <span className="text-xs font-bold text-white font-mono">94%</span>
                    </div>
                    <div className="w-full bg-zinc-800/60 h-1 rounded-full overflow-hidden mt-1">
                      <div 
                        className="bg-[#10b981] h-full rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: metricsVisible ? '94%' : '0%' }}
                      />
                    </div>
                    <span className="text-[9px] text-zinc-500 leading-normal mt-1">
                      Individual phonemes are well articulated. Intelligibility is excellent.
                    </span>
                  </div>

                  {/* Metric Block 2 - Liaison & Linking */}
                  <div className="bg-zinc-950/40 border border-zinc-800/50 rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] uppercase font-mono tracking-wider text-[#fbbf24]">Liaison (Flow)</span>
                      <span className="text-xs font-bold text-[#fbbf24] font-mono">89%</span>
                    </div>
                    <div className="w-full bg-zinc-800/60 h-1 rounded-full overflow-hidden mt-1">
                      <div 
                        className="bg-[#fbbf24] h-full rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: metricsVisible ? '89%' : '0%' }}
                      />
                    </div>
                    <span className="text-[9px] text-[#fbbf24]/80 leading-normal mt-1">
                      Missed linking consonants in "agentic" and "autonomous".
                    </span>
                  </div>

                  {/* Metric Block 3 - Intonation */}
                  <div className="bg-zinc-950/40 border border-zinc-800/50 rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] uppercase font-mono tracking-wider text-zinc-500">Intonation</span>
                      <span className="text-xs font-bold text-white font-mono">91%</span>
                    </div>
                    <div className="w-full bg-zinc-800/60 h-1 rounded-full overflow-hidden mt-1">
                      <div 
                        className="bg-[#10b981] h-full rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: metricsVisible ? '91%' : '0%' }}
                      />
                    </div>
                    <span className="text-[9px] text-zinc-500 leading-normal mt-1">
                      Pitch contours match reference waveforms. Slightly flat end stresses.
                    </span>
                  </div>
                </div>

                {/* Speech Improvement Summary Callout */}
                <div className="bg-[#fbbf24]/5 border border-[#fbbf24]/10 rounded-xl p-4 flex items-start gap-3 animate-slide-up">
                  <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1 text-xs">
                    <span className="font-semibold text-white">AI Coach Diagnostic Summary</span>
                    <p className="text-zinc-400 leading-relaxed">
                      "Primary focus remains on linking final consonants to following vowels. Try blending the final <strong className="text-white">/k/</strong> sound in <strong className="text-amber-400">'agentic'</strong> directly into the <strong className="text-white">/w/</strong> of <strong className="text-amber-400">'workflows'</strong>. Doing so removes glottal stops and raises liaison flow past 95%."
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </section>

        </div>
      </main>
    </div>
  );
}

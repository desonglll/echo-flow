import { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Sparkles,
  Volume2,
  RotateCcw,
  X,
  Play,
  Activity
} from 'lucide-react';
import './App.css';

// Type definitions
interface WordItem {
  text: string;
  type: 'perfect' | 'liaison' | 'flat' | 'none';
  ipa: string;
  tip: string;
}

// Podcast Transcript
const transcriptWords: WordItem[] = [
  { text: "The", type: "none", ipa: "ðə", tip: "" },
  { text: "future", type: "perfect", ipa: "ˈfjuː.tʃər", tip: "Vowel duration and dental release are perfect." },
  { text: "of", type: "none", ipa: "əv", tip: "" },
  { text: "LLMs", type: "perfect", ipa: "el.el.emz", tip: "Crisp pronunciation of initials." },
  { text: "and", type: "none", ipa: "ænd", tip: "" },
  { 
    text: "agentic", 
    type: "liaison", 
    ipa: "əˈdʒen.tɪk", 
    tip: "✨ Mouth Tip: Slide the ending 'c' /k/ smoothly into the 'w' of 'workflows' without inserting a glottal stop." 
  },
  { 
    text: "workflows", 
    type: "flat", 
    ipa: "ˈwɜːk.fləʊz", 
    tip: "Intonation drop: Elevate the first syllable 'work-' and let '-flows' drop off naturally." 
  },
  { text: "will", type: "none", ipa: "wɪl", tip: "" },
  { text: "require", type: "perfect", ipa: "rɪˈkwaɪər", tip: "Excellent rhotic vowel transition." },
  { text: "human-in-the-loop", type: "perfect", ipa: "ˌhjuː.mən.ɪn.ðə.luːp", tip: "Superb liaison. Flowed naturally as 'human-in-the-loop'." },
  { 
    text: "autonomous", 
    type: "liaison", 
    ipa: "ɔːˈtɒn.ə.məs", 
    tip: "✨ Mouth Tip: Blend the final 's' sound directly into the 'f' of 'feedback' for a seamless transition." 
  },
  { text: "feedback", type: "perfect", ipa: "ˈfiːd.bæk", tip: "Clean stop consonant articulation." },
  { 
    text: "loops.", 
    type: "flat", 
    ipa: "luːps", 
    tip: "Flat Intonation: Raise pitch slightly at 'loops' to indicate continuation of the clause." 
  }
];

export default function App() {
  // 'ready' | 'recording' | 'analyzing' | 'result'
  const [shadowState, setShadowState] = useState<'ready' | 'recording' | 'analyzing' | 'result'>('ready');
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);
  
  // Custom states for Apple product experience
  const [playbackSpeed, setPlaybackSpeed] = useState<'1.0x' | '0.8x' | '1.2x'>('1.0x');
  const [activeTab, setActiveTab] = useState<'practice' | 'analysis' | 'history'>('practice');
  const [isPlayingNative, setIsPlayingNative] = useState<boolean>(false);
  const [isPlayingUser, setIsPlayingUser] = useState<boolean>(false);
  const [activeAudioWord, setActiveAudioWord] = useState<number | null>(null);
  
  // Time and animation states
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const recordingTimerRef = useRef<any>(null);
  const [wavePoints, setWavePoints] = useState<number[]>(Array.from({ length: 45 }, () => 12));
  const wavePointsRef = useRef<any>(null);
  const [analyzingMessage, setAnalyzingMessage] = useState<string>("Analyzing vocal structures...");
  
  // Sweeping timeline cursor progress (0 to 100)
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);

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

  // Keyboard Spacebar listener
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

  // Audio wave points generator (Undulating Siri wave)
  useEffect(() => {
    if (shadowState === 'recording') {
      const startTime = Date.now();
      wavePointsRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        setWavePoints(prev => prev.map((_, idx) => {
          const baseWave = Math.sin(idx * 0.5 + elapsed * 10) * 8;
          const secondaryWave = Math.cos(idx * 0.2 - elapsed * 14) * 4;
          const noise = Math.random() * 2;
          return Math.max(1, Math.min(23, 12 + baseWave + secondaryWave + noise));
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

  // Timer counter when recording
  useEffect(() => {
    if (shadowState === 'recording') {
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [shadowState]);

  // Animate timeline sweeping cursor
  useEffect(() => {
    let animationFrameId: number;
    let startTime: number;
    const duration = 700; // Matches playback duration of playFullAudio (700ms)
    
    if (isPlayingNative || isPlayingUser) {
      startTime = Date.now();
      const updateCursor = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(100, (elapsed / duration) * 100);
        setPlaybackProgress(progress);
        if (progress < 100) {
          animationFrameId = requestAnimationFrame(updateCursor);
        } else {
          setPlaybackProgress(0);
        }
      };
      animationFrameId = requestAnimationFrame(updateCursor);
    } else {
      setPlaybackProgress(0);
    }
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlayingNative, isPlayingUser]);

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
      setAnalyzingMessage("Aligning vocal tracks...");
      
      setTimeout(() => {
        setAnalyzingMessage("Evaluating rhythmic linking...");
      }, 750);
      
      setTimeout(() => {
        setAnalyzingMessage("Calculating pitch curves...");
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
      setRecordingSeconds(0);
      setWavePoints(Array.from({ length: 45 }, () => 12));
    }
  };

  // Convert array of wave values into a smooth Bezier SVG path with mathematical phase shifting
  const getPathFromPointsShifted = (points: number[], phase: number, amplitudeScale: number, verticalOffset: number) => {
    const width = 100;
    const step = width / (points.length - 1);
    let path = `M 0 12`;
    for (let i = 1; i < points.length; i++) {
      const x = i * step;
      const yVal = points[i];
      const offset = Math.sin(i * 0.4 + phase) * 2;
      const y = 12 + (yVal - 12) * amplitudeScale + offset + verticalOffset;
      const prevX = (i - 1) * step;
      const prevYVal = points[i - 1];
      const prevOffset = Math.sin((i - 1) * 0.4 + phase) * 2;
      const prevY = 12 + (prevYVal - 12) * amplitudeScale + prevOffset + verticalOffset;
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

  const formatTime = (secs: number) => {
    const min = Math.floor(secs / 60);
    const sec = secs % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // Apple GarageBand style dual tracks paths
  const nativeReferencePath = "M 0 12 C 12 5, 20 3, 30 12 C 40 21, 48 21, 58 12 C 68 3, 76 3, 86 12 C 92 19, 96 19, 100 12";
  const userResultPath = "M 0 12 C 12 6, 20 4, 30 12 C 34 12, 38 12, 42 12 C 46 12, 48 21, 58 12 C 68 4, 72 12, 75 12 C 78 12, 80 12, 86 12 C 92 18, 96 18, 100 12";

  return (
    <div className="flex h-screen w-full text-apple-dark font-sans flex-col relative select-none animated-mesh">
      
      {/* macOS Window Decoration Top Bar */}
      <header className="h-12 border-b border-black/5 bg-white/40 backdrop-blur-md flex items-center justify-between px-6 shrink-0 relative z-30">
        {/* macOS Traffic Lights */}
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] border border-[#e0443e] active:brightness-90 transition-all cursor-pointer" />
          <div className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e] border border-[#dfa224] active:brightness-90 transition-all cursor-pointer" />
          <div className="w-3.5 h-3.5 rounded-full bg-[#27c93f] border border-[#1a9c2b] active:brightness-90 transition-all cursor-pointer" />
          <span className="text-[10px] text-apple-gray font-mono ml-3 uppercase tracking-wider font-semibold">EchoFlow.app</span>
        </div>

        {/* Centered Segmented Control Tabs */}
        <div className="absolute left-1/2 -translate-x-1/2 flex bg-black/5 p-0.5 rounded-full border border-black/5 text-xs">
          <button 
            onClick={() => setActiveTab('practice')}
            className={`px-4 py-1 rounded-full font-medium transition-all cursor-pointer active:scale-95 ${
              activeTab === 'practice' 
                ? 'bg-white text-apple-dark shadow-sm' 
                : 'text-apple-gray hover:text-apple-dark'
            }`}
          >
            Practice
          </button>
          <button 
            onClick={() => setActiveTab('analysis')}
            className={`px-4 py-1 rounded-full font-medium transition-all cursor-pointer active:scale-95 ${
              activeTab === 'analysis' 
                ? 'bg-white text-apple-dark shadow-sm' 
                : 'text-apple-gray hover:text-apple-dark'
            }`}
          >
            Speech Lab
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-4 py-1 rounded-full font-medium transition-all cursor-pointer active:scale-95 ${
              activeTab === 'history' 
                ? 'bg-white text-apple-dark shadow-sm' 
                : 'text-apple-gray hover:text-apple-dark'
            }`}
          >
            History
          </button>
        </div>

        {/* User profile */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#34c759]/10 border border-[#34c759]/20 px-2 py-0.5 rounded-md text-[9px] text-[#34c759] font-mono font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34c759] animate-pulse" />
            <span>AI SYSTEM</span>
          </div>
          <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[10px] border border-black/10 text-apple-dark font-bold shadow-sm">
            C
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        
        {/* Apple Logic Pro Style Dual-Track Timeline Editor */}
        <section className="bg-white/20 border-b border-black/5 p-6 flex flex-col gap-4 relative shrink-0">
          <div className="flex items-center justify-between text-xs text-apple-gray font-mono">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-apple-gray" />
              <span>TIMELINE MONITOR</span>
            </div>
            <span>{shadowState === 'recording' ? formatTime(recordingSeconds) : '0:00'} / 0:15 sec</span>
          </div>

          {/* Tracks Board */}
          <div className="flex flex-col gap-3 bg-black/[0.02] border border-black/5 rounded-2xl p-4 relative overflow-hidden">
            
            {/* Playhead Sweeping Cursor */}
            {playbackProgress > 0 && (
              <div 
                className="absolute top-0 bottom-0 w-[1.5px] bg-apple-blue shadow-[0_0_8px_rgba(0,113,227,0.7)] pointer-events-none z-20"
                style={{ 
                  left: `calc(96px + (100% - 96px - 16px) * ${playbackProgress} / 100)` 
                }} 
              />
            )}

            {/* Timeline Ruler */}
            <div className="h-4 border-b border-black/5 relative flex justify-between px-2 text-[9px] text-apple-gray font-mono">
              <span>0:00</span>
              <span>0:02</span>
              <span>0:04</span>
              <span>0:06</span>
              <span>0:08</span>
              <span>0:10</span>
              <span>0:12</span>
              <span>0:14</span>
            </div>

            {/* TRACK 1: Reference Audio Wave */}
            <div className="h-16 flex items-center relative rounded-xl bg-white/45 border border-white/80 px-4 group shadow-sm transition-all duration-300 glass-glow-overlay">
              <div className="w-24 shrink-0 flex flex-col gap-0.5 text-left select-none">
                <span className="text-[10px] font-bold text-apple-gray uppercase tracking-wider flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-apple-gray" /> Native Track
                </span>
                <span className="text-[9px] font-mono text-zinc-400">Model speaker</span>
              </div>
              
              {/* Wave Display */}
              <div className="flex-1 h-10 relative flex items-center">
                <svg className="w-full h-full opacity-60" viewBox="0 0 100 24" preserveAspectRatio="none">
                  <path 
                    d={nativeReferencePath} 
                    fill="none" 
                    stroke="#86868b" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                  />
                </svg>
              </div>

              {/* Play buttons next to track */}
              <button 
                onClick={() => playFullAudio('native')}
                disabled={isPlayingNative}
                className="absolute right-4 p-2 bg-white hover:bg-apple-light-gray border border-black/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:opacity-50 shadow-sm active:scale-95 z-10"
              >
                <Play className="w-3.5 h-3.5 text-apple-dark fill-apple-dark" />
              </button>
            </div>

            {/* TRACK 2: User Recorded Wave */}
            <div className="h-16 flex items-center relative rounded-xl bg-white/45 border border-white/80 px-4 group shadow-sm transition-all duration-300 glass-glow-overlay">
              <div className="w-24 shrink-0 flex flex-col gap-0.5 text-left select-none">
                <span className="text-[10px] font-bold text-apple-gray uppercase tracking-wider flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-apple-gray" /> Your Shadowing
                </span>
                <span className="text-[9px] font-mono text-zinc-400">
                  {shadowState === 'ready' && "Track Empty"}
                  {shadowState === 'recording' && "Recording..."}
                  {shadowState === 'analyzing' && analyzingMessage}
                  {shadowState === 'result' && "Score: 92%"}
                </span>
              </div>
              
              {/* Wave Display */}
              <div className="flex-1 h-10 relative flex items-center">
                {shadowState === 'ready' && (
                  <div className="w-full h-[0.5px] bg-black/10" />
                )}

                {shadowState === 'recording' && (
                  /* Overlay Three Siri Waves with varying frequencies */
                  <svg className="w-full h-full siri-anim-light" viewBox="0 0 100 24" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="appleGlow1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0071e3" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="#0071e3" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Primary Wave 1 Fill */}
                    <path d={`${getPathFromPointsShifted(wavePoints, 0, 1.0, 0)} L 100 24 L 0 24 Z`} fill="url(#appleGlow1)" />
                    {/* Primary Wave 1 Stroke (Blue) */}
                    <path d={getPathFromPointsShifted(wavePoints, 0, 1.0, 0)} fill="none" stroke="#0071e3" strokeWidth="1.8" strokeLinecap="round" />
                    {/* Wave 2 Stroke (Green Shift) */}
                    <path d={getPathFromPointsShifted(wavePoints, Math.PI / 3, 0.75, 0.5)} fill="none" stroke="#34c759" strokeWidth="1.0" strokeOpacity="0.5" strokeLinecap="round" />
                    {/* Wave 3 Stroke (Orange Shift) */}
                    <path d={getPathFromPointsShifted(wavePoints, -Math.PI / 4, 0.5, -0.5)} fill="none" stroke="#ff9500" strokeWidth="0.8" strokeOpacity="0.3" strokeLinecap="round" />
                  </svg>
                )}

                {shadowState === 'analyzing' && (
                  <div className="w-full h-full shimmer-wave opacity-30 rounded" />
                )}

                {shadowState === 'result' && (
                  <>
                    <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                      {/* Base User wave (Green) */}
                      <path d={userResultPath} fill="none" stroke="#34c759" strokeWidth="2" strokeLinecap="round" />
                      
                      {/* Orange Highlights for Liaison breaks */}
                      <path d="M 34 12 L 42 12" fill="none" stroke="#ff9500" strokeWidth="2.5" strokeLinecap="round" />
                      <path d="M 72 12 L 78 12" fill="none" stroke="#ff9500" strokeWidth="2.5" strokeLinecap="round" />

                      {/* Glowing Point Pins directly on the wave coordinates */}
                      {/* Pin 1: agentic */}
                      <circle cx="38" cy="12" r="2.5" fill="#ff9500" />
                      
                      {/* Pin 2: autonomous */}
                      <circle cx="75" cy="12" r="2.5" fill="#ff9500" />
                    </svg>

                    {/* Apple Style Highlight boundary overlays */}
                    <button 
                      onClick={() => setSelectedWordIndex(5)}
                      className="absolute bottom-0 left-[34%] w-[8%] h-full border-x border-t border-dashed border-[#ff9500]/30 bg-[#ff9500]/5 hover:bg-[#ff9500]/10 cursor-pointer focus:outline-none transition-colors z-10"
                      title="Liaison correction: agentic -> workflows"
                    />
                    <button 
                      onClick={() => setSelectedWordIndex(10)}
                      className="absolute bottom-0 left-[72%] w-[6%] h-full border-x border-t border-dashed border-[#ff9500]/30 bg-[#ff9500]/5 hover:bg-[#ff9500]/10 cursor-pointer focus:outline-none transition-colors z-10"
                      title="Liaison correction: autonomous -> feedback"
                    />
                  </>
                )}
              </div>

              {/* Play button next to track */}
              {shadowState === 'result' && (
                <button 
                  onClick={() => playFullAudio('user')}
                  disabled={isPlayingUser}
                  className="absolute right-4 p-2 bg-white hover:bg-apple-light-gray border border-black/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:opacity-50 shadow-sm active:scale-95 z-10"
                >
                  <Play className="w-3.5 h-3.5 text-apple-dark fill-apple-dark" />
                </button>
              )}
            </div>

          </div>
        </section>

        {/* Apple Music Style Scrolling Lyrics Transcription Panel */}
        <section className="flex-1 flex flex-col justify-center items-center px-8 py-12 text-center max-w-[1000px] mx-auto min-h-[360px] relative">
          
          {/* Transcript lyrics wall */}
          <div className="flex-1 flex flex-wrap justify-center content-center gap-x-2 gap-y-6 leading-[4rem] text-3xl md:text-4xl font-bold tracking-tight text-apple-gray/40 select-text font-sans">
            {transcriptWords.map((item, idx) => {
              const isSelected = selectedWordIndex === idx;
              const isEvaluating = showFeedback && shadowState === 'result';
              
              // Standard styling
              let wordStyle = "text-apple-dark/40 hover:text-apple-dark px-2.5 py-0.5 rounded-2xl cursor-pointer transition-all duration-300 spring-active hover:bg-white/60 hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)]";
              let borderStyle = "";
              
              if (isEvaluating) {
                if (item.type === 'perfect') {
                  wordStyle = "text-[#34c759] hover:text-[#34c759]/80 px-2.5 py-0.5 cursor-pointer transition-colors";
                } else if (item.type === 'liaison') {
                  wordStyle = "text-[#ff9500] bg-[#ff9500]/5 px-2.5 py-0.5 rounded-2xl border border-[#ff9500]/20 animate-pulse shadow-[0_4px_16px_rgba(255,149,0,0.06)] cursor-pointer transition-all";
                  borderStyle = "border-b-2 border-dashed border-[#ff9500] pb-1";
                } else if (item.type === 'flat') {
                  wordStyle = "text-apple-gray bg-black/5 px-2.5 py-0.5 rounded-2xl border border-black/5 cursor-pointer transition-all";
                  borderStyle = "border-b border-apple-gray pb-1";
                }
              }

              if (isSelected) {
                if (item.type === 'liaison') {
                  wordStyle += " ring-2 ring-[#ff9500]/60 bg-[#ff9500]/10 scale-105";
                } else {
                  wordStyle += " ring-2 ring-apple-gray bg-white/80 shadow-sm scale-105";
                }
              }

              return (
                <span key={idx} className="relative inline-block">
                  <button
                    onClick={() => {
                      playWordAudio(item, idx, 'native');
                      if (isEvaluating && (item.type === 'liaison' || item.type === 'flat')) {
                        setSelectedWordIndex(isSelected ? null : idx);
                      }
                    }}
                    className={`${wordStyle} ${borderStyle} focus:outline-none`}
                  >
                    {item.text}
                  </button>

                  {/* Audio wave click ripple indicator */}
                  {activeAudioWord === idx && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0071e3] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#0071e3]"></span>
                    </span>
                  )}

                  {/* iOS Style Action sheet popover right under the word */}
                  {isSelected && isEvaluating && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 z-50 w-[310px] liquidglass-card rounded-3xl p-5 shadow-[0_24px_50px_rgba(0,0,0,0.08)] animate-fade-in flex flex-col gap-4 text-left glass-glow-overlay">
                      
                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-black/5 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-apple-dark font-sans">{item.text.replace(/[^a-zA-Z]/g, "")}</span>
                          <span className="text-xs text-apple-gray font-mono font-medium">{item.ipa}</span>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedWordIndex(null);
                          }}
                          className="p-1 rounded-full hover:bg-black/5 text-apple-gray hover:text-apple-dark transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Wave comparison */}
                      <div className="flex flex-col gap-2.5 bg-black/[0.02] border border-black/5 rounded-2xl p-3">
                        <span className="text-[9px] uppercase tracking-wider text-apple-gray font-bold font-sans">Pitch Contour Comparison</span>
                        
                        {/* Native */}
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-apple-gray font-mono w-10 shrink-0">Native:</span>
                          <div className="flex-1 h-6 flex items-center relative overflow-hidden">
                            <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                              <path 
                                d="M0 12 C15 4, 25 2, 40 12 C55 20, 65 20, 80 12 T100 12" 
                                fill="none" 
                                stroke="#86868b" 
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
                            className="p-1.5 rounded-full bg-white hover:bg-apple-light-gray text-apple-dark border border-black/5 shadow-sm transition-colors cursor-pointer active:scale-95 z-10"
                          >
                            <Play className="w-3 h-3 fill-current" />
                          </button>
                        </div>

                        {/* You */}
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-[#ff9500] font-mono w-10 shrink-0">You:</span>
                          <div className="flex-1 h-6 flex items-center relative overflow-hidden">
                            <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                              {item.type === 'liaison' ? (
                                <>
                                  <path 
                                    d="M0 12 C15 4, 25 2, 40 12 M58 12 C65 20, 80 12 T100 12" 
                                    fill="none" 
                                    stroke="#ff9500" 
                                    strokeWidth="2.0" 
                                    strokeDasharray="3.5 2.5"
                                    strokeLinecap="round"
                                  />
                                  <circle cx="49" cy="12" r="2.5" fill="#ff3b30" className="animate-ping" />
                                </>
                              ) : (
                                <path 
                                  d="M0 12 H100" 
                                  fill="none" 
                                  stroke="#86868b" 
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
                            className="p-1.5 rounded-full bg-white hover:bg-apple-light-gray text-apple-dark border border-black/5 shadow-sm transition-colors cursor-pointer active:scale-95 z-10"
                          >
                            <Play className="w-3 h-3 fill-current" />
                          </button>
                        </div>
                      </div>

                      {/* Mouth Tip */}
                      <div className="bg-[#ff9500]/5 border border-[#ff9500]/10 rounded-2xl p-3.5 text-xs text-[#ff9500] leading-relaxed font-medium">
                        {item.tip}
                      </div>

                      {/* CTA */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedWordIndex(null);
                          setShadowState('ready');
                          setTimeout(() => {
                            handleMainActionClick();
                          }, 300);
                        }}
                        className="w-full bg-[#34c759] hover:bg-[#34c759]/90 text-white text-xs font-bold py-2.5 rounded-2xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95 z-10"
                      >
                        <Mic className="w-4 h-4" />
                        <span>Isolate & Practice Word</span>
                      </button>
                    </div>
                  )}
                </span>
              );
            })}
          </div>

          {/* Large Overall Score display overlay (Apple-style summary banner) */}
          {shadowState === 'result' && (
            <div className="absolute top-4 bg-white/60 border border-white/80 rounded-2xl px-5 py-3.5 flex items-center gap-6 shadow-[0_12px_24px_rgba(0,0,0,0.03)] backdrop-blur-md glass-glow-overlay">
              <div className="flex flex-col gap-0.5 text-left border-r border-black/5 pr-5">
                <span className="text-[9px] uppercase tracking-widest text-apple-gray font-bold font-mono">Evaluation score</span>
                <span className="text-3xl font-extralight text-[#34c759] tracking-tight">92% <span className="text-[10px] font-bold uppercase tracking-wider text-apple-gray font-sans ml-1">Excellent</span></span>
              </div>
              
              <div className="flex items-center gap-6 text-[10px] text-apple-gray font-mono">
                <div className="flex flex-col gap-0.5">
                  <span>Pronunciation</span>
                  <span className="text-apple-dark font-bold">94%</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[#ff9500]">Liaison linking</span>
                  <span className="text-[#ff9500] font-bold">89%</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span>Pitch Intonation</span>
                  <span className="text-apple-dark font-bold">91%</span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Floating iOS Voice Memos-Style Controller Dock (Bottom Center) */}
        <div className="sticky bottom-8 left-0 right-0 flex justify-center z-40 px-4">
          <div className="liquidglass-panel rounded-full px-6 py-3 shadow-[0_16px_36px_rgba(0,0,0,0.06)] flex items-center gap-8 max-w-[580px] w-full justify-between glass-glow-overlay">
            
            {/* Speed Control Indicator */}
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => {
                  playSynthSound([300], 0.08, 'sine');
                  setPlaybackSpeed(prev => prev === '1.0x' ? '0.8x' : prev === '0.8x' ? '1.2x' : '1.0x');
                }}
                className="w-10 h-10 rounded-full bg-white hover:bg-apple-light-gray text-apple-dark border border-black/5 text-[10px] font-mono font-bold flex items-center justify-center cursor-pointer transition-colors shadow-sm active:scale-95 z-10"
                title="Change Playback Speed"
              >
                {playbackSpeed}
              </button>
              <span className="text-[8px] font-mono text-apple-gray uppercase tracking-wider font-semibold">Speed</span>
            </div>

            {/* Central iOS Recording Button */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {shadowState === 'recording' && (
                  <div className="absolute inset-[-6px] rounded-full border border-apple-red/30 ring-glow-active-light" />
                )}
                
                {/* Circular Button Face */}
                <button
                  onClick={handleMainActionClick}
                  className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative focus:outline-none cursor-pointer active:scale-95 z-10 ${
                    shadowState === 'ready' 
                      ? 'border-apple-dark bg-white hover:scale-105' 
                      : shadowState === 'recording'
                        ? 'border-apple-dark bg-white scale-105'
                        : shadowState === 'analyzing'
                          ? 'border-zinc-300 bg-[#f5f5f7] cursor-not-allowed'
                          : 'border-[#34c759] bg-white hover:scale-105 shadow-sm'
                  }`}
                >
                  {/* Inside Circle/Square morphs */}
                  {shadowState === 'ready' && (
                    <div className="w-10 h-10 rounded-full bg-apple-red hover:brightness-95 transition-all" />
                  )}
                  {shadowState === 'recording' && (
                    <div className="w-4 h-4 bg-apple-red rounded-sm animate-pulse transition-all" />
                  )}
                  {shadowState === 'analyzing' && (
                    <svg className="animate-spin h-5 w-5 text-apple-gray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {shadowState === 'result' && (
                    <RotateCcw className="w-5 h-5 text-[#34c759]" />
                  )}
                </button>
              </div>
              <span className="text-[8px] font-mono text-apple-gray uppercase tracking-widest mt-1.5 font-bold">
                {shadowState === 'ready' && "RECORD"}
                {shadowState === 'recording' && "STOP"}
                {shadowState === 'analyzing' && "SYNC"}
                {shadowState === 'result' && "RESET"}
              </span>
            </div>

            {/* AI Overlay Toggler */}
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-mono text-apple-gray uppercase tracking-wider font-semibold">Overlay</span>
              <button 
                onClick={() => {
                  if (shadowState === 'result') {
                    setShowFeedback(!showFeedback);
                    setSelectedWordIndex(null);
                    playSynthSound([600], 0.1, 'sine');
                  } else {
                    handleMainActionClick();
                  }
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all cursor-pointer shadow-sm active:scale-95 z-10 ${
                  showFeedback && shadowState === 'result'
                    ? 'bg-[#34c759]/10 border-[#34c759] text-[#34c759]' 
                    : 'bg-white border-black/5 text-apple-gray hover:text-apple-dark hover:bg-apple-light-gray'
                }`}
                title="Toggle Speech Feedback Overlay"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}

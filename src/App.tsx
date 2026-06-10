import { useState, useEffect, useRef } from 'react';
import './App.css';

// Types, Constants & Utilities
import type { WordItem } from './types';
import { transcriptWords } from './constants/transcript';
import { playSynthSound, parseTimestamp } from './utils/audio';

// Components
import { GlowFilters } from './components/GlowFilters';
import { Sidebar } from './components/Sidebar';
import { NavigationDots } from './components/NavigationDots';
import { Hero } from './components/Hero';
import { PracticeArena } from './components/PracticeArena';
import { DiagnosticsHub } from './components/DiagnosticsHub';
import { DictionaryPopover } from './components/DictionaryPopover';
import { Sparkles } from 'lucide-react';

// AI Sentence Composition Database
const COMMON_DICTIONARY: Record<string, { ipa: string; definition: string }> = {
  "the": { ipa: "ðə", definition: "art. 这，那（特指）" },
  "future": { ipa: "ˈfjuː.tʃər", definition: "n. 未来，前途 | adj. 未来的" },
  "of": { ipa: "əv", definition: "prep. 属于……的，关于" },
  "llms": { ipa: "el.el.emz", definition: "n. 大语言模型 (LLMs)" },
  "and": { ipa: "ænd", definition: "conj. 和, 且, 与, 而且" },
  "agentic": { ipa: "əˈdʒen.tɪk", definition: "adj. 智能体的，代理的" },
  "workflows": { ipa: "ˈwɜːk.fləʊz", definition: "n. 工作流，工作步骤" },
  "will": { ipa: "wɪl", definition: "v. 将，会" },
  "require": { ipa: "rɪˈkwaɪər", definition: "v. 需要，要求" },
  "human-in-the-loop": { ipa: "ˌhjuː.mən.ɪn.ðə.luːp", definition: "n. 人机协同，人机回环" },
  "autonomous": { ipa: "ɔːˈtɒn.ə.məs", definition: "adj. 自主的，自治的" },
  "feedback": { ipa: "ˈfiːd.bæk", definition: "n. 反馈，反馈信息" },
  "loops": { ipa: "luːps", definition: "n. 循环，回路（复数）" },
  "loop": { ipa: "luːp", definition: "n. 循环，圈" },
  "we": { ipa: "wiː", definition: "pron. 我们" },
  "can": { ipa: "kæn", definition: "v. 能，可以" },
  "build": { ipa: "bɪld", definition: "v. 建造，构建" },
  "better": { ipa: "ˈbet.ər", definition: "adj. 更好的" },
  "systems": { ipa: "ˈsɪs.təmz", definition: "n. 系统（复数）" },
  "system": { ipa: "ˈsɪs.təm", definition: "n. 系统" },
  "with": { ipa: "wɪð", definition: "prep. 具有，带有，和……一起" },
  "this": { ipa: "ðɪs", definition: "pron. 这，这个" },
  "new": { ipa: "njuː", definition: "adj. 新的" },
  "technology": { ipa: "tekˈnɒl.ə.dʒi", definition: "n. 技术，科技" },
  "to": { ipa: "tuː", definition: "prep. 向，到，对于" },
  "optimize": { ipa: "ˈɒp.tɪ.maɪz", definition: "v. 优化，使最优化" },
  "our": { ipa: "ˈaʊ.ər", definition: "pron. 我们的" },
  "performance": { ipa: "pəˈfɔː.məns", definition: "n. 表现，性能，绩效" },
  "ai": { ipa: "ˌeɪˈaɪ", definition: "n. 人工智能 (AI)" },
  "models": { ipa: "ˈmɒd.əlz", definition: "n. 模型（复数）" },
  "model": { ipa: "ˈmɒd.əl", definition: "n. 模型" },
  "for": { ipa: "fɔːr", definition: "prep. 为了，给，因为" },
  "enhanced": { ipa: "ɪnˈhɑːnst", definition: "adj. 增强的，提高的" },
  "accuracy": { ipa: "ˈæk.jə.rə.si", definition: "n. 精确度，准确性" },
  "active": { ipa: "ˈæk.tɪv", definition: "adj. 积极的，活跃的" },
  "learning": { ipa: "ˈlɜː.nɪŋ", definition: "n. 学习，学问" },
  "networks": { ipa: "ˈnet.wɜːks", definition: "n. 网络（复数）" },
  "network": { ipa: "ˈnet.wɜːk", definition: "n. 网络" },
  "neural": { ipa: "ˈnjʊə.rəl", definition: "adj. 神经的，神经系统的" },
  "leverages": { ipa: "ˈliː.vər.ɪdʒ.ɪz", definition: "v. 杠杆化，利用" },
  "advanced": { ipa: "ədˈvɑːnst", definition: "adj. 先进的，高级的" },
  "capture": { ipa: "ˈkæp.tʃər", definition: "v. 捕捉，捕获" },
  "spoken": { ipa: "ˈspəʊ.kən", definition: "adj. 口语的，口头的" },
  "audio": { ipa: "ˈɔː.di.əʊ", definition: "n. 音频，声音" },
  "deliver": { ipa: "dɪˈlɪv.ər", definition: "v. 交付，递送，表达" },
  "high": { ipa: "haɪ", definition: "adj. 高的" },
  "fidelity": { ipa: "fɪˈdel.ə.ti", definition: "n. 保真度，忠诚" },
  "real-time": { ipa: "ˌrɪəlˈtaɪm", definition: "adj. 实时的" },
  "speech": { ipa: "spiːtʃ", definition: "n. 演讲，语音，说话" },
  "diagnostics": { ipa: "ˌdaɪ.əɡˈnɒs.tɪks", definition: "n. 诊断，诊断学" }
};

const CANDIDATE_SENTENCES: string[] = [
  "We can optimize our workflows and systems for the future of LLMs.",
  "Autonomous feedback loops require active neural networks to optimize performance.",
  "This technology leverages agentic AI models with advanced diagnostics.",
  "The neural workflows will require a human-in-the-loop to analyze feedback.",
  "Deep neural networks deliver high fidelity speech diagnostics in real-time.",
  "EchoFlow leverages advanced agentic workflows for autonomous voice feedback.",
  "The future LLMs will require high fidelity autonomous feedback loops.",
  "AI speech diagnostics will require a human-in-the-loop for advanced workflows."
];

export default function App() {
  // Scrollytelling active state tracker
  const [activeSection, setActiveSection] = useState<number>(0);
  const [arenaProgress, setArenaProgress] = useState<number>(0);
  const [diagnosticsProgress, setDiagnosticsProgress] = useState<number>(0);
  
  // Application State
  const [shadowState, setShadowState] = useState<'ready' | 'recording' | 'analyzing' | 'result'>('ready');
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);
  const [popoverDirection, setPopoverDirection] = useState<'top' | 'bottom'>('top');
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number; height: number } | null>(null);
  const [popoverCardId, setPopoverCardId] = useState<number | null>(null);
  
  // Starred vocabulary words list
  const [starredWords, setStarredWords] = useState<string[]>([]);
  // AI sentence generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  // Active target text in Practice Arena
  const [activeTranscriptWords, setActiveTranscriptWords] = useState<WordItem[]>(transcriptWords);

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

  const handleWordClick = (e: React.MouseEvent<HTMLButtonElement>, item: WordItem, index: number, cardId: number) => {
    if (shadowState === 'recording') return;
    
    playWordAudio(item, index, 'native');
    
    if (selectedWordIndex === index && popoverCardId === cardId) {
      setSelectedWordIndex(null);
      setPopoverPosition(null);
      setPopoverCardId(null);
    } else {
      const buttonRect = e.currentTarget.getBoundingClientRect();
      const buttonCenterLeft = buttonRect.left + buttonRect.width / 2;
      const buttonTop = buttonRect.top;
      const buttonHeight = buttonRect.height;
      const viewportHeight = window.innerHeight;
      
      // If the word is in the top half of the screen, show below. Otherwise show above.
      const showBelow = buttonTop < viewportHeight / 2;
      setPopoverDirection(showBelow ? 'bottom' : 'top');
      setPopoverPosition({ top: buttonTop, left: buttonCenterLeft, height: buttonHeight });
      setSelectedWordIndex(index);
      setPopoverCardId(cardId);
    }
  };

  const handleToggleStar = (wordText: string) => {
    const cleanWord = wordText.replace(/[^a-zA-Z]/g, "");
    if (!cleanWord) return;

    setStarredWords(prev => {
      const exists = prev.some(w => w.toLowerCase() === cleanWord.toLowerCase());
      if (exists) {
        return prev.filter(w => w.toLowerCase() !== cleanWord.toLowerCase());
      } else {
        return [...prev, cleanWord];
      }
    });
  };

  const handleGenerateSentence = () => {
    if (starredWords.length === 0) return;
    setIsGenerating(true);
    
    setSelectedWordIndex(null);
    setPopoverPosition(null);
    setPopoverCardId(null);
    
    setTimeout(() => {
      let bestSentence = CANDIDATE_SENTENCES[0];
      let maxMatches = -1;
      
      CANDIDATE_SENTENCES.forEach(sentence => {
        let matches = 0;
        starredWords.forEach(starred => {
          const regex = new RegExp(`\\b${starred}\\b`, 'i');
          if (regex.test(sentence)) {
            matches++;
          }
        });
        if (matches > maxMatches) {
          maxMatches = matches;
          bestSentence = sentence;
        }
      });
      
      const rawWords = bestSentence.split(/\s+/);
      const newWordItems: WordItem[] = rawWords.map((word, idx) => {
        const cleanWordForLookup = word.toLowerCase().replace(/[^a-z-]/g, "");
        const dictEntry = COMMON_DICTIONARY[cleanWordForLookup] || {
          ipa: `/${cleanWordForLookup}/`,
          definition: `Word: ${word}`
        };

        const isStarred = starredWords.some(sw => sw.toLowerCase() === cleanWordForLookup.toLowerCase());
        
        let type: 'perfect' | 'liaison' | 'flat' | 'none' = 'none';
        let accuracy: 'good' | 'average' | 'poor' = 'good';
        let tip = "Standard vocal articulation.";

        if (isStarred) {
          if (idx % 2 === 0) {
            type = 'liaison';
            accuracy = 'average';
            tip = `✨ AI Tip: Focus on linking '${word}' smoothly into the next sound.`;
          } else {
            type = 'flat';
            accuracy = 'poor';
            tip = `❌ AI Tip: Pronunciation of '${word}' was flat. Lift soft palate and round lips.`;
          }
        } else {
          if (idx % 3 === 0) {
            type = 'perfect';
            accuracy = 'good';
            tip = "Clean stop consonant articulation.";
          }
        }

        const timeSec = idx * 0.7 + 0.4;
        const minutes = Math.floor(timeSec / 60);
        const seconds = (timeSec % 60).toFixed(1);
        const timestamp = `${minutes}:${seconds.padStart(4, '0')}`;

        return {
          text: word,
          type,
          ipa: dictEntry.ipa,
          tip,
          definition: dictEntry.definition,
          timestamp,
          accuracy
        };
      });

      setActiveTranscriptWords(newWordItems);
      setShadowState('ready');
      setRecordingMillis(0);
      setWavePoints(Array.from({ length: 30 }, () => 12));
      setIsGenerating(false);

      window.scrollTo({
        top: window.innerHeight,
        behavior: 'smooth'
      });
    }, 1500);
  };

  // Scroll tracker logic
  useEffect(() => {
    const handleScroll = () => {
      // Close popover on scroll to prevent detaching
      setSelectedWordIndex(null);
      setPopoverPosition(null);
      setPopoverCardId(null);

      const scrollTop = window.scrollY;
      const height = window.innerHeight;
      
      // Calculate active section index based on scroll offsets
      let index = 0;
      if (scrollTop < height) {
        index = 0;
      } else if (scrollTop < 3 * height) {
        index = 1;
      } else {
        index = 2;
      }
      setActiveSection(index);
      
      // Calculate scroll progress specifically within the 200vh Practice Arena track
      if (scrollTop >= height && scrollTop < 3 * height) {
        const progress = (scrollTop - height) / (2 * height);
        setArenaProgress(progress);
      } else {
        setArenaProgress(0);
      }
      
      // Calculate scroll progress specifically within the 200vh Diagnostics track
      if (scrollTop >= 3 * height && scrollTop < 5 * height) {
        const progress = (scrollTop - 3 * height) / (2 * height);
        setDiagnosticsProgress(progress);
      } else {
        setDiagnosticsProgress(0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      setPopoverCardId(null);
      setRecordingMillis(0);
      setWavePoints(Array.from({ length: 30 }, () => 12));
    }
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

  // Find index of the currently spoken/transcribed word during recording
  const currentActiveWordIndex = shadowState === 'recording'
    ? activeTranscriptWords.findIndex((item, idx) => {
        const wordTime = parseTimestamp(item.timestamp);
        const nextWordTime = idx < activeTranscriptWords.length - 1 
          ? parseTimestamp(activeTranscriptWords[idx + 1].timestamp) 
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

  const diagnosticSlideX = activeSection === 2
    ? Math.max(0, (0.45 - diagnosticsProgress) / 0.45 * 125)
    : activeSection > 2 ? 0 : 125;

  const hasFinishedRecording = shadowState === 'result';

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="w-full bg-[#09090b] text-[#ededef] font-sans relative"
    >
      {/* Ambient background blobs for premium designer atmosphere */}
      <div className="ambient-blob-1" />
      <div className="ambient-blob-2" />

      {/* Global SVG Glow Filters for neon laser oscilloscope aesthetic */}
      <GlowFilters />

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
      <Sidebar 
        activeSection={activeSection} 
        hasFinishedRecording={hasFinishedRecording} 
        starredWords={starredWords}
        onToggleStar={handleToggleStar}
        onGenerateSentence={handleGenerateSentence}
      />

      {/* Right Side Navigation Dots Indicator */}
      <NavigationDots activeSection={activeSection} hasFinishedRecording={hasFinishedRecording} />

      {/* Scrollable Viewports stack */}
      <div className="pl-[260px] w-full min-h-screen relative z-10">
        
        {/* SECTION 1: The Intro/Hero Screen */}
        <Hero />

        {/* SECTION 2 & 3: Sticky Practice Arena (h-[200vh]) */}
        <PracticeArena
          shadowState={shadowState}
          recordingMillis={recordingMillis}
          recordLimitPercent={recordLimitPercent}
          currentActiveWordIndex={currentActiveWordIndex}
          activeAudioWord={activeAudioWord}
          selectedWordIndex={selectedWordIndex}
          slideTranslateX={slideTranslateX}
          wavePoints={wavePoints}
          analyzingProgress={analyzingProgress}
          analyzingMessage={analyzingMessage}
          transcriptWords={activeTranscriptWords}
          handleWordClick={handleWordClick}
          handleMainActionClick={handleMainActionClick}
          nativeReferencePath={nativeReferencePath}
          userResultPath={userResultPath}
        />

        {/* SECTION 4: AI Feedback Hub */}
        <DiagnosticsHub
          selectedWordIndex={selectedWordIndex}
          diagnosticSlideX={diagnosticSlideX}
          scoreCount={scoreCount}
          metricsVisible={metricsVisible}
          transcriptWords={activeTranscriptWords}
          activeAudioWord={activeAudioWord}
          handleWordClick={handleWordClick}
          playWordAudio={playWordAudio}
          nativeReferencePath={nativeReferencePath}
          userResultPath={userResultPath}
          hasFinishedRecording={hasFinishedRecording}
        />

      </div>

      {/* Global Dictionary Popover */}
      {selectedWordIndex !== null && popoverPosition && (
        <DictionaryPopover
          word={activeTranscriptWords[selectedWordIndex]}
          popoverDirection={popoverDirection}
          popoverPosition={popoverPosition}
          onClose={() => {
            setSelectedWordIndex(null);
            setPopoverPosition(null);
            setPopoverCardId(null);
          }}
          onPlayAudio={(source) => {
            setSelectedWordIndex(null);
            setPopoverPosition(null);
            playWordAudio(activeTranscriptWords[selectedWordIndex!], selectedWordIndex!, source);
          }}
          isStarred={starredWords.some(w => w.toLowerCase() === activeTranscriptWords[selectedWordIndex].text.replace(/[^a-zA-Z]/g, "").toLowerCase())}
          onToggleStar={handleToggleStar}
        />
      )}

      {/* AI Processing Modal Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 bg-zinc-950/85 backdrop-blur-md z-100 flex flex-col items-center justify-center gap-6 animate-fade-in">
          <div className="relative flex items-center justify-center">
            {/* Glowing ring */}
            <div className="absolute -inset-4 rounded-full border border-emerald-500/20 ring-glow-active" />
            
            {/* Bounce logo card */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 animate-bounce">
              <Sparkles className="w-8 h-8 fill-current" />
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-1 text-center">
            <h3 className="text-base font-bold text-white tracking-wide font-sans">AI Speech Coach</h3>
            <p className="text-xs text-zinc-400 max-w-[240px] leading-relaxed font-sans">
              Composing custom practice sentence containing your vocabulary words...
            </p>
          </div>
          
          {/* Progress bar */}
          <div className="w-[180px] bg-zinc-900 border border-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full animate-loading-bar" />
          </div>
        </div>
      )}
    </div>
  );
}

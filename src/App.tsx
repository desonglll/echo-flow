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
      <Sidebar activeSection={activeSection} hasFinishedRecording={hasFinishedRecording} />

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
          transcriptWords={transcriptWords}
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
          transcriptWords={transcriptWords}
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
          word={transcriptWords[selectedWordIndex]}
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
            playWordAudio(transcriptWords[selectedWordIndex!], selectedWordIndex!, source);
          }}
        />
      )}
    </div>
  );
}

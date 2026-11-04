import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Flame,
  Award,
  BookOpen,
  Headphones,
  CheckCircle2,
} from 'lucide-react';
import {
  FocusTimerPreset,
  AmbientSoundType,
  LectureItem,
  HomeworkItem,
  QuickTask,
} from '../types';
import {
  FOCUS_TIMER_PRESETS,
  MOTIVATIONAL_FOCUS_QUOTES,
  formatTimeMMSS,
  getPresetDurationSeconds,
} from '../utils/quickTasksAndFocusLogic';

interface FocusModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAwardPoints: (points: number, reason: string) => void;
  lectures: LectureItem[];
  homework: HomeworkItem[];
  quickTasks: QuickTask[];
}

export const FocusModeModal: React.FC<FocusModeModalProps> = ({
  isOpen,
  onClose,
  onAwardPoints,
  lectures,
  homework,
  quickTasks,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<FocusTimerPreset>('pomodoro');
  const [customMinutes, setCustomMinutes] = useState<number>(30);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [initialDuration, setInitialDuration] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedTaskTitle, setSelectedTaskTitle] = useState<string>('مذاكرة حرة وتركيز عام');
  const [isCustomTaskInput, setIsCustomTaskInput] = useState<boolean>(false);
  const [customTaskText, setCustomTaskText] = useState<string>('');
  const [quoteIndex, setQuoteIndex] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [ambientSound, setAmbientSound] = useState<AmbientSoundType>('none');
  const [completedSessionsCount, setCompletedSessionsCount] = useState<number>(0);

  // Web Audio Context for offline synthetic ambient sound
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundNodeRef = useRef<{ stop: () => void } | null>(null);

  // Rotate quotes every 45s
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_FOCUS_QUOTES.length);
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  // Update timer duration when preset changes
  useEffect(() => {
    const secs = getPresetDurationSeconds(selectedPreset, customMinutes);
    setInitialDuration(secs);
    setSecondsRemaining(secs);
    setIsRunning(false);
  }, [selectedPreset, customMinutes]);

  // Main countdown / stopwatch interval
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isRunning) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (selectedPreset === 'stopwatch') {
            return prev + 1;
          }

          if (prev <= 1) {
            // Timer Finished!
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, selectedPreset]);

  // Web Audio ambient sound generator
  useEffect(() => {
    // Stop any existing sound
    if (soundNodeRef.current) {
      try {
        soundNodeRef.current.stop();
      } catch (e) {}
      soundNodeRef.current = null;
    }

    if (ambientSound === 'none' || !isRunning) {
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (ambientSound === 'whitenoise' || ambientSound === 'rain') {
        // Noise buffer generator
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          if (ambientSound === 'rain') {
            // Brown / Pink noise for rain
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + 0.02 * white) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5;
          } else {
            // White noise
            output[i] = Math.random() * 2 - 1;
          }
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        // Filter
        const filter = ctx.createBiquadFilter();
        filter.type = ambientSound === 'rain' ? 'lowpass' : 'bandpass';
        filter.frequency.value = ambientSound === 'rain' ? 800 : 1000;

        const gainNode = ctx.createGain();
        gainNode.gain.value = 0.035;

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        whiteNoise.start();
        soundNodeRef.current = {
          stop: () => {
            try {
              whiteNoise.stop();
              whiteNoise.disconnect();
            } catch (e) {}
          },
        };
      } else if (ambientSound === 'alpha_binaural') {
        // Alpha Waves 10Hz difference (200Hz and 210Hz)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.frequency.value = 216;
        osc2.frequency.value = 226; // 10Hz binaural beat
        gain.gain.value = 0.03;

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start();
        osc2.start();

        soundNodeRef.current = {
          stop: () => {
            try {
              osc1.stop();
              osc2.stop();
              osc1.disconnect();
              osc2.disconnect();
            } catch (e) {}
          },
        };
      } else if (ambientSound === 'tick') {
        // Metronome / Soft Tick every 1 sec
        let isStopped = false;
        const tickInterval = setInterval(() => {
          if (isStopped) return;
          try {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.frequency.value = 900;
            g.gain.setValueAtTime(0.02, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
            osc.connect(g);
            g.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.05);
          } catch (e) {}
        }, 1000);

        soundNodeRef.current = {
          stop: () => {
            isStopped = true;
            clearInterval(tickInterval);
          },
        };
      }
    } catch (e) {
      console.warn('Web Audio Ambient error:', e);
    }

    return () => {
      if (soundNodeRef.current) {
        soundNodeRef.current.stop();
        soundNodeRef.current = null;
      }
    };
  }, [ambientSound, isRunning]);

  // Handle ESC key to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if (e.code === 'Space' && isOpen && e.target === document.body) {
        e.preventDefault();
        setIsRunning((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleTimerComplete = () => {
    setIsRunning(false);
    setCompletedSessionsCount((c) => c + 1);

    // Calculate awarded points based on session
    let points = 15;
    if (selectedPreset === 'deep_work') points = 30;
    if (selectedPreset === 'sprint') points = 10;
    if (selectedPreset === 'custom') points = Math.max(5, Math.round(customMinutes / 2));

    onAwardPoints(points, `إتمام جلسة تركيز (${selectedTaskTitle})`);

    // Celebration
    try {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    } catch (e) {}

    // Audio chime
    try {
      const ctx = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3); // G5
      osc.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.45); // C6
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {}
  };

  const handleAdd5Minutes = () => {
    setSecondsRemaining((prev) => prev + 5 * 60);
    setInitialDuration((prev) => prev + 5 * 60);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    const secs = getPresetDurationSeconds(selectedPreset, customMinutes);
    setSecondsRemaining(secs);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Progress ratio
  const progressRatio =
    selectedPreset === 'stopwatch'
      ? 1
      : initialDuration > 0
      ? Math.max(0, Math.min(1, 1 - secondsRemaining / initialDuration))
      : 0;

  // Stroke calculation for circular progress ring (radius = 120)
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between overflow-y-auto selection:bg-amber-500 selection:text-black animate-in fade-in duration-300"
      style={{
        backgroundImage: 'radial-gradient(ellipse at 50% 20%, rgba(30, 27, 75, 0.6) 0%, rgba(2, 6, 23, 0.98) 80%)',
      }}
    >
      {/* Top Bar (Ultra Minimal, Clutter-Free) */}
      <div className="w-full max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-3 border-b border-slate-900/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Flame className="w-5 h-5 fill-amber-500 text-amber-500 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black tracking-wide text-white">
                وضع التركيز العميق (Focus Mode)
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                خالٍ من المشتتات 📵
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              جلسات مكتملة اليوم: <strong className="text-amber-400">{completedSessionsCount}</strong>
            </p>
          </div>
        </div>

        {/* Top Control Buttons */}
        <div className="flex items-center gap-2">
          {/* Ambient Sound Selector */}
          <div className="relative flex items-center">
            <select
              value={ambientSound}
              onChange={(e) => setAmbientSound(e.target.value as AmbientSoundType)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              title="أصوات هادئة للتركيز (مطر، ضوضاء بيضاء، ألفا)"
            >
              <option value="none">🔇 بدون صوت</option>
              <option value="rain">🌧️ صوت المطر</option>
              <option value="whitenoise">📻 ضوضاء بيضاء</option>
              <option value="alpha_binaural">🧠 موجات ألفا 10Hz</option>
              <option value="tick">⏱️ دقات هادئة</option>
            </select>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            title={isFullscreen ? 'تصغير الشاشة' : 'ملء الشاشة'}
            aria-label="تبديل ملء الشاشة"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close / Exit Button */}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/50 hover:border-rose-700/60 text-slate-300 hover:text-rose-300 border border-slate-800 text-xs font-bold transition-all"
            title="الخروج من وضع التركيز (Esc)"
            aria-label="الخروج من وضع التركيز"
          >
            <X className="w-4 h-4" />
            <span>خروج</span>
          </button>
        </div>
      </div>

      {/* Main Focus Canvas */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8">
        {/* Active Task Selector & Target */}
        <div className="w-full max-w-lg space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            مهمة التركيز الحالية:
          </span>

          {!isCustomTaskInput ? (
            <div className="flex items-center justify-center gap-2">
              <select
                value={selectedTaskTitle}
                onChange={(e) => {
                  if (e.target.value === '__custom__') {
                    setIsCustomTaskInput(true);
                  } else {
                    setSelectedTaskTitle(e.target.value);
                  }
                }}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-sm font-bold text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
              >
                <optgroup label="مهمة عامة">
                  <option value="مذاكرة حرة وتركيز عام">🎯 مذاكرة حرة وتركيز عام</option>
                </optgroup>
                <optgroup label="محاضرات القدرات المتبقية">
                  {lectures
                    .filter((l) => !l.completed)
                    .map((l) => (
                      <option key={l.id} value={`القدرات: ${l.title}`}>
                        {l.category === 'quantitative' ? '📐 ' : '📖 '} {l.title}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="واجبات المدرسة">
                  {homework
                    .filter((h) => !h.completed)
                    .map((h) => (
                      <option key={h.id} value={`واجب ${h.subject}: ${h.title}`}>
                        📝 واجب {h.subject}: {h.title}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="مهام سريعة">
                  {quickTasks
                    .filter((q) => !q.completed)
                    .map((q) => (
                      <option key={q.id} value={`مهمة سريعة: ${q.title}`}>
                        ⚡ {q.title}
                      </option>
                    ))}
                </optgroup>
                <option value="__custom__">✏️ اكتب هدفاً مخصصاً بنفسك...</option>
              </select>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={customTaskText}
                onChange={(e) => setCustomTaskText(e.target.value)}
                placeholder="اكتب هدف جلستك (مثال: حل 20 سؤال تجميعات 1445)"
                className="flex-1 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (customTaskText.trim()) {
                    setSelectedTaskTitle(customTaskText.trim());
                  }
                  setIsCustomTaskInput(false);
                }}
                className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
              >
                تثبيت
              </button>
              <button
                type="button"
                onClick={() => setIsCustomTaskInput(false)}
                className="px-2 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs"
              >
                إلغاء
              </button>
            </div>
          )}
        </div>

        {/* Circular Animated Study Timer */}
        <div className="relative flex items-center justify-center my-2">
          {/* SVG Progress Circle */}
          <svg className="w-64 h-64 sm:w-80 sm:h-80 -rotate-90 transform" viewBox="0 0 280 280">
            {/* Background ring */}
            <circle
              cx="140"
              cy="140"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-slate-800/80"
            />
            {/* Animated progress ring */}
            <circle
              cx="140"
              cy="140"
              r={radius}
              stroke="url(#focusGradient)"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
            <defs>
              <linearGradient id="focusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Digital Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
            <span
              className={`font-mono font-black text-6xl sm:text-7xl tracking-tighter ${
                isRunning ? 'text-white' : 'text-slate-300'
              }`}
            >
              {formatTimeMMSS(secondsRemaining)}
            </span>

            <span className="text-xs sm:text-sm font-bold text-amber-400/90 flex items-center gap-1">
              {selectedPreset === 'stopwatch' ? (
                'عداد تصاعدي مفتوح ⏱️'
              ) : isRunning ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block mr-1" />
                  جلسة تركيز جارية...
                </>
              ) : (
                'المؤقت متوقف مؤقتاً'
              )}
            </span>
          </div>
        </div>

        {/* Primary Controls (Play/Pause, Reset, +5m) */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={handleResetTimer}
            className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all hover:scale-105 active:scale-95"
            title="إعادة ضبط المؤقت"
            aria-label="إعادة ضبط المؤقت"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center justify-center gap-2.5 px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl font-black text-base sm:text-lg shadow-xl transition-all hover:scale-105 active:scale-95 ${
              isRunning
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
                : 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-amber-500/30 ring-4 ring-amber-500/20'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-6 h-6 fill-current" />
                <span>إيقاف مؤقت</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6 fill-current ml-0.5" />
                <span>ابدأ التركيز</span>
              </>
            )}
          </button>

          {selectedPreset !== 'stopwatch' && (
            <button
              type="button"
              onClick={handleAdd5Minutes}
              className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-slate-800 transition-all hover:scale-105 active:scale-95 font-black text-xs flex items-center gap-1"
              title="تمديد 5 دقائق إضافية"
              aria-label="إضافة 5 دقائق"
            >
              <Plus className="w-4 h-4" />
              <span>5د</span>
            </button>
          )}
        </div>

        {/* Timer Presets Selection Pills */}
        <div className="w-full max-w-xl space-y-2 pt-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            أنماط التركيز المتاحة:
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {FOCUS_TIMER_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPreset(p.id)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-xs transition-all ${
                  selectedPreset === p.id
                    ? 'bg-gradient-to-b from-indigo-900/60 to-slate-900 border-amber-400 text-white shadow-md shadow-amber-500/10 scale-105'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span className="text-base mb-0.5">{p.icon}</span>
                <span className="font-bold text-[11px]">{p.label}</span>
                <span className="text-[9px] text-slate-400">
                  {p.minutes > 0 ? `${p.minutes}د` : 'حر'}
                </span>
              </button>
            ))}
          </div>

          {/* Custom Minutes Input if custom selected */}
          {selectedPreset === 'custom' && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <span className="text-xs text-slate-400">حدد الدقائق:</span>
              <input
                type="number"
                min="1"
                max="180"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-center font-bold text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-xs text-slate-400">دقيقة</span>
            </div>
          )}
        </div>

        {/* Motivational Quote Banner */}
        <div className="w-full max-w-md p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 font-medium">
          <p className="italic">"{MOTIVATIONAL_FOCUS_QUOTES[quoteIndex]}"</p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full max-w-5xl mx-auto px-4 py-3 text-center text-xs text-slate-500 border-t border-slate-900/80">
        اضغط <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded-md text-[10px] text-slate-400 font-mono">Space</kbd> للتشغيل/الإيقاف • اضغط <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded-md text-[10px] text-slate-400 font-mono">Esc</kbd> للخروج
      </div>
    </div>
  );
};

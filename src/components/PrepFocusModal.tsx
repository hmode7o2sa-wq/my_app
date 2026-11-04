import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Plus,
  CheckCircle2,
  Sparkles,
  Volume2,
  VolumeX,
  Clock,
  Bell,
} from 'lucide-react';
import { PrepItem } from '../types';
import {
  sendBrowserNotification,
  playChimeSound,
  requestNotificationPermission,
  getNotificationPermission,
} from '../utils/notificationService';

interface PrepFocusModalProps {
  prep: PrepItem;
  onClose: () => void;
  onComplete: (prepId: string) => void;
}

export const PrepFocusModal: React.FC<PrepFocusModalProps> = ({
  prep,
  onClose,
  onComplete,
}) => {
  const totalSeconds = prep.durationMinutes * 60;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(totalSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const warnedRef = useRef(false);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          // Warning when 60 seconds left
          if (prev === 61 && !warnedRef.current) {
            warnedRef.current = true;
            if (soundEnabled) playChimeSound('warning');
            sendBrowserNotification('اقتربت جلسة الاستعداد من الانتهاء ⏳', {
              body: `تبقى دقيقة واحدة على نهاية جلسة: "${prep.name}"`,
              tag: 'prep-warning',
            });
          }

          if (prev <= 1) {
            clearInterval(interval!);
            handleFinished();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsRemaining, soundEnabled, prep]);

  const handleFinished = () => {
    setIsRunning(false);
    if (soundEnabled) {
      playChimeSound('finish');
    }
    sendBrowserNotification('انتهت جلسة التركيز والاستعداد! 🎓', {
      body: `تهانينا! أنهيت وقت جلسة "${prep.name}". اضغط لإنهاء الجلسة وحصد +${prep.pointsReward} نقطة.`,
      tag: 'prep-finish',
      requireInteraction: true,
    });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min(
    100,
    Math.round(((totalSeconds - secondsRemaining) / totalSeconds) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 text-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative space-y-6 text-center dir-rtl">
        {/* Top Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
              title={soundEnabled ? 'كتم الصوت' : 'تفعيل صوت التنبيه'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {getNotificationPermission() !== 'granted' && (
              <button
                type="button"
                onClick={requestNotificationPermission}
                className="text-[11px] font-bold px-2 py-1 rounded-lg bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 flex items-center gap-1"
                title="تفعيل إشعارات المتصفح"
              >
                <Bell className="w-3 h-3" />
                <span>إشعار</span>
              </button>
            )}
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            جلسة تركيز ومذاكرة
          </span>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
            aria-label="إغلاق مؤقت التركيز"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Prep Info */}
        <div className="space-y-1">
          <h3 className="text-xl font-black text-white tracking-tight">
            {prep.name}
          </h3>
          <p className="text-xs text-indigo-200/80 line-clamp-2">
            {prep.description}
          </p>
        </div>

        {/* Circular / Big Timer Display */}
        <div className="relative py-4 flex flex-col items-center justify-center">
          <div className="w-56 h-56 rounded-full border-4 border-indigo-500/20 flex flex-col items-center justify-center relative shadow-inner shadow-indigo-950">
            {/* SVG Progress Circle */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="112"
                cy="112"
                r="104"
                className="stroke-indigo-500/20"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="112"
                cy="112"
                r="104"
                className="stroke-amber-400 transition-all duration-500"
                strokeWidth="6"
                strokeDasharray={2 * Math.PI * 104}
                strokeDashoffset={2 * Math.PI * 104 * (1 - progressPercent / 100)}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            <span className="text-4xl sm:text-5xl font-black tracking-wider text-white font-mono">
              {formatTime(secondsRemaining)}
            </span>
            <span className="text-xs text-indigo-300 mt-1 font-bold">
              {progressPercent}% مكتمل
            </span>
          </div>
        </div>

        {/* Controls: Play/Pause, +5m, Reset */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setSecondsRemaining((prev) => prev + 300)}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1 transition-colors"
            title="إضافة 5 دقائق"
          >
            <Plus className="w-4 h-4" />
            <span>5 دقائق</span>
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className="px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-amber-400/20 transition-transform active:scale-95"
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>إيقاف مؤقت</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>متابعة الجلسة</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setIsRunning(false);
              setSecondsRemaining(totalSeconds);
              warnedRef.current = false;
            }}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="إعادة تعيين المؤقت"
            aria-label="إعادة تعيين المؤقت"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Complete Session Action Button */}
        <div className="pt-2 border-t border-white/10">
          <button
            onClick={() => {
              onComplete(prep.id);
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm shadow-md transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>إنهاء الاستعداد وحصد (+{prep.pointsReward} نقطة)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

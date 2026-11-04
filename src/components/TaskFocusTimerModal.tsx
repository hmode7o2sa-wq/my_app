import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  X,
  Clock,
  Sparkles,
  Award,
  BookOpen,
  Bell,
} from 'lucide-react';
import { HomeworkItem } from '../types';
import {
  sendBrowserNotification,
  playChimeSound,
  requestNotificationPermission,
  getNotificationPermission,
} from '../utils/notificationService';

interface TaskFocusTimerModalProps {
  task: HomeworkItem | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (taskId: string) => void;
}

export const TaskFocusTimerModal: React.FC<TaskFocusTimerModalProps> = ({
  task,
  isOpen,
  onClose,
  onComplete,
}) => {
  if (!isOpen || !task) return null;

  const totalMinutes = task.timerMinutes || task.durationMinutes || 25;
  const initialSeconds = totalMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState<number>(initialSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const warnedRef = useRef(false);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
    setIsRunning(true);
    warnedRef.current = false;
  }, [task]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => {
          // Warning when 60 seconds left
          if (prev === 61 && !warnedRef.current) {
            warnedRef.current = true;
            playChimeSound('warning');
            sendBrowserNotification('اقترب انتهاء المؤقت ⏱️', {
              body: `تبقى دقيقة واحدة فقط على انتهاء تايمر المهمة: "${task.title}"`,
              tag: 'task-warning',
            });
          }

          if (prev <= 1) {
            setIsRunning(false);
            playChimeSound('finish');
            sendBrowserNotification('انتهى مؤقت المهمة! 🎉', {
              body: `تهانينا! أنهيت وقت إنجاز المهمة "${task.title}". اضغط لتسجيل الإنجاز وحصد +${task.points} نقطة.`,
              tag: 'task-finish',
              requireInteraction: true,
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, secondsLeft, task]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progressPercent = Math.min(100, Math.round(((initialSeconds - secondsLeft) / initialSeconds) * 100));

  const handleFinish = () => {
    onComplete(task.id);
    onClose();
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(initialSeconds);
    warnedRef.current = false;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 text-center space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800 dir-rtl text-right">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </span>
            <span className="text-xs font-black text-slate-800 dark:text-slate-100">
              مؤقت إنجاز المهمة (تايمر مع إشعار)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {getNotificationPermission() !== 'granted' && (
              <button
                type="button"
                onClick={requestNotificationPermission}
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-300 hover:bg-amber-500/30 flex items-center gap-1"
                title="تفعيل إشعارات المتصفح"
              >
                <Bell className="w-3 h-3" />
                <span>إذن الإشعارات</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Task Info - Centered Title */}
        <div className="space-y-2 text-center">
          <span className="inline-block text-xs font-extrabold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            {task.subject}
          </span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white text-center">
            {task.title}
          </h3>
          {task.hasDescription && task.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto text-center">
              {task.description}
            </p>
          )}
        </div>

        {/* Circular / Big Timer Display */}
        <div className="relative py-4 flex flex-col items-center justify-center">
          <div className="w-48 h-48 rounded-full border-8 border-indigo-100 dark:border-slate-800 flex flex-col items-center justify-center relative shadow-inner">
            <div
              className="absolute inset-0 rounded-full border-8 border-indigo-600 dark:border-indigo-500 transition-all duration-1000"
              style={{
                clipPath: `polygon(50% 50%, -50% -50%, ${progressPercent * 2}% -50%, ${progressPercent * 2}% 150%, -50% 150%)`,
              }}
            />
            <span className="text-4xl font-black tracking-tight text-slate-900 dark:text-white z-10 font-mono">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1 z-10">
              {secondsLeft === 0
                ? 'انتهى الوقت بالكامل! 🎉'
                : isRunning
                ? 'المؤقت قيد التشغيل...'
                : 'المؤقت متوقف مؤقتاً'}
            </span>
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm text-white shadow-md transition-all ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                <span>إيقاف مؤقت</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>استئناف المؤقت</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="p-3 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            title="إعادة التعيين"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Complete and Earn Points Button */}
        <div className="pt-2">
          <button
            onClick={handleFinish}
            className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-102"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[3]" />
            <span>تم إنجاز المهمة بنجاح واكتساب (+{task.points} نقطة)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

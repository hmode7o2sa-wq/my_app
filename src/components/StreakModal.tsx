import React from 'react';
import {
  Flame,
  Shield,
  Trophy,
  Sparkles,
  X,
  CheckCircle2,
  Calendar,
  Zap,
  ArrowLeft,
} from 'lucide-react';
import { StreakData } from '../types';

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  streak: StreakData;
  onOpenBadges?: () => void;
}

export const StreakModal: React.FC<StreakModalProps> = ({
  isOpen,
  onClose,
  streak,
  onOpenBadges,
}) => {
  if (!isOpen) return null;

  const milestones = [
    { days: 3, title: 'شعلة البداية', reward: '+30 نقطة', icon: '🔥' },
    { days: 7, title: 'الستريك الذهبي', reward: '+70 نقطة', icon: '⚡' },
    { days: 14, title: 'فارس الانضباط', reward: '+150 نقطة', icon: '🛡️' },
    { days: 30, title: 'أسطورة الشهر', reward: '+350 نقطة', icon: '👑' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="streak-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 text-right dir-rtl space-y-6 my-6 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="إغلاق نافذة الستريك"
          className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header with Flame Glow */}
        <div className="text-center space-y-3 pt-2">
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 bg-rose-500/30 rounded-full blur-2xl animate-pulse" />
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-rose-600 via-orange-500 to-amber-400 flex items-center justify-center text-white shadow-xl shadow-orange-500/30 relative z-10">
              <Flame className="w-12 h-12 fill-white animate-bounce" />
            </div>
          </div>

          <div className="space-y-1">
            <h2
              id="streak-modal-title"
              className="text-3xl font-black text-slate-900 dark:text-white"
            >
              {streak.currentStreak} أيام ستريك مستمر! 🔥
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              شعلة التزامك مشتعلة! حافظ على مذاكرة محاضرات القدرات أو تقييم يومك يومياً ليبقى الستريك حياً.
            </p>
          </div>
        </div>

        {/* Streak Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-bold">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>أطول ستريك تاريخي</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {streak.longestStreak} <span className="text-xs text-slate-400 font-medium">أيام</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-bold">
              <Shield className="w-3.5 h-3.5 text-indigo-500" />
              <span>دروع الحماية (Freeze)</span>
            </div>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {streak.freezesRemaining} <span className="text-xs text-slate-400 font-medium">دروع</span>
            </div>
            <span className="text-[10px] text-slate-400 block">تحميك عند الغياب يوماً</span>
          </div>
        </div>

        {/* Milestones Timeline */}
        <div className="space-y-3">
          <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>محطات ومكافآت الستريك:</span>
          </h4>

          <div className="space-y-2">
            {milestones.map((m) => {
              const isAchieved = streak.currentStreak >= m.days;
              return (
                <div
                  key={m.days}
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                    isAchieved
                      ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/80 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-75'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{m.icon}</span>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                          {m.title}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">
                          ({m.days} أيام)
                        </span>
                      </div>
                      <span className="text-xs text-amber-700 dark:text-amber-300 font-extrabold block">
                        مكافأة: {m.reward}
                      </span>
                    </div>
                  </div>

                  {isAchieved ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>مكتمل ✅</span>
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-400">
                      متبقي {m.days - streak.currentStreak} يوم
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          {onOpenBadges && (
            <button
              onClick={() => {
                onClose();
                onOpenBadges();
              }}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              <span>استعراض جميع الأوسمة والشارات 🏆</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

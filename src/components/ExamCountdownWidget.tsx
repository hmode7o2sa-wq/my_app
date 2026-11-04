import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  Sparkles,
  Edit3,
  Check,
  X,
  Target,
  Flame,
  ChevronDown,
  ChevronUp,
  MapPin,
} from 'lucide-react';
import { ExamCountdownConfig } from '../types';
import { calculateTimeRemaining, TimeRemaining } from '../utils/streakAndBadgesLogic';

interface ExamCountdownWidgetProps {
  config: ExamCountdownConfig;
  onUpdateConfig: (newConfig: ExamCountdownConfig) => void;
  onOpenSettings?: () => void;
}

export const ExamCountdownWidget: React.FC<ExamCountdownWidgetProps> = ({
  config,
  onUpdateConfig,
  onOpenSettings,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [formData, setFormData] = useState<ExamCountdownConfig>(config);
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(config.targetDate)
  );

  // Sync formData when config changes
  useEffect(() => {
    setFormData(config);
  }, [config]);

  // Live ticking timer every second
  useEffect(() => {
    if (!config.enabled) return;

    setTimeRemaining(calculateTimeRemaining(config.targetDate));
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(config.targetDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [config.targetDate, config.enabled]);

  if (!config.enabled) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(formData);
    setIsEditing(false);
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-black dark:via-indigo-950/70 dark:to-slate-950 text-white rounded-3xl p-4 sm:p-6 shadow-xl border border-indigo-900/40 relative overflow-hidden text-right dir-rtl transition-all">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute -bottom-10 right-10 w-60 h-60 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Header bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white">
                {config.examName}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-400 text-slate-950 shadow-xs flex items-center gap-1">
                <Target className="w-3 h-3" />
                <span>الهدف: {config.targetScore}</span>
              </span>
            </div>
            {config.notes && (
              <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                <span>{config.notes}</span>
              </p>
            )}
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 mr-auto">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 border border-white/15 transition-all flex items-center gap-1.5"
            title="تعديل موعد واسم الاختبار"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">تعديل الموعد</span>
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 border border-white/15 transition-all"
            title={isCollapsed ? 'توسيع العداد' : 'تصغير العداد'}
            aria-label={isCollapsed ? 'توسيع عداد الاختبار' : 'تصغير عداد الاختبار'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Editing Form */}
      {isEditing && (
        <form onSubmit={handleSave} className="relative z-10 pt-4 space-y-3 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">اسم الاختبار:</label>
              <input
                type="text"
                required
                value={formData.examName}
                onChange={(e) => setFormData({ ...formData, examName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">تاريخ ووقت الاختبار:</label>
              <input
                type="datetime-local"
                required
                value={formData.targetDate.slice(0, 16)}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">الدرجة المستهدفة:</label>
              <input
                type="text"
                placeholder="مثال: +95 أو 100%"
                value={formData.targetScore}
                onChange={(e) => setFormData({ ...formData, targetScore: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">المقر أو ملاحظة:</label>
            <input
              type="text"
              placeholder="مثال: مقر قياس جامعة الملك سعود - قاعة رقم 3"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>حفظ التعديلات</span>
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold transition-all"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      {/* Countdown Digits View (if not collapsed) */}
      {!isCollapsed && !isEditing && (
        <div className="relative z-10 pt-4">
          {timeRemaining.isPast ? (
            <div className="p-4 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl text-center space-y-1">
              <p className="text-base sm:text-lg font-black text-emerald-300">
                {timeRemaining.formattedArabic}
              </p>
              <p className="text-xs text-slate-300">
                توكل على الله، لقد بذلت الجهد والالتزام، وفالك أعلى الدرجات بإذن الله!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Ticking Units Row */}
              <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-xl mx-auto">
                <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/15 p-2 sm:p-3 rounded-2xl text-center space-y-0.5">
                  <div className="text-2xl sm:text-4xl font-black text-amber-300 tracking-tight font-mono">
                    {timeRemaining.days}
                  </div>
                  <span className="text-[10px] sm:text-xs text-slate-300 font-bold block">
                    يوم
                  </span>
                </div>

                <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/15 p-2 sm:p-3 rounded-2xl text-center space-y-0.5">
                  <div className="text-2xl sm:text-4xl font-black text-white tracking-tight font-mono">
                    {String(timeRemaining.hours).padStart(2, '0')}
                  </div>
                  <span className="text-[10px] sm:text-xs text-slate-300 font-bold block">
                    ساعة
                  </span>
                </div>

                <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/15 p-2 sm:p-3 rounded-2xl text-center space-y-0.5">
                  <div className="text-2xl sm:text-4xl font-black text-white tracking-tight font-mono">
                    {String(timeRemaining.minutes).padStart(2, '0')}
                  </div>
                  <span className="text-[10px] sm:text-xs text-slate-300 font-bold block">
                    دقيقة
                  </span>
                </div>

                <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/15 p-2 sm:p-3 rounded-2xl text-center space-y-0.5">
                  <div className="text-2xl sm:text-4xl font-black text-amber-400 tracking-tight font-mono animate-pulse">
                    {String(timeRemaining.seconds).padStart(2, '0')}
                  </div>
                  <span className="text-[10px] sm:text-xs text-slate-300 font-bold block">
                    ثانية
                  </span>
                </div>
              </div>

              {/* Motivational Advice Banner */}
              <div className="flex items-center justify-between text-xs text-slate-300 bg-white/5 px-3.5 py-2 rounded-xl border border-white/10">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    كل محاضرة قدرات تنجزها اليوم تقرّبك خطوة حاسمة من تحقيق درجة {config.targetScore} بإذن الله!
                  </span>
                </span>
                <span className="text-amber-300 font-extrabold hidden md:inline shrink-0">
                  التزم بالـ 5 لفظي ودرس الكمي يومياً 🚀
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  Brain,
  Calculator,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Gift,
  Flame,
  RotateCcw,
  BookOpen,
  AlertTriangle,
  MinusCircle,
  Settings,
  ShieldAlert,
  Star,
} from 'lucide-react';
import { LectureItem, QuduratCategory, PenaltySettings } from '../types';
import { calculateLectureProgress, formatDurationInArabic } from '../utils/studyLogic';

interface QuduratSectionProps {
  lectures: LectureItem[];
  penaltySettings: PenaltySettings;
  onToggleLecture: (id: string) => void;
  onUpdatePenaltySettings: (settings: PenaltySettings) => void;
  onApplyManualPenalty: () => void;
  onNavigateToRewards: () => void;
  onResetLectures: () => void;
  onOpenSettings?: () => void;
  onOpenDailyReview?: () => void;
  hasReviewedToday?: boolean;
}

export const QuduratSection: React.FC<QuduratSectionProps> = ({
  lectures,
  penaltySettings,
  onToggleLecture,
  onUpdatePenaltySettings,
  onApplyManualPenalty,
  onNavigateToRewards,
  onResetLectures,
  onOpenSettings,
  onOpenDailyReview,
  hasReviewedToday = false,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | QuduratCategory>('all');
  const [justCompletedLecture, setJustCompletedLecture] = useState<LectureItem | null>(null);
  const [showPenaltySettings, setShowPenaltySettings] = useState(false);

  const progress = calculateLectureProgress(lectures);

  const filteredLectures =
    activeCategory === 'all'
      ? lectures
      : lectures.filter((l) => l.category === activeCategory);

  const handleLectureClick = (lec: LectureItem) => {
    const willBeCompleted = !lec.completed;
    onToggleLecture(lec.id);

    if (willBeCompleted) {
      setJustCompletedLecture(lec);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner: Daily Qudurat Goal & Progress */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-slate-950 dark:via-indigo-950 dark:to-black rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden border border-indigo-900/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold backdrop-blur-xs">
              <Brain className="w-3.5 h-3.5" />
              <span>مطلوب يومياً: 5 لفظي + درس كمي كامل</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              محاضرات ودروس القدرات اليومية
            </h2>
            <p className="text-sm text-indigo-200/90 max-w-xl leading-relaxed">
              5 محاضرات في القسم اللفظي + درس كامل وشامل في القسم الكمي. أنجزها لحصد النقاط أو سيتم تطبيق الخصم التلقائي المبرمج!
            </p>
          </div>

          {/* Quick Circular Progress & Direct Reward Button */}
          <div className="flex items-center gap-3 self-start md:self-center shrink-0">
            <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/15 rounded-2xl p-3 sm:p-4 text-center min-w-[130px]">
              <span className="text-[11px] text-indigo-200 block font-bold">
                إنجاز اليوم
              </span>
              <div className="text-2xl sm:text-3xl font-black text-amber-300">
                {progress.totalDone} / 6
              </div>
              <span className="text-[10px] text-indigo-300">
                {progress.verbalDone}/5 لفظي • {progress.quantDone}/1 كمي
              </span>
            </div>

            <button
              onClick={onNavigateToRewards}
              className="flex flex-col items-center justify-center gap-1 px-4 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all hover:scale-105 active:scale-95 min-h-[76px]"
              title="الانتقال إلى كافيه المكافآت"
            >
              <Gift className="w-5 h-5 text-slate-950" />
              <span>كافيه المكافآت</span>
            </button>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex justify-between text-xs text-indigo-200 font-semibold">
            <span>
              نسبة إتمام مهام اليوم ({progress.totalDone} من 6 محاضرات ودروس منجزة)
            </span>
            <span className="font-bold text-white">{progress.percent}%</span>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 backdrop-blur-xs">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Penalty Settings Banner & Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/40 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  نظام الخصم عند عدم المذاكرة
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    penaltySettings.autoPenaltyEnabled
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {penaltySettings.autoPenaltyEnabled ? 'الخصم التلقائي مفعل ✅' : 'معطل'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                يخصم {penaltySettings.quduratVerbalPenalty} نقطة لكل محاضرة لفظي لم تُذاكر، و {penaltySettings.quduratQuantLessonPenalty} نقطة لعدم مذاكرة درس الكمي الكامل.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Auto Penalty Switch */}
            <button
              onClick={() =>
                onUpdatePenaltySettings({
                  ...penaltySettings,
                  autoPenaltyEnabled: !penaltySettings.autoPenaltyEnabled,
                })
              }
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                penaltySettings.autoPenaltyEnabled
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
              }`}
            >
              {penaltySettings.autoPenaltyEnabled ? 'تعطيل الخصم التلقائي' : 'تفعيل الخصم التلقائي'}
            </button>

            {/* Manual Deduction Trigger */}
            <button
              onClick={onApplyManualPenalty}
              className="px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-colors"
              title="تطبيق الخصم الآن على المهام غير المنجزة"
            >
              تطبيق الخصم الآن ⚠️
            </button>

            {/* Customizer trigger */}
            <button
              onClick={onOpenSettings || (() => setShowPenaltySettings(!showPenaltySettings))}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors"
              title="تعديل قيم الخصم والإعدادات"
            >
              <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span>الإعدادات</span>
            </button>
          </div>
        </div>
      </div>

      {/* Just-Completed Celebration Banner */}
      {justCompletedLecture && justCompletedLecture.completed && (
        <div className="bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 text-white rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 text-center sm:text-right">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20">
                  +{justCompletedLecture.points} نقطة أضيفت لرصيدك!
                </span>
                <span className="text-xs text-emerald-100">تم إنجاز المهمة بنجاح</span>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white mt-0.5">
                أحسنت! أتممت: {justCompletedLecture.category === 'verbal' ? `محاضرة ${justCompletedLecture.order} - لفظي` : `محاضرة ${justCompletedLecture.order || 1} - كمي`}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={onNavigateToRewards}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-md transition-transform hover:scale-105 active:scale-95"
            >
              <Gift className="w-4 h-4 text-slate-900" />
              <span>الانتقال لكافيه المكافآت الآن</span>
            </button>
            <button
              onClick={() => setJustCompletedLecture(null)}
              className="px-3 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* Category Tabs: لفظي (5) / كمي (درس كامل) / الكل */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 p-1 bg-slate-200/80 dark:bg-slate-800/80 rounded-2xl border border-slate-300/80 dark:border-slate-700">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeCategory === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            الكل (6 مهام قدرات)
          </button>
          <button
            onClick={() => setActiveCategory('verbal')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeCategory === 'verbal'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>القسم اللفظي (5 محاضرات)</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeCategory === 'verbal'
                  ? 'bg-indigo-800 text-indigo-100'
                  : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {progress.verbalDone}/5
            </span>
          </button>
          <button
            onClick={() => setActiveCategory('quantitative')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeCategory === 'quantitative'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>القسم الكمي (درس كامل)</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeCategory === 'quantitative'
                  ? 'bg-sky-800 text-sky-100'
                  : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {progress.quantDone}/1
            </span>
          </button>
        </div>

        {/* Reset / Daily Reset action */}
        <button
          onClick={onResetLectures}
          title="إعادة تعيين المحاضرات ليوم دراسي جديد"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>بدء يوم دراسي جديد</span>
        </button>
      </div>

      {/* Lectures Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLectures.map((lec) => {
          const isVerbal = lec.category === 'verbal';

          return (
            <div
              key={lec.id}
              className={`relative rounded-3xl border transition-all duration-200 overflow-hidden ${
                lec.completed
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 shadow-xs'
                  : isVerbal
                  ? 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-900/60 hover:border-indigo-400 hover:shadow-md'
                  : 'bg-white dark:bg-slate-900 border-sky-300 dark:border-sky-800/80 ring-2 ring-sky-100 dark:ring-sky-950 hover:border-sky-500 hover:shadow-md'
              }`}
            >
              {/* Category indicator strip */}
              <div
                className={`h-2 w-full ${
                  lec.completed
                    ? 'bg-emerald-500'
                    : isVerbal
                    ? 'bg-indigo-600'
                    : 'bg-gradient-to-r from-sky-500 via-teal-500 to-indigo-600'
                }`}
              />

              <div className="p-4 sm:p-5 space-y-3.5">
                {/* Header: Category Badge, Duration & Points */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black ${
                        isVerbal
                          ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800'
                          : 'bg-sky-100 dark:bg-sky-950 text-sky-900 dark:text-sky-200 border border-sky-200 dark:border-sky-800'
                      }`}
                    >
                      {isVerbal ? (
                        <Brain className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-300" />
                      ) : (
                        <Calculator className="w-3.5 h-3.5 text-sky-700 dark:text-sky-300" />
                      )}
                      <span>{isVerbal ? 'لفظي' : 'كمي'}</span>
                    </span>

                    {lec.isFullLesson && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800">
                        درس كامل
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-semibold bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDurationInArabic(lec.durationMinutes)}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-700 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg">
                      <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      <span>+{lec.points} نقطة</span>
                    </span>
                  </div>
                </div>

                {/* Lecture Title */}
                <div>
                  <h3
                    className={`text-lg sm:text-xl font-black tracking-tight ${
                      lec.completed ? 'text-emerald-950 dark:text-emerald-300 line-through opacity-80' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {isVerbal ? `محاضرة ${lec.order} - لفظي` : `محاضرة ${lec.order || 1} - كمي`}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {lec.description}
                </p>

                {/* Primary Action Button: "تم إنجاز المهمة" */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                  <button
                    onClick={() => handleLectureClick(lec)}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm transition-all duration-200 ${
                      lec.completed
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 dark:shadow-none hover:scale-[1.01] active:scale-[0.99]'
                    }`}
                  >
                    {lec.completed ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تم إنجاز المهمة ✅ (انقر للإلغاء)</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4" />
                        <span>تم إنجاز المهمة (+{lec.points} نقطة)</span>
                      </>
                    )}
                  </button>

                  {/* If completed, show direct rewards button */}
                  {lec.completed && (
                    <button
                      onClick={onNavigateToRewards}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
                      title="استبدال النقاط في كافيه المكافآت"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>المكافآت</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* End of Day Rating Callout Banner */}
      {onOpenDailyReview && (
        <div className="bg-gradient-to-r from-amber-500/15 via-indigo-500/10 to-amber-500/15 dark:from-amber-950/40 dark:via-indigo-950/30 dark:to-amber-950/40 rounded-3xl p-5 sm:p-6 border border-amber-300 dark:border-amber-700/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-right">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
              <Star className="w-6 h-6 fill-slate-950 text-slate-950" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>تقييم نهاية اليوم الدراسي</span>
                {hasReviewedToday && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    تم التقييم اليوم ✅
                  </span>
                )}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                {hasReviewedToday
                  ? 'تم حفظ تقييمك وملاحظتك بنجاح في سجل الأداء، يمكنك تعديلها في أي وقت.'
                  : 'قيّم إنجازك من 5 نجوم واكتب ملاحظة قصيرة لتوثيق تركيزك وحفظه بسجل الأداء مع +15 نقطة!'}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenDailyReview}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all hover:scale-105 active:scale-95 shrink-0 flex items-center justify-center gap-2"
          >
            <Star className="w-4 h-4 fill-slate-950 text-slate-950" />
            <span>{hasReviewedToday ? 'عرض وتعديل تقييم اليوم ✏️' : 'قيّم إنجاز اليوم الآن ⭐'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  Star,
  Award,
  Flame,
  Calendar,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Trash2,
  Plus,
  Filter,
  Brain,
  GraduationCap,
  TrendingUp,
} from 'lucide-react';
import { DailyReviewRecord } from '../types';
import {
  calculateReviewStats,
  getRatingDescriptor,
  getTodayDateKey,
  checkHasReviewedToday,
} from '../utils/dailyReviewLogic';

interface DailyReviewHistoryProps {
  reviews: DailyReviewRecord[];
  onOpenReviewModal: () => void;
  onDeleteReview: (id: string) => void;
}

export const DailyReviewHistory: React.FC<DailyReviewHistoryProps> = ({
  reviews,
  onOpenReviewModal,
  onDeleteReview,
}) => {
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const todayKey = getTodayDateKey();
  const hasReviewedToday = checkHasReviewedToday(reviews, todayKey);
  const stats = calculateReviewStats(reviews);

  const filteredReviews = reviews.filter((r) => {
    if (filterRating === 'all') return true;
    return r.rating === filterRating;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-xs space-y-6 text-right dir-rtl">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>سجل الأداء الدراسي اليومي</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            سجل تقييمات اليوم وملاحظات الأداء
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            متابعة تراكمية لتقييماتك اليومية (من 5 نجوم) وملاحظاتك لتعزيز الانضباط وتحقيق التفوق في القدرات والمدرسة.
          </p>
        </div>

        {/* Trigger Review Button */}
        <button
          onClick={onOpenReviewModal}
          className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-black shadow-md transition-all flex items-center justify-center gap-2 shrink-0 ${
            hasReviewedToday
              ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
              : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 hover:shadow-amber-500/25 active:scale-98 animate-pulse'
          }`}
        >
          <Star className={`w-4 h-4 ${hasReviewedToday ? 'text-amber-500 fill-amber-500' : 'text-slate-950 fill-slate-950'}`} />
          <span>{hasReviewedToday ? 'تعديل تقييم اليوم ✏️' : 'قيّم إنجاز اليوم الآن ⭐'}</span>
        </button>
      </div>

      {/* KPI Performance Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>متوسط التقييم</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white flex items-baseline gap-1">
            <span>{stats.averageRating}</span>
            <span className="text-xs font-medium text-slate-400">/ 5.0</span>
          </div>
          <div className="flex items-center gap-0.5 text-amber-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3 h-3 ${
                  star <= Math.round(stats.averageRating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-300 dark:text-slate-600'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>أيام أسطورية (5 نجوم)</span>
            <Award className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {stats.fiveStarCount}{' '}
            <span className="text-xs font-medium text-slate-400">أيام</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
            {stats.highRatingPercentage}% نسبة التميز
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>سلسلة الالتزام (Streak)</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 flex items-baseline gap-1">
            <span>{stats.streakDays}</span>
            <span className="text-xs font-medium text-slate-400">أيام متتالية</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
            تقييم يومي مستمر 🔥
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>إجمالي الأيام المقيمة</span>
            <Calendar className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {stats.totalReviews}{' '}
            <span className="text-xs font-medium text-slate-400">سجل</span>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">
            محفوظة في سجل الأداء
          </span>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-bold ml-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>تصفية:</span>
          </span>

          <button
            onClick={() => setFilterRating('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filterRating === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            الكل ({reviews.length})
          </button>

          {[5, 4, 3, 2, 1].map((stars) => {
            const count = reviews.filter((r) => r.rating === stars).length;
            return (
              <button
                key={stars}
                onClick={() => setFilterRating(stars)}
                className={`px-2.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
                  filterRating === stars
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <span>{stars}</span>
                <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        {hasReviewedToday && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>تم تقييم اليوم بنجاح</span>
          </span>
        )}
      </div>

      {/* Review Entries List */}
      <div className="space-y-3">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-10 px-4 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
            <Star className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              لا توجد تقييمات مطابقة لهذا الاختيار
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              اضغط على زر &quot;قيّم إنجاز اليوم الآن ⭐&quot; لبدء تسجيل أول تقييم وملاحظة في سجل أدائك اليومي.
            </p>
          </div>
        ) : (
          filteredReviews.map((rev) => {
            const info = getRatingDescriptor(rev.rating);
            const isToday = rev.dateStr === todayKey;

            return (
              <div
                key={rev.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isToday
                    ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300/80 dark:border-amber-700/60 shadow-xs'
                    : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/80 hover:border-slate-300'
                } space-y-3`}
              >
                {/* Top row: Stars + Day + Badge + Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {/* Stars */}
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 sm:w-5 sm:h-5 ${
                            s <= rev.rating
                              ? 'fill-amber-400 text-amber-500 filter drop-shadow-xs'
                              : 'text-slate-200 dark:text-slate-700'
                          }`}
                        />
                      ))}
                    </div>

                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      {rev.displayDate || `${rev.dayName}، ${rev.dateStr}`}
                    </span>

                    {isToday && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 shadow-xs">
                        اليوم
                      </span>
                    )}

                    <span
                      className={`hidden sm:inline-block px-2.5 py-0.5 rounded-xl text-xs font-bold ${info.bgColor} ${info.color} border ${info.borderColor}`}
                    >
                      {info.badge}
                    </span>
                  </div>

                  {/* Badges of achievement and Delete Button */}
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                      <Brain className="w-3 h-3 text-indigo-500" />
                      <span>{rev.quduratDone}/{rev.quduratTotal} قدرات</span>
                    </span>

                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                      <GraduationCap className="w-3 h-3 text-emerald-500" />
                      <span>{rev.homeworkDone} واجبات</span>
                    </span>

                    <button
                      onClick={() => {
                        if (window.confirm('هل تريد حذف هذا التقييم من سجل الأداء؟')) {
                          onDeleteReview(rev.id);
                        }
                      }}
                      title="حذف هذا السجل"
                      aria-label="حذف التقييم من سجل الأداء"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Note / Reflection Box */}
                {rev.note && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <p className="flex-1 font-medium">{rev.note}</p>
                  </div>
                )}

                {/* Tags if present */}
                {rev.tags && rev.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {rev.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 text-[11px] font-semibold"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Star,
  Sparkles,
  X,
  CheckCircle2,
  Calendar,
  Brain,
  GraduationCap,
  Award,
  Flame,
  MessageSquare,
  Tag,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DailyReviewRecord } from '../types';
import {
  getRatingDescriptor,
  getTodayDateKey,
  getArabicDayName,
  formatArabicFullDate,
  PRESET_REVIEW_TAGS,
  DAILY_REVIEW_BONUS_POINTS,
  getTodayReviewRecord,
} from '../utils/dailyReviewLogic';

interface DailyReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveReview: (review: DailyReviewRecord, isNewBonus: boolean) => void;
  quduratDone: number;
  quduratTotal: number;
  homeworkDone: number;
  todayPoints: number;
  existingReviews: DailyReviewRecord[];
}

export const DailyReviewModal: React.FC<DailyReviewModalProps> = ({
  isOpen,
  onClose,
  onSaveReview,
  quduratDone,
  quduratTotal,
  homeworkDone,
  todayPoints,
  existingReviews,
}) => {
  const todayKey = getTodayDateKey();
  const existingToday = getTodayReviewRecord(existingReviews, todayKey);

  const [rating, setRating] = useState<number>(existingToday?.rating || 5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [note, setNote] = useState<string>(existingToday?.note || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(
    existingToday?.tags || ['🔥 تركيز عميق']
  );

  // Sync state whenever modal opens or existing review changes
  useEffect(() => {
    if (isOpen) {
      if (existingToday) {
        setRating(existingToday.rating);
        setNote(existingToday.note);
        setSelectedTags(existingToday.tags || []);
      } else {
        // Suggest rating based on completion
        const suggested =
          quduratDone === quduratTotal ? 5 : quduratDone >= 4 ? 4 : quduratDone >= 2 ? 3 : 2;
        setRating(suggested);
        setNote('');
        setSelectedTags(quduratDone === quduratTotal ? ['🎯 إنجاز 100%', '🔥 تركيز عميق'] : ['⚡ حماس عالي']);
      }
    }
  }, [isOpen, existingToday, quduratDone, quduratTotal]);

  if (!isOpen) return null;

  const currentDisplayRating = hoverRating !== null ? hoverRating : rating;
  const ratingInfo = getRatingDescriptor(currentDisplayRating);

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isNewBonus = !existingToday;
    const reviewRecord: DailyReviewRecord = {
      id: existingToday ? existingToday.id : `rev_${Date.now()}`,
      dateStr: todayKey,
      dayName: getArabicDayName(),
      displayDate: formatArabicFullDate(),
      rating,
      note: note.trim() || 'تم تقييم اليوم بنجاح والتسجيل في سجل الأداء الدراسي.',
      tags: selectedTags,
      quduratDone,
      quduratTotal,
      homeworkDone,
      pointsEarned: todayPoints,
      createdAt: new Date().toISOString(),
    };

    onSaveReview(reviewRecord, isNewBonus);

    if (rating >= 4) {
      try {
        confetti({
          particleCount: rating === 5 ? 90 : 50,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // safe fallback
      }
    }

    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="daily-review-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 text-right dir-rtl space-y-5 my-6 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="إغلاق نافذة التقييم"
          className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5 pl-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>نهاية اليوم الدراسي</span>
            <span className="text-slate-400">•</span>
            <span>{formatArabicFullDate()}</span>
          </div>

          <h2
            id="daily-review-title"
            className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white"
          >
            تقييم إنجاز اليوم 🌟
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            قيّم مستوى تركيزك وإنجازك اليومي، ودوّن ملاحظة تُحفظ في سجل الأداء لمتابعة تطورك المستمر.
          </p>
        </div>

        {/* Today's Digest Pill Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 sm:p-4 rounded-2xl border border-slate-200/70 dark:border-slate-700/60">
          <div className="text-center space-y-0.5">
            <div className="flex items-center justify-center gap-1 text-slate-500 dark:text-slate-400 text-[11px] font-bold">
              <Brain className="w-3.5 h-3.5 text-indigo-500" />
              <span>القدرات</span>
            </div>
            <div className="text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400">
              {quduratDone} / {quduratTotal}
            </div>
            <span className="text-[10px] text-slate-400">
              {quduratDone === quduratTotal ? 'مكتملة بالكامل ✅' : 'محاضرة ودرس'}
            </span>
          </div>

          <div className="text-center space-y-0.5 border-x border-slate-200 dark:border-slate-700 px-1">
            <div className="flex items-center justify-center gap-1 text-slate-500 dark:text-slate-400 text-[11px] font-bold">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
              <span>المدرسة</span>
            </div>
            <div className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">
              {homeworkDone}
            </div>
            <span className="text-[10px] text-slate-400">واجب منجز</span>
          </div>

          <div className="text-center space-y-0.5">
            <div className="flex items-center justify-center gap-1 text-slate-500 dark:text-slate-400 text-[11px] font-bold">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>نقاط اليوم</span>
            </div>
            <div className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400">
              +{todayPoints}
            </div>
            <span className="text-[10px] text-slate-400">نقطة في الرصيد</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 5-Star Interactive Rating Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>درجة التقييم من 5 نجوم</span>
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {currentDisplayRating} من 5 نجوم
              </span>
            </div>

            {/* Stars Row */}
            <div className="flex items-center justify-center gap-2 sm:gap-4 py-2 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              {[1, 2, 3, 4, 5].map((starValue) => {
                const isFilled = starValue <= currentDisplayRating;
                return (
                  <button
                    key={starValue}
                    type="button"
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(null)}
                    aria-label={`تقييم ${starValue} من 5 نجوم: ${getRatingDescriptor(starValue).label}`}
                    className="p-1 sm:p-2 rounded-xl transition-all duration-150 hover:scale-125 focus:outline-none focus:ring-2 focus:ring-amber-400 active:scale-95"
                  >
                    <Star
                      className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors ${
                        isFilled
                          ? 'fill-amber-400 text-amber-500 filter drop-shadow-md'
                          : 'fill-transparent text-slate-300 dark:text-slate-600 hover:text-amber-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Dynamic Rating Descriptor Banner */}
            <div
              className={`p-3.5 rounded-2xl border transition-all ${ratingInfo.bgColor} ${ratingInfo.borderColor}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`text-sm sm:text-base font-black ${ratingInfo.color}`}>
                  {ratingInfo.label}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-white/70 dark:bg-slate-900/70 text-slate-700 dark:text-slate-300 shadow-xs">
                  {ratingInfo.badge}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {ratingInfo.tip}
              </p>
            </div>
          </div>

          {/* Quick Tags / Chips */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-500" />
              <span>وسوم اليوم السريعة (اختر ما يصف يومك):</span>
            </label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {PRESET_REVIEW_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs font-bold scale-[1.02]'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Short Note Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="daily-review-note"
                className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4 text-indigo-500" />
                <span>ملاحظة الإنجاز والدروس المستفادة:</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {note.length} / 280 حرف
              </span>
            </div>

            <textarea
              id="daily-review-note"
              rows={3}
              maxLength={280}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="اكتب ملاحظة قصيرة عن يومك (مثل: أتقنت درس النسبة المئوية في الكمي، حليت واجب الكيمياء، أحتاج مراجعة التناظر غداً...)"
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors leading-relaxed placeholder:text-slate-400"
            />
          </div>

          {/* Bonus Reward Callout */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200/80 dark:border-amber-800/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-black shadow-xs">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div className="text-xs space-y-0.5">
              <p className="font-extrabold text-amber-950 dark:text-amber-200">
                {existingToday
                  ? 'تم تحديث التقييم اليومي في سجل الأداء'
                  : `مكافأة فورية +${DAILY_REVIEW_BONUS_POINTS} نقطة عند تسجيل تقييم اليوم! 🎁`}
              </p>
              <p className="text-amber-700 dark:text-amber-300">
                يُحفظ تقييمك في سجل الأداء لمتابعة تقدمك التراكمي ونسبة تفوقك.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {existingToday ? 'تحديث التقييم في سجل الأداء' : 'حفظ التقييم في سجل الأداء ⭐'}
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

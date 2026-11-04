import { DailyReviewRecord } from '../types';

export const DAILY_REVIEW_BONUS_POINTS = 15;

export const PRESET_REVIEW_TAGS = [
  '🔥 تركيز عميق',
  '📐 أتقنت الكمي',
  '📖 ختمت اللفظي',
  '📝 أنهيت الواجبات',
  '⚡ حماس عالي',
  '🎯 إنجاز 100%',
  '💪 تحديت الصعوبات',
  '😴 تعب خفيف لكن أنجزت',
];

export interface RatingDescriptor {
  stars: number;
  label: string;
  badge: string;
  color: string;
  borderColor: string;
  bgColor: string;
  tip: string;
}

export function getRatingDescriptor(rating: number): RatingDescriptor {
  const clamped = Math.max(1, Math.min(5, Math.round(rating)));
  switch (clamped) {
    case 5:
      return {
        stars: 5,
        label: 'أسطوري - يوم مثالي 100%',
        badge: '🌟 استثنائي',
        color: 'text-amber-500 dark:text-amber-400',
        borderColor: 'border-amber-300 dark:border-amber-600',
        bgColor: 'bg-amber-500/10 dark:bg-amber-950/30',
        tip: 'ما شاء الله تبارك الله! قمة الالتزام والتركيز، استمر بهذا الشغف وستصل لأعلى الدرجات بإذن الله!',
      };
    case 4:
      return {
        stars: 4,
        label: 'ممتاز - إنجاز قوي ومجهود رائع',
        badge: '✨ متميز',
        color: 'text-indigo-600 dark:text-indigo-400',
        borderColor: 'border-indigo-300 dark:border-indigo-600',
        bgColor: 'bg-indigo-500/10 dark:bg-indigo-950/30',
        tip: 'أداء مشرف جداً! خطوة كبيرة للأمام نحو تحقيق هدفك في القدرات والمدرسة.',
      };
    case 3:
      return {
        stars: 3,
        label: 'جيد - التزام لا بأس به',
        badge: '👍 جيد',
        color: 'text-emerald-600 dark:text-emerald-400',
        borderColor: 'border-emerald-300 dark:border-emerald-600',
        bgColor: 'bg-emerald-500/10 dark:bg-emerald-950/30',
        tip: 'مجهود طيب! استمر بالثبات، وغداً فرصة ممتازة لرفع وتيرة الإنجاز وتحقيق الدرجة الكاملة.',
      };
    case 2:
      return {
        stars: 2,
        label: 'مقبول - إنجاز جزئي للمهام',
        badge: '⚠️ مقبول',
        color: 'text-orange-600 dark:text-orange-400',
        borderColor: 'border-orange-300 dark:border-orange-600',
        bgColor: 'bg-orange-500/10 dark:bg-orange-950/30',
        tip: 'أنجزت بعض المهام، ولكن احذر من التسويف! ركز غداً على الـ 5 محاضرات لفظي ودرس الكمي كاملاً.',
      };
    case 1:
    default:
      return {
        stars: 1,
        label: 'يحتاج تحسين - يوم صعب أو تشتت',
        badge: '🔄 يحتاج تعويض',
        color: 'text-rose-600 dark:text-rose-400',
        borderColor: 'border-rose-300 dark:border-rose-600',
        bgColor: 'bg-rose-500/10 dark:bg-rose-950/30',
        tip: 'لا بأس، كل عثرة هي فرصة لبداية أقوى! تذكر أهدافك وخطط لبدء يومك القادم مبكراً وبنشاط.',
      };
  }
}

/**
 * Returns date string in format YYYY-MM-DD
 */
export function getTodayDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const ARABIC_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const ARABIC_MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

export function getArabicDayName(date: Date = new Date()): string {
  return ARABIC_DAYS[date.getDay()];
}

export function formatArabicFullDate(date: Date = new Date()): string {
  const dayName = getArabicDayName(date);
  const dayNum = date.getDate();
  const monthName = ARABIC_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName}، ${dayNum} ${monthName} ${year}`;
}

/**
 * Saves a new review or updates existing review for the same dateStr
 */
export function saveOrUpdateReviewRecord(
  records: DailyReviewRecord[],
  newRecord: DailyReviewRecord
): { records: DailyReviewRecord[]; isNew: boolean } {
  const existingIndex = records.findIndex((r) => r.dateStr === newRecord.dateStr);

  if (existingIndex >= 0) {
    const updated = [...records];
    updated[existingIndex] = {
      ...records[existingIndex],
      ...newRecord,
      id: records[existingIndex].id, // preserve original ID
    };
    return { records: updated, isNew: false };
  }

  // Prepend and sort by date descending
  const updated = [newRecord, ...records].sort(
    (a, b) => new Date(b.dateStr).getTime() - new Date(a.dateStr).getTime()
  );

  return { records: updated, isNew: true };
}

export function deleteReviewRecord(
  records: DailyReviewRecord[],
  id: string
): DailyReviewRecord[] {
  return records.filter((r) => r.id !== id);
}

export function checkHasReviewedToday(
  records: DailyReviewRecord[],
  todayDateKey: string = getTodayDateKey()
): boolean {
  return records.some((r) => r.dateStr === todayDateKey);
}

export function getTodayReviewRecord(
  records: DailyReviewRecord[],
  todayDateKey: string = getTodayDateKey()
): DailyReviewRecord | undefined {
  return records.find((r) => r.dateStr === todayDateKey);
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  fiveStarCount: number;
  highRatingPercentage: number;
  streakDays: number;
}

export function calculateReviewStats(records: DailyReviewRecord[]): ReviewStats {
  if (records.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      fiveStarCount: 0,
      highRatingPercentage: 0,
      streakDays: 0,
    };
  }

  const totalReviews = records.length;
  const sumRating = records.reduce((acc, r) => acc + r.rating, 0);
  const averageRating = Number((sumRating / totalReviews).toFixed(1));
  const fiveStarCount = records.filter((r) => r.rating === 5).length;
  const highRatingCount = records.filter((r) => r.rating >= 4).length;
  const highRatingPercentage = Math.round((highRatingCount / totalReviews) * 100);

  // Calculate streak of consecutive days
  // Sort date strings uniquely descending
  const uniqueDates = Array.from(new Set(records.map((r) => r.dateStr))).sort().reverse();
  let streakDays = 0;

  if (uniqueDates.length > 0) {
    const todayKey = getTodayDateKey();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayKey = getTodayDateKey(yesterdayDate);

    // streak starts if today or yesterday is logged
    if (uniqueDates[0] === todayKey || uniqueDates[0] === yesterdayKey) {
      streakDays = 1;
      let checkDate = new Date(uniqueDates[0]);

      for (let i = 1; i < uniqueDates.length; i++) {
        checkDate.setDate(checkDate.getDate() - 1);
        const expectedKey = getTodayDateKey(checkDate);
        if (uniqueDates[i] === expectedKey) {
          streakDays++;
        } else {
          break;
        }
      }
    }
  }

  return {
    averageRating,
    totalReviews,
    fiveStarCount,
    highRatingPercentage,
    streakDays,
  };
}

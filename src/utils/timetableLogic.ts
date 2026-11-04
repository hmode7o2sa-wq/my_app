import { TimetableSlot, HomeworkItem, ExamItem, TaskColorTheme } from '../types';

export type SlotTaskStatus = 'both' | 'exam_only' | 'homework_only' | 'completed' | 'none';

/**
 * Returns Arabic period name for numbers 1 to 7
 */
export function getPeriodArabicName(period: number): string {
  switch (period) {
    case 1:
      return 'الحصة الأولى';
    case 2:
      return 'الحصة الثانية';
    case 3:
      return 'الحصة الثالثة';
    case 4:
      return 'الحصة الرابعة';
    case 5:
      return 'الحصة الخامسة';
    case 6:
      return 'الحصة السادسة';
    case 7:
      return 'الحصة السابعة';
    default:
      return `الحصة ${period}`;
  }
}

/**
 * Determines the task status of a specific timetable slot
 */
export function getSlotTaskStatus(
  day: string,
  period: number,
  subject: string,
  homework: HomeworkItem[],
  exams: ExamItem[]
): SlotTaskStatus {
  const linkedHws = homework.filter((h) => {
    if (h.dayOfWeek === day && h.periodNumber === period) return true;
    if (h.dayOfWeek === day && h.subject && h.subject.includes(subject)) return true;
    return false;
  });

  const linkedExams = exams.filter((e) => {
    if (e.dayOfWeek === day && e.periodNumber === period) return true;
    if (e.dayOfWeek === day && e.subject && e.subject.includes(subject)) return true;
    return false;
  });

  const totalItems = linkedHws.length + linkedExams.length;
  if (totalItems === 0) return 'none';

  const uncompletedHws = linkedHws.filter((h) => !h.completed);
  const uncompletedExams = linkedExams.filter((e) => !e.completed);

  // If all linked items are marked completed
  if (uncompletedHws.length === 0 && uncompletedExams.length === 0) {
    return 'completed';
  }

  if (uncompletedHws.length > 0 && uncompletedExams.length > 0) {
    return 'both';
  }

  if (uncompletedExams.length > 0) {
    return 'exam_only';
  }

  return 'homework_only';
}

/**
 * Returns color styles and labels for a slot based on its task status
 */
export function getSlotColorClass(
  status: SlotTaskStatus,
  customColor?: TaskColorTheme
): {
  bg: string;
  border: string;
  badge: string;
  text: string;
  label?: string;
  badgeBg: string;
  glow: string;
} {
  switch (status) {
    case 'both':
      return {
        bg: 'bg-gradient-to-br from-indigo-50 via-purple-50 to-amber-50 dark:from-indigo-950/50 dark:via-purple-950/40 dark:to-amber-950/30',
        border: 'border-purple-400 dark:border-purple-600',
        badge: 'واجب + اختبار مسجل ⚡',
        badgeBg: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white',
        text: 'text-purple-950 dark:text-purple-200',
        glow: 'ring-2 ring-purple-500/40 shadow-md',
      };
    case 'exam_only':
      return {
        bg: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30',
        border: 'border-amber-400 dark:border-amber-600',
        badge: 'موعد اختبار مسجل 📝',
        badgeBg: 'bg-amber-600 text-white',
        text: 'text-amber-950 dark:text-amber-200',
        glow: 'ring-2 ring-amber-500/40 shadow-md',
      };
    case 'homework_only':
      if (customColor === 'rose') {
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/40',
          border: 'border-rose-400 dark:border-rose-600',
          badge: 'واجب مدرسي مطلوب 📚',
          badgeBg: 'bg-rose-600 text-white',
          text: 'text-rose-950 dark:text-rose-200',
          glow: 'ring-2 ring-rose-500/40 shadow-md',
        };
      }
      if (customColor === 'sky') {
        return {
          bg: 'bg-sky-50 dark:bg-sky-950/40',
          border: 'border-sky-400 dark:border-sky-600',
          badge: 'واجب مدرسي مطلوب 📚',
          badgeBg: 'bg-sky-600 text-white',
          text: 'text-sky-950 dark:text-sky-200',
          glow: 'ring-2 ring-sky-500/40 shadow-md',
        };
      }
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        border: 'border-emerald-400 dark:border-emerald-600',
        badge: 'واجب مدرسي مطلوب 📚',
        badgeBg: 'bg-emerald-600 text-white',
        text: 'text-emerald-950 dark:text-emerald-200',
        glow: 'ring-2 ring-emerald-500/40 shadow-md',
      };
    case 'completed':
      return {
        bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
        border: 'border-emerald-300 dark:border-emerald-800',
        badge: 'تم الإنجاز بالكامل ✅',
        badgeBg: 'bg-emerald-700 text-white',
        text: 'text-emerald-900 dark:text-emerald-300',
        glow: 'shadow-2xs',
      };
    case 'none':
    default:
      return {
        bg: 'bg-white dark:bg-slate-900',
        border: 'border-slate-200 dark:border-slate-800',
        badge: 'حصة بدون مهام',
        badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
        text: 'text-slate-900 dark:text-white',
        glow: 'shadow-2xs',
      };
  }
}

/**
 * Maps system day index to Saudi school week day name
 */
export function getTodayArabicDayName(): 'الأحد' | 'الإثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس' {
  const dayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday, ... 4 is Thursday, 5 is Friday, 6 is Saturday
  switch (dayIndex) {
    case 0:
      return 'الأحد';
    case 1:
      return 'الإثنين';
    case 2:
      return 'الثلاثاء';
    case 3:
      return 'الأربعاء';
    case 4:
      return 'الخميس';
    default:
      // If Friday or Saturday, show Sunday as upcoming school day
      return 'الأحد';
  }
}

/**
 * Calculates daily stats summary for selected day
 */
export function calculateDailySummary(
  day: string,
  slots: TimetableSlot[],
  homework: HomeworkItem[],
  exams: ExamItem[]
) {
  const daySlots = slots.filter((s) => s.day === day);

  const dayHomework = homework.filter((h) => {
    if (h.dayOfWeek === day) return true;
    return false;
  });

  const dayExams = exams.filter((e) => {
    if (e.dayOfWeek === day) return true;
    return false;
  });

  const homeworkCount = dayHomework.length;
  const examCount = dayExams.length;

  const totalPoints =
    dayHomework.reduce((acc, h) => acc + (h.points || 0), 0) +
    dayExams.reduce((acc, e) => acc + (e.points || 0), 0);

  const completedCount =
    dayHomework.filter((h) => h.completed).length +
    dayExams.filter((e) => e.completed).length;

  return {
    totalSlots: daySlots.length,
    homeworkCount,
    examCount,
    totalPoints,
    completedCount,
  };
}

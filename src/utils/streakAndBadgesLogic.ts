import {
  BadgeItem,
  StreakData,
  ExamCountdownConfig,
  QuduratDailyTarget,
  TimetableSlot,
} from '../types';

export const DEFAULT_EXAM_COUNTDOWN: ExamCountdownConfig = {
  enabled: true,
  examName: 'اختبار القدرات العامة (محوسب) - قياس',
  examTitle: 'اختبار القدرات العامة (محوسب) - قياس',
  targetDate: '2026-11-28T09:00:00',
  targetScore: '95+',
  notes: 'مقر الاختبار: المركز الوطني للقياس (جامعة الملك سعود)',
  motivationalNote: 'استمر في إنجاز محاضراتك اليومية، التميز قادم بإذن الله!',
};

export const DEFAULT_QUDURAT_TARGET: QuduratDailyTarget = {
  verbalTarget: 5,
  quantTarget: 1,
  verbalLecturesDaily: 5,
  quantLessonsDaily: 1,
  verbalPoints: 20,
  quantPoints: 50,
};

export const INITIAL_STREAK: StreakData = {
  currentStreak: 4,
  longestStreak: 7,
  lastActiveDate: '2026-11-04',
  freezesRemaining: 2,
};

export interface TimeRemaining {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  formattedArabic: string;
}

export function calculateTimeRemaining(targetDateStr: string, now = new Date()): TimeRemaining {
  const targetTime = new Date(targetDateStr).getTime();
  const currentTime = now.getTime();
  const totalMs = targetTime - currentTime;

  if (isNaN(totalMs) || totalMs <= 0) {
    return {
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast: true,
      formattedArabic: 'حان موعد الاختبار اليوم! نسأل الله لك التوفيق والسداد 🎓',
    };
  }

  const seconds = Math.floor((totalMs / 1000) % 60);
  const minutes = Math.floor((totalMs / (1000 * 60)) % 60);
  const hours = Math.floor((totalMs / (1000 * 60 * 60)) % 24);
  const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));

  return {
    totalMs,
    days,
    hours,
    minutes,
    seconds,
    isPast: false,
    formattedArabic: `متبقي ${days} يوم و ${hours} ساعة و ${minutes} دقيقة`,
  };
}

export function updateStreakOnActivity(
  streak: StreakData,
  todayKey?: string,
  yesterdayKey?: string
): { streak: StreakData; streakIncreased: boolean; freezeUsed: boolean } {
  const today = todayKey || new Date().toISOString().slice(0, 10);
  const yesterday =
    yesterdayKey ||
    new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  // If already active today, keep streak unchanged
  if (streak.lastActiveDate === today) {
    return { streak, streakIncreased: false, freezeUsed: false };
  }

  // If last active was yesterday, increment streak
  if (streak.lastActiveDate === yesterday) {
    const newCurrent = streak.currentStreak + 1;
    const newLongest = Math.max(streak.longestStreak, newCurrent);
    return {
      streak: {
        ...streak,
        currentStreak: newCurrent,
        longestStreak: newLongest,
        lastActiveDate: today,
      },
      streakIncreased: true,
      freezeUsed: false,
    };
  }

  // If there's a gap of more than 1 day
  if (streak.freezesRemaining > 0 && streak.currentStreak > 1) {
    // Streak freeze used to protect progress
    return {
      streak: {
        ...streak,
        freezesRemaining: streak.freezesRemaining - 1,
        lastActiveDate: today,
      },
      streakIncreased: false,
      freezeUsed: true,
    };
  }

  // Reset streak to 1
  return {
    streak: {
      ...streak,
      currentStreak: 1,
      longestStreak: Math.max(streak.longestStreak, 1),
      lastActiveDate: today,
    },
    streakIncreased: true,
    freezeUsed: false,
  };
}

export const INITIAL_BADGES: BadgeItem[] = [
  {
    id: 'qudurat_starter',
    title: 'الانطلاقة الأولى 🚀',
    description: 'إتمام أول محاضرة أو درس قدرات',
    iconName: 'Brain',
    category: 'qudurat',
    progress: 1,
    maxProgress: 1,
    unlocked: true,
    unlockedAt: '2026-11-01T10:00:00Z',
    pointsReward: 20,
  },
  {
    id: 'qudurat_verbal_master',
    title: 'صقر اللفظي 🦅',
    description: 'إتمام 15 محاضرة لفظي',
    iconName: 'BookOpen',
    category: 'qudurat',
    progress: 10,
    maxProgress: 15,
    unlocked: false,
    pointsReward: 50,
  },
  {
    id: 'qudurat_quant_beast',
    title: 'داهية الكمي 📐',
    description: 'إتمام 5 دروس كمي كاملة',
    iconName: 'Calculator',
    category: 'qudurat',
    progress: 3,
    maxProgress: 5,
    unlocked: false,
    pointsReward: 60,
  },
  {
    id: 'school_homework_hero',
    title: 'منقذ الواجبات 📚',
    description: 'إنجاز 10 واجبات مدرسية بنجاح',
    iconName: 'GraduationCap',
    category: 'school',
    progress: 8,
    maxProgress: 10,
    unlocked: false,
    pointsReward: 40,
  },
  {
    id: 'streak_3_days',
    title: 'شعلة البداية 🔥',
    description: 'الحفاظ على ستريك دراسي لمدة 3 أيام متتالية',
    iconName: 'Flame',
    category: 'streak',
    progress: 4,
    maxProgress: 3,
    unlocked: true,
    unlockedAt: '2026-11-03T18:00:00Z',
    pointsReward: 30,
  },
  {
    id: 'streak_7_days',
    title: 'الستريك الذهبي ⚡',
    description: 'الحفاظ على ستريك دراسي لمدة 7 أيام متتالية',
    iconName: 'Zap',
    category: 'streak',
    progress: 4,
    maxProgress: 7,
    unlocked: false,
    pointsReward: 70,
  },
  {
    id: 'points_collector_500',
    title: 'صائد النقاط 💰',
    description: 'الوصول إلى 500 نقطة تراكمية في الرصيد',
    iconName: 'Award',
    category: 'points',
    progress: 250,
    maxProgress: 500,
    unlocked: false,
    pointsReward: 50,
  },
  {
    id: 'review_faithful',
    title: 'سيد التقييم اليومي ⭐',
    description: 'تسجيل 5 تقييمات في سجل الأداء الدراسي',
    iconName: 'Star',
    category: 'reviews',
    progress: 4,
    maxProgress: 5,
    unlocked: false,
    pointsReward: 40,
  },
  {
    id: 'reward_enjoyer',
    title: 'سفير الكافيه ☕',
    description: 'استبدال 3 مكافآت من كافيه المكافآت',
    iconName: 'Coffee',
    category: 'rewards',
    progress: 1,
    maxProgress: 3,
    unlocked: false,
    pointsReward: 35,
  },
];

export interface UserStatsSnapshot {
  totalVerbalCompleted: number;
  totalQuantCompleted: number;
  totalHomeworkCompleted: number;
  totalPoints: number;
  currentStreak: number;
  totalReviewsCount: number;
  totalRedemptionsCount: number;
}

export function evaluateBadges(
  badges: BadgeItem[],
  stats: UserStatsSnapshot
): {
  updatedBadges: BadgeItem[];
  newlyUnlocked: BadgeItem[];
  totalBonusPoints: number;
} {
  const newlyUnlocked: BadgeItem[] = [];
  let totalBonusPoints = 0;

  const updatedBadges = badges.map((badge) => {
    let currentProgress = badge.progress;

    switch (badge.id) {
      case 'qudurat_starter':
        currentProgress = stats.totalVerbalCompleted + stats.totalQuantCompleted;
        break;
      case 'qudurat_verbal_master':
        currentProgress = stats.totalVerbalCompleted;
        break;
      case 'qudurat_quant_beast':
        currentProgress = stats.totalQuantCompleted;
        break;
      case 'school_homework_hero':
        currentProgress = stats.totalHomeworkCompleted;
        break;
      case 'streak_3_days':
      case 'streak_7_days':
        currentProgress = stats.currentStreak;
        break;
      case 'points_collector_500':
        currentProgress = stats.totalPoints;
        break;
      case 'review_faithful':
        currentProgress = stats.totalReviewsCount;
        break;
      case 'reward_enjoyer':
        currentProgress = stats.totalRedemptionsCount;
        break;
    }

    const clampedProgress = Math.min(badge.maxProgress, Math.max(0, currentProgress));
    const shouldUnlock = clampedProgress >= badge.maxProgress;

    if (shouldUnlock && !badge.unlocked) {
      const unlockedBadge: BadgeItem = {
        ...badge,
        progress: clampedProgress,
        unlocked: true,
        unlockedAt: new Date().toISOString(),
      };
      newlyUnlocked.push(unlockedBadge);
      totalBonusPoints += badge.pointsReward;
      return unlockedBadge;
    }

    return {
      ...badge,
      progress: clampedProgress,
    };
  });

  return {
    updatedBadges,
    newlyUnlocked,
    totalBonusPoints,
  };
}

export function createBackupJson(data: Record<string, unknown>): string {
  const payload = {
    appName: 'Wayjib Study App',
    version: '2.0.0',
    exportDate: new Date().toISOString(),
    data,
  };
  return JSON.stringify(payload, null, 2);
}

export function validateAndParseBackupJson(jsonStr: string): {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'الملف ليس بتنسيق JSON صالح' };
    }
    if (!parsed.data && !parsed.appName) {
      return { success: false, error: 'ملف النسخة الاحتياطية لا يحتوي على بيانات التطبيق' };
    }
    return { success: true, data: parsed.data || parsed };
  } catch {
    return { success: false, error: 'تعذر قراءة ملف النسخة الاحتياطية' };
  }
}

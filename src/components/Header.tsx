import { Award, Flame, Gift, Sparkles, BookOpen, Clock, FileText, Settings, Star, Trophy, Focus } from 'lucide-react';
import { calculateLevel, ProgressSummary } from '../utils/studyLogic';
import { NavigationTab } from '../types';

interface HeaderProps {
  totalPoints: number;
  progress: ProgressSummary;
  activeTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  onOpenExport: () => void;
  onOpenSettings: () => void;
  onOpenDailyReview: () => void;
  hasReviewedToday?: boolean;
  todayRating?: number;
  streakDays?: number;
  onOpenStreak?: () => void;
  unlockedBadgesCount?: number;
  onOpenBadges?: () => void;
  onOpenFocusMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalPoints,
  progress,
  activeTab,
  onNavigate,
  onOpenExport,
  onOpenSettings,
  onOpenDailyReview,
  hasReviewedToday = false,
  todayRating,
  streakDays = 4,
  onOpenStreak,
  unlockedBadgesCount = 2,
  onOpenBadges,
}) => {
  const levelInfo = calculateLevel(totalPoints);

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-3.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & App Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                ويجب <span className="text-indigo-600 dark:text-indigo-400">للمذاكرة</span>
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
                القدرات والمدرسة
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              رفيقك الذكي لإنجاز محاضرات القدرات والواجبات وحصد المكافآت
            </p>
          </div>
        </div>

        {/* Stats, Points Badge & Rewards Shortcut */}
        <div className="flex items-center gap-2 sm:gap-3 mr-auto">
          {/* Daily Qudurat Lectures Progress Counter */}
          <div
            title="إنجاز محاضرات القدرات اليومية"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
          >
            <Clock className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <span className="hidden xs:inline">القدرات:</span>
            <span className="text-indigo-700 dark:text-indigo-300 font-extrabold">{progress.totalDone}/6</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">محاضرة</span>
          </div>

          {/* Points Wallet Badge */}
          <div
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 dark:from-amber-950/40 dark:via-amber-900/30 dark:to-amber-950/40 border border-amber-300 dark:border-amber-700/80 text-amber-900 dark:text-amber-200 font-extrabold text-sm shadow-xs"
            title={`رصيدك الإجمالي: ${totalPoints} نقطة`}
          >
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>{totalPoints}</span>
            <span className="text-xs font-medium text-amber-700 dark:text-amber-300">نقطة</span>
          </div>

          {/* Streak Flame Badge Button */}
          {onOpenStreak && (
            <button
              onClick={onOpenStreak}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-300/80 dark:border-rose-700/60 shadow-xs transition-all hover:scale-105 active:scale-95"
              title={`سلسلة الالتزام: ${streakDays} أيام مستمرة 🔥`}
              aria-label="عرض تفاصيل الستريك"
            >
              <Flame className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse" />
              <span>{streakDays}</span>
              <span className="hidden xs:inline text-[11px] font-bold">أيام</span>
            </button>
          )}

          {/* Badges Trophy Button */}
          {onOpenBadges && (
            <button
              onClick={onOpenBadges}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-xs transition-all hover:scale-105 active:scale-95"
              title={`خزانة الأوسمة والإنجازات (${unlockedBadgesCount} مفتوح)`}
              aria-label="عرض الأوسمة والإنجازات"
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">الأوسمة</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-indigo-200/70 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200">
                {unlockedBadgesCount}
              </span>
            </button>
          )}

          {/* Daily Review Button */}
          <button
            onClick={onOpenDailyReview}
            className={`relative flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs border ${
              hasReviewedToday
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700/80 hover:bg-amber-100'
                : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 border-amber-400 shadow-amber-500/20 active:scale-95'
            }`}
            title="تقييم إنجاز اليوم وحفظه في سجل الأداء"
            aria-label="تقييم إنجاز اليوم"
          >
            <Star className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${hasReviewedToday ? 'fill-amber-500 text-amber-500' : 'fill-slate-950 text-slate-950'}`} />
            <span className="font-extrabold whitespace-nowrap">
              {hasReviewedToday ? `تقييم اليوم (${todayRating}⭐)` : 'تقييم اليوم ⭐'}
            </span>
          </button>

          {/* Direct Go to Rewards Cafe Button */}
          <button
            onClick={() => onNavigate('rewards')}
            className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm ${
              activeTab === 'rewards'
                ? 'bg-amber-500 text-white shadow-amber-200 dark:shadow-none'
                : 'bg-amber-100/80 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300/80 dark:border-amber-800 hover:scale-[1.02]'
            }`}
            aria-label="الانتقال إلى كافيه المكافآت"
          >
            <Gift className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="font-extrabold">كافيه المكافآت</span>
          </button>

          {/* Export / Docs Trigger */}
          <button
            onClick={onOpenExport}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors"
            title="تصدير الخطة والتذكير"
            aria-label="تصدير الخطة والتذكيرات"
          >
            <FileText className="w-4 h-4" />
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors"
            title="الإعدادات ونظام الخصم والمظهر"
            aria-label="إعدادات التطبيق"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

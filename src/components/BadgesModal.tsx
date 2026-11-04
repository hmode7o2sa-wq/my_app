import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  X,
  CheckCircle2,
  Lock,
  Brain,
  BookOpen,
  Calculator,
  GraduationCap,
  Flame,
  Zap,
  Star,
  Coffee,
  Filter,
} from 'lucide-react';
import { BadgeItem, BadgeCategory } from '../types';

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  badges: BadgeItem[];
}

export const BadgesModal: React.FC<BadgesModalProps> = ({
  isOpen,
  onClose,
  badges,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | BadgeCategory>('all');

  if (!isOpen) return null;

  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const totalCount = badges.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  const filteredBadges = badges.filter((b) => {
    if (activeCategory === 'all') return true;
    return b.category === activeCategory;
  });

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Brain':
        return <Brain className="w-6 h-6" />;
      case 'BookOpen':
        return <BookOpen className="w-6 h-6" />;
      case 'Calculator':
        return <Calculator className="w-6 h-6" />;
      case 'GraduationCap':
        return <GraduationCap className="w-6 h-6" />;
      case 'Flame':
        return <Flame className="w-6 h-6 text-rose-500 fill-rose-500" />;
      case 'Zap':
        return <Zap className="w-6 h-6 text-amber-500 fill-amber-500" />;
      case 'Star':
        return <Star className="w-6 h-6 text-amber-500 fill-amber-500" />;
      case 'Coffee':
        return <Coffee className="w-6 h-6 text-amber-600" />;
      case 'Award':
      default:
        return <Award className="w-6 h-6 text-purple-500" />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="badges-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 text-right dir-rtl space-y-6 my-6 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="إغلاق نافذة الأوسمة"
          className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5 pl-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Award className="w-3.5 h-3.5" />
            <span>نظام الشارات والمعالم التحفيزي</span>
          </div>

          <h2
            id="badges-modal-title"
            className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white"
          >
            خزانة الأوسمة والإنجازات 🏆
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            كلما التزمت بمحاضرات القدرات والواجبات وحافظت على الستريك، ستُفتح لك شارات تكريمية مع نقاط مجانية!
          </p>
        </div>

        {/* Progress Bar Card */}
        <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-amber-500/10 dark:from-amber-950/30 dark:via-indigo-950/30 dark:to-amber-950/30 p-4 sm:p-5 rounded-2xl border border-amber-300/80 dark:border-amber-800/60 space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm font-black">
            <span className="text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>معدل إكمال الأوسمة</span>
            </span>
            <span className="text-amber-700 dark:text-amber-300 font-extrabold">
              {unlockedCount} من {totalCount} أوسمة مكتملة ({completionPercentage}%)
            </span>
          </div>

          <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-bold ml-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>التصنيف:</span>
          </span>

          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
              activeCategory === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            الكل ({badges.length})
          </button>
          <button
            onClick={() => setActiveCategory('qudurat')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
              activeCategory === 'qudurat'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            القدرات
          </button>
          <button
            onClick={() => setActiveCategory('streak')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
              activeCategory === 'streak'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            الستريك 🔥
          </button>
          <button
            onClick={() => setActiveCategory('school')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
              activeCategory === 'school'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            المدرسة
          </button>
          <button
            onClick={() => setActiveCategory('reviews')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
              activeCategory === 'reviews'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            التقييمات ⭐
          </button>
          <button
            onClick={() => setActiveCategory('points')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
              activeCategory === 'points'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            النقاط
          </button>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {filteredBadges.map((badge) => {
            const isUnlocked = badge.unlocked;
            const progressRatio = Math.min(100, Math.round((badge.progress / badge.maxProgress) * 100));

            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-amber-50/70 via-white to-amber-50/40 dark:from-amber-950/20 dark:via-slate-900 dark:to-amber-950/10 border-amber-300 dark:border-amber-700/80 shadow-xs'
                    : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-80'
                } space-y-3`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                      isUnlocked
                        ? 'bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 ring-2 ring-amber-400/40'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
                    }`}
                  >
                    {isUnlocked ? getIcon(badge.iconName) : <Lock className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        {badge.title}
                      </h4>
                      {isUnlocked ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>مفتوح</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400">
                          {badge.progress}/{badge.maxProgress}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {badge.description}
                    </p>
                  </div>
                </div>

                {/* Progress bar and bonus tag */}
                <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
                    <span>التقدم نحو الوسام</span>
                    <span className="text-amber-600 dark:text-amber-400">
                      +{badge.pointsReward} نقطة مكافأة
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700/80 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isUnlocked
                          ? 'bg-emerald-500'
                          : 'bg-indigo-600 dark:bg-indigo-500'
                      }`}
                      style={{ width: `${progressRatio}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="text-center pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-black text-sm shadow-md transition-all"
          >
            إغلاق خزانة الأوسمة
          </button>
        </div>
      </div>
    </div>
  );
};

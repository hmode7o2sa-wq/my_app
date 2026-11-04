import React from 'react';
import { Brain, GraduationCap, PlusCircle, Gift, CalendarCheck2 } from 'lucide-react';
import { NavigationTab } from '../types';

interface BottomNavProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  quduratPendingCount: number;
  schoolPendingCount: number;
  totalPoints: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  quduratPendingCount,
  schoolPendingCount,
  totalPoints,
}) => {
  const tabs = [
    {
      id: 'qudurat' as NavigationTab,
      label: 'القدرات',
      sublabel: '5 لفظي + درس كمي',
      icon: Brain,
      badge: quduratPendingCount > 0 ? `${quduratPendingCount}` : undefined,
      badgeColor: 'bg-indigo-600',
    },
    {
      id: 'school' as NavigationTab,
      label: 'المدرسة والجدول',
      sublabel: 'الواجبات والحصص',
      icon: GraduationCap,
      badge: schoolPendingCount > 0 ? `${schoolPendingCount}` : undefined,
      badgeColor: 'bg-emerald-600',
    },
    {
      id: 'prep' as NavigationTab,
      label: 'الاستعدادات',
      sublabel: 'تخصيص + مؤقت',
      icon: PlusCircle,
      highlight: true,
    },
    {
      id: 'rewards' as NavigationTab,
      label: 'كافيه المكافآت',
      sublabel: `${totalPoints} نقطة`,
      icon: Gift,
      badge: 'مكافآت',
      badgeColor: 'bg-amber-500',
    },
    {
      id: 'schedule' as NavigationTab,
      label: 'الجدول والتذكير',
      sublabel: 'المزامنة والتقارير',
      icon: CalendarCheck2,
    },
  ];

  return (
    <nav
      aria-label="القائمة السفلية الرئيسية"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-slate-200/90 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)] transition-colors"
    >
      <div className="max-w-xl mx-auto px-2 py-1.5 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all select-none min-w-[62px] ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-extrabold scale-105'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
              }`}
            >
              {/* Active pill background indicator */}
              {isActive && (
                <span className="absolute inset-0 bg-indigo-50/80 dark:bg-indigo-950/60 rounded-xl -z-10" />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 text-indigo-600 dark:text-indigo-400 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
                {tab.badge && (
                  <span
                    className={`absolute -top-1.5 -right-2 px-1.5 py-0.2 min-w-[16px] text-[10px] font-bold text-white rounded-full flex items-center justify-center shadow-xs ${tab.badgeColor}`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className="text-[11px] mt-1 leading-tight tracking-tight text-center">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

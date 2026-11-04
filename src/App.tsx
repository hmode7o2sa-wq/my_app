/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  INITIAL_LECTURES,
  INITIAL_HOMEWORK,
  INITIAL_EXAMS,
  INITIAL_PREPS,
  INITIAL_REWARDS,
  DEFAULT_PENALTY_SETTINGS,
  INITIAL_DAILY_REVIEWS,
} from './data/initialData';
import {
  LectureItem,
  HomeworkItem,
  ExamItem,
  PrepItem,
  RewardItem,
  RedemptionRecord,
  PenaltyRecord,
  PenaltySettings,
  NavigationTab,
  DailyReviewRecord,
  ExamCountdownConfig,
  QuduratDailyTarget,
  BadgeItem,
  StreakData,
  TimetableSlot,
  SECOND_SECONDARY_CLASS_TIMETABLE,
} from './types';
import {
  calculateLectureProgress,
  redeemRewardLogic,
  applyPenaltyLogic,
  checkAndCalculateQuduratPenalties,
} from './utils/studyLogic';
import {
  getTodayDateKey,
  getTodayReviewRecord,
  saveOrUpdateReviewRecord,
  deleteReviewRecord,
  DAILY_REVIEW_BONUS_POINTS,
} from './utils/dailyReviewLogic';
import {
  DEFAULT_EXAM_COUNTDOWN,
  DEFAULT_QUDURAT_TARGET,
  INITIAL_STREAK,
  INITIAL_BADGES,
  updateStreakOnActivity,
  evaluateBadges,
} from './utils/streakAndBadgesLogic';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { QuduratSection } from './components/QuduratSection';
import { SchoolSection } from './components/SchoolSection';
import { PrepSection } from './components/PrepSection';
import { RewardsSection } from './components/RewardsSection';
import { RemindersExportModal } from './components/RemindersExportModal';
import { PrepFocusModal } from './components/PrepFocusModal';
import { WeeklyProgressCharts } from './components/WeeklyProgressCharts';
import { SettingsModal, AppTheme } from './components/SettingsModal';
import { DailyReviewModal } from './components/DailyReviewModal';
import { DailyReviewHistory } from './components/DailyReviewHistory';
import { ExamCountdownWidget } from './components/ExamCountdownWidget';
import { BadgesModal } from './components/BadgesModal';
import { StreakModal } from './components/StreakModal';
import { QuickTasksWidget } from './components/QuickTasksWidget';
import { FocusModeModal } from './components/FocusModeModal';
import { INITIAL_QUICK_TASKS } from './data/initialData';
import { QuickTask, QuickTaskCategory, QuickTaskPriority } from './types';
import {
  addQuickTask,
  toggleQuickTask,
  deleteQuickTask,
  clearCompletedQuickTasks,
} from './utils/quickTasksAndFocusLogic';

export default function App() {
  // LocalStorage keys
  const STORAGE_PREFIX = 'wayjib_study_app_v2_';

  // State with LocalStorage persistence
  const [lectures, setLectures] = useState<LectureItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'lectures');
      if (saved) {
        const parsed: LectureItem[] = JSON.parse(saved);
        return parsed.map((item) => ({
          ...item,
          title: item.category === 'verbal' ? `محاضرة ${item.order} - لفظي` : `محاضرة ${item.order || 1} - كمي`,
          topic: item.category === 'verbal' ? 'لفظي' : 'كمي',
        }));
      }
      return INITIAL_LECTURES;
    } catch {
      return INITIAL_LECTURES;
    }
  });

  const [homework, setHomework] = useState<HomeworkItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'homework');
      return saved ? JSON.parse(saved) : INITIAL_HOMEWORK;
    } catch {
      return INITIAL_HOMEWORK;
    }
  });

  const [exams, setExams] = useState<ExamItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'exams');
      return saved ? JSON.parse(saved) : INITIAL_EXAMS;
    } catch {
      return INITIAL_EXAMS;
    }
  });

  const [preps, setPreps] = useState<PrepItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'preps');
      return saved ? JSON.parse(saved) : INITIAL_PREPS;
    } catch {
      return INITIAL_PREPS;
    }
  });

  const [rewards, setRewards] = useState<RewardItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'rewards');
      return saved ? JSON.parse(saved) : INITIAL_REWARDS;
    } catch {
      return INITIAL_REWARDS;
    }
  });

  const [redemptions, setRedemptions] = useState<RedemptionRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'redemptions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [penalties, setPenalties] = useState<PenaltyRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'penalties');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [penaltySettings, setPenaltySettings] = useState<PenaltySettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'penalty_settings');
      return saved ? JSON.parse(saved) : DEFAULT_PENALTY_SETTINGS;
    } catch {
      return DEFAULT_PENALTY_SETTINGS;
    }
  });

  const [totalPoints, setTotalPoints] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'points');
      return saved ? JSON.parse(saved) : 60; // Welcome initial points
    } catch {
      return 60;
    }
  });

  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'theme');
      return (saved as AppTheme) || 'light';
    } catch {
      return 'light';
    }
  });

  const [dailyReviews, setDailyReviews] = useState<DailyReviewRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'daily_reviews');
      return saved ? JSON.parse(saved) : INITIAL_DAILY_REVIEWS;
    } catch {
      return INITIAL_DAILY_REVIEWS;
    }
  });

  const [examCountdown, setExamCountdown] = useState<ExamCountdownConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'exam_countdown');
      return saved ? JSON.parse(saved) : DEFAULT_EXAM_COUNTDOWN;
    } catch {
      return DEFAULT_EXAM_COUNTDOWN;
    }
  });

  const [quduratTarget, setQuduratTarget] = useState<QuduratDailyTarget>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'qudurat_target');
      return saved ? JSON.parse(saved) : DEFAULT_QUDURAT_TARGET;
    } catch {
      return DEFAULT_QUDURAT_TARGET;
    }
  });

  const [streakData, setStreakData] = useState<StreakData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'streak');
      return saved ? JSON.parse(saved) : INITIAL_STREAK;
    } catch {
      return INITIAL_STREAK;
    }
  });

  const [badges, setBadges] = useState<BadgeItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'badges');
      return saved ? JSON.parse(saved) : INITIAL_BADGES;
    } catch {
      return INITIAL_BADGES;
    }
  });

  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'timetable_slots');
      return saved ? JSON.parse(saved) : SECOND_SECONDARY_CLASS_TIMETABLE;
    } catch {
      return SECOND_SECONDARY_CLASS_TIMETABLE;
    }
  });

  const [quickTasks, setQuickTasks] = useState<QuickTask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'quick_tasks');
      return saved ? JSON.parse(saved) : INITIAL_QUICK_TASKS;
    } catch {
      return INITIAL_QUICK_TASKS;
    }
  });

  const [activeTab, setActiveTab] = useState<NavigationTab>('qudurat');
  const [activeFocusPrep, setActiveFocusPrep] = useState<PrepItem | null>(null);
  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDailyReviewOpen, setIsDailyReviewOpen] = useState(false);
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync theme to root class
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'theme', currentTheme);
    const root = document.documentElement;
    if (currentTheme === 'dark') {
      root.classList.add('dark');
    } else if (currentTheme === 'light') {
      root.classList.remove('dark');
    } else {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemPrefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [currentTheme]);

  const handleResetAllData = () => {
    setLectures(INITIAL_LECTURES);
    setHomework(INITIAL_HOMEWORK);
    setExams(INITIAL_EXAMS);
    setPreps(INITIAL_PREPS);
    setRewards(INITIAL_REWARDS);
    setRedemptions([]);
    setPenalties([]);
    setDailyReviews(INITIAL_DAILY_REVIEWS);
    setPenaltySettings(DEFAULT_PENALTY_SETTINGS);
    setTotalPoints(60);
    setStreakData(INITIAL_STREAK);
    setBadges(INITIAL_BADGES);
    setExamCountdown(DEFAULT_EXAM_COUNTDOWN);
    setQuduratTarget(DEFAULT_QUDURAT_TARGET);
    setTimetableSlots(SECOND_SECONDARY_CLASS_TIMETABLE);
    setQuickTasks(INITIAL_QUICK_TASKS);
    localStorage.removeItem(STORAGE_PREFIX + 'quick_tasks');
    showToast('تمت إعادة ضبط وتصفير جميع بيانات التطبيق والواجبات والنقاط والأوسمة للحالة الافتراضية بنجاح 🔄');
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'lectures', JSON.stringify(lectures));
  }, [lectures]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'homework', JSON.stringify(homework));
  }, [homework]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'exams', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'preps', JSON.stringify(preps));
  }, [preps]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'rewards', JSON.stringify(rewards));
  }, [rewards]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'redemptions', JSON.stringify(redemptions));
  }, [redemptions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'penalties', JSON.stringify(penalties));
  }, [penalties]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'daily_reviews', JSON.stringify(dailyReviews));
  }, [dailyReviews]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'penalty_settings', JSON.stringify(penaltySettings));
  }, [penaltySettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'points', JSON.stringify(totalPoints));
  }, [totalPoints]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'exam_countdown', JSON.stringify(examCountdown));
  }, [examCountdown]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'qudurat_target', JSON.stringify(quduratTarget));
  }, [quduratTarget]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'streak', JSON.stringify(streakData));
  }, [streakData]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'badges', JSON.stringify(badges));
  }, [badges]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'timetable_slots', JSON.stringify(timetableSlots));
  }, [timetableSlots]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'quick_tasks', JSON.stringify(quickTasks));
  }, [quickTasks]);

  // Quick tasks handlers
  const handleAddTask = (title: string, category: QuickTaskCategory, priority: QuickTaskPriority) => {
    const res = addQuickTask(quickTasks, title, category, priority, 5);
    if (res.newTask) {
      setQuickTasks(res.updatedTasks);
      showToast('تمت إضافة المهمة السريعة بنجاح ⚡');
    } else if (res.error) {
      showToast(res.error);
    }
  };

  const handleToggleTask = (id: string) => {
    const res = toggleQuickTask(quickTasks, id);
    setQuickTasks(res.updatedTasks);
    if (res.pointsDelta !== 0) {
      setTotalPoints((pts) => Math.max(0, pts + res.pointsDelta));
      if (res.isCompleted) {
        showToast('أحسنت! أتممت المهمة السريعة وحصلت على +5 نقاط 🌟');
        try {
          confetti({ particleCount: 50, spread: 45, origin: { y: 0.7 } });
        } catch (e) {}
      }
    }
  };

  const handleDeleteTask = (id: string) => {
    setQuickTasks((prev) => deleteQuickTask(prev, id));
    showToast('تم حذف المهمة السريعة 🗑️');
  };

  const handleClearCompletedTasks = () => {
    const res = clearCompletedQuickTasks(quickTasks);
    setQuickTasks(res.updatedTasks);
    showToast(`تم مسح ${res.removedCount} من المهام المكتملة 🧹`);
  };


  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Trigger streak & check badges helper
  const triggerActivityMilestones = (
    updatedLectures = lectures,
    updatedHomework = homework,
    updatedReviews = dailyReviews,
    currentPoints = totalPoints
  ) => {
    // 1. Update streak
    const streakResult = updateStreakOnActivity(streakData);
    setStreakData(streakResult.streak);

    // 2. Evaluate badges
    const totalVerbalDone = updatedLectures.filter((l) => l.category === 'verbal' && l.completed).length;
    const totalQuantDone = updatedLectures.filter((l) => l.category === 'quantitative' && l.completed).length;
    const totalHomeworkDone = updatedHomework.filter((h) => h.completed).length;

    const { updatedBadges, newlyUnlocked } = evaluateBadges(badges, {
      totalVerbalCompleted: totalVerbalDone,
      totalQuantCompleted: totalQuantDone,
      totalHomeworkCompleted: totalHomeworkDone,
      totalPoints: currentPoints,
      currentStreak: streakResult.streak.currentStreak,
      totalReviewsCount: updatedReviews.length,
      totalRedemptionsCount: redemptions.length,
    });

    if (newlyUnlocked.length > 0) {
      setBadges(updatedBadges);
      const totalBonus = newlyUnlocked.reduce((acc, b) => acc + b.pointsReward, 0);
      setTotalPoints((prev) => prev + totalBonus);
      newlyUnlocked.forEach((badge) => {
        showToast(`وسام جديد تم فتحه: ${badge.title} (+${badge.pointsReward} نقطة) 🏆`);
      });
      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
      } catch (e) {}
    }
  };

  const handleUpdateTimetableSlot = (updatedSlot: TimetableSlot) => {
    setTimetableSlots((prev) =>
      prev.map((s) => (s.day === updatedSlot.day && s.period === updatedSlot.period ? updatedSlot : s))
    );
    showToast(`تم تحديث حصة ${updatedSlot.subject} بنجاح ✅`);
  };

  const handleImportBackupData = (data: Record<string, any>) => {
    if (data.lectures) setLectures(data.lectures);
    if (data.homework) setHomework(data.homework);
    if (data.exams) setExams(data.exams);
    if (data.preps) setPreps(data.preps);
    if (data.rewards) setRewards(data.rewards);
    if (data.redemptions) setRedemptions(data.redemptions);
    if (data.penalties) setPenalties(data.penalties);
    if (data.dailyReviews) setDailyReviews(data.dailyReviews);
    if (data.points !== undefined) setTotalPoints(data.points);
    if (data.penaltySettings) setPenaltySettings(data.penaltySettings);
    if (data.streak) setStreakData(data.streak);
    if (data.badges) setBadges(data.badges);
    if (data.examCountdown) setExamCountdown(data.examCountdown);
    if (data.quduratTarget) setQuduratTarget(data.quduratTarget);
    if (data.timetableSlots) setTimetableSlots(data.timetableSlots);
    showToast('تمت استعادة كافة البيانات بنجاح! 💾');
  };

  // Check today's review status
  const todayKey = getTodayDateKey();
  const todayReview = getTodayReviewRecord(dailyReviews, todayKey);
  const hasReviewedToday = !!todayReview;

  const handleSaveDailyReview = (review: DailyReviewRecord, isNewBonus: boolean) => {
    const res = saveOrUpdateReviewRecord(dailyReviews, review);
    setDailyReviews(res.records);
    if (isNewBonus) {
      setTotalPoints((pts) => pts + DAILY_REVIEW_BONUS_POINTS);
      showToast(`تم حفظ تقييم اليوم في سجل الأداء بنجاح ومُنحت +${DAILY_REVIEW_BONUS_POINTS} نقطة تحفيزية! 🌟`);
    } else {
      showToast('تم تحديث تقييم اليوم في سجل الأداء بنجاح ✏️');
    }
    setTimeout(() => {
      triggerActivityMilestones(lectures, homework, res.records, totalPoints + (isNewBonus ? DAILY_REVIEW_BONUS_POINTS : 0));
    }, 100);
  };

  const handleDeleteDailyReview = (id: string) => {
    setDailyReviews((prev) => deleteReviewRecord(prev, id));
    showToast('تم حذف التقييم من سجل الأداء 🗑️');
  };

  // Toggle Lecture Completed
  const handleToggleLecture = (id: string) => {
    let updatedList: LectureItem[] = [];
    setLectures((prev) => {
      updatedList = prev.map((l) => {
        if (l.id === id) {
          const newStatus = !l.completed;
          if (newStatus) {
            setTotalPoints((pts) => pts + l.points);
            showToast(`أحسنت! أتممت "${l.title}" وحصلت على +${l.points} نقطة 🌟`);
            try {
              confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
            } catch (e) {
              // safe fallback
            }
          } else {
            setTotalPoints((pts) => Math.max(0, pts - l.points));
          }
          return {
            ...l,
            completed: newStatus,
            completedAt: newStatus ? new Date().toISOString() : undefined,
          };
        }
        return l;
      });
      return updatedList;
    });
    setTimeout(() => {
      triggerActivityMilestones(updatedList, homework, dailyReviews, totalPoints);
    }, 100);
  };

  // Reset lectures for new day
  const handleResetLectures = () => {
    if (!hasReviewedToday) {
      if (
        window.confirm(
          'لم تقم بتقييم إنجاز اليوم بعد! هل ترغب في تقييم اليوم وتدوين ملاحظتك في سجل الأداء أولاً؟ ⭐'
        )
      ) {
        setIsDailyReviewOpen(true);
        return;
      }
    }

    if (window.confirm('هل تريد بدء يوم دراسي جديد وإعادة تعيين محاضرات ودروس القدرات؟')) {
      // Check if auto penalty is enabled and deduct for uncompleted items
      if (penaltySettings.autoPenaltyEnabled) {
        const penaltiesCheck = checkAndCalculateQuduratPenalties(lectures, penaltySettings);
        if (penaltiesCheck.totalPenalty > 0) {
          const res = applyPenaltyLogic(
            totalPoints,
            `خصم تلقائي لليوم السابق: ${penaltiesCheck.reasons.join('، ')}`,
            penaltiesCheck.totalPenalty
          );
          setTotalPoints(res.newPoints);
          setPenalties((prev) => [res.record, ...prev]);
          showToast(`تم تطبيق الخصم التلقائي لعدم إنجاز المهام: -${penaltiesCheck.totalPenalty} نقطة ⚠️`);
        }
      }
      setLectures((prev) => prev.map((l) => ({ ...l, completed: false })));
      showToast('تمت إعادة تعيين محاضرات القدرات ليوم جديد بنشاط وتفوق!');
    }
  };

  // Apply Manual Penalty
  const handleApplyManualPenalty = () => {
    const penaltiesCheck = checkAndCalculateQuduratPenalties(lectures, penaltySettings);
    if (penaltiesCheck.totalPenalty === 0) {
      showToast('ما شاء الله! كل محاضرات ودروس القدرات لليوم منجزة ولا توجد خصومات. 🌟');
      return;
    }

    if (
      window.confirm(
        `سيتم تطبيق خصم بقيمة ${penaltiesCheck.totalPenalty} نقطة بسبب:\n${penaltiesCheck.reasons.join('\n')}\nهل ترغب بالمتابعة؟`
      )
    ) {
      const res = applyPenaltyLogic(
        totalPoints,
        penaltiesCheck.reasons.join('، '),
        penaltiesCheck.totalPenalty
      );
      setTotalPoints(res.newPoints);
      setPenalties((prev) => [res.record, ...prev]);
      showToast(`تم تطبيق الخصم: -${penaltiesCheck.totalPenalty} نقطة.`);
    }
  };

  // Toggle Homework Completed
  const handleToggleHomework = (id: string) => {
    let updatedList: HomeworkItem[] = [];
    setHomework((prev) => {
      updatedList = prev.map((hw) => {
        if (hw.id === id) {
          const newStatus = !hw.completed;
          if (newStatus) {
            setTotalPoints((pts) => pts + hw.points);
            showToast(`ممتاز! أنجزت "${hw.title}" واكتسبت +${hw.points} نقطة 🎯`);
          } else {
            setTotalPoints((pts) => Math.max(0, pts - hw.points));
          }
          return {
            ...hw,
            completed: newStatus,
            completedAt: newStatus ? new Date().toISOString() : undefined,
          };
        }
        return hw;
      });
      return updatedList;
    });
    setTimeout(() => {
      triggerActivityMilestones(lectures, updatedList, dailyReviews, totalPoints);
    }, 100);
  };

  // Add Homework
  const handleAddHomework = (
    newHw: Omit<HomeworkItem, 'id' | 'completed' | 'completedAt'>
  ) => {
    const item: HomeworkItem = {
      ...newHw,
      id: `hw_${Date.now()}`,
      completed: false,
    };
    setHomework((prev) => [item, ...prev]);
    showToast(`تمت إضافة واجب "${item.title}" في ${item.subject} بنجاح!`);
  };

  // Delete Homework
  const handleDeleteHomework = (id: string) => {
    setHomework((prev) => prev.filter((h) => h.id !== id));
  };

  // Postpone Homework (تأجيل مهمة لليوم التالي أو للأسبوع التالي)
  const handlePostponeHomework = (id: string, postponeType: 'tomorrow' | 'next_week') => {
    setHomework((prev) =>
      prev.map((hw) => {
        if (hw.id === id) {
          const label = postponeType === 'tomorrow' ? 'غداً' : 'الأسبوع القادم';
          showToast(`تم تأجيل مهمة "${hw.title}" إلى ${label} 🗓️`);
          return {
            ...hw,
            dueDate: label,
            postponedUntil: label,
          };
        }
        return hw;
      })
    );
  };

  // Toggle Exam
  const handleToggleExam = (id: string) => {
    setExams((prev) =>
      prev.map((ex) => {
        if (ex.id === id) {
          const newStatus = !ex.completed;
          if (newStatus) {
            setTotalPoints((pts) => pts + ex.points);
            showToast(`رائع جداً! أتممت مذاكرة "${ex.title}" في ${ex.subject} واكتسبت +${ex.points} نقطة 🎓`);
            try {
              confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
            } catch (e) {
              // safe fallback
            }
          } else {
            setTotalPoints((pts) => Math.max(0, pts - ex.points));
          }
          return {
            ...ex,
            completed: newStatus,
            completedAt: newStatus ? new Date().toISOString() : undefined,
          };
        }
        return ex;
      })
    );
  };

  // Add Exam
  const handleAddExam = (
    newExam: Omit<ExamItem, 'id' | 'completed' | 'completedAt'>
  ) => {
    const item: ExamItem = {
      ...newExam,
      id: `exam_${Date.now()}`,
      completed: false,
    };
    setExams((prev) => [item, ...prev]);
    showToast(`تمت جدولة اختبار "${item.title}" لمادة ${item.subject} بنجاح!`);
  };

  // Delete Exam
  const handleDeleteExam = (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  // Add Custom Prep
  const handleAddPrep = (
    newPrep: Omit<
      PrepItem,
      'id' | 'createdAt' | 'completed' | 'totalTimesPracticed' | 'pointsReward'
    >
  ) => {
    const item: PrepItem = {
      ...newPrep,
      id: `prep_${Date.now()}`,
      completed: false,
      totalTimesPracticed: 0,
      pointsReward: Math.max(25, Math.round(newPrep.durationMinutes * 0.8)),
      createdAt: new Date().toISOString(),
    };
    setPreps((prev) => [item, ...prev]);
    showToast(`تم تخصيص الاستعداد "${item.name}" بنجاح! (+)`);
  };

  // Delete Prep
  const handleDeletePrep = (id: string) => {
    setPreps((prev) => prev.filter((p) => p.id !== id));
    showToast('تم حذف الاستعداد.');
  };

  // Complete Prep Session
  const handleCompletePrepSession = (prepId: string) => {
    const prep = preps.find((p) => p.id === prepId);
    if (!prep) return;

    setTotalPoints((pts) => pts + prep.pointsReward);
    setPreps((prev) =>
      prev.map((p) =>
        p.id === prepId
          ? { ...p, totalTimesPracticed: p.totalTimesPracticed + 1 }
          : p
      )
    );
    showToast(
      `رائع! أكملت جلسة "${prep.name}" وحصلت على +${prep.pointsReward} نقطة 🎉`
    );
    try {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    } catch (e) {
      // safe fallback
    }
  };

  // Redeem Reward
  const handleRedeemReward = (reward: RewardItem) => {
    const res = redeemRewardLogic(totalPoints, reward);
    if (!res.success) {
      alert(res.error || 'عفواً، رصيدك لا يكفي');
      return;
    }

    setTotalPoints(res.newPoints);
    if (res.record) {
      setRedemptions((prev) => [res.record!, ...prev]);
    }
    setRewards((prev) =>
      prev.map((r) =>
        r.id === reward.id ? { ...r, redeemedCount: r.redeemedCount + 1 } : r
      )
    );
    showToast(`مبروك! تم فتح مكافأة "${reward.title}". استمتع بوقتك! 🎁`);
  };

  // Add Custom Reward
  const handleAddCustomReward = (
    newReward: Omit<RewardItem, 'id' | 'redeemedCount' | 'isCustom'>
  ) => {
    const item: RewardItem = {
      ...newReward,
      id: `rew_custom_${Date.now()}`,
      isCustom: true,
      redeemedCount: 0,
      createdAt: new Date().toISOString(),
    };
    setRewards((prev) => [item, ...prev]);
    showToast(`تمت إضافة مكافأتك المخصصة "${item.title}" بنجاح! ☕`);
  };

  // Delete Reward (حذف المكافأة)
  const handleDeleteReward = (id: string) => {
    setRewards((prev) => prev.filter((r) => r.id !== id));
    showToast('تم حذف المكافأة بنجاح 🗑️');
  };

  // Update Reward (تعديل المكافأة)
  const handleUpdateReward = (updatedReward: RewardItem) => {
    setRewards((prev) =>
      prev.map((r) => (r.id === updatedReward.id ? updatedReward : r))
    );
    showToast(`تم تعديل مكافأة "${updatedReward.title}" بنجاح ✏️`);
  };

  // Counters for Bottom Nav
  const progress = calculateLectureProgress(lectures);
  const quduratPendingCount = 6 - progress.totalDone;
  const schoolPendingCount =
    homework.filter((h) => !h.completed).length + exams.filter((e) => !e.completed).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Header */}
      <Header
        totalPoints={totalPoints}
        progress={progress}
        activeTab={activeTab}
        onNavigate={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenDailyReview={() => setIsDailyReviewOpen(true)}
        hasReviewedToday={hasReviewedToday}
        todayRating={todayReview?.rating}
        streakDays={streakData.currentStreak}
        onOpenStreak={() => setIsStreakModalOpen(true)}
        unlockedBadgesCount={badges.filter((b) => b.unlocked).length}
        onOpenBadges={() => setIsBadgesModalOpen(true)}
        onOpenFocusMode={() => setIsFocusModeOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-5 sm:py-6 space-y-5">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-slate-900/95 dark:bg-slate-800/95 text-white text-xs sm:text-sm font-bold shadow-2xl backdrop-blur-md border border-slate-700 animate-in fade-in slide-in-from-top-3 flex items-center gap-2">
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Exam Countdown Widget (تنازلي اختبار القدرات مع الهدف والتحفيز) */}
        <ExamCountdownWidget
          config={examCountdown}
          onUpdateConfig={setExamCountdown}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Quick Tasks Widget (المهام السريعة اليومية) */}
        <QuickTasksWidget
          tasks={quickTasks}
          onToggleTask={handleToggleTask}
          onAddTask={handleAddTask}
          onDeleteTask={handleDeleteTask}
          onClearCompleted={handleClearCompletedTasks}
          onOpenFocusMode={() => setIsFocusModeOpen(true)}
        />


        {/* Tab 1: القدرات (كل يوم 5 محاضرات لفظي + درس كمي كامل) */}
        {activeTab === 'qudurat' && (
          <QuduratSection
            lectures={lectures}
            penaltySettings={penaltySettings}
            onToggleLecture={handleToggleLecture}
            onUpdatePenaltySettings={setPenaltySettings}
            onApplyManualPenalty={handleApplyManualPenalty}
            onNavigateToRewards={() => {
              setActiveTab('rewards');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onResetLectures={handleResetLectures}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenDailyReview={() => setIsDailyReviewOpen(true)}
            hasReviewedToday={hasReviewedToday}
          />
        )}

        {/* Tab 2: الواجبات والاختبارات المدرسية (ثاني ثانوي) */}
        {activeTab === 'school' && (
          <SchoolSection
            homework={homework}
            exams={exams}
            slots={timetableSlots}
            onUpdateSlot={handleUpdateTimetableSlot}
            penaltySettings={penaltySettings}
            onToggleHomework={handleToggleHomework}
            onAddHomework={handleAddHomework}
            onDeleteHomework={handleDeleteHomework}
            onPostponeHomework={handlePostponeHomework}
            onToggleExam={handleToggleExam}
            onAddExam={handleAddExam}
            onDeleteExam={handleDeleteExam}
            onNavigateToRewards={() => {
              setActiveTab('rewards');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* Tab 3: الاستعدادات والاختبارات المخصصة عبر زر '+' */}
        {activeTab === 'prep' && (
          <PrepSection
            preps={preps}
            onAddPrep={handleAddPrep}
            onDeletePrep={handleDeletePrep}
            onCompletePrepSession={handleCompletePrepSession}
            onStartTimer={(prep) => setActiveFocusPrep(prep)}
            onNavigateToRewards={() => {
              setActiveTab('rewards');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* Tab 4: نظام التحفيز والنقاط والمكافآت والخصم */}
        {activeTab === 'rewards' && (
          <RewardsSection
            totalPoints={totalPoints}
            rewards={rewards}
            redemptions={redemptions}
            penalties={penalties}
            penaltySettings={penaltySettings}
            onRedeemReward={handleRedeemReward}
            onAddCustomReward={handleAddCustomReward}
            onUpdatePenaltySettings={setPenaltySettings}
            onApplyManualPenalty={handleApplyManualPenalty}
            onDeleteReward={handleDeleteReward}
            onUpdateReward={handleUpdateReward}
          />
        )}

        {/* Tab 5: الجدول والتذكير والمزامنة مع الرسوم البيانية وسجل الأداء */}
        {activeTab === 'schedule' && (
          <div className="space-y-6 pb-20">
            {/* Recharts Weekly Progress Charts */}
            <WeeklyProgressCharts
              todayVerbalDone={progress.verbalDone}
              todayQuantDone={progress.quantDone}
              todayHomeworkDone={homework.filter((h) => h.completed).length}
              todayPoints={totalPoints}
            />

            {/* Performance Record: سجل الأداء والتقييمات اليومية */}
            <DailyReviewHistory
              reviews={dailyReviews}
              onOpenReviewModal={() => setIsDailyReviewOpen(true)}
              onDeleteReview={handleDeleteDailyReview}
            />

            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 space-y-3">
              <h2 className="text-2xl font-black">الجدول الدراسي والمزامنة</h2>
              <p className="text-sm text-slate-300 max-w-xl">
                هنا يمكنك استعراض جدولك اليومي، تصديره إلى Google Docs، أو إنشاء تذكير بالبريد الإلكتروني عبر Gmail.
              </p>
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-md"
              >
                فتح نافذة التصدير والتذكير
              </button>
            </div>

            {/* Quick summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xs text-slate-500 font-bold">القدرات اليومية</span>
                <div className="text-2xl font-black text-indigo-600">
                  {progress.totalDone} / 6 مكتملة
                </div>
                <p className="text-xs text-slate-600">
                  {progress.verbalDone}/5 لفظي و {progress.quantDone}/1 كمي (درس كامل).
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xs text-slate-500 font-bold">واجبات واختبارات ثاني ثانوي</span>
                <div className="text-2xl font-black text-emerald-600">
                  {homework.filter((h) => h.completed).length + exams.filter((e) => e.completed).length} / {homework.length + exams.length} منجز
                </div>
                <p className="text-xs text-slate-600">
                  واجبات بالصفحات ومذاكرة اختبارات مجدولة.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xs text-slate-500 font-bold">المكافآت والخصومات</span>
                <div className="text-2xl font-black text-amber-500">
                  {redemptions.length} مكافأة / {penalties.length} خصم
                </div>
                <p className="text-xs text-slate-600">
                  رصيد النقاط الحالي: {totalPoints} نقطة.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Focus Timer Modal */}
      {activeFocusPrep && (
        <PrepFocusModal
          prep={activeFocusPrep}
          onClose={() => setActiveFocusPrep(null)}
          onComplete={(prepId) => {
            handleCompletePrepSession(prepId);
            setActiveFocusPrep(null);
          }}
        />
      )}

      {/* Focus Mode Immersive Modal */}
      <FocusModeModal
        isOpen={isFocusModeOpen}
        onClose={() => setIsFocusModeOpen(false)}
        onAwardPoints={(pts, reason) => {
          setTotalPoints((p) => p + pts);
          showToast(`أحسنت! منحت +${pts} نقطة مقابل: ${reason} 🌟`);
        }}
        lectures={lectures}
        homework={homework}
        quickTasks={quickTasks}
      />


      {/* Export / Reminders Modal */}
      <RemindersExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        lectures={lectures}
        homework={homework}
        exams={exams}
        preps={preps}
        rewards={rewards}
        totalPoints={totalPoints}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        penaltySettings={penaltySettings}
        onUpdatePenaltySettings={(newSettings) => {
          setPenaltySettings(newSettings);
          showToast('تم حفظ إعدادات الخصم والنظام بنجاح ✅');
        }}
        onApplyManualPenalty={handleApplyManualPenalty}
        onResetLectures={handleResetLectures}
        totalPoints={totalPoints}
        onResetAllData={handleResetAllData}
        currentTheme={currentTheme}
        onThemeChange={(newTheme) => {
          setCurrentTheme(newTheme);
          showToast(`تم تغيير مظهر التطبيق إلى: ${newTheme === 'dark' ? 'الوضع الداكن 🌙' : newTheme === 'light' ? 'الوضع الفاتح ☀️' : 'تلقائي 💻'}`);
        }}
        examCountdown={examCountdown}
        onUpdateExamCountdown={setExamCountdown}
        quduratTarget={quduratTarget}
        onUpdateQuduratTarget={setQuduratTarget}
        timetableSlots={timetableSlots}
        onUpdateTimetableSlot={handleUpdateTimetableSlot}
        onImportBackupData={handleImportBackupData}
      />

      {/* Streak Modal (ميزة الستريك وحساب الأيام المتتالية) */}
      <StreakModal
        isOpen={isStreakModalOpen}
        onClose={() => setIsStreakModalOpen(false)}
        streak={streakData}
        onOpenBadges={() => {
          setIsStreakModalOpen(false);
          setIsBadgesModalOpen(true);
        }}
      />

      {/* Badges Modal (نظام الأوسمة والإنجازات والشارات) */}
      <BadgesModal
        isOpen={isBadgesModalOpen}
        onClose={() => setIsBadgesModalOpen(false)}
        badges={badges}
      />

      {/* Daily Review Modal (تقييم نهاية اليوم وحفظه في سجل الأداء) */}
      <DailyReviewModal
        isOpen={isDailyReviewOpen}
        onClose={() => setIsDailyReviewOpen(false)}
        onSaveReview={handleSaveDailyReview}
        quduratDone={progress.totalDone}
        quduratTotal={6}
        homeworkDone={homework.filter((h) => h.completed).length}
        todayPoints={totalPoints}
        existingReviews={dailyReviews}
      />

      {/* Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        quduratPendingCount={quduratPendingCount}
        schoolPendingCount={schoolPendingCount}
        totalPoints={totalPoints}
      />
    </div>
  );
}

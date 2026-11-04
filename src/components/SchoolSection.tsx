import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Plus,
  Clock,
  Sparkles,
  Trash2,
  Calendar,
  AlertTriangle,
  BookmarkCheck,
  CalendarDays,
  Play,
  RotateCcw,
  Palette,
  AlignLeft,
  Bell,
  ChevronRight,
  ChevronDown,
  CornerDownLeft,
  ArrowRight,
} from 'lucide-react';
import {
  HomeworkItem,
  ExamItem,
  SAUDI_SECONDARY_2_SUBJECTS,
  SaudiSubject,
  PenaltySettings,
  TaskColorTheme,
  TimetableSlot,
} from '../types';
import { formatDurationInArabic } from '../utils/studyLogic';
import { SchoolTimetable } from './SchoolTimetable';
import { DailyTimetable } from './DailyTimetable';
import { TaskFocusTimerModal } from './TaskFocusTimerModal';
import {
  requestNotificationPermission,
  getNotificationPermission,
} from '../utils/notificationService';

interface SchoolSectionProps {
  homework: HomeworkItem[];
  exams: ExamItem[];
  penaltySettings: PenaltySettings;
  slots?: TimetableSlot[];
  onUpdateSlot?: (slot: TimetableSlot) => void;
  onToggleHomework: (id: string) => void;
  onAddHomework: (hw: Omit<HomeworkItem, 'id' | 'completed' | 'completedAt'>) => void;
  onDeleteHomework: (id: string) => void;
  onPostponeHomework: (id: string, postponeType: 'tomorrow' | 'next_week') => void;
  onToggleExam: (id: string) => void;
  onAddExam: (exam: Omit<ExamItem, 'id' | 'completed' | 'completedAt'>) => void;
  onDeleteExam: (id: string) => void;
  onNavigateToRewards: () => void;
}

const COLOR_PALETTES: Array<{
  key: TaskColorTheme;
  name: string;
  bgClass: string;
  borderClass: string;
  badgeClass: string;
  dotClass: string;
}> = [
  { key: 'emerald', name: 'أخضر زمردي', bgClass: 'bg-emerald-50 dark:bg-emerald-950/40', borderClass: 'border-emerald-300 dark:border-emerald-700', badgeClass: 'bg-emerald-600 text-white', dotClass: 'bg-emerald-500' },
  { key: 'indigo', name: 'نيلي ملكي', bgClass: 'bg-indigo-50 dark:bg-indigo-950/40', borderClass: 'border-indigo-300 dark:border-indigo-700', badgeClass: 'bg-indigo-600 text-white', dotClass: 'bg-indigo-500' },
  { key: 'sky', name: 'سماوي هادئ', bgClass: 'bg-sky-50 dark:bg-sky-950/40', borderClass: 'border-sky-300 dark:border-sky-700', badgeClass: 'bg-sky-600 text-white', dotClass: 'bg-sky-500' },
  { key: 'amber', name: 'كهرماني دافئ', bgClass: 'bg-amber-50 dark:bg-amber-950/40', borderClass: 'border-amber-300 dark:border-amber-700', badgeClass: 'bg-amber-600 text-white', dotClass: 'bg-amber-500' },
  { key: 'rose', name: 'وردي لطيف', bgClass: 'bg-rose-50 dark:bg-rose-950/40', borderClass: 'border-rose-300 dark:border-rose-700', badgeClass: 'bg-rose-600 text-white', dotClass: 'bg-rose-500' },
  { key: 'purple', name: 'بنفسجي فاخر', bgClass: 'bg-purple-50 dark:bg-purple-950/40', borderClass: 'border-purple-300 dark:border-purple-700', badgeClass: 'bg-purple-600 text-white', dotClass: 'bg-purple-500' },
  { key: 'teal', name: 'تيل بحري', bgClass: 'bg-teal-50 dark:bg-teal-950/40', borderClass: 'border-teal-300 dark:border-teal-700', badgeClass: 'bg-teal-600 text-white', dotClass: 'bg-teal-500' },
  { key: 'slate', name: 'رمادي كلاسيكي', bgClass: 'bg-slate-100 dark:bg-slate-800/60', borderClass: 'border-slate-300 dark:border-slate-700', badgeClass: 'bg-slate-700 text-white', dotClass: 'bg-slate-500' },
];

export const SchoolSection: React.FC<SchoolSectionProps> = ({
  homework,
  exams,
  penaltySettings,
  slots,
  onUpdateSlot,
  onToggleHomework,
  onAddHomework,
  onDeleteHomework,
  onPostponeHomework,
  onToggleExam,
  onAddExam,
  onDeleteExam,
  onNavigateToRewards,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'daily_timetable' | 'homework' | 'timetable' | 'exams'>('daily_timetable');
  const [isAddHomeworkOpen, setIsAddHomeworkOpen] = useState(false);
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [activeTimerTask, setActiveTimerTask] = useState<HomeworkItem | null>(null);

  // Homework Form State
  const [hwSubject, setHwSubject] = useState<SaudiSubject>(SAUDI_SECONDARY_2_SUBJECTS[0]);
  const [hwCustomSubject, setHwCustomSubject] = useState('');
  const [hwTitle, setHwTitle] = useState('');
  const [hasDescription, setHasDescription] = useState<boolean>(true); // خيار وصف أو بدون وصف
  const [hwDescription, setHwDescription] = useState('');
  const [hwPageNumber, setHwPageNumber] = useState('');
  const [hwDuration, setHwDuration] = useState<number>(30); // الزمن اللازم
  const [hwPoints, setHwPoints] = useState<number>(30); // عدد النقاط للمهمة
  const [hwDueDate, setHwDueDate] = useState('غداً قبل الحصة الأولى');
  const [hasTimer, setHasTimer] = useState<boolean>(true); // خيار اختياري تايمر
  const [timerMinutes, setTimerMinutes] = useState<number>(30);
  const [hwColor, setHwColor] = useState<TaskColorTheme>('emerald'); // لون المهمة
  const [hwDayOfWeek, setHwDayOfWeek] = useState<string>('الأحد');
  const [hwPeriodNumber, setHwPeriodNumber] = useState<number>(1);
  const [linkToSchedule, setLinkToSchedule] = useState<boolean>(true);
  const [hwError, setHwError] = useState('');

  // Exam Form State
  const [examSubject, setExamSubject] = useState<SaudiSubject>(SAUDI_SECONDARY_2_SUBJECTS[0]);
  const [examCustomSubject, setExamCustomSubject] = useState('');
  const [examTitle, setExamTitle] = useState('');
  const [examStudyDetails, setExamStudyDetails] = useState('');
  const [examDate, setExamDate] = useState('الخميس القادم');
  const [examDuration, setExamDuration] = useState<number>(60);
  const [examPoints, setExamPoints] = useState<number>(50);
  const [examColor, setExamColor] = useState<TaskColorTheme>('teal');
  const [examDayOfWeek, setExamDayOfWeek] = useState<string>('الخميس');
  const [examPeriodNumber, setExamPeriodNumber] = useState<number>(1);
  const [examLinkToSchedule, setExamLinkToSchedule] = useState<boolean>(true);
  const [examError, setExamError] = useState('');

  const completedHwCount = homework.filter((h) => h.completed).length;
  const completedExamsCount = exams.filter((e) => e.completed).length;

  // Pending items for Top Reminders bar (خانة التذكيرات اعلى شي)
  const pendingHomework = homework.filter((h) => !h.completed);
  const pendingExams = exams.filter((e) => !e.completed);
  const allPendingCount = pendingHomework.length + pendingExams.length;

  // Open homework modal pre-populated from timetable slot
  const handleOpenAddForSlot = (slot: TimetableSlot) => {
    const matchingSubject = SAUDI_SECONDARY_2_SUBJECTS.find((s) => s.includes(slot.subject)) || slot.subject;
    setHwSubject(matchingSubject);
    setHwDayOfWeek(slot.day);
    setHwPeriodNumber(slot.period);
    setLinkToSchedule(true);
    setHwDueDate(`يوم ${slot.day} - الحصة ${slot.period}`);
    setHwTitle(`واجب ${slot.subject} - الحصة ${slot.period}`);
    setIsAddHomeworkOpen(true);
  };

  // Open exam modal pre-populated from timetable slot
  const handleOpenAddExamForSlot = (slot: TimetableSlot) => {
    const matchingSubject = SAUDI_SECONDARY_2_SUBJECTS.find((s) => s.includes(slot.subject)) || slot.subject;
    setExamSubject(matchingSubject);
    setExamDayOfWeek(slot.day);
    setExamPeriodNumber(slot.period);
    setExamLinkToSchedule(true);
    setExamDate(`يوم ${slot.day} - الحصة ${slot.period}`);
    setExamTitle(`اختبار ${slot.subject} - الحصة ${slot.period}`);
    setIsAddExamOpen(true);
  };

  const handleHomeworkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwTitle.trim()) {
      setHwError('يرجى إدخال عنوان المهمة أو الواجب');
      return;
    }

    const chosenSubject =
      hwSubject === 'مادة أخرى' && hwCustomSubject.trim()
        ? hwCustomSubject.trim()
        : hwSubject;

    onAddHomework({
      subject: chosenSubject,
      title: hwTitle.trim(),
      hasDescription: hasDescription,
      description: hasDescription ? hwDescription.trim() : '',
      pageNumber: hwPageNumber.trim() || 'غير محدد',
      durationMinutes: Number(hwDuration) || 30,
      dueDate: hwDueDate.trim() || 'غير محدد',
      points: Number(hwPoints) || 30,
      priority: 'medium',
      hasTimer: hasTimer,
      timerMinutes: hasTimer ? Number(timerMinutes) || Number(hwDuration) || 30 : undefined,
      color: hwColor,
      dayOfWeek: linkToSchedule ? hwDayOfWeek : undefined,
      periodNumber: linkToSchedule ? Number(hwPeriodNumber) : undefined,
    });

    setHwTitle('');
    setHwDescription('');
    setHwPageNumber('');
    setHwDuration(30);
    setHwPoints(30);
    setHwError('');
    setIsAddHomeworkOpen(false);
  };

  const handleExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim()) {
      setExamError('يرجى إدخال عنوان الاختبار');
      return;
    }
    if (!examStudyDetails.trim()) {
      setExamError('يرجى تحديد الشيء والمقرر الذي يجب مذاكرته للاختبار');
      return;
    }

    const chosenSubject =
      examSubject === 'مادة أخرى' && examCustomSubject.trim()
        ? examCustomSubject.trim()
        : examSubject;

    onAddExam({
      subject: chosenSubject,
      title: examTitle.trim(),
      studyDetails: examStudyDetails.trim(),
      examDate: examDate.trim() || 'غير محدد',
      durationMinutes: Number(examDuration) || 60,
      points: Number(examPoints) || 50,
      color: examColor,
      dayOfWeek: examLinkToSchedule ? examDayOfWeek : undefined,
      periodNumber: examLinkToSchedule ? Number(examPeriodNumber) : undefined,
    });

    setExamTitle('');
    setExamStudyDetails('');
    setExamDate('الخميس القادم');
    setExamDuration(60);
    setExamPoints(50);
    setExamError('');
    setIsAddExamOpen(false);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* 1. TOP REMINDERS BAR (خانة التذكيرات أعلى شيء) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-slate-950 dark:via-indigo-950 dark:to-black rounded-3xl p-5 border border-indigo-900/40 text-white shadow-xl space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center">
              <Bell className="w-5 h-5 text-amber-400 animate-bounce" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  خانة التذكيرات والمواعيد القادمة
                </h3>
                <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                  {allPendingCount} مهام معلقة
                </span>
              </div>
              <p className="text-xs text-indigo-200/90">
                مواعيد تسليم الواجبات واختبارات الحصص المدرسية مع ألوانها المحددة وتنبيهات المتصفح.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {getNotificationPermission() !== 'granted' ? (
              <button
                type="button"
                onClick={requestNotificationPermission}
                className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition-all"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>تفعيل إشعارات المتصفح 🔔</span>
              </button>
            ) : (
              <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-xl flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>إشعارات المتصفح مفعّلة ✅</span>
              </span>
            )}
          </div>
        </div>

        {/* Reminders Carousel / Grid */}
        {allPendingCount === 0 ? (
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center text-xs text-indigo-200">
            ما شاء الله! أنجزت كل واجباتك واختباراتك المقررة. لا توجد مواعيد متأخرة حالياً! 🌟
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
            {/* Show top pending homeworks */}
            {pendingHomework.slice(0, 3).map((item) => {
              const colorInfo =
                COLOR_PALETTES.find((c) => c.key === item.color) || COLOR_PALETTES[0];
              return (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-white/10 dark:bg-slate-900/80 border border-white/15 dark:border-slate-800 flex items-center justify-between gap-2 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-3 h-3 rounded-full shrink-0 ${colorInfo.dotClass}`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-200">
                        <span className="text-emerald-300 font-extrabold">واجب</span>
                        <span>•</span>
                        <span>{item.subject}</span>
                        {item.dayOfWeek && (
                          <span>
                            ({item.dayOfWeek} ح{item.periodNumber || 1})
                          </span>
                        )}
                      </div>
                      <h5 className="text-xs font-black text-white truncate" title={item.title}>
                        {item.title}
                      </h5>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {item.hasTimer && (
                      <button
                        onClick={() => setActiveTimerTask(item)}
                        className="p-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-[11px] font-bold"
                        title="بدء التايمر"
                      >
                        <Play className="w-3 h-3 fill-white" />
                      </button>
                    )}
                    <button
                      onClick={() => onToggleHomework(item.id)}
                      className="px-2 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black"
                    >
                      إنجاز
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Show top pending exams */}
            {pendingExams.slice(0, 3).map((exam) => {
              const colorInfo =
                COLOR_PALETTES.find((c) => c.key === exam.color) || COLOR_PALETTES[6];
              return (
                <div
                  key={exam.id}
                  className="p-3 rounded-2xl bg-white/10 dark:bg-slate-900/80 border border-white/15 dark:border-slate-800 flex items-center justify-between gap-2 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-3 h-3 rounded-full shrink-0 ${colorInfo.dotClass}`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-teal-200">
                        <span className="text-amber-300 font-extrabold">اختبار</span>
                        <span>•</span>
                        <span>{exam.subject}</span>
                        <span>({exam.examDate})</span>
                      </div>
                      <h5 className="text-xs font-black text-white truncate" title={exam.title}>
                        {exam.title}
                      </h5>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleExam(exam.id)}
                    className="px-2 py-1 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-[10px] font-black shrink-0"
                  >
                    تمت المذاكرة
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Section Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 dark:from-slate-950 dark:via-teal-950 dark:to-black rounded-3xl p-5 sm:p-7 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-emerald-900/40">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 border border-white/15 text-xs font-semibold">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-300" />
            <span>ثاني ثانوي - الفصل الثاني عام 2</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            الواجبات والاختبارات وجدول الحصص
          </h2>
          <p className="text-sm text-emerald-100/90 leading-relaxed">
            المهام اليومية مع تايمر التركيز وإشعارات المتصفح، تأجيل لغداً أو الأسبوع القادم، وجدول الحصص المدرسي الملوّن بالكامل بنفس لون مهامك.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
          <button
            onClick={() => setIsAddHomeworkOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
            <span>إضافة مهمة / واجب (+)</span>
          </button>

          <button
            onClick={() => setIsAddExamOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs sm:text-sm shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4 text-white stroke-[3]" />
            <span>إضافة موعد اختبار (+)</span>
          </button>
        </div>
      </div>

      {/* 4 Sub-tabs: جدول الحصص اليومي | المهام والواجبات | الجدول الأسبوعي | الاختبارات */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 dark:bg-slate-800/80 rounded-2xl border border-slate-300 dark:border-slate-700 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('daily_timetable')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'daily_timetable'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4 text-indigo-300" />
            <span>جدول الحصص اليومي (1 - 7)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('homework')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'homework'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>المهام والواجبات ({homework.length})</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeSubTab === 'homework'
                  ? 'bg-emerald-800 text-emerald-100'
                  : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {completedHwCount}/{homework.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('timetable')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'timetable'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>الجدول الأسبوعي الكامل</span>
          </button>

          <button
            onClick={() => setActiveSubTab('exams')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'exams'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookmarkCheck className="w-4 h-4" />
            <span>الاختبارات ({exams.length})</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeSubTab === 'exams'
                  ? 'bg-teal-800 text-teal-100'
                  : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {completedExamsCount}/{exams.length}
            </span>
          </button>
        </div>

        {/* Penalty status tag */}
        <div className="text-xs text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span>خصم تأخير الواجب: {penaltySettings.homeworkLatePenalty} نقطة</span>
        </div>
      </div>

      {/* VIEW 1: HOMEWORK & DAILY TASKS LIST */}
      {activeSubTab === 'homework' && (
        <div className="space-y-4">
          {homework.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
              <BookOpen className="w-12 h-12 text-emerald-500 mx-auto" />
              <h4 className="text-base font-bold text-slate-800 dark:text-white">
                لا توجد مهام أو واجبات مسجلة حالياً
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                انقر على "إضافة مهمة / واجب" لإدراج مهمتك باللون والوصف والنقاط ومؤقت التايمر.
              </p>
              <button
                onClick={() => setIsAddHomeworkOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-700"
              >
                إضافة مهمة الآن
              </button>
            </div>
          ) : (
            homework.map((item) => {
              const colorConfig =
                COLOR_PALETTES.find((c) => c.key === item.color) || COLOR_PALETTES[0];

              return (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 rounded-3xl border transition-all space-y-3 relative overflow-hidden ${
                    item.completed
                      ? 'bg-slate-50/80 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-75'
                      : `${colorConfig.bgClass} ${colorConfig.borderClass} shadow-xs hover:shadow-md`
                  }`}
                >
                  {/* Color Accent Bar Top */}
                  <div
                    className={`h-1.5 w-full absolute top-0 left-0 right-0 ${
                      item.completed ? 'bg-slate-300 dark:bg-slate-700' : colorConfig.dotClass
                    }`}
                  />

                  {/* Header Row: Subject Badge, Schedule Info, Points */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 shadow-2xs">
                        {item.subject}
                      </span>

                      {item.pageNumber && item.pageNumber !== 'غير محدد' && (
                        <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-lg shadow-2xs">
                          الصفحة: {item.pageNumber}
                        </span>
                      )}

                      {item.dayOfWeek && (
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                          <CalendarDays className="w-3 h-3 text-indigo-500" />
                          <span>
                            {item.dayOfWeek} {item.periodNumber ? `(الحصة ${item.periodNumber})` : ''}
                          </span>
                        </span>
                      )}

                      <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{formatDurationInArabic(item.durationMinutes)}</span>
                      </span>

                      {item.postponedUntil && (
                        <span className="text-[11px] font-black text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/60 px-2.5 py-0.5 rounded-lg border border-rose-200 dark:border-rose-800">
                          مؤجل إلى: {item.postponedUntil}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-2xs">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>+{item.points} نقطة</span>
                      </span>

                      <button
                        onClick={() => onDeleteHomework(item.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="حذف المهمة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* CENTERED TASK TITLE (اسم المهمة في المنتصف) */}
                  <div className="py-2 text-center">
                    <h3
                      className={`text-lg sm:text-xl font-black text-center tracking-tight ${
                        item.completed
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {item.title}
                    </h3>
                  </div>

                  {/* Optional Description Box (يظهر فقط عند وجود وصف) */}
                  {item.hasDescription && item.description && item.description.trim() !== '' && (
                    <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 text-center max-w-2xl mx-auto shadow-2xs leading-relaxed">
                      {item.description}
                    </div>
                  )}

                  {/* Bottom Action Controls: Timer, Postpone to Tomorrow/Next Week, Complete */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/60 dark:border-slate-800/60">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Timer Button */}
                      {item.hasTimer && !item.completed && (
                        <button
                          onClick={() => setActiveTimerTask(item)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-xs transition-transform hover:scale-102 active:scale-98"
                          title="بدء مؤقت التايمر للمهمة فوراً"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>بدء التايمر ({item.timerMinutes || item.durationMinutes} دقيقة) ⏱️</span>
                        </button>
                      )}

                      {/* Postpone to Tomorrow Button (زر تأجيل مهمة لليوم اللي بعده) */}
                      {!item.completed && (
                        <button
                          onClick={() => onPostponeHomework(item.id, 'tomorrow')}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-xs font-bold transition-colors shadow-2xs"
                          title="تأجيل المهمة ليوم غد"
                        >
                          <Calendar className="w-3.5 h-3.5 text-amber-500" />
                          <span>تأجيل لغداً ⏭️</span>
                        </button>
                      )}

                      {/* Postpone to Next Week Button (زر تأجيل للأسبوع اللي بعده) */}
                      {!item.completed && (
                        <button
                          onClick={() => onPostponeHomework(item.id, 'next_week')}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-xs font-bold transition-colors shadow-2xs"
                          title="تأجيل المهمة للأسبوع القادم"
                        >
                          <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />
                          <span>تأجيل للأسبوع القادم 📅</span>
                        </button>
                      )}
                    </div>

                    {/* Completion Toggle Button */}
                    <button
                      onClick={() => onToggleHomework(item.id)}
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-black transition-all shadow-xs ${
                        item.completed
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                          : 'bg-emerald-600 text-white hover:bg-emerald-500 hover:scale-102'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                      <span>{item.completed ? 'منجز بنجاح ✅' : 'تم إنجاز المهمة (+نقاط)'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW: DAILY TIMETABLE (جدول حصص يومي مفصل من الحصة 1 إلى 7) */}
      {activeSubTab === 'daily_timetable' && (
        <DailyTimetable
          slots={slots}
          homework={homework}
          exams={exams}
          onAddHomeworkForSlot={handleOpenAddForSlot}
          onAddExamForSlot={handleOpenAddExamForSlot}
          onToggleHomework={onToggleHomework}
          onToggleExam={onToggleExam}
          onStartTimer={(task) => setActiveTimerTask(task)}
          onPostponeHomework={onPostponeHomework}
        />
      )}

      {/* VIEW 2: SCHOOL TIMETABLE (من الصورة المرفوعة مع مزامنة الألوان) */}
      {activeSubTab === 'timetable' && (
        <SchoolTimetable
          slots={slots}
          onUpdateSlot={onUpdateSlot}
          homework={homework}
          exams={exams}
          onAddHomeworkForSlot={handleOpenAddForSlot}
          onAddExamForSlot={handleOpenAddExamForSlot}
          onSwitchToDailyView={() => setActiveSubTab('daily_timetable')}
        />
      )}

      {/* VIEW 3: EXAMS LIST */}
      {activeSubTab === 'exams' && (
        <div className="space-y-4">
          {exams.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
              <BookmarkCheck className="w-12 h-12 text-teal-500 mx-auto" />
              <h4 className="text-base font-bold text-slate-800 dark:text-white">
                لا توجد اختبارات مسجلة حالياً
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                أضف موعد اختبارك وحدد المقرر والشيء الذي يجب مذاكرته والمدة المقترحة واليوم والحصة بالجدول.
              </p>
              <button
                onClick={() => setIsAddExamOpen(true)}
                className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold shadow-xs hover:bg-teal-700"
              >
                إضافة اختبار جديد
              </button>
            </div>
          ) : (
            exams.map((exam) => {
              const colorConfig =
                COLOR_PALETTES.find((c) => c.key === exam.color) || COLOR_PALETTES[6];

              return (
                <div
                  key={exam.id}
                  className={`p-4 sm:p-5 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden ${
                    exam.completed
                      ? 'bg-slate-50/80 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-90'
                      : `${colorConfig.bgClass} ${colorConfig.borderClass} shadow-xs hover:shadow-md`
                  }`}
                >
                  <div
                    className={`h-1.5 w-full absolute top-0 left-0 right-0 ${
                      exam.completed ? 'bg-slate-300 dark:bg-slate-700' : colorConfig.dotClass
                    }`}
                  />

                  <div className="flex items-start gap-3.5 pt-1">
                    <button
                      onClick={() => onToggleExam(exam.id)}
                      className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center transition-all shrink-0 ${
                        exam.completed
                          ? 'bg-teal-600 text-white'
                          : 'border-2 border-slate-300 dark:border-slate-600 hover:border-teal-500 text-transparent'
                      }`}
                      aria-label={exam.completed ? 'إلغاء المذاكرة' : 'تسجيل إتمام المذاكرة'}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-teal-900 dark:text-teal-200 border border-slate-200 dark:border-slate-700 shadow-2xs">
                          {exam.subject}
                        </span>

                        <span className="text-xs font-bold text-amber-800 dark:text-amber-200 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-2xs">
                          <Calendar className="w-3 h-3 text-amber-600" />
                          <span>يوم الاختبار: {exam.examDate}</span>
                        </span>

                        {exam.dayOfWeek && (
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                            <CalendarDays className="w-3 h-3 text-teal-500" />
                            <span>
                              {exam.dayOfWeek} {exam.periodNumber ? `(الحصة ${exam.periodNumber})` : ''}
                            </span>
                          </span>
                        )}

                        <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>مدة المذاكرة: {formatDurationInArabic(exam.durationMinutes)}</span>
                        </span>
                      </div>

                      <h4
                        className={`text-base font-extrabold ${
                          exam.completed ? 'line-through text-slate-500' : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {exam.title}
                      </h4>

                      <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-1 shadow-2xs">
                        <span className="font-bold text-teal-800 dark:text-teal-300 block">
                          الشيء المقرر مذاكرته للاختبار:
                        </span>
                        <p className="leading-relaxed">{exam.studyDetails}</p>
                      </div>
                    </div>
                  </div>

                  {/* Points & Actions */}
                  <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                    <span className="text-xs font-black text-amber-700 dark:text-amber-300 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-xl flex items-center gap-1 border border-amber-200 dark:border-amber-800 shadow-2xs">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>+{exam.points} نقطة</span>
                    </span>

                    <button
                      onClick={() => onToggleExam(exam.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        exam.completed
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                          : 'bg-teal-600 text-white hover:bg-teal-700 shadow-xs'
                      }`}
                    >
                      {exam.completed ? 'تمت المذاكرة ✅' : 'تمت المذاكرة والاستعداد'}
                    </button>

                    <button
                      onClick={() => onDeleteExam(exam.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="حذف الاختبار"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* MODAL 1: ADD HOMEWORK & DAILY TASK */}
      {isAddHomeworkOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in"
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[92vh] overflow-y-auto dir-rtl text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <span>إضافة مهمة يومية / واجب مدرسي جديد</span>
              </h3>
              <button
                onClick={() => setIsAddHomeworkOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {hwError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 text-xs font-bold">
                {hwError}
              </div>
            )}

            <form onSubmit={handleHomeworkSubmit} className="space-y-4">
              {/* Task Title (اسم المهمة) */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-800 dark:text-slate-200 block text-center">
                  اسم المهمة / الواجب <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={hwTitle}
                  onChange={(e) => setHwTitle(e.target.value)}
                  placeholder="مثال: حل مسائل الفيزياء ص 45، حفظ كلمات إنجليزي..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold text-center focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Subject dropdown - Saudi 2nd secondary */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  اختر مادة ثاني ثانوي <span className="text-rose-500">*</span>
                </label>
                <select
                  value={hwSubject}
                  onChange={(e) => setHwSubject(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {SAUDI_SECONDARY_2_SUBJECTS.map((subj) => (
                    <option key={subj} value={subj}>
                      {subj}
                    </option>
                  ))}
                  <option value="مادة أخرى">مادة أخرى أو مهمة عامة...</option>
                </select>

                {hwSubject === 'مادة أخرى' && (
                  <input
                    type="text"
                    value={hwCustomSubject}
                    onChange={(e) => setHwCustomSubject(e.target.value)}
                    placeholder="اكتب اسم المادة أو المهمة..."
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                )}
              </div>

              {/* Toggle: مع وصف أو بدون وصف + مربع الوصف */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <AlignLeft className="w-4 h-4 text-emerald-600" />
                    <span>خيار الوصف للمهمة:</span>
                  </span>

                  <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-200 dark:bg-slate-700">
                    <button
                      type="button"
                      onClick={() => setHasDescription(false)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        !hasDescription
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      بدون وصف
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasDescription(true)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        hasDescription
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      مع وصف
                    </button>
                  </div>
                </div>

                {hasDescription && (
                  <div className="space-y-1 animate-in fade-in">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                      مربع كتابة الوصف والتفاصيل:
                    </label>
                    <textarea
                      value={hwDescription}
                      onChange={(e) => setHwDescription(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium resize-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      placeholder="اكتب تفاصيل الواجب، شروط المعلم، أو ملاحظات التنفيذ..."
                    />
                  </div>
                )}
              </div>

              {/* Color Selector (واختار لون للمهمة) */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-indigo-500" />
                  <span>اختيار لون مميز للمهمة:</span>
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {COLOR_PALETTES.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setHwColor(c.key)}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                        hwColor === c.key
                          ? 'border-indigo-600 ring-2 ring-indigo-500 scale-105'
                          : 'border-slate-200 dark:border-slate-700 hover:scale-102'
                      } ${c.bgClass}`}
                    >
                      <span className={`w-4 h-4 rounded-full ${c.dotClass} shadow-xs`}></span>
                      <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300 truncate max-w-full">
                        {c.name.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration and Points */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    الزمن اللازم (بالدقائق)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="240"
                    value={hwDuration}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setHwDuration(val);
                      if (hasTimer) setTimerMinutes(val);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    عدد النقاط المكتسبة
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="200"
                    value={hwPoints}
                    onChange={(e) => setHwPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Optional Timer Configuration (خيار اختياري تايمر) */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-black text-indigo-950 dark:text-indigo-200">
                      تفعيل مؤقت تركيز للمهمة (تايمر ⏱️)
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasTimer}
                    onChange={(e) => setHasTimer(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded-sm cursor-pointer"
                  />
                </div>

                {hasTimer && (
                  <div className="flex items-center gap-2 pt-1 animate-in fade-in">
                    <span className="text-xs text-slate-600 dark:text-slate-300">
                      مدة التايمر عند البدء:
                    </span>
                    <input
                      type="number"
                      min="5"
                      max="180"
                      value={timerMinutes}
                      onChange={(e) => setTimerMinutes(Number(e.target.value))}
                      className="w-20 px-2.5 py-1 rounded-lg border border-indigo-300 dark:border-indigo-700 text-xs font-black text-center bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                      دقيقة
                    </span>
                  </div>
                )}
              </div>

              {/* School Timetable Linking (ربط الواجب باليوم والحصة بالجدول) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4 text-teal-600" />
                    <span>تحديد اليوم والحصة في جدول الحصص:</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={linkToSchedule}
                    onChange={(e) => setLinkToSchedule(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded-sm cursor-pointer"
                  />
                </div>

                {linkToSchedule && (
                  <div className="grid grid-cols-2 gap-2 pt-1 animate-in fade-in">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                        اختر اليوم:
                      </label>
                      <select
                        value={hwDayOfWeek}
                        onChange={(e) => setHwDayOfWeek(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value="الأحد">الأحد</option>
                        <option value="الإثنين">الإثنين</option>
                        <option value="الثلاثاء">الثلاثاء</option>
                        <option value="الأربعاء">الأربعاء</option>
                        <option value="الخميس">الخميس</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                        اختر رقم الحصة:
                      </label>
                      <select
                        value={hwPeriodNumber}
                        onChange={(e) => setHwPeriodNumber(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        {[1, 2, 3, 4, 5, 6, 7].map((p) => (
                          <option key={p} value={p}>
                            الحصة {p}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Page Number & Due Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    الصفحة / التمارين
                  </label>
                  <input
                    type="text"
                    value={hwPageNumber}
                    onChange={(e) => setHwPageNumber(e.target.value)}
                    placeholder="مثال: ص 84 - 86"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    موعد التسليم
                  </label>
                  <input
                    type="text"
                    value={hwDueDate}
                    onChange={(e) => setHwDueDate(e.target.value)}
                    placeholder="مثال: غداً الساعة 8 صباحاً"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddHomeworkOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black shadow-md hover:bg-emerald-700"
                >
                  حفظ وإضافة المهمة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD EXAM (مع اختيار اليوم والحصة بالجدول واختيار اللون) */}
      {isAddExamOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in"
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[92vh] overflow-y-auto dir-rtl text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <BookmarkCheck className="w-5 h-5 text-teal-600" />
                <span>إضافة موعد اختبار ثاني ثانوي</span>
              </h3>
              <button
                onClick={() => setIsAddExamOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {examError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs font-bold">
                {examError}
              </div>
            )}

            <form onSubmit={handleExamSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  اختر مادة الاختبار <span className="text-rose-500">*</span>
                </label>
                <select
                  value={examSubject}
                  onChange={(e) => setExamSubject(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {SAUDI_SECONDARY_2_SUBJECTS.map((subj) => (
                    <option key={subj} value={subj}>
                      {subj}
                    </option>
                  ))}
                  <option value="مادة أخرى">مادة أخرى مخصصة...</option>
                </select>

                {examSubject === 'مادة أخرى' && (
                  <input
                    type="text"
                    value={examCustomSubject}
                    onChange={(e) => setExamCustomSubject(e.target.value)}
                    placeholder="اكتب اسم المادة..."
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  عنوان الاختبار <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="مثال: اختبار الفترة الأولى - الباب الثاني..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              {/* Color selector for Exam */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-teal-500" />
                  <span>اختيار لون الاختبار في الجدول:</span>
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                  {COLOR_PALETTES.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setExamColor(c.key)}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                        examColor === c.key
                          ? 'border-teal-600 ring-2 ring-teal-500 scale-105'
                          : 'border-slate-200 dark:border-slate-700 hover:scale-102'
                      } ${c.bgClass}`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${c.dotClass} shadow-xs`}></span>
                      <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300 truncate max-w-full">
                        {c.name.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  الشيء اللي لازم أذاكره (التفاصيل والمقرر) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={examStudyDetails}
                  onChange={(e) => setExamStudyDetails(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium resize-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="اكتب الفصول والدروس المحددة، القوانين والمفاهيم المهمة..."
                  required
                />
              </div>

              {/* Day and Period in schedule for Exam (اختيار اليوم والحصة بالجدول) */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4 text-teal-600" />
                    <span>تحديد موعد الاختبار في جدول الحصص:</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={examLinkToSchedule}
                    onChange={(e) => setExamLinkToSchedule(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded-sm cursor-pointer"
                  />
                </div>

                {examLinkToSchedule && (
                  <div className="grid grid-cols-2 gap-2 pt-1 animate-in fade-in">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                        يوم الحصة:
                      </label>
                      <select
                        value={examDayOfWeek}
                        onChange={(e) => setExamDayOfWeek(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value="الأحد">الأحد</option>
                        <option value="الإثنين">الإثنين</option>
                        <option value="الثلاثاء">الثلاثاء</option>
                        <option value="الأربعاء">الأربعاء</option>
                        <option value="الخميس">الخميس</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                        الحصة رقم:
                      </label>
                      <select
                        value={examPeriodNumber}
                        onChange={(e) => setExamPeriodNumber(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        {[1, 2, 3, 4, 5, 6, 7].map((p) => (
                          <option key={p} value={p}>
                            الحصة {p}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    تاريخ/يوم الاختبار
                  </label>
                  <input
                    type="text"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    placeholder="مثال: الخميس 18 محرم"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-amber-700 dark:text-amber-300 bg-white dark:bg-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    النقاط المكتسبة
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="300"
                    value={examPoints}
                    onChange={(e) => setExamPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-amber-700 dark:text-amber-300 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddExamOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 text-white text-xs font-black shadow-md hover:bg-teal-700"
                >
                  حفظ وإضافة الاختبار
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Focus Timer Modal for task */}
      <TaskFocusTimerModal
        task={activeTimerTask}
        isOpen={Boolean(activeTimerTask)}
        onClose={() => setActiveTimerTask(null)}
        onComplete={(taskId) => {
          onToggleHomework(taskId);
          setActiveTimerTask(null);
        }}
      />
    </div>
  );
};

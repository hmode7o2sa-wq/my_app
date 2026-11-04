import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  User,
  Plus,
  BookOpen,
  CheckCircle2,
  BookmarkCheck,
  Play,
  Sparkles,
  Layers,
  ArrowRight,
  Filter,
  Check,
  AlertCircle,
  HelpCircle,
  Calendar,
  Hourglass,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import {
  SECOND_SECONDARY_CLASS_TIMETABLE,
  TIMETABLE_PERIODS,
  TimetableSlot,
  HomeworkItem,
  ExamItem,
  TaskColorTheme,
} from '../types';
import {
  getPeriodArabicName,
  getSlotTaskStatus,
  getSlotColorClass,
  getTodayArabicDayName,
  calculateDailySummary,
  SlotTaskStatus,
} from '../utils/timetableLogic';

interface DailyTimetableProps {
  homework: HomeworkItem[];
  exams: ExamItem[];
  slots?: TimetableSlot[];
  onAddHomeworkForSlot?: (slot: TimetableSlot) => void;
  onAddExamForSlot?: (slot: TimetableSlot) => void;
  onToggleHomework: (id: string) => void;
  onToggleExam: (id: string) => void;
  onStartTimer?: (task: HomeworkItem) => void;
  onPostponeHomework?: (id: string, postponeType: 'tomorrow' | 'next_week') => void;
}

const DAYS_OF_WEEK: Array<'الأحد' | 'الإثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس'> = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
];

export const DailyTimetable: React.FC<DailyTimetableProps> = ({
  homework,
  exams,
  slots,
  onAddHomeworkForSlot,
  onAddExamForSlot,
  onToggleHomework,
  onToggleExam,
  onStartTimer,
  onPostponeHomework,
}) => {
  const todayArabic = getTodayArabicDayName();
  const [selectedDay, setSelectedDay] = useState<'الأحد' | 'الإثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس'>(
    todayArabic
  );
  const [filterType, setFilterType] = useState<'all' | 'with_tasks' | 'with_exams' | 'free'>('all');

  const activeSlots = slots && slots.length > 0 ? slots : SECOND_SECONDARY_CLASS_TIMETABLE;

  // Get all scheduled slots for the selected day
  const rawDaySlots = activeSlots.filter((s) => s.day === selectedDay);

  // Generate full 1 to 7 periods sequence (filling empty periods if any, e.g. period 7 on Tue/Wed/Thu)
  const fullSevenPeriods: TimetableSlot[] = TIMETABLE_PERIODS.map((periodInfo) => {
    const existing = rawDaySlots.find((s) => s.period === periodInfo.period);
    if (existing) {
      return existing;
    }
    return {
      day: selectedDay,
      period: periodInfo.period,
      timeRange: periodInfo.timeRange,
      subject: 'حصة حرة / نشاط ومذاكرة ذاتية',
      teacher: 'إشراف عام / انصراف',
    };
  });

  // Calculate day summary metrics
  const summary = calculateDailySummary(selectedDay, rawDaySlots, homework, exams);

  // Helper to find homeworks for a given slot
  const getHomeworksForPeriod = (period: number, subject: string) => {
    return homework.filter((h) => {
      if (h.dayOfWeek === selectedDay && h.periodNumber === period) return true;
      if (h.dayOfWeek === selectedDay && h.subject && h.subject.includes(subject)) return true;
      return false;
    });
  };

  // Helper to find exams for a given slot
  const getExamsForPeriod = (period: number, subject: string) => {
    return exams.filter((e) => {
      if (e.dayOfWeek === selectedDay && e.periodNumber === period) return true;
      if (e.dayOfWeek === selectedDay && e.subject && e.subject.includes(subject)) return true;
      return false;
    });
  };

  // Filter periods based on user selection
  const filteredPeriods = fullSevenPeriods.filter((slot) => {
    const status = getSlotTaskStatus(selectedDay, slot.period, slot.subject, homework, exams);
    if (filterType === 'all') return true;
    if (filterType === 'with_tasks') return status === 'homework_only' || status === 'both';
    if (filterType === 'with_exams') return status === 'exam_only' || status === 'both';
    if (filterType === 'free') return status === 'none' || status === 'completed';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Daily Timetable Header & Day Selector Card */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-indigo-900/40 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-bold">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>جدول حصص يومي مفصل (الحصة الأولى إلى السابعة)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>جدول حصص يوم {selectedDay}</span>
              {selectedDay === todayArabic && (
                <span className="text-xs font-extrabold px-2.5 py-1 rounded-xl bg-amber-400 text-slate-950 animate-pulse">
                  اليوم الدراسي الحالي 🌟
                </span>
              )}
            </h3>
            <p className="text-xs sm:text-sm text-indigo-200/90 max-w-2xl leading-relaxed">
              عرض تسلسلي للمواد من الحصة 1 إلى 7، مع تلوين الخلايا وفقاً لنوع المهمة (واجب، اختبار، كلاهما)، وإمكانية إنجاز المهام أو بدء التايمر مباشرة.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 bg-white/5 border border-white/10 rounded-2xl p-3 shrink-0">
            <div className="text-center px-2">
              <span className="text-[11px] text-indigo-300 block">الحصص</span>
              <span className="text-base font-black text-white">{fullSevenPeriods.length}</span>
            </div>
            <div className="text-center px-2 border-x border-white/10">
              <span className="text-[11px] text-emerald-300 block">واجبات اليوم</span>
              <span className="text-base font-black text-emerald-400">{summary.homeworkCount}</span>
            </div>
            <div className="text-center px-2">
              <span className="text-[11px] text-amber-300 block">اختبارات اليوم</span>
              <span className="text-base font-black text-amber-400">{summary.examCount}</span>
            </div>
          </div>
        </div>

        {/* Days of Week Selector Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-2 border-t border-white/10">
          <span className="text-xs font-bold text-indigo-300 pl-2 shrink-0">اختر اليوم:</span>
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = selectedDay === day;
            const isToday = day === todayArabic;
            const dayHws = homework.filter((h) => h.dayOfWeek === day && !h.completed).length;
            const dayExs = exams.filter((e) => e.dayOfWeek === day && !e.completed).length;
            const hasPending = dayHws > 0 || dayExs > 0;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-400 scale-[1.02]'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200'
                }`}
              >
                <span>يوم {day}</span>
                {isToday && <span className="text-[10px] text-amber-300">★</span>}
                {hasPending && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-indigo-900 text-indigo-100' : 'bg-rose-500 text-white'
                    }`}
                  >
                    {dayHws + dayExs}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Legend & Filter Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Color Legend (دليل ألوان الحصص) */}
        <div className="space-y-1.5">
          <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            دليل تلوين الحصص حسب نوع المهمة:
          </span>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>واجب مدرسي</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>موعد اختبار</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span>واجب + اختبار معاً</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-bold">
              <Check className="w-3 h-3 text-emerald-600" />
              <span>تم الإنجاز بالكامل</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <span>حصة حرة / بدون مهام</span>
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shrink-0 overflow-x-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            الكل (7)
          </button>
          <button
            onClick={() => setFilterType('with_tasks')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'with_tasks'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            واجبات
          </button>
          <button
            onClick={() => setFilterType('with_exams')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'with_exams'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            اختبارات
          </button>
          <button
            onClick={() => setFilterType('free')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'free'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            الحرة
          </button>
        </div>
      </div>

      {/* Sequential Periods List (من الحصة الأولى إلى الحصة السابعة) */}
      <div className="space-y-4">
        {filteredPeriods.map((slot) => {
          const linkedHomeworks = getHomeworksForPeriod(slot.period, slot.subject);
          const linkedExams = getExamsForPeriod(slot.period, slot.subject);
          const status = getSlotTaskStatus(selectedDay, slot.period, slot.subject, homework, exams);

          // Find custom color from first linked homework or exam
          const customColor =
            linkedHomeworks.find((h) => h.color)?.color ||
            linkedExams.find((e) => e.color)?.color;

          // Color styling based on task registration
          const style = getSlotColorClass(status, customColor);
          const arabicPeriodTitle = getPeriodArabicName(slot.period);
          const hasLinkedItems = linkedHomeworks.length > 0 || linkedExams.length > 0;

          return (
            <div
              key={`day_${selectedDay}_period_${slot.period}`}
              className={`rounded-3xl border transition-all overflow-hidden ${style.bg} ${style.border} ${style.glow}`}
            >
              {/* Period Top Status Header */}
              <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-black/5 dark:border-white/5">
                <div className="flex items-center gap-3">
                  {/* Period Number Box */}
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center shadow-xs shrink-0">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">حصة</span>
                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 leading-tight">
                      {slot.period}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                        {arabicPeriodTitle}
                      </span>

                      {/* Status Badge */}
                      <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${style.badgeBg} shadow-2xs`}>
                        {style.badge}
                      </span>

                      {/* Time Range Badge */}
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 bg-white/60 dark:bg-slate-800/60 px-2.5 py-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{slot.timeRange}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-600 dark:text-slate-300">
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                        المادة: {slot.subject}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>المعلم: {slot.teacher}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Action Buttons to Link Homework or Exam */}
                <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                  <button
                    onClick={() => onAddHomeworkForSlot && onAddHomeworkForSlot(slot)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold transition-all shadow-2xs hover:scale-105"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ربط واجب (+)</span>
                  </button>

                  <button
                    onClick={() => onAddExamForSlot && onAddExamForSlot(slot)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-bold transition-all shadow-2xs hover:scale-105"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-600" />
                    <span>ربط اختبار (+)</span>
                  </button>
                </div>
              </div>

              {/* Linked Items Content Body */}
              <div className="p-4 sm:p-5 space-y-3">
                {hasLinkedItems ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Linked Homeworks */}
                    {linkedHomeworks.map((hw) => (
                      <div
                        key={hw.id}
                        className={`p-3.5 rounded-2xl bg-white dark:bg-slate-900/90 border transition-all space-y-2.5 ${
                          hw.completed
                            ? 'border-emerald-300 dark:border-emerald-800/80 opacity-75'
                            : 'border-slate-300 dark:border-slate-700 shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>واجب مدرسي مطلوب</span>
                              <span>•</span>
                              <span className="text-slate-500 dark:text-slate-400">+{hw.points || 30} نقطة</span>
                            </div>

                            <h5
                              className={`text-sm font-black truncate ${
                                hw.completed
                                  ? 'line-through text-slate-400 dark:text-slate-500'
                                  : 'text-slate-900 dark:text-white'
                              }`}
                              title={hw.title}
                            >
                              {hw.title}
                            </h5>

                            {hw.hasDescription && hw.description && (
                              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                                {hw.description}
                              </p>
                            )}

                            {hw.pageNumber && (
                              <span className="inline-block text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                صفحة: {hw.pageNumber}
                              </span>
                            )}
                          </div>

                          {/* Completion Toggle Button */}
                          <button
                            onClick={() => onToggleHomework(hw.id)}
                            className={`p-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                              hw.completed
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={hw.completed ? 'إلغاء الإنجاز' : 'تم إنجاز الواجب'}
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Task Action Bar */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                            <Clock className="w-3.5 h-3.5" />
                            <span>الموعد: {hw.dueDate}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {hw.hasTimer && !hw.completed && onStartTimer && (
                              <button
                                onClick={() => onStartTimer(hw)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] shadow-xs cursor-pointer"
                              >
                                <Play className="w-3 h-3 fill-white" />
                                <span>تايمر ({hw.timerMinutes || 30} د)</span>
                              </button>
                            )}

                            {onPostponeHomework && !hw.completed && (
                              <button
                                onClick={() => onPostponeHomework(hw.id, 'tomorrow')}
                                className="px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[10px]"
                                title="تأجيل لغداً"
                              >
                                تأجيل ⏭️
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Linked Exams */}
                    {linkedExams.map((exam) => (
                      <div
                        key={exam.id}
                        className={`p-3.5 rounded-2xl bg-white dark:bg-slate-900/90 border transition-all space-y-2.5 ${
                          exam.completed
                            ? 'border-emerald-300 dark:border-emerald-800/80 opacity-75'
                            : 'border-amber-300 dark:border-amber-700/80 shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                              <BookmarkCheck className="w-3.5 h-3.5" />
                              <span>موعد اختبار ومذاكرة</span>
                              <span>•</span>
                              <span className="text-slate-500 dark:text-slate-400">+{exam.points || 50} نقطة</span>
                            </div>

                            <h5
                              className={`text-sm font-black truncate ${
                                exam.completed
                                  ? 'line-through text-slate-400 dark:text-slate-500'
                                  : 'text-slate-900 dark:text-white'
                              }`}
                              title={exam.title}
                            >
                              {exam.title}
                            </h5>

                            {exam.studyDetails && (
                              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                                المطلوب مذاكرته: {exam.studyDetails}
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => onToggleExam(exam.id)}
                            className={`p-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                              exam.completed
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                            }`}
                            title={exam.completed ? 'إلغاء' : 'تمت مذاكرة الاختبار'}
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            تاريخ الاختبار: {exam.examDate}
                          </span>

                          <button
                            onClick={() => onToggleExam(exam.id)}
                            className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[11px]"
                          >
                            {exam.completed ? 'مكتمل ✅' : 'تمت المذاكرة'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>لا توجد واجبات أو اختبارات مسجلة لهذه الحصة حالياً.</span>
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                      حصة جاهزة أو يمكنك ربط مهمة عبر الأزرار بالأعلى ☝️
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

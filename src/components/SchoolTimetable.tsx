import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  User,
  Plus,
  BookOpen,
  CheckCircle2,
  Image as ImageIcon,
  BookmarkCheck,
  Sparkles,
  Edit3,
  X,
  Check,
} from 'lucide-react';
import {
  SECOND_SECONDARY_CLASS_TIMETABLE,
  TIMETABLE_PERIODS,
  TimetableSlot,
  HomeworkItem,
  ExamItem,
  TaskColorTheme,
} from '../types';

interface SchoolTimetableProps {
  homework: HomeworkItem[];
  exams: ExamItem[];
  slots?: TimetableSlot[];
  onUpdateSlot?: (slot: TimetableSlot) => void;
  onAddHomeworkForSlot?: (slot: TimetableSlot) => void;
  onAddExamForSlot?: (slot: TimetableSlot) => void;
  onSelectHomework?: (hwId: string) => void;
  onSwitchToDailyView?: () => void;
}

const DAYS_OF_WEEK: Array<'الأحد' | 'الإثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس'> = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
];

// Color mapping for task theme colors
const TASK_COLOR_STYLES: Record<
  TaskColorTheme,
  { bg: string; border: string; text: string; bar: string; badge: string }
> = {
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-400 dark:border-emerald-600',
    text: 'text-emerald-900 dark:text-emerald-200',
    bar: 'bg-emerald-500',
    badge: 'bg-emerald-600 text-white',
  },
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    border: 'border-indigo-400 dark:border-indigo-600',
    text: 'text-indigo-900 dark:text-indigo-200',
    bar: 'bg-indigo-500',
    badge: 'bg-indigo-600 text-white',
  },
  sky: {
    bg: 'bg-sky-50 dark:bg-sky-950/40',
    border: 'border-sky-400 dark:border-sky-600',
    text: 'text-sky-900 dark:text-sky-200',
    bar: 'bg-sky-500',
    badge: 'bg-sky-600 text-white',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-400 dark:border-amber-600',
    text: 'text-amber-900 dark:text-amber-200',
    bar: 'bg-amber-500',
    badge: 'bg-amber-600 text-white',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-400 dark:border-rose-600',
    text: 'text-rose-900 dark:text-rose-200',
    bar: 'bg-rose-500',
    badge: 'bg-rose-600 text-white',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    border: 'border-purple-400 dark:border-purple-600',
    text: 'text-purple-900 dark:text-purple-200',
    bar: 'bg-purple-500',
    badge: 'bg-purple-600 text-white',
  },
  teal: {
    bg: 'bg-teal-50 dark:bg-teal-950/40',
    border: 'border-teal-400 dark:border-teal-600',
    text: 'text-teal-900 dark:text-teal-200',
    bar: 'bg-teal-500',
    badge: 'bg-teal-600 text-white',
  },
  slate: {
    bg: 'bg-slate-100 dark:bg-slate-800/60',
    border: 'border-slate-400 dark:border-slate-600',
    text: 'text-slate-900 dark:text-slate-200',
    bar: 'bg-slate-500',
    badge: 'bg-slate-700 text-white',
  },
};

// Default subject styling when no homework/exam overrides color
const DEFAULT_SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string; bar: string }> = {
  الرياضيات: { bg: 'bg-indigo-50/70 dark:bg-indigo-950/30', text: 'text-indigo-800 dark:text-indigo-200', border: 'border-indigo-200 dark:border-indigo-800/80', bar: 'bg-indigo-500' },
  الفيزياء: { bg: 'bg-sky-50/70 dark:bg-sky-950/30', text: 'text-sky-800 dark:text-sky-200', border: 'border-sky-200 dark:border-sky-800/80', bar: 'bg-sky-500' },
  الكيمياء: { bg: 'bg-purple-50/70 dark:bg-purple-950/30', text: 'text-purple-800 dark:text-purple-200', border: 'border-purple-200 dark:border-purple-800/80', bar: 'bg-purple-500' },
  الأحياء: { bg: 'bg-emerald-50/70 dark:bg-emerald-950/30', text: 'text-emerald-800 dark:text-emerald-200', border: 'border-emerald-200 dark:border-emerald-800/80', bar: 'bg-emerald-500' },
  الإنجليزية: { bg: 'bg-amber-50/70 dark:bg-amber-950/30', text: 'text-amber-800 dark:text-amber-200', border: 'border-amber-200 dark:border-amber-800/80', bar: 'bg-amber-500' },
  'الكفايات اللغوية': { bg: 'bg-rose-50/70 dark:bg-rose-950/30', text: 'text-rose-800 dark:text-rose-200', border: 'border-rose-200 dark:border-rose-800/80', bar: 'bg-rose-500' },
  التاريخ: { bg: 'bg-orange-50/70 dark:bg-orange-950/30', text: 'text-orange-800 dark:text-orange-200', border: 'border-orange-200 dark:border-orange-800/80', bar: 'bg-orange-500' },
  النشاط: { bg: 'bg-teal-50/70 dark:bg-teal-950/30', text: 'text-teal-800 dark:text-teal-200', border: 'border-teal-200 dark:border-teal-800/80', bar: 'bg-teal-500' },
};

interface SchoolTimetableProps {
  homework: HomeworkItem[];
  exams: ExamItem[];
  slots?: TimetableSlot[];
  onUpdateSlot?: (slot: TimetableSlot) => void;
  onAddHomeworkForSlot?: (slot: TimetableSlot) => void;
  onAddExamForSlot?: (slot: TimetableSlot) => void;
  onSelectHomework?: (hwId: string) => void;
  onSwitchToDailyView?: () => void;
}

export const SchoolTimetable: React.FC<SchoolTimetableProps> = ({
  homework,
  exams,
  slots,
  onUpdateSlot,
  onAddHomeworkForSlot,
  onAddExamForSlot,
  onSelectHomework,
  onSwitchToDailyView,
}) => {
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [showOriginalImage, setShowOriginalImage] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);

  const timetableData = slots || SECOND_SECONDARY_CLASS_TIMETABLE;

  // Group slots by day
  const slotsByDay = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = timetableData.filter((s) => s.day === day);
    return acc;
  }, {} as Record<string, TimetableSlot[]>);

  // Find homework items associated with slot
  const getHomeworksForSlot = (slot: TimetableSlot) => {
    return homework.filter((h) => {
      if (h.dayOfWeek === slot.day && h.periodNumber === slot.period) return true;
      if (h.dayOfWeek === slot.day && h.subject && h.subject.includes(slot.subject)) return true;
      return false;
    });
  };

  // Find exams associated with slot
  const getExamsForSlot = (slot: TimetableSlot) => {
    return exams.filter((e) => {
      if (e.dayOfWeek === slot.day && e.periodNumber === slot.period) return true;
      if (e.dayOfWeek === slot.day && e.subject && e.subject.includes(slot.subject)) return true;
      return false;
    });
  };

  return (
    <div className="space-y-5">
      {/* Timetable Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-indigo-900/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-bold">
            <CalendarDays className="w-3.5 h-3.5 text-indigo-400" />
            <span>جدول الحصص المدرسي المعتمد (22/08/2026)</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            جدول الفصل الثاني الثانوي عام 2
          </h3>
          <p className="text-xs sm:text-sm text-indigo-200 max-w-xl">
            حصصك الأسبوعية مطابقة لصورة المدرسة. الحصة التي تحتوي على واجب أو اختبار تتلوّن بنفس لون المهمة تلقائياً!
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onSwitchToDailyView && (
            <button
              onClick={onSwitchToDailyView}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-sm shrink-0"
            >
              <Clock className="w-4 h-4 text-indigo-200" />
              <span>جدول الحصص اليومي (1 - 7)</span>
            </button>
          )}

          <button
            onClick={() => setShowOriginalImage(!showOriginalImage)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all shrink-0"
          >
            <ImageIcon className="w-4 h-4 text-amber-300" />
            <span>{showOriginalImage ? 'إخفاء صورة الجدول' : 'عرض صورة الجدول الأصلية'}</span>
          </button>
        </div>
      </div>

      {/* Original Image Modal / Dropdown */}
      {showOriginalImage && (
        <div className="p-4 rounded-3xl bg-slate-900/95 border border-slate-800 text-white space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300">
              الصورة الأصلية المرفوعة من المدرسة (جدول 2 ثانوي عام 2):
            </span>
            <button
              onClick={() => setShowOriginalImage(false)}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/10"
            >
              إغلاق
            </button>
          </div>
          <div className="rounded-2xl overflow-hidden border border-slate-700 bg-black flex justify-center max-h-96">
            <img
              src="/assets/aistudio/WhatsApp_Image_2026-11-03_at_7.10.43_PM_c805e8dd.jpeg"
              alt="جدول الفصل الثاني الثانوي عام 2"
              className="object-contain w-full h-auto max-h-96"
            />
          </div>
        </div>
      )}

      {/* Days Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-1">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 overflow-x-auto">
          <button
            onClick={() => setSelectedDay('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
              selectedDay === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            الجدول الأسبوعي الكامل
          </button>
          {DAYS_OF_WEEK.map((day) => {
            const count = SECOND_SECONDARY_CLASS_TIMETABLE.filter((s) => s.day === day).length;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                  selectedDay === day
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {day} ({count} حصص)
              </button>
            );
          })}
        </div>

        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-indigo-500" />
          <span>7 حصص يومياً (7:00 ص إلى 1:30 م)</span>
        </div>
      </div>

      {/* Day by Day View / Weekly Grid */}
      <div className="space-y-6">
        {DAYS_OF_WEEK.filter((d) => selectedDay === 'all' || selectedDay === d).map((day) => {
          const daySlots = slotsByDay[day] || [];
          return (
            <div
              key={day}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5 space-y-4"
            >
              {/* Day Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                    {day.slice(0, 1)}
                  </span>
                  <div>
                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      يوم {day}
                    </h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {daySlots.length} حصص دراسية مجدولة
                    </span>
                  </div>
                </div>

                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-xl">
                  ثاني ثانوي عام 2
                </span>
              </div>

              {/* Periods Grid for this day */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {daySlots.map((slot) => {
                  const linkedHws = getHomeworksForSlot(slot);
                  const linkedExams = getExamsForSlot(slot);

                  // Extract color if any homework or exam has custom color
                  const activeColor: TaskColorTheme | undefined =
                    linkedHws.find((h) => h.color)?.color ||
                    linkedExams.find((e) => e.color)?.color;

                  // "واليوم الللي فيه واجب او اختبار يكون بنفس اللون حق المهمة"
                  const slotStyle = activeColor
                    ? TASK_COLOR_STYLES[activeColor]
                    : DEFAULT_SUBJECT_COLORS[slot.subject] || {
                        bg: 'bg-slate-50 dark:bg-slate-800/40',
                        text: 'text-slate-800 dark:text-slate-200',
                        border: 'border-slate-200 dark:border-slate-700',
                        bar: 'bg-slate-500',
                      };

                  const hasLinkedItems = linkedHws.length > 0 || linkedExams.length > 0;

                  return (
                    <div
                      key={`${slot.day}_p${slot.period}`}
                      className={`p-3.5 rounded-2xl border transition-all relative flex flex-col justify-between gap-3 overflow-hidden ${
                        slotStyle.bg
                      } ${slotStyle.border} ${
                        hasLinkedItems ? 'ring-2 ring-offset-1 ring-indigo-500/30 shadow-md' : 'shadow-2xs'
                      } hover:shadow-md hover:scale-[1.01]`}
                    >
                      {/* Top Accent Color Bar */}
                      <div
                        className={`absolute top-0 left-0 right-0 h-1.5 ${
                          (slotStyle as any).bar || 'bg-indigo-500'
                        }`}
                      />

                      {/* Period Number, Edit Button and Time Badge */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-white/90 dark:bg-slate-900/90 shadow-2xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">
                            الحصة {slot.period}
                          </span>
                          {onUpdateSlot && (
                            <button
                              onClick={() => setEditingSlot(slot)}
                              className="p-1 rounded-md text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-white/80 dark:hover:bg-slate-800 transition-colors"
                              title="تعديل المادة أو المعلم لهذه الحصة"
                              aria-label="تعديل الحصة"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{slot.timeRange}</span>
                        </span>
                      </div>

                      {/* Subject Name & Teacher */}
                      <div className="space-y-1">
                        <h5 className={`text-base font-black ${slotStyle.text}`}>
                          {slot.subject}
                        </h5>
                        <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>المعلم: {slot.teacher}</span>
                        </div>
                      </div>

                      {/* Linked Homeworks & Exams Chips */}
                      {hasLinkedItems && (
                        <div className="p-2 rounded-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 space-y-1.5 shadow-2xs">
                          {linkedHws.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <BookOpen className="w-3 h-3" />
                                <span>واجب مطلوب ({linkedHws.length}):</span>
                              </span>
                              {linkedHws.map((hw) => (
                                <div
                                  key={hw.id}
                                  onClick={() => onSelectHomework && onSelectHomework(hw.id)}
                                  className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate cursor-pointer hover:underline flex items-center gap-1"
                                  title={hw.title}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  <span className="truncate">{hw.title}</span>
                                  {hw.completed && <span className="text-[10px] text-emerald-500">✅</span>}
                                </div>
                              ))}
                            </div>
                          )}

                          {linkedExams.length > 0 && (
                            <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                              <span className="text-[10px] font-black text-teal-600 dark:text-teal-400 flex items-center gap-1">
                                <BookmarkCheck className="w-3 h-3" />
                                <span>موعد اختبار ({linkedExams.length}):</span>
                              </span>
                              {linkedExams.map((ex) => (
                                <div
                                  key={ex.id}
                                  className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate flex items-center gap-1"
                                  title={ex.title}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                                  <span className="truncate">{ex.title}</span>
                                  {ex.completed && <span className="text-[10px] text-teal-500">✅</span>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Actions: Add Homework or Add Exam for this slot */}
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        <button
                          onClick={() => onAddHomeworkForSlot && onAddHomeworkForSlot(slot)}
                          className="py-1 px-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-[10px] font-bold flex items-center justify-center gap-1 transition-all shadow-2xs hover:border-emerald-500"
                          title="إضافة واجب لهذه الحصة"
                        >
                          <Plus className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>واجب</span>
                        </button>

                        <button
                          onClick={() => onAddExamForSlot && onAddExamForSlot(slot)}
                          className="py-1 px-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-[10px] font-bold flex items-center justify-center gap-1 transition-all shadow-2xs hover:border-teal-500"
                          title="إضافة اختبار لهذه الحصة"
                        >
                          <Plus className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                          <span>اختبار</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {/* Edit Slot Modal */}
      {editingSlot && onUpdateSlot && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
        >
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-6 text-right dir-rtl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-500" />
                <span>تعديل {editingSlot.day} - الحصة {editingSlot.period}</span>
              </h4>
              <button
                onClick={() => setEditingSlot(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  اسم المادة:
                </label>
                <input
                  type="text"
                  value={editingSlot.subject}
                  onChange={(e) =>
                    setEditingSlot({ ...editingSlot, subject: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  اسم المعلم:
                </label>
                <input
                  type="text"
                  value={editingSlot.teacher}
                  onChange={(e) =>
                    setEditingSlot({ ...editingSlot, teacher: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  التوقيت الزمني:
                </label>
                <input
                  type="text"
                  value={editingSlot.timeRange}
                  onChange={(e) =>
                    setEditingSlot({ ...editingSlot, timeRange: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  onUpdateSlot(editingSlot);
                  setEditingSlot(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>حفظ التعديل في الجدول</span>
              </button>
              <button
                type="button"
                onClick={() => setEditingSlot(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

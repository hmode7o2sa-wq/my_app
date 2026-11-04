export type QuduratCategory = 'verbal' | 'quantitative'; // لفظي | كمي

export interface LectureItem {
  id: string;
  category: QuduratCategory;
  order: number; // 1..5 for verbal, 1 for full quant lesson
  title: string;
  topic: string;
  description: string;
  durationMinutes: number;
  completed: boolean;
  completedAt?: string;
  points: number;
  summaryBullets: string[];
  keyTip?: string;
  isFullLesson?: boolean; // true for full quantitative lesson
}

export const SAUDI_SECONDARY_2_SUBJECTS = [
  'الرياضيات (رياضيات 2)',
  'الفيزياء (فيزياء 2)',
  'الكيمياء (كيمياء 2)',
  'الأحياء (أحياء 2)',
  'اللغة الإنجليزية (Mega Goal 2)',
  'الكفايات اللغوية (لغتي 2)',
  'التفكير الناقد',
  'التقنية الرقمية 2',
  'الدراسات الإسلامية',
  'اللياقة والثقافة الصحية',
] as const;

export type SaudiSubject = (typeof SAUDI_SECONDARY_2_SUBJECTS)[number] | string;

export type TaskColorTheme =
  | 'emerald'
  | 'indigo'
  | 'sky'
  | 'rose'
  | 'amber'
  | 'purple'
  | 'teal'
  | 'slate';

export interface HomeworkItem {
  id: string;
  subject: SaudiSubject; // مادة ثاني ثانوي
  title: string;
  hasDescription?: boolean; // خيار وصف أو بدون وصف
  description: string; // مربع الوصف
  pageNumber: string; // الصفحة
  durationMinutes: number; // الزمن اللازم
  dueDate: string; // موعد التسليم
  points: number; // عدد النقاط للمهمة
  completed: boolean;
  completedAt?: string;
  priority: 'high' | 'medium' | 'normal';
  hasTimer?: boolean; // خيار اختياري تايمر
  timerMinutes?: number; // وقت التايمر المحدد
  color?: TaskColorTheme; // لون المهمة
  dayOfWeek?: string; // الأحد إلى الخميس
  periodNumber?: number; // الحصة كم (1 إلى 7)
  postponedUntil?: string; // مؤجل إلى
}

export interface TimetablePeriod {
  period: number;
  timeRange: string;
}

export interface TimetableSlot {
  day: 'الأحد' | 'الإثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس';
  period: number;
  timeRange: string;
  subject: string;
  teacher: string;
}

export const TIMETABLE_PERIODS: TimetablePeriod[] = [
  { period: 1, timeRange: '7:00 ص - 7:50 ص' },
  { period: 2, timeRange: '7:50 ص - 8:40 ص' },
  { period: 3, timeRange: '8:40 ص - 9:30 ص' },
  { period: 4, timeRange: '10:00 ص - 10:50 ص' },
  { period: 5, timeRange: '10:50 ص - 11:40 ص' },
  { period: 6, timeRange: '11:40 ص - 12:30 م' },
  { period: 7, timeRange: '12:50 م - 1:30 م' },
];

export const SECOND_SECONDARY_CLASS_TIMETABLE: TimetableSlot[] = [
  // الأحد
  { day: 'الأحد', period: 1, timeRange: '7:00 ص - 7:50 ص', subject: 'الإنجليزية', teacher: 'عبدالعزيز غرم' },
  { day: 'الأحد', period: 2, timeRange: '7:50 ص - 8:40 ص', subject: 'الكيمياء', teacher: 'حسن عبدالله' },
  { day: 'الأحد', period: 3, timeRange: '8:40 ص - 9:30 ص', subject: 'النشاط', teacher: 'حمود صالح' },
  { day: 'الأحد', period: 4, timeRange: '10:00 ص - 10:50 ص', subject: 'الرياضيات', teacher: 'عبدالمجيد صالح' },
  { day: 'الأحد', period: 5, timeRange: '10:50 ص - 11:40 ص', subject: 'الفيزياء', teacher: 'حسن محمد' },
  { day: 'الأحد', period: 6, timeRange: '11:40 ص - 12:30 م', subject: 'الكفايات اللغوية', teacher: 'محمد حسين' },
  { day: 'الأحد', period: 7, timeRange: '12:50 م - 1:30 م', subject: 'الأحياء', teacher: 'بدر سعيد' },

  // الإثنين
  { day: 'الإثنين', period: 1, timeRange: '7:00 ص - 7:50 ص', subject: 'الكيمياء', teacher: 'حسن عبدالله' },
  { day: 'الإثنين', period: 2, timeRange: '7:50 ص - 8:40 ص', subject: 'الرياضيات', teacher: 'عبدالمجيد صالح' },
  { day: 'الإثنين', period: 3, timeRange: '8:40 ص - 9:30 ص', subject: 'النشاط', teacher: 'حمود صالح' },
  { day: 'الإثنين', period: 4, timeRange: '10:00 ص - 10:50 ص', subject: 'الإنجليزية', teacher: 'عبدالعزيز غرم' },
  { day: 'الإثنين', period: 5, timeRange: '10:50 ص - 11:40 ص', subject: 'التاريخ', teacher: 'علي محمد' },
  { day: 'الإثنين', period: 6, timeRange: '11:40 ص - 12:30 م', subject: 'الكفايات اللغوية', teacher: 'محمد حسين' },
  { day: 'الإثنين', period: 7, timeRange: '12:50 م - 1:30 م', subject: 'الفيزياء', teacher: 'حسن محمد' },

  // الثلاثاء
  { day: 'الثلاثاء', period: 1, timeRange: '7:00 ص - 7:50 ص', subject: 'الإنجليزية', teacher: 'عبدالعزيز غرم' },
  { day: 'الثلاثاء', period: 2, timeRange: '7:50 ص - 8:40 ص', subject: 'الفيزياء', teacher: 'حسن محمد' },
  { day: 'الثلاثاء', period: 3, timeRange: '8:40 ص - 9:30 ص', subject: 'الكيمياء', teacher: 'حسن عبدالله' },
  { day: 'الثلاثاء', period: 4, timeRange: '10:00 ص - 10:50 ص', subject: 'التاريخ', teacher: 'علي محمد' },
  { day: 'الثلاثاء', period: 5, timeRange: '10:50 ص - 11:40 ص', subject: 'الرياضيات', teacher: 'عبدالمجيد صالح' },
  { day: 'الثلاثاء', period: 6, timeRange: '11:40 ص - 12:30 م', subject: 'الأحياء', teacher: 'بدر سعيد' },

  // الأربعاء
  { day: 'الأربعاء', period: 1, timeRange: '7:00 ص - 7:50 ص', subject: 'الرياضيات', teacher: 'عبدالمجيد صالح' },
  { day: 'الأربعاء', period: 2, timeRange: '7:50 ص - 8:40 ص', subject: 'الإنجليزية', teacher: 'عبدالعزيز غرم' },
  { day: 'الأربعاء', period: 3, timeRange: '8:40 ص - 9:30 ص', subject: 'الفيزياء', teacher: 'حسن محمد' },
  { day: 'الأربعاء', period: 4, timeRange: '10:00 ص - 10:50 ص', subject: 'الكفايات اللغوية', teacher: 'محمد حسين' },
  { day: 'الأربعاء', period: 5, timeRange: '10:50 ص - 11:40 ص', subject: 'الكيمياء', teacher: 'حسن عبدالله' },
  { day: 'الأربعاء', period: 6, timeRange: '11:40 ص - 12:30 م', subject: 'الأحياء', teacher: 'بدر سعيد' },

  // الخميس
  { day: 'الخميس', period: 1, timeRange: '7:00 ص - 7:50 ص', subject: 'الأحياء', teacher: 'بدر سعيد' },
  { day: 'الخميس', period: 2, timeRange: '7:50 ص - 8:40 ص', subject: 'التاريخ', teacher: 'علي محمد' },
  { day: 'الخميس', period: 3, timeRange: '8:40 ص - 9:30 ص', subject: 'الكفايات اللغوية', teacher: 'محمد حسين' },
  { day: 'الخميس', period: 4, timeRange: '10:00 ص - 10:50 ص', subject: 'الإنجليزية', teacher: 'عبدالعزيز غرم' },
  { day: 'الخميس', period: 5, timeRange: '10:50 ص - 11:40 ص', subject: 'الكيمياء', teacher: 'حسن عبدالله' },
  { day: 'الخميس', period: 6, timeRange: '11:40 ص - 12:30 م', subject: 'الرياضيات', teacher: 'عبدالمجيد صالح' },
];

export interface ExamItem {
  id: string;
  subject: SaudiSubject; // مادة ثاني ثانوي
  title: string; // عنوان الاختبار (دوري، نهائي، فتري)
  studyDetails: string; // الشيء اللي لازم اذاكره (التفاصيل)
  examDate: string; // يوم الاختبار
  durationMinutes: number; // مدة المذاكرة المقترحة
  points: number; // نقاط الاستعداد
  completed: boolean;
  completedAt?: string;
  dayOfWeek?: string; // اليوم بالجدول (الأحد إلى الخميس)
  periodNumber?: number; // الحصة بالجدول (1 إلى 7)
  color?: TaskColorTheme; // لون الاختبار
}

export interface PrepItem {
  id: string;
  name: string; // الاسم
  description: string; // الوصف
  durationMinutes: number; // كم مدته
  category: 'qudurat' | 'school' | 'competency' | 'general';
  completed: boolean;
  totalTimesPracticed: number;
  pointsReward: number;
  createdAt: string;
}

export interface RewardItem {
  id: string;
  title: string;
  description: string;
  pointsCost: number; // المتاعب / النقاط المطلوبة
  iconName: string;
  category: 'food' | 'rest' | 'gaming' | 'outing' | 'entertainment' | 'custom';
  isCustom: boolean;
  redeemedCount: number;
  createdAt?: string;
}

export interface RedemptionRecord {
  id: string;
  rewardId: string;
  rewardTitle: string;
  pointsSpent: number;
  timestamp: string;
  dateStr: string;
}

export interface PenaltyRecord {
  id: string;
  reason: string;
  pointsDeducted: number;
  dateStr: string;
  timestamp: string;
}

export interface PenaltySettings {
  autoPenaltyEnabled: boolean; // زر تفعيل الخصم التلقائي
  quduratVerbalPenalty: number; // خصم عدم مذاكرة المحاضرة اللفظية
  quduratQuantLessonPenalty: number; // خصم عدم مذاكرة درس الكمي الكامل
  homeworkLatePenalty: number; // خصم تفويت تسليم الواجب
}

export interface DailyReviewRecord {
  id: string;
  dateStr: string; // صيغة YYYY-MM-DD
  dayName: string; // مثل "الأربعاء"
  displayDate?: string; // التاريخ المعروض
  rating: number; // من 1 إلى 5 نجوم
  note: string; // ملاحظة قصيرة عن الإنجاز والمستوى
  tags?: string[]; // وسوم سريعة مثل "تركيز عالي"، "أنجزت الكمي"
  quduratDone: number; // عدد محاضرات القدرات المنجزة لليوم
  quduratTotal: number; // إجمالي المطلوب (6)
  homeworkDone: number; // عدد الواجبات المنجزة
  pointsEarned: number; // إجمالي النقاط المكتسبة لليوم
  createdAt: string; // تاريخ ووقت التسجيل ISO
}

export interface ExamCountdownConfig {
  enabled: boolean;
  examName: string; // مثل "اختبار القدرات العامة (محوسب)"
  examTitle?: string; // اسم الاختبار في نموذج الإعدادات
  targetDate: string; // تاريخ ووقت الاختبار YYYY-MM-DDTHH:mm
  targetScore: string; // النسبة المستهدفة مثل "95+"
  notes?: string; // مقر الاختبار أو ملاحظة
  motivationalNote?: string; // عبارة التحفيز
}

export interface QuduratDailyTarget {
  verbalTarget: number; // الافتراضي: 5 محاضرات
  quantTarget: number; // الافتراضي: 1 درس كامل
  verbalLecturesDaily?: number;
  quantLessonsDaily?: number;
  verbalPoints?: number;
  quantPoints?: number;
}

export type BadgeCategory = 'qudurat' | 'school' | 'streak' | 'points' | 'reviews' | 'rewards';

export interface BadgeItem {
  id: string;
  title: string; // اسم الوسام
  description: string; // شرط فتح الوسام
  iconName: string;
  category: BadgeCategory;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: string;
  pointsReward: number; // نقاط إضافية عند التتويج بالوسام
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // تاريخ آخر نشاط YYYY-MM-DD
  freezesRemaining: number; // عدد مرات حماية الستريك
}

export type NavigationTab = 'qudurat' | 'school' | 'prep' | 'rewards' | 'schedule';

export type QuickTaskCategory = 'general' | 'personal' | 'habit' | 'organize' | 'errand';
export type QuickTaskPriority = 'normal' | 'important' | 'urgent';

export interface QuickTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  category: QuickTaskCategory;
  priority: QuickTaskPriority;
  points: number; // نقاط الإنجاز السريع (الافتراضي 5 نقاط)
}

export type FocusTimerPreset = 'pomodoro' | 'deep_work' | 'sprint' | 'short_break' | 'custom' | 'stopwatch';

export type AmbientSoundType = 'none' | 'rain' | 'whitenoise' | 'forest' | 'alpha_binaural' | 'tick';

export interface FocusSessionLog {
  id: string;
  startedAt: string;
  durationMinutes: number;
  taskTitle: string;
  completed: boolean;
  pointsAwarded: number;
}

import { QuickTask, QuickTaskCategory, QuickTaskPriority, FocusTimerPreset } from '../types';

export const QUICK_TASK_CATEGORIES: { id: QuickTaskCategory; label: string; icon: string; badgeColor: string }[] = [
  { id: 'general', label: 'عام', icon: '📌', badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700' },
  { id: 'personal', label: 'شخصي', icon: '👤', badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800' },
  { id: 'habit', label: 'عادة يومية', icon: '🌱', badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' },
  { id: 'organize', label: 'ترتيب وتنظيم', icon: '🧹', badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800' },
  { id: 'errand', label: 'مشوار وتسوق', icon: '🛍️', badgeColor: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-300 dark:border-sky-800' },
];

export const QUICK_TASK_PRIORITIES: { id: QuickTaskPriority; label: string; colorClass: string }[] = [
  { id: 'normal', label: 'عادية', colorClass: 'text-slate-500' },
  { id: 'important', label: 'مهمة', colorClass: 'text-amber-600 font-bold' },
  { id: 'urgent', label: 'عاجلة', colorClass: 'text-rose-600 font-extrabold' },
];

export const QUICK_TASK_SUGGESTIONS = [
  { title: 'شرب 2 لتر ماء على مدار اليوم 💧', category: 'habit' as QuickTaskCategory },
  { title: 'ترتيب طاولة المذاكرة وتنظيم الكتب 🧹', category: 'organize' as QuickTaskCategory },
  { title: 'تجهيز حقيبة المدرسة وزي الغد 🎒', category: 'personal' as QuickTaskCategory },
  { title: 'مشي خفيف 15 دقيقة لتجديد الطاقة 👟', category: 'habit' as QuickTaskCategory },
  { title: 'إيقاف إشعارات الجوال أثناء جلسة القدرات 📵', category: 'habit' as QuickTaskCategory },
  { title: 'تهوية غرفة المذاكرة وتعديل الإضاءة 🪟', category: 'organize' as QuickTaskCategory },
  { title: 'نوم مبكر قبل الساعة 11 مساءً 🌙', category: 'habit' as QuickTaskCategory },
];

export const FOCUS_TIMER_PRESETS: { id: FocusTimerPreset; label: string; minutes: number; icon: string; desc: string }[] = [
  { id: 'pomodoro', label: 'بومودورو', minutes: 25, icon: '🍅', desc: '25 دقيقة تركيز تام يعقبها استراحة' },
  { id: 'deep_work', label: 'جلسة عميقة', minutes: 50, icon: '⚡', desc: '50 دقيقة استغراق كامل لدروس الكمي' },
  { id: 'sprint', label: 'إنجاز سريع', minutes: 15, icon: '🚀', desc: '15 دقيقة لإنهاء مهمة محددة أو مراجعة سريعة' },
  { id: 'short_break', label: 'استراحة قصيرة', minutes: 5, icon: '☕', desc: '5 دقائق استرخاء وشرب ماء' },
  { id: 'custom', label: 'مخصص', minutes: 30, icon: '⚙️', desc: 'حدد الدقائق بنفسك بحرية' },
  { id: 'stopwatch', label: 'ساعة إيقاف', minutes: 0, icon: '⏱️', desc: 'مؤقت تصاعدي مفتوح لحساب وقت دراستك' },
];

export const MOTIVATIONAL_FOCUS_QUOTES = [
  'التفوق ليس ضربة حظ، بل عادة يومية تُبنى دقيقة بدقيقة 🌟',
  'كل مسألة كمي تفهمها اليوم تقربك من الـ 95+ بإذن الله 📐',
  'أغلق مشتتاتك الآن، واحتفل بنتيجة تعبك قريباً 🎯',
  'الجهد الخفي الذي تبذله في غرفتك هو سر تميزك في قاعة الاختبار ✨',
  'ابدأ بما هو ضروري، ثم ما هو ممكن، لتجد نفسك تصنع المستحيل 🚀',
  'أنت قادر على حصد الدرجة التي تطمح إليها بالاستمرار والدعاء 🤲',
  'جلسة تركيز واحدة صافية تعادل ساعات من المذاكرة المشتتة 💡',
];

/**
 * Add a new quick task
 */
export function addQuickTask(
  tasks: QuickTask[],
  title: string,
  category: QuickTaskCategory = 'general',
  priority: QuickTaskPriority = 'normal',
  points: number = 5
): { updatedTasks: QuickTask[]; newTask: QuickTask | null; error?: string } {
  const trimmed = title.trim();
  if (!trimmed) {
    return { updatedTasks: tasks, newTask: null, error: 'يرجى كتابة عنوان للمهمة السريعة' };
  }

  const newTask: QuickTask = {
    id: `qtask_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: trimmed,
    completed: false,
    createdAt: new Date().toISOString(),
    category,
    priority,
    points: Math.max(1, points),
  };

  return {
    updatedTasks: [newTask, ...tasks],
    newTask,
  };
}

/**
 * Toggle quick task completion
 */
export function toggleQuickTask(
  tasks: QuickTask[],
  id: string
): { updatedTasks: QuickTask[]; toggledTask: QuickTask | null; isCompleted: boolean; pointsDelta: number } {
  let toggledTask: QuickTask | null = null;
  let isCompleted = false;
  let pointsDelta = 0;

  const updatedTasks = tasks.map((t) => {
    if (t.id === id) {
      const nextCompleted = !t.completed;
      isCompleted = nextCompleted;
      pointsDelta = nextCompleted ? t.points : -t.points;
      toggledTask = {
        ...t,
        completed: nextCompleted,
        completedAt: nextCompleted ? new Date().toISOString() : undefined,
      };
      return toggledTask;
    }
    return t;
  });

  return { updatedTasks, toggledTask, isCompleted, pointsDelta };
}

/**
 * Delete a quick task
 */
export function deleteQuickTask(tasks: QuickTask[], id: string): QuickTask[] {
  return tasks.filter((t) => t.id !== id);
}

/**
 * Clear all completed quick tasks
 */
export function clearCompletedQuickTasks(tasks: QuickTask[]): { updatedTasks: QuickTask[]; removedCount: number } {
  const remaining = tasks.filter((t) => !t.completed);
  return {
    updatedTasks: remaining,
    removedCount: tasks.length - remaining.length,
  };
}

/**
 * Filter quick tasks
 */
export function filterQuickTasks(
  tasks: QuickTask[],
  filter: 'all' | 'pending' | 'completed',
  categoryFilter: string = 'all'
): QuickTask[] {
  return tasks.filter((t) => {
    // Status filter
    if (filter === 'pending' && t.completed) return false;
    if (filter === 'completed' && !t.completed) return false;
    // Category filter
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    return true;
  });
}

/**
 * Summary stats for quick tasks
 */
export function calculateQuickTasksSummary(tasks: QuickTask[]) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const rate = total === 0 ? 0 : Math.round((completed / total) * 100);
  const totalEarnedPoints = tasks.filter((t) => t.completed).reduce((sum, t) => sum + t.points, 0);

  return {
    total,
    completed,
    pending,
    rate,
    totalEarnedPoints,
  };
}

/**
 * Format seconds to MM:SS string
 */
export function formatTimeMMSS(totalSeconds: number): string {
  const mins = Math.floor(Math.max(0, totalSeconds) / 60);
  const secs = Math.floor(Math.max(0, totalSeconds) % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get initial duration in seconds for a preset
 */
export function getPresetDurationSeconds(preset: FocusTimerPreset, customMinutes: number = 30): number {
  switch (preset) {
    case 'pomodoro':
      return 25 * 60;
    case 'deep_work':
      return 50 * 60;
    case 'sprint':
      return 15 * 60;
    case 'short_break':
      return 5 * 60;
    case 'custom':
      return Math.max(1, customMinutes) * 60;
    case 'stopwatch':
      return 0;
    default:
      return 25 * 60;
  }
}

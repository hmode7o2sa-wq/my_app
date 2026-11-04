import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Sparkles,
  Zap,
  ChevronDown,
  ChevronUp,
  Focus,
  ListTodo,
} from 'lucide-react';
import { QuickTask, QuickTaskCategory, QuickTaskPriority } from '../types';
import {
  QUICK_TASK_CATEGORIES,
  QUICK_TASK_PRIORITIES,
  QUICK_TASK_SUGGESTIONS,
  addQuickTask,
  filterQuickTasks,
  calculateQuickTasksSummary,
} from '../utils/quickTasksAndFocusLogic';

interface QuickTasksWidgetProps {
  tasks: QuickTask[];
  onToggleTask: (id: string) => void;
  onAddTask: (title: string, category: QuickTaskCategory, priority: QuickTaskPriority) => void;
  onDeleteTask: (id: string) => void;
  onClearCompleted: () => void;
  onOpenFocusMode?: () => void;
}

export const QuickTasksWidget: React.FC<QuickTasksWidgetProps> = ({
  tasks,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onClearCompleted,
  onOpenFocusMode,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<QuickTaskCategory>('general');
  const [selectedPriority, setSelectedPriority] = useState<QuickTaskPriority>('normal');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [inputError, setInputError] = useState<string | null>(null);

  const summary = calculateQuickTasksSummary(tasks);
  const filteredTasks = filterQuickTasks(tasks, activeFilter, selectedCategoryFilter);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setInputError('يرجى كتابة عنوان للمهمة السريعة');
      return;
    }
    setInputError(null);
    onAddTask(newTitle, selectedCategory, selectedPriority);
    setNewTitle('');
  };

  const handleAddSuggestion = (suggestion: { title: string; category: QuickTaskCategory }) => {
    onAddTask(suggestion.title, suggestion.category, 'normal');
  };

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xs transition-all">
      {/* Widget Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
            <Zap className="w-5 h-5 fill-white text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                المهام السريعة اليومية
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800">
                {summary.completed}/{summary.total} منجز
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              مهام يومية بسيطة وغير دراسية لرفع إنتاجيتك واكتساب +5 نقاط لكل إنجاز ⚡
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          {onOpenFocusMode && (
            <button
              onClick={onOpenFocusMode}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-transform active:scale-95"
              title="دخول وضع التركيز والمؤقت"
            >
              <Focus className="w-3.5 h-3.5" />
              <span>وضع التركيز 🎯</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={isExpanded ? 'طي المهام السريعة' : 'توسيع المهام السريعة'}
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-600 dark:text-slate-400">
                نسبة إنجاز مهام اليوم
              </span>
              <span className="font-extrabold text-amber-600 dark:text-amber-400">
                {summary.rate}% ({summary.completed} من {summary.total})
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${summary.rate}%` }}
              />
            </div>
          </div>

          {/* Quick Suggestions Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              اقتراحات سريعة للإضافة بنقرة واحدة:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TASK_SUGGESTIONS.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddSuggestion(sug)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800/80 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-300 hover:text-amber-800 dark:hover:text-amber-300 border border-slate-200 dark:border-slate-700 hover:border-amber-300 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Plus className="w-3 h-3 text-amber-500" />
                  <span>{sug.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Add Task Form */}
          <form onSubmit={handleFormSubmit} className="space-y-2.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => {
                  setNewTitle(e.target.value);
                  if (inputError) setInputError(null);
                }}
                placeholder="أضف مهمة سريعة جديدة (مثل: شرب 2 لتر ماء، ترتيب المكتب، شراء قلم...)"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 transition-all"
              />

              <div className="flex items-center gap-2">
                {/* Category select */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as QuickTaskCategory)}
                  className="px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  aria-label="تصنيف المهمة السريعة"
                >
                  {QUICK_TASK_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>

                {/* Priority select */}
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value as QuickTaskPriority)}
                  className="px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  aria-label="أولوية المهمة"
                >
                  {QUICK_TASK_PRIORITIES.map((pr) => (
                    <option key={pr.id} value={pr.id}>
                      {pr.label}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة</span>
                </button>
              </div>
            </div>

            {inputError && (
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400 animate-in fade-in">
                ⚠️ {inputError}
              </p>
            )}
          </form>

          {/* Filter Bar & Clear Completed */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === 'all'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                الكل ({summary.total})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('pending')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === 'pending'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                المتبقية ({summary.pending})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('completed')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === 'completed'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                المكتملة ({summary.completed})
              </button>
            </div>

            {summary.completed > 0 && (
              <button
                type="button"
                onClick={onClearCompleted}
                className="text-xs font-bold text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                title="مسح كافة المهام المكتملة"
              >
                مسح المكتملة 🧹
              </button>
            )}
          </div>

          {/* Tasks List */}
          <div className="space-y-2">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                <ListTodo className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-1" />
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {activeFilter === 'completed'
                    ? 'لا توجد مهام مكتملة حتى الآن. ابدأ بإنجاز مهامك السريعة!'
                    : activeFilter === 'pending'
                    ? 'رائع! لا توجد مهام معلقة، لقد أنجزت جميع المهام السريعة 🎉'
                    : 'لا توجد مهام سريعة مضافة. استخدم مربع الإدخال أو الاقتراحات أعلاه!'}
                </p>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const categoryConfig = QUICK_TASK_CATEGORIES.find((c) => c.id === task.category) || QUICK_TASK_CATEGORIES[0];
                const priorityConfig = QUICK_TASK_PRIORITIES.find((p) => p.id === task.priority) || QUICK_TASK_PRIORITIES[0];

                return (
                  <div
                    key={task.id}
                    className={`group flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all ${
                      task.completed
                        ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-80'
                        : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 hover:border-amber-400 shadow-2xs'
                    }`}
                  >
                    {/* Checkbox and Title */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => onToggleTask(task.id)}
                        className="text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors shrink-0"
                        aria-label={task.completed ? `إلغاء إنجاز ${task.title}` : `إنجاز ${task.title}`}
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-xs sm:text-sm font-semibold truncate transition-all ${
                            task.completed
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-800 dark:text-slate-100'
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {/* Category Badge */}
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md text-[10px] font-bold border ${categoryConfig.badgeColor}`}
                          >
                            <span>{categoryConfig.icon}</span>
                            <span>{categoryConfig.label}</span>
                          </span>

                          {/* Priority */}
                          {task.priority !== 'normal' && (
                            <span className={`text-[10px] ${priorityConfig.colorClass}`}>
                              {priorityConfig.label}
                            </span>
                          )}

                          {/* Points tag */}
                          <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" />
                            +{task.points} ن
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Delete action */}
                    <button
                      type="button"
                      onClick={() => onDeleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                      title="حذف المهمة السريعة"
                      aria-label={`حذف ${task.title}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </section>
  );
};

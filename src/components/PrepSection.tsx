import React, { useState } from 'react';
import {
  Plus,
  Clock,
  Sparkles,
  Play,
  CheckCircle2,
  Trash2,
  Calendar,
  Layers,
  BookOpen,
  Award,
  AlertCircle,
  X,
} from 'lucide-react';
import { PrepItem } from '../types';
import { formatDurationInArabic } from '../utils/studyLogic';

interface PrepSectionProps {
  preps: PrepItem[];
  onAddPrep: (prep: Omit<PrepItem, 'id' | 'createdAt' | 'completed' | 'totalTimesPracticed' | 'pointsReward'>) => void;
  onDeletePrep: (id: string) => void;
  onCompletePrepSession: (prepId: string) => void;
  onStartTimer: (prep: PrepItem) => void;
  onNavigateToRewards: () => void;
}

export const PrepSection: React.FC<PrepSectionProps> = ({
  preps,
  onAddPrep,
  onDeletePrep,
  onCompletePrepSession,
  onStartTimer,
  onNavigateToRewards,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [category, setCategory] = useState<'qudurat' | 'school' | 'competency' | 'general'>('qudurat');
  const [formError, setFormError] = useState('');

  const quickDurationPresets = [15, 25, 30, 45, 60, 90, 120];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('يرجى إدخال اسم الاستعداد أو الاختبار');
      return;
    }
    if (!durationMinutes || durationMinutes <= 0) {
      setFormError('يرجى تحديد مدة الاستعداد بالدقائق');
      return;
    }

    onAddPrep({
      name: name.trim(),
      description: description.trim() || 'جلسة استعداد ومذاكرة مخصصة',
      durationMinutes: Number(durationMinutes),
      category,
    });

    setName('');
    setDescription('');
    setDurationMinutes(30);
    setCategory('qudurat');
    setFormError('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header with Title and Big '+' Customization Button */}
      <div className="bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 dark:from-slate-950 dark:via-indigo-950 dark:to-black rounded-3xl p-5 sm:p-7 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-violet-900/30">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-violet-200 border border-white/15 text-xs font-semibold">
            <Layers className="w-3.5 h-3.5 text-violet-300" />
            <span>تخصيص جلسات الاستعداد والاختبارات</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            الاستعدادات والاختبارات
          </h2>
          <p className="text-sm text-violet-100/90 leading-relaxed">
            خصص جلساتك واختباراتك بسهولة عبر زر <strong>'+'</strong>: حدد الاسم والوصف والمدة، وابدأ مؤقت التركيز مع تنبيهات واكسب النقاط!
          </p>
        </div>

        {/* Big '+' Add Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 shrink-0"
          aria-label="إضافة استعداد جديد"
        >
          <div className="w-6 h-6 rounded-lg bg-slate-950/20 flex items-center justify-center">
            <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
          </div>
          <span>إضافة استعداد جديد (+)</span>
        </button>
      </div>

      {/* Preps Grid / Empty State */}
      <div>
        {preps.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
              <Layers className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-800 dark:text-white">
                لا توجد استعدادات مخصصة حتى الآن
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                اضغط على زر '+' بالأعلى لإضافة جلسة استعدادك أو اختبارك القادم بالاسم والوصف والمدة.
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-sm hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة أول استعداد الآن</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {preps.map((prep) => {
              const categoryBadge =
                prep.category === 'qudurat'
                  ? { label: 'استعداد قدرات', color: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800' }
                  : prep.category === 'competency'
                  ? { label: 'كفاءة مدرسية', color: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800' }
                  : prep.category === 'school'
                  ? { label: 'مذاكرة مادة', color: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800' }
                  : { label: 'استعداد عام', color: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700' };

              return (
                <div
                  key={prep.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group"
                >
                  <div className="space-y-3">
                    {/* Top Row: Category, Duration & Delete */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${categoryBadge.color}`}
                      >
                        {categoryBadge.label}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 text-xs font-extrabold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{formatDurationInArabic(prep.durationMinutes)}</span>
                        </span>

                        <button
                          onClick={() => {
                            if (window.confirm(`هل أنت متأكد من حذف استعداد "${prep.name}"؟`)) {
                              onDeletePrep(prep.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="حذف الاستعداد"
                          aria-label={`حذف ${prep.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Name & Description */}
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {prep.name}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-1 line-clamp-3">
                        {prep.description}
                      </p>
                    </div>

                    {/* Practice stats & points tag */}
                    <div className="flex items-center justify-between text-xs pt-1 text-slate-500 dark:text-slate-400">
                      <span>تكرار التدريب: {prep.totalTimesPracticed} مرات</span>
                      <span className="font-extrabold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                        +{prep.pointsReward} نقطة
                      </span>
                    </div>
                  </div>

                  {/* Actions: Start Live Timer & Quick Complete */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <button
                      onClick={() => onStartTimer(prep)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>بدء مؤقت المذاكرة</span>
                    </button>

                    <button
                      onClick={() => onCompletePrepSession(prep.id)}
                      className="flex items-center justify-center p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors text-xs font-bold"
                      title="تم إنجاز الجلسة الآن وإضافة النقاط"
                      aria-label="تسجيل إنجاز الجلسة"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Custom Prep Modal */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto dir-rtl text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>تخصيص استعداد أو اختبار جديد</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  اسم الاستعداد أو الاختبار <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: محاكاة قياس كاملة، مراجعة قوانين نيوتن..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">الوصف والتفاصيل</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium resize-none"
                  placeholder="حدد أهداف الجلسة، رقم النموذج، أو الفصول التي ستراجعها..."
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">تصنيف الاستعداد</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="qudurat">استعداد اختبار القدرات العامة</option>
                  <option value="school">مذاكرة مادة دراسية (ثاني ثانوي)</option>
                  <option value="competency">استعداد الكفاءة المدرسية</option>
                  <option value="general">استعداد عام ومراجعة حرة</option>
                </select>
              </div>

              {/* Duration with quick presets */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  المدة بالدقائق (كم مدته) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="5"
                  max="360"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold"
                  required
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {quickDurationPresets.map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setDurationMinutes(preset)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        durationMinutes === preset
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {preset} دقيقة
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-black shadow-md hover:bg-indigo-700"
                >
                  حفظ الاستعداد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

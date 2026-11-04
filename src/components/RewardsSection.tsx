import React, { useState } from 'react';
import {
  Gift,
  Sparkles,
  Plus,
  CheckCircle2,
  Lock,
  Coffee,
  Tv,
  Gamepad2,
  Utensils,
  Moon,
  Clock,
  Heart,
  Music,
  ShoppingBag,
  Flame,
  Award,
  History,
  X,
  AlertCircle,
  ShieldAlert,
  Sliders,
  MinusCircle,
  Check,
  Edit2,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RewardItem, RedemptionRecord, PenaltyRecord, PenaltySettings } from '../types';
import { calculateLevel, canRedeemReward } from '../utils/studyLogic';

interface RewardsSectionProps {
  totalPoints: number;
  rewards: RewardItem[];
  redemptions: RedemptionRecord[];
  penalties: PenaltyRecord[];
  penaltySettings: PenaltySettings;
  onRedeemReward: (reward: RewardItem) => void;
  onAddCustomReward: (reward: Omit<RewardItem, 'id' | 'redeemedCount' | 'isCustom'>) => void;
  onUpdatePenaltySettings: (settings: PenaltySettings) => void;
  onApplyManualPenalty: () => void;
  onDeleteReward?: (id: string) => void;
  onUpdateReward?: (reward: RewardItem) => void;
}

export const RewardsSection: React.FC<RewardsSectionProps> = ({
  totalPoints,
  rewards,
  redemptions,
  penalties,
  penaltySettings,
  onRedeemReward,
  onAddCustomReward,
  onUpdatePenaltySettings,
  onApplyManualPenalty,
  onDeleteReward,
  onUpdateReward,
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'penalties' | 'history'>('catalog');
  const [filterCustom, setFilterCustom] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<RewardItem | null>(null);
  const [lastRedeemed, setLastRedeemed] = useState<RewardItem | null>(null);

  // Add Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pointsCost, setPointsCost] = useState<number>(60);
  const [iconName, setIconName] = useState<string>('Gift');
  const [category, setCategory] = useState<'food' | 'rest' | 'gaming' | 'outing' | 'custom'>('custom');
  const [formError, setFormError] = useState('');

  // Edit Form state
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPointsCost, setEditPointsCost] = useState<number>(60);
  const [editIconName, setEditIconName] = useState<string>('Gift');
  const [editFormError, setEditFormError] = useState('');

  const levelInfo = calculateLevel(totalPoints);

  const iconMap: Record<string, any> = {
    Coffee,
    Tv,
    Gamepad2,
    Utensils,
    Moon,
    Sparkles,
    Gift,
    Heart,
    Music,
    ShoppingBag,
    Award,
  };

  const getIcon = (name: string) => {
    return iconMap[name] || Gift;
  };

  const handleOpenEdit = (reward: RewardItem) => {
    setEditingReward(reward);
    setEditTitle(reward.title);
    setEditDescription(reward.description);
    setEditPointsCost(reward.pointsCost);
    setEditIconName(reward.iconName);
    setEditFormError('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      setEditFormError('يرجى إدخال اسم المكافأة');
      return;
    }
    if (!editPointsCost || editPointsCost <= 0) {
      setEditFormError('يرجى تحديد النقاط المطلوبة');
      return;
    }

    if (editingReward && onUpdateReward) {
      onUpdateReward({
        ...editingReward,
        title: editTitle.trim(),
        description: editDescription.trim(),
        pointsCost: Number(editPointsCost),
        iconName: editIconName,
      });
    }
    setEditingReward(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف المكافأة "${name}"؟`)) {
      if (onDeleteReward) {
        onDeleteReward(id);
      }
    }
  };

  const handleRedeem = (reward: RewardItem) => {
    if (!canRedeemReward(totalPoints, reward.pointsCost)) return;

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // safe fallback
    }

    onRedeemReward(reward);
    setLastRedeemed(reward);
  };

  const handleSubmitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('يرجى إدخال اسم المكافأة');
      return;
    }
    if (!pointsCost || pointsCost <= 0) {
      setFormError('يرجى تحديد النقاط المطلوبة للمكافأة (المتاعب)');
      return;
    }

    onAddCustomReward({
      title: title.trim(),
      description: description.trim() || 'مكافأة خاصة بي بعد التعب والمذاكرة',
      pointsCost: Number(pointsCost),
      iconName,
      category,
    });

    setTitle('');
    setDescription('');
    setPointsCost(60);
    setIconName('Gift');
    setFormError('');
    setIsAddModalOpen(false);
  };

  const filteredRewards = filterCustom
    ? rewards.filter((r) => r.isCustom)
    : rewards;

  return (
    <div className="space-y-6 pb-20">
      {/* Hero Wallet Card */}
      <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 dark:from-amber-600 dark:via-amber-700 dark:to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 text-amber-100 text-xs font-semibold backdrop-blur-xs">
              <Gift className="w-3.5 h-3.5" />
              <span>نظام التحفيز والنقاط والمكافآت والخصم</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              التحكم في المكافآت ونقاط الخصم
            </h2>
            <p className="text-sm text-amber-50/90 leading-relaxed max-w-xl">
              أنت تتحكم في كل شيء: رصيد النقاط، حذف وتعديل المكافآت، وزر تفعيل الخصم التلقائي عند عدم المذاكرة.
            </p>
          </div>

          {/* Points & Level Box */}
          <div className="bg-black/25 backdrop-blur-md border border-white/25 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center min-w-[220px] text-center shadow-lg">
            <span className="text-xs text-amber-200 font-bold mb-1">
              رصيدك الحالي المتاح للاستبدال
            </span>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
              <span className="text-4xl font-black tracking-tight text-white">
                {totalPoints}
              </span>
              <span className="text-sm font-bold text-amber-200">نقطة</span>
            </div>
            <div className="mt-2 pt-2 border-t border-white/15 w-full text-xs text-amber-100 flex items-center justify-between">
              <span>{levelInfo.title}</span>
              <span className="font-extrabold text-amber-300">مستوى {levelInfo.level}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Just-Redeemed Modal/Banner */}
      {lastRedeemed && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20">
                تم الاستبدال بنجاح! 🎉
              </span>
              <h4 className="text-base sm:text-lg font-black text-white mt-0.5">
                استمتع بـ: {lastRedeemed.title} (خصم {lastRedeemed.pointsCost} نقطة)
              </h4>
            </div>
          </div>
          <button
            onClick={() => setLastRedeemed(null)}
            className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold"
          >
            حسناً، رائع
          </button>
        </div>
      )}

      {/* Navigation Tabs: متجر المكافآت | نظام الخصم والعقوبات | سجل الاستبدال */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 p-1 bg-slate-200/80 dark:bg-slate-800/80 rounded-2xl border border-slate-300 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'catalog'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            كافيه المكافآت ({rewards.length})
          </button>

          <button
            onClick={() => setActiveTab('penalties')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'penalties'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>نظام الخصم والتحكم</span>
            {penalties.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-800 text-rose-100">
                {penalties.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>سجل الاستبدال ({redemptions.length})</span>
          </button>
        </div>

        {activeTab === 'catalog' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs sm:text-sm shadow-md transition-transform hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>إضافة مكافأة مخصصة (+)</span>
          </button>
        )}
      </div>

      {/* VIEW 1: REWARDS CATALOG */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRewards.map((reward) => {
            const Icon = getIcon(reward.iconName);
            const canAfford = canRedeemReward(totalPoints, reward.pointsCost);
            const pointsNeeded = reward.pointsCost - totalPoints;

            return (
              <div
                key={reward.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl border p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${
                  canAfford
                    ? 'border-amber-200 dark:border-amber-900/60 ring-1 ring-amber-100 dark:ring-amber-950'
                    : 'border-slate-200 dark:border-slate-800 opacity-90'
                }`}
              >
                <div className="space-y-3">
                  {/* Top row: Icon, Edit/Delete, & Points Cost Badge */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        canAfford
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEdit(reward)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                        title="تعديل المكافأة"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(reward.id, reward.title)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        title="حذف المكافأة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl font-black text-sm ${
                          canAfford
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{reward.pointsCost} نقطة</span>
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {reward.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
                      {reward.description}
                    </p>
                  </div>

                  {/* Redeemed counter */}
                  {reward.redeemedCount > 0 && (
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>تم استبدالها {reward.redeemedCount} مرة</span>
                    </div>
                  )}
                </div>

                {/* Redeem Action Button */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    disabled={!canAfford}
                    onClick={() => handleRedeem(reward)}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                      canAfford
                        ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-200 dark:shadow-none active:scale-95'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? (
                      <>
                        <Gift className="w-4 h-4" />
                        <span>استبدال المكافأة الآن</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>تحتاج {pointsNeeded} نقطة إضافية</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: PENALTIES & DEDUCTIONS CONTROL */}
      {activeTab === 'penalties' && (
        <div className="space-y-6">
          {/* Penalty Rules Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/50 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    التحكم في إعدادات الخصم التلقائي
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    أنت تحدد قيمة الخصم وتفعل أو تعطل الخصم التلقائي بضغطة زر
                  </p>
                </div>
              </div>

              {/* Master Auto-Penalty Button */}
              <button
                onClick={() =>
                  onUpdatePenaltySettings({
                    ...penaltySettings,
                    autoPenaltyEnabled: !penaltySettings.autoPenaltyEnabled,
                  })
                }
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all shadow-sm ${
                  penaltySettings.autoPenaltyEnabled
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full ${
                    penaltySettings.autoPenaltyEnabled ? 'bg-white animate-ping' : 'bg-slate-400'
                  }`}
                />
                <span>
                  {penaltySettings.autoPenaltyEnabled
                    ? 'الخصم التلقائي: مفعّل (انقر للتعطيل)'
                    : 'الخصم التلقائي: معطّل (انقر للتفعيل)'}
                </span>
              </button>
            </div>

            {/* Configurable values */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    خصم المحاضرة اللفظية (قدرات)
                  </span>
                  <span className="text-xs font-black text-rose-600">
                    -{penaltySettings.quduratVerbalPenalty} نقطة
                  </span>
                </div>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={penaltySettings.quduratVerbalPenalty}
                  onChange={(e) =>
                    onUpdatePenaltySettings({
                      ...penaltySettings,
                      quduratVerbalPenalty: Math.max(1, Number(e.target.value)),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  يخصم عند عدم إنجاز أي من محاضرات اللفظي الـ 5 المقررة.
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    خصم درس الكمي الكامل (قدرات)
                  </span>
                  <span className="text-xs font-black text-rose-600">
                    -{penaltySettings.quduratQuantLessonPenalty} نقطة
                  </span>
                </div>
                <input
                  type="number"
                  min="10"
                  max="200"
                  value={penaltySettings.quduratQuantLessonPenalty}
                  onChange={(e) =>
                    onUpdatePenaltySettings({
                      ...penaltySettings,
                      quduratQuantLessonPenalty: Math.max(1, Number(e.target.value)),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  يخصم عند تفويت درس الكمي الكامل لليوم.
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    خصم تفويت واجب مدرسي
                  </span>
                  <span className="text-xs font-black text-rose-600">
                    -{penaltySettings.homeworkLatePenalty} نقطة
                  </span>
                </div>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={penaltySettings.homeworkLatePenalty}
                  onChange={(e) =>
                    onUpdatePenaltySettings({
                      ...penaltySettings,
                      homeworkLatePenalty: Math.max(1, Number(e.target.value)),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  يخصم عند التأخر عن تسليم الواجب أو عدم حله.
                </span>
              </div>
            </div>

            {/* Apply Manual Penalty Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-rose-50/70 dark:bg-rose-950/40 p-4 rounded-2xl border border-rose-200 dark:border-rose-800">
              <div className="space-y-0.5 text-right w-full sm:w-auto">
                <span className="text-xs font-bold text-rose-900 dark:text-rose-200 block">
                  تطبيق الخصم فوراً على المهام المتبقية اليوم
                </span>
                <span className="text-[11px] text-rose-700 dark:text-rose-300 block">
                  يفحص المحاضرات والدروس التي لم تنجز ويخصم نقاطها بحسب إعداداتك.
                </span>
              </div>
              <button
                onClick={onApplyManualPenalty}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 shrink-0"
              >
                تطبيق الخصم الآن ⚠️
              </button>
            </div>
          </div>

          {/* Penalties History Log */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4">
            <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <MinusCircle className="w-4 h-4 text-rose-600" />
              <span>سجل الخصومات المنفذة</span>
            </h4>

            {penalties.length === 0 ? (
              <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
                سجلك نظيف تماماً! لم يتم تطبيق أي خصم بعد. واصل التزامك! 🌟
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {penalties.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex items-center justify-center font-black">
                        -
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-slate-900 dark:text-white">{item.reason}</h5>
                        <span className="text-[11px] text-slate-400">{item.dateStr}</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-lg">
                      -{item.pointsDeducted} نقطة
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: REDEMPTION HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-4 h-4 text-amber-600" />
            <span>سجل المكافآت التي تم فتحها</span>
          </h3>

          {redemptions.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-xs">
              لم تقم باستبدال أي مكافأة بعد. أنجز محاضراتك وافتح مكافأتك الأولى!
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {redemptions.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 flex items-center justify-center">
                      <Gift className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-900 dark:text-white">{item.rewardTitle}</h5>
                      <span className="text-[11px] text-slate-400">{item.dateStr}</span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-lg">
                    -{item.pointsSpent} نقطة
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: ADD CUSTOM REWARD */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto dir-rtl text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-500" />
                <span>إضافة مكافأة مخصصة بك</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitCustom} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  اسم المكافأة <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: طلب عشاء شاورما، شراء كتاب جديد..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">الوصف</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium resize-none"
                  placeholder="تفاصيل المكافأة والشعور بالإنجاز..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  النقاط المطلوبة (المتاعب المقابلة) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="20"
                  max="1000"
                  value={pointsCost}
                  onChange={(e) => setPointsCost(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold"
                  required
                />
                <div className="flex gap-2 pt-1">
                  {[40, 60, 80, 100, 150, 200].map((pts) => (
                    <button
                      type="button"
                      key={pts}
                      onClick={() => setPointsCost(pts)}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      {pts} نقطة
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">اختر أيقونة المكافأة</label>
                <div className="flex flex-wrap gap-2">
                  {['Gift', 'Coffee', 'Tv', 'Gamepad2', 'Utensils', 'Moon', 'Sparkles', 'Heart', 'Music', 'ShoppingBag'].map(
                    (icName) => {
                      const Ic = getIcon(icName);
                      return (
                        <button
                          type="button"
                          key={icName}
                          onClick={() => setIconName(icName)}
                          className={`p-2.5 rounded-xl border transition-all ${
                            iconName === icName
                              ? 'bg-amber-100 dark:bg-amber-950 border-amber-500 text-amber-800 dark:text-amber-200 scale-105'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          <Ic className="w-4 h-4" />
                        </button>
                      );
                    }
                  )}
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
                  className="px-5 py-2 rounded-xl bg-amber-500 text-white text-xs font-black shadow-md hover:bg-amber-600"
                >
                  حفظ المكافأة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT REWARD MODAL (تعديل المكافأة) */}
      {editingReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto dir-rtl text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-500" />
                <span>تعديل المكافأة: {editingReward.title}</span>
              </h3>
              <button
                onClick={() => setEditingReward(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editFormError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{editFormError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  اسم المكافأة <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">الوصف</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  النقاط المطلوبة للاستبدال <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={editPointsCost}
                  onChange={(e) => setEditPointsCost(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold"
                  required
                />
              </div>

              {/* Icon selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">اختر أيقونة المكافأة</label>
                <div className="flex flex-wrap gap-2">
                  {['Gift', 'Coffee', 'Tv', 'Gamepad2', 'Utensils', 'Moon', 'Sparkles', 'Heart', 'Music', 'ShoppingBag'].map(
                    (icName) => {
                      const Ic = getIcon(icName);
                      return (
                        <button
                          type="button"
                          key={icName}
                          onClick={() => setEditIconName(icName)}
                          className={`p-2.5 rounded-xl border transition-all ${
                            editIconName === icName
                              ? 'bg-amber-100 dark:bg-amber-950 border-amber-500 text-amber-800 dark:text-amber-200 scale-105'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          <Ic className="w-4 h-4" />
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingReward(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-black shadow-md hover:bg-indigo-700"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

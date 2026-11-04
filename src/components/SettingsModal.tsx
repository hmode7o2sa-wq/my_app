import React, { useState } from 'react';
import {
  X,
  Settings,
  ShieldAlert,
  Sparkles,
  RotateCcw,
  Bell,
  Trash2,
  Check,
  Download,
  Upload,
  Brain,
  Calculator,
  AlertTriangle,
  Info,
  Sun,
  Moon,
  Laptop,
  Palette,
  Calendar,
  Clock,
  Target,
  Timer,
  BookOpen,
  Edit3,
} from 'lucide-react';
import { PenaltySettings, ExamCountdownConfig, QuduratDailyTarget, TimetableSlot, SAUDI_SECONDARY_2_SUBJECTS, SaudiSubject } from '../types';
import { validateAndParseBackupJson } from '../utils/streakAndBadgesLogic';

export type AppTheme = 'light' | 'dark' | 'system';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  penaltySettings: PenaltySettings;
  onUpdatePenaltySettings: (settings: PenaltySettings) => void;
  onApplyManualPenalty: () => void;
  onResetLectures: () => void;
  totalPoints: number;
  onResetAllData?: () => void;
  currentTheme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
  examCountdown: ExamCountdownConfig;
  onUpdateExamCountdown: (config: ExamCountdownConfig) => void;
  quduratTarget: QuduratDailyTarget;
  onUpdateQuduratTarget: (target: QuduratDailyTarget) => void;
  timetableSlots?: TimetableSlot[];
  onUpdateTimetableSlot?: (slot: TimetableSlot) => void;
  onImportBackupData?: (data: any) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  penaltySettings,
  onUpdatePenaltySettings,
  onApplyManualPenalty,
  onResetLectures,
  totalPoints,
  onResetAllData,
  currentTheme,
  onThemeChange,
  examCountdown,
  onUpdateExamCountdown,
  quduratTarget,
  onUpdateQuduratTarget,
  timetableSlots = [],
  onUpdateTimetableSlot,
  onImportBackupData,
}) => {
  const [activeTab, setActiveTab] = useState<'penalties' | 'study' | 'timetable' | 'theme' | 'notifications' | 'data'>('penalties');
  const [tempSettings, setTempSettings] = useState<PenaltySettings>(penaltySettings);
  const [tempExamCountdown, setTempExamCountdown] = useState<ExamCountdownConfig>(examCountdown);
  const [tempQuduratTarget, setTempQuduratTarget] = useState<QuduratDailyTarget>(quduratTarget);
  
  // Timetable editing state
  const [selectedTimetableDay, setSelectedTimetableDay] = useState<number>(0); // 0 = Sunday
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState<string>('');
  const [editTeacher, setEditTeacher] = useState<string>('');
  const [editStartTime, setEditStartTime] = useState<string>('');
  const [editEndTime, setEditEndTime] = useState<string>('');

  // Backup import state
  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const [notificationPermission, setNotificationPermission] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdatePenaltySettings(tempSettings);
    onUpdateExamCountdown(tempExamCountdown);
    onUpdateQuduratTarget(tempQuduratTarget);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      processImportJson(content);
    };
    reader.readAsText(file);
  };

  const processImportJson = (jsonString: string) => {
    const res = validateAndParseBackupJson(jsonString);
    if (!res.success || !res.data) {
      setImportStatus({ success: false, message: res.error || 'الملف غير صالح أو لا يحتوي على بنية بيانات صحيحة.' });
      return;
    }
    if (onImportBackupData) {
      onImportBackupData(res.data);
      setImportStatus({ success: true, message: 'تم استعادة النسخة الاحتياطية بنجاح وتحديث كافة البيانات!' });
    }
  };

  const handleRequestNotification = async () => {
    if (typeof Notification !== 'undefined') {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
        if (perm === 'granted') {
          new Notification('ويجب للمذاكرة', {
            body: 'تم تفعيل التنبيهات بنجاح! سنذكرك بمحاضرات القدرات والواجبات.',
            icon: '/favicon.ico',
          });
        }
      } catch (err) {
        console.error('Notification error', err);
      }
    }
  };

  const handleExportBackup = () => {
    try {
      const backupData: Record<string, any> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('wayjib_study_app_')) {
          backupData[key] = localStorage.getItem(key);
        }
      }
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wayjib_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed', e);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden text-right dir-rtl">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Settings className="w-5 h-5 text-indigo-400 animate-[spin_6s_linear_infinite]" />
            </div>
            <div>
              <h2 id="settings-modal-title" className="text-lg sm:text-xl font-black text-white">
                إعدادات تطبيق ويجب
              </h2>
              <p className="text-xs text-indigo-200">
                التحكم بالخصم التلقائي، قواعد النقاط، التنبيهات، واليوم الدراسي
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="إغلاق الإعدادات"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 pt-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('penalties')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'penalties'
                ? 'border-rose-600 text-rose-700 dark:text-rose-400 bg-white dark:bg-slate-900 shadow-xs'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <span>نظام الخصم التلقائي</span>
          </button>

          <button
            onClick={() => setActiveTab('study')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'study'
                ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400 bg-white dark:bg-slate-900 shadow-xs'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Brain className="w-4 h-4 text-indigo-500" />
            <span>القدرات والعد التنازلي</span>
          </button>

          <button
            onClick={() => setActiveTab('timetable')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'timetable'
                ? 'border-teal-600 text-teal-700 dark:text-teal-400 bg-white dark:bg-slate-900 shadow-xs'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4 text-teal-500" />
            <span>جدول الحصص المخصص</span>
          </button>

          <button
            onClick={() => setActiveTab('theme')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'theme'
                ? 'border-purple-600 text-purple-700 dark:text-purple-400 bg-white dark:bg-slate-900 shadow-xs'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Palette className="w-4 h-4 text-purple-500" />
            <span>المظهر والتصميم</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'notifications'
                ? 'border-amber-600 text-amber-700 dark:text-amber-400 bg-white dark:bg-slate-900 shadow-xs'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4 text-amber-500" />
            <span>التنبيهات والمواعيد</span>
          </button>

          <button
            onClick={() => setActiveTab('data')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'data'
                ? 'border-slate-800 dark:border-slate-300 text-slate-900 dark:text-white bg-white dark:bg-slate-900 shadow-xs'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <RotateCcw className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>البيانات والنسخ الاحتياطي</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: PENALTIES & DEDUCTIONS */}
          {activeTab === 'penalties' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Master Auto Penalty Switch */}
              <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                      تفعيل الخصم التلقائي عند عدم المذاكرة
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        tempSettings.autoPenaltyEnabled
                          ? 'bg-rose-200 dark:bg-rose-900/70 text-rose-800 dark:text-rose-200'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {tempSettings.autoPenaltyEnabled ? 'مفعل ✅' : 'معطل ⏸️'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    عند التفعيل، سيتم تطبيق الخصم المحدد على المهام اليومية التي لم تنجزها لحثك على الالتزام.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setTempSettings({
                      ...tempSettings,
                      autoPenaltyEnabled: !tempSettings.autoPenaltyEnabled,
                    })
                  }
                  className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    tempSettings.autoPenaltyEnabled ? 'bg-rose-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  aria-pressed={tempSettings.autoPenaltyEnabled}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      tempSettings.autoPenaltyEnabled ? '-translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Penalty Rates Configuration */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  تحديد عدد نقاط الخصم لكل عنصر:
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Verbal Lecture Penalty */}
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
                    <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-xs">
                      <Brain className="w-3.5 h-3.5" />
                      <span>محاضرة لفظي لم تُذاكر</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={tempSettings.quduratVerbalPenalty}
                        onChange={(e) =>
                          setTempSettings({
                            ...tempSettings,
                            quduratVerbalPenalty: Math.max(1, Number(e.target.value)),
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-extrabold text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-center"
                      />
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400 shrink-0">نقطة</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">الافتراضي: 15 نقطة</span>
                  </div>

                  {/* Quant Full Lesson Penalty */}
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
                    <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400 font-bold text-xs">
                      <Calculator className="w-3.5 h-3.5" />
                      <span>درس كمي كامل لم يُنجز</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="200"
                        value={tempSettings.quduratQuantLessonPenalty}
                        onChange={(e) =>
                          setTempSettings({
                            ...tempSettings,
                            quduratQuantLessonPenalty: Math.max(1, Number(e.target.value)),
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-extrabold text-sm text-slate-900 dark:text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-center"
                      />
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400 shrink-0">نقطة</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">الافتراضي: 35 نقطة</span>
                  </div>

                  {/* Homework Late Penalty */}
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>واجب مدرسي متأخر</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={tempSettings.homeworkLatePenalty}
                        onChange={(e) =>
                          setTempSettings({
                            ...tempSettings,
                            homeworkLatePenalty: Math.max(1, Number(e.target.value)),
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-extrabold text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-center"
                      />
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400 shrink-0">نقطة</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">الافتراضي: 25 نقطة</span>
                  </div>
                </div>
              </div>

              {/* Instant Deduction Trigger */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-slate-800 dark:text-white block">تطبيق الخصم فوراً:</span>
                  يتم فحص مهام اليوم غير المنجزة وخصم النقاط المقررة وتسجيلها في سجل الخصومات.
                </div>
                <button
                  onClick={() => {
                    onApplyManualPenalty();
                    onClose();
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shrink-0"
                >
                  تطبيق الخصم الآن
                </button>
              </div>
            </div>
          )}

          {/* TAB: THEME & APPEARANCE */}
          {activeTab === 'theme' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 border border-purple-200 dark:border-purple-900/50 space-y-2">
                <div className="flex items-center gap-2 font-black text-purple-950 dark:text-purple-200 text-sm">
                  <Palette className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>تخصيص مظهر التطبيق والتصميم</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  اختر المظهر المريح لعينيك أثناء جلسات المذاكرة وحل الواجبات. يدعم التطبيق النمط الفاتح العالي الوضوح والنمط الداكن المريح للمذاكرة الليلية.
                </p>
              </div>

              {/* Theme Selector Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Light Mode */}
                <button
                  type="button"
                  onClick={() => onThemeChange('light')}
                  className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between gap-3 ${
                    currentTheme === 'light'
                      ? 'border-purple-600 ring-2 ring-purple-500 bg-white shadow-md'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                      <Sun className="w-5 h-5" />
                    </div>
                    {currentTheme === 'light' && (
                      <span className="text-[10px] font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                        محدد حالياً ✅
                      </span>
                    )}
                  </div>
                  <div>
                    <h5 className="font-black text-slate-900 dark:text-white text-sm">الوضع الفاتح (نهاري)</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      تباين عالي وألوان مشرقة للمذاكرة أثناء النهار وفي المدرسة.
                    </p>
                  </div>
                </button>

                {/* Dark Mode */}
                <button
                  type="button"
                  onClick={() => onThemeChange('dark')}
                  className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between gap-3 ${
                    currentTheme === 'dark'
                      ? 'border-purple-600 ring-2 ring-purple-500 bg-slate-900 text-white shadow-md'
                      : 'border-slate-800 bg-slate-900 text-slate-200 hover:border-purple-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <Moon className="w-5 h-5" />
                    </div>
                    {currentTheme === 'dark' && (
                      <span className="text-[10px] font-black text-purple-300 bg-purple-900/60 px-2 py-0.5 rounded-full">
                        محدد حالياً ✅
                      </span>
                    )}
                  </div>
                  <div>
                    <h5 className="font-black text-white text-sm">الوضع الداكن (ليلي)</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      تقليل إجهاد العين وتوفير طاقة البطارية أثناء المذاكرة المتأخرة.
                    </p>
                  </div>
                </button>

                {/* System Mode */}
                <button
                  type="button"
                  onClick={() => onThemeChange('system')}
                  className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between gap-3 ${
                    currentTheme === 'system'
                      ? 'border-purple-600 ring-2 ring-purple-500 bg-white dark:bg-slate-800 shadow-md'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                      <Laptop className="w-5 h-5" />
                    </div>
                    {currentTheme === 'system' && (
                      <span className="text-[10px] font-black text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/60 px-2 py-0.5 rounded-full">
                        محدد حالياً ✅
                      </span>
                    )}
                  </div>
                  <div>
                    <h5 className="font-black text-slate-900 dark:text-white text-sm">تلقائي حسب الجهاز</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      يتزامن تلقائياً مع إعدادات نظام جهازك أو هاتفك.
                    </p>
                  </div>
                </button>
              </div>

              {/* Design Preview Box */}
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  مميزات التصميم الحالي في تطبيق ويجب:
                </span>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                  <li>عناوين مهام واضحة ومتوسطة في منتصف البطاقة لسهولة القراءة.</li>
                  <li>لوحة ألوان متناسقة لكل مهمة وواجب مدرسي لتسهيل التمييز البصري.</li>
                  <li>جدول حصص ثاني ثانوي تفاعلي بالحصص والمعلمين والمواقيت من 7:00 ص إلى 1:30 م.</li>
                  <li>مؤقت تركيز تايمر ذكي يبدأ فور ضغطك على زر البدء لحفظ تركيزك.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: STUDY & QUDURAT TARGETS & EXAM COUNTDOWN */}
          {activeTab === 'study' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Daily Targets Setting */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-4">
                <div className="flex items-center gap-2 font-black text-indigo-950 dark:text-indigo-200 text-sm">
                  <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>تخصيص هدف القدرات اليومي:</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-900/50 space-y-2">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                      عدد محاضرات اللفظي اليومية:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={tempQuduratTarget.verbalLecturesDaily}
                        onChange={(e) =>
                          setTempQuduratTarget({
                            ...tempQuduratTarget,
                            verbalLecturesDaily: Math.max(1, Math.min(10, parseInt(e.target.value) || 1)),
                          })
                        }
                        className="w-20 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-black text-center text-indigo-600 dark:text-indigo-400 focus:ring-2 focus:ring-indigo-500 outline-hidden"
                      />
                      <span className="text-xs text-slate-500">محاضرات يومياً (الافتراضي 5)</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      النقاط لكل محاضرة:{' '}
                      <input
                        type="number"
                        min="5"
                        max="100"
                        step="5"
                        value={tempQuduratTarget.verbalPoints}
                        onChange={(e) =>
                          setTempQuduratTarget({
                            ...tempQuduratTarget,
                            verbalPoints: parseInt(e.target.value) || 20,
                          })
                        }
                        className="w-16 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold text-center inline-block text-xs"
                      />{' '}
                      نقطة
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-900/50 space-y-2">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                      عدد دروس الكمي اليومية:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={tempQuduratTarget.quantLessonsDaily}
                        onChange={(e) =>
                          setTempQuduratTarget({
                            ...tempQuduratTarget,
                            quantLessonsDaily: Math.max(1, Math.min(5, parseInt(e.target.value) || 1)),
                          })
                        }
                        className="w-20 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-black text-center text-sky-600 dark:text-sky-400 focus:ring-2 focus:ring-sky-500 outline-hidden"
                      />
                      <span className="text-xs text-slate-500">دروس شاملة يومياً (الافتراضي 1)</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      النقاط لكل درس:{' '}
                      <input
                        type="number"
                        min="10"
                        max="200"
                        step="10"
                        value={tempQuduratTarget.quantPoints}
                        onChange={(e) =>
                          setTempQuduratTarget({
                            ...tempQuduratTarget,
                            quantPoints: parseInt(e.target.value) || 50,
                          })
                        }
                        className="w-16 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold text-center inline-block text-xs"
                      />{' '}
                      نقطة
                    </div>
                  </div>
                </div>
              </div>

              {/* Exam Countdown Settings */}
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-amber-950 dark:text-amber-200 text-sm">
                    <Timer className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>العداد التنازلي للاختبار (Exam Countdown):</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tempExamCountdown.enabled}
                      onChange={(e) =>
                        setTempExamCountdown({
                          ...tempExamCountdown,
                          enabled: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                <div className="space-y-3 text-xs pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      اسم الاختبار أو المناسبة:
                    </label>
                    <input
                      type="text"
                      value={tempExamCountdown.examTitle}
                      onChange={(e) =>
                        setTempExamCountdown({
                          ...tempExamCountdown,
                          examTitle: e.target.value,
                        })
                      }
                      placeholder="مثال: اختبار القدرات العامة (محوسب) - قياس"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        تاريخ ووقت الاختبار:
                      </label>
                      <input
                        type="datetime-local"
                        value={tempExamCountdown.targetDate.slice(0, 16)}
                        onChange={(e) =>
                          setTempExamCountdown({
                            ...tempExamCountdown,
                            targetDate: e.target.value ? new Date(e.target.value).toISOString() : tempExamCountdown.targetDate,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        الدرجة المستهدفة:
                      </label>
                      <input
                        type="text"
                        value={tempExamCountdown.targetScore}
                        onChange={(e) =>
                          setTempExamCountdown({
                            ...tempExamCountdown,
                            targetScore: e.target.value,
                          })
                        }
                        placeholder="مثال: +95 أو 100%"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      عبارة التحفيز:
                    </label>
                    <input
                      type="text"
                      value={tempExamCountdown.motivationalNote}
                      onChange={(e) =>
                        setTempExamCountdown({
                          ...tempExamCountdown,
                          motivationalNote: e.target.value,
                        })
                      }
                      placeholder="استمر في إنجاز محاضراتك اليومية، التميز قادم!"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Reset Day Lectures */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">بدء يوم دراسي جديد</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      إعادة تعيين المحاضرات لتبدأ يوماً جديداً بنشاط مع الاحتفاظ بكافة نقاطك المكتسبة ومكافآتك.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onResetLectures();
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>تصفير محاضرات اليوم</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TIMETABLE CUSTOMIZATION */}
          {activeTab === 'timetable' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/40 text-xs text-teal-900 dark:text-teal-200 space-y-1">
                <span className="font-bold block">إعدادات الجدول المدرسي المخصص:</span>
                <p>
                  يمكنك تخصيص المواد والمعلمين وتوقيت الحصص لكل يوم دراسي. التعديلات تنعكس فوراً في جدول الحصص وعرض اليوم.
                </p>
              </div>

              {/* Days Selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {(['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'] as const).map((dayName, idx) => (
                  <button
                    key={dayName}
                    type="button"
                    onClick={() => setSelectedTimetableDay(idx)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-colors ${
                      selectedTimetableDay === idx
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {dayName}
                  </button>
                ))}
              </div>

              {/* Slots List for selected day */}
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {(() => {
                  const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'] as const;
                  const currentDayName = dayNames[selectedTimetableDay] || 'الأحد';
                  const slotsForDay = timetableSlots.filter((s) => s.day === currentDayName);

                  if (slotsForDay.length === 0) {
                    return (
                      <div className="text-center py-6 text-xs text-slate-500">
                        لا توجد حصص مسجلة لهذا اليوم.
                      </div>
                    );
                  }

                  return slotsForDay.map((slot) => {
                    const isEditing = editingSlotId === `${slot.day}_${slot.period}`;
                    return (
                      <div
                        key={`${slot.day}_${slot.period}`}
                        className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-teal-300 transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 text-xs font-black flex items-center justify-center">
                              {slot.period}
                            </span>
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                              {slot.subject}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-500 font-medium">
                              {slot.timeRange}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                if (isEditing) {
                                  setEditingSlotId(null);
                                } else {
                                  setEditingSlotId(`${slot.day}_${slot.period}`);
                                  setEditSubject(slot.subject);
                                  setEditTeacher(slot.teacher);
                                  const [start = '', end = ''] = slot.timeRange.split(' - ');
                                  setEditStartTime(start.trim());
                                  setEditEndTime(end.trim());
                                }
                              }}
                              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-teal-600 dark:text-teal-400"
                              title="تعديل الحصة"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-500 flex items-center justify-between">
                          <span>المعلم: {slot.teacher}</span>
                        </div>

                        {/* Inline Edit Form */}
                        {isEditing && (
                          <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                  المادة:
                                </label>
                                <select
                                  value={editSubject}
                                  onChange={(e) => setEditSubject(e.target.value)}
                                  className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                                >
                                  {SAUDI_SECONDARY_2_SUBJECTS.map((subj) => (
                                    <option key={subj} value={subj}>
                                      {subj}
                                    </option>
                                  ))}
                                  <option value={editSubject}>مادة مخصصة ({editSubject})</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                  اسم المعلم:
                                </label>
                                <input
                                  type="text"
                                  value={editTeacher}
                                  onChange={(e) => setEditTeacher(e.target.value)}
                                  placeholder="أ. المعلم"
                                  className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setEditingSlotId(null)}
                                className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs"
                              >
                                إلغاء
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (onUpdateTimetableSlot) {
                                    onUpdateTimetableSlot({
                                      ...slot,
                                      subject: editSubject.trim() || slot.subject,
                                      teacher: editTeacher.trim() || slot.teacher,
                                    });
                                  }
                                  setEditingSlotId(null);
                                }}
                                className="px-3 py-1 rounded-lg bg-teal-600 text-white font-bold text-xs"
                              >
                                حفظ الحصة
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-extrabold text-amber-950 dark:text-amber-200 text-sm">إشعارات المتصفح اليومية</h4>
                  <p className="text-xs text-amber-800/90 dark:text-amber-300/90 mt-0.5">
                    إرسال تذكير يومي بمحاضرات القدرات والواجبات المدرسية المطلوب تسليمها.
                  </p>
                  <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 mt-1 block">
                    الحالة الحالية:{' '}
                    {notificationPermission === 'granted'
                      ? 'مفعلة بالمتصفح ✅'
                      : notificationPermission === 'denied'
                      ? 'محظورة بالمتصفح ❌'
                      : 'في انتظار الإذن'}
                  </span>
                </div>

                <button
                  onClick={handleRequestNotification}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shrink-0 shadow-xs"
                >
                  {notificationPermission === 'granted' ? 'إرسال إشعار تجريبي' : 'طلب إذن الإشعارات'}
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-white">
                  <Info className="w-4 h-4 text-indigo-500" />
                  <span>تلميح المذاكرة الفعالة:</span>
                </div>
                <p>
                  يمكنك أيضاً استخدام تبويب <strong>«الجدول والتذكير»</strong> لتصدير مواعيد مذاكرتك مباشرة إلى Google Calendar أو Google Docs لربطها ببريدك وهاتفك.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: DATA & BACKUP */}
          {activeTab === 'data' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">النسخ الاحتياطي ونقل البيانات</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  قم بتحميل نسخة احتياطية من نقاطك، مكافآتك، واجباتك، واختباراتك بصيغة ملف JSON لنقلها لأي جهاز.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={handleExportBackup}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-bold text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل نسخة احتياطية (JSON)</span>
                  </button>
                </div>
              </div>

              {/* Restore JSON */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">استعادة نسخة احتياطية سابقة</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ارفع ملف النسخة الاحتياطية (.json) أو الصق نص الـ JSON لاستعادة كافة السجلات والنقاط والمهام.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <label className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold text-xs cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>اختر ملف نسخة احتياطية (.json)</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportFile}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    أو الصق محتوى ملف الـ JSON هنا:
                  </label>
                  <textarea
                    rows={3}
                    value={importJsonText}
                    onChange={(e) => setImportJsonText(e.target.value)}
                    placeholder='{"wayjib_study_app_v2_points": 150, ...}'
                    className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono text-slate-800 dark:text-slate-200 outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                  {importJsonText && (
                    <button
                      type="button"
                      onClick={() => processImportJson(importJsonText)}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>تطبيق واستعادة النص المنسوخ</span>
                    </button>
                  )}
                </div>

                {importStatus && (
                  <div
                    className={`p-2.5 rounded-xl text-xs font-bold ${
                      importStatus.success
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300'
                        : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300'
                    }`}
                  >
                    {importStatus.message}
                  </div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 space-y-3">
                <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-extrabold text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>منطقة الخطر: إعادة الضبط الشاملة</span>
                </div>
                <p className="text-xs text-rose-700 dark:text-rose-300">
                  رصيدك الحالي: <strong>{totalPoints} نقطة</strong>. إعادة التعيين ستمسح السجلات المخصصة وتعيدك للحالة المبدئية.
                </p>

                {confirmResetOpen ? (
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-rose-300 dark:border-rose-800 space-y-2">
                    <p className="text-xs font-bold text-rose-900 dark:text-rose-200">
                      هل أنت متأكد من رغبتك في إعادة ضبط التطبيق بالكامل؟
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (onResetAllData) onResetAllData();
                          setConfirmResetOpen(false);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                      >
                        نعم، تأكيد إعادة التعيين
                      </button>
                      <button
                        onClick={() => setConfirmResetOpen(false)}
                        className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmResetOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/30 font-bold text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>إعادة ضبط التطبيق للحالة الافتراضية</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {savedSuccess ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" />
                تم حفظ التغييرات بنجاح!
              </span>
            ) : (
              <span>يتم تطبيق الإعدادات وحفظها فوراً في المتصفح</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs"
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>حفظ الإعدادات</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

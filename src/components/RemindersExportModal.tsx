import React, { useState } from 'react';
import {
  X,
  FileText,
  Mail,
  Copy,
  Check,
  Bell,
  Calendar,
  Sparkles,
  ExternalLink,
  Share2,
} from 'lucide-react';
import { LectureItem, HomeworkItem, ExamItem, PrepItem, RewardItem } from '../types';
import { generateStudyExportDoc } from '../utils/studyLogic';
import {
  sendBrowserNotification,
  requestNotificationPermission,
  playChimeSound,
} from '../utils/notificationService';

interface RemindersExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  lectures: LectureItem[];
  homework: HomeworkItem[];
  exams: ExamItem[];
  preps: PrepItem[];
  rewards: RewardItem[];
  totalPoints: number;
}

export const RemindersExportModal: React.FC<RemindersExportModalProps> = ({
  isOpen,
  onClose,
  lectures,
  homework,
  exams,
  preps,
  rewards,
  totalPoints,
}) => {
  const [copied, setCopied] = useState(false);
  const [reminderTime, setReminderTime] = useState('16:00');
  const [notificationStatus, setNotificationStatus] = useState<string>('');

  if (!isOpen) return null;

  const exportText = generateStudyExportDoc(lectures, homework, exams, preps, rewards, totalPoints);

  const handleCopy = () => {
    navigator.clipboard.writeText(exportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenGoogleDocs = () => {
    handleCopy();
    window.open('https://docs.google.com/document/create', '_blank');
  };

  const handleOpenGmail = () => {
    const subject = encodeURIComponent('تذكير المذاكرة اليومي - تطبيق ويجب');
    const body = encodeURIComponent(
      `السلام عليكم ورحمة الله،\n\nهذا تذكير يومي بجدول مذاكرة القدرات والواجبات المدرسية المطلوب إنجازها اليوم عبر تطبيق ويجب:\n\n${exportText}\n\nبالتوفيق والدرجات العليا دائماً!`
    );
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, '_blank');
  };

  const handleTestNotification = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      sendBrowserNotification('تطبيق ويجب للمذاكرة 📚', {
        body: 'حان وقت مذاكرة محاضرات القدرات والواجبات المدرسية! افتح التطبيق واكسب نقاط المكافآت.',
      });
      playChimeSound('success');
      setNotificationStatus('تم إرسال إشعار تجريبي بنجاح!');
    } else {
      setNotificationStatus('يرجى السماح بالإشعارات في المتصفح.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 max-h-[90vh] overflow-y-auto dir-rtl text-right">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                التذكير اليومي ومزامنة الخطة الدراسية
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                تصدير جدولك لـ Google Docs أو التذكير عبر Gmail والمتصفح
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            aria-label="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Browser Push Reminder */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="space-y-0.5 text-right w-full sm:w-auto">
            <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200 text-sm">
              <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>تذكير إشعارات المتصفح التلقائي</span>
            </div>
            <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
              استلم تنبيهاً مباشراً على سطح المكتب أو الجوال بموعد المذاكرة وحل الواجبات.
            </p>
            {notificationStatus && (
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 block pt-1">
                {notificationStatus}
              </span>
            )}
          </div>

          <button
            onClick={handleTestNotification}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs shrink-0"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>تجربة إشعار المتصفح 🔔</span>
          </button>
        </div>

        {/* Google Workspace Integrations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleOpenGoogleDocs}
            className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-right transition-all flex items-start gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 font-bold text-indigo-950 dark:text-indigo-200 text-sm">
                <span>تصدير لمستند Google Docs</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-[-2px] transition-transform" />
              </div>
              <p className="text-xs text-indigo-900/70 dark:text-indigo-300/70 leading-relaxed">
                ينسخ تقريرك الدراسي ويفتح مستند جديد على درايف لحفظه أو طباعته.
              </p>
            </div>
          </button>

          <button
            onClick={handleOpenGmail}
            className="p-4 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-right transition-all flex items-start gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Mail className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 font-bold text-rose-950 dark:text-rose-200 text-sm">
                <span>إرسال تذكير عبر Gmail</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-[-2px] transition-transform" />
              </div>
              <p className="text-xs text-rose-900/70 dark:text-rose-300/70 leading-relaxed">
                يجهز رسالة بريد تتضمن جدولك ومحاضراتك لإرسالها لنفسك أو لولي أمرك.
              </p>
            </div>
          </button>
        </div>

        {/* Text Preview Box with Copy */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              معاينة التقرير والخطة الدراسية المجهزة:
            </span>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'تم النسخ للحافظة!' : 'نسخ النص'}</span>
            </button>
          </div>

          <pre className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {exportText}
          </pre>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs hover:bg-slate-800"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

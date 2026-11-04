import {
  LectureItem,
  HomeworkItem,
  ExamItem,
  PrepItem,
  RewardItem,
  RedemptionRecord,
  PenaltyRecord,
  PenaltySettings,
} from '../types';

export interface ProgressSummary {
  verbalDone: number;
  verbalTotal: number;
  quantDone: number;
  quantTotal: number;
  totalDone: number;
  totalLectures: number;
  percent: number;
  isAllLecturesDone: boolean;
}

export function calculateLectureProgress(lectures: LectureItem[]): ProgressSummary {
  const verbalLectures = lectures.filter((l) => l.category === 'verbal');
  const quantLectures = lectures.filter((l) => l.category === 'quantitative');

  const verbalDone = verbalLectures.filter((l) => l.completed).length;
  const quantDone = quantLectures.filter((l) => l.completed).length;

  const totalDone = verbalDone + quantDone;
  const totalLectures = lectures.length;
  const percent = totalLectures > 0 ? Math.round((totalDone / totalLectures) * 100) : 0;

  return {
    verbalDone,
    verbalTotal: verbalLectures.length,
    quantDone,
    quantTotal: quantLectures.length,
    totalDone,
    totalLectures,
    percent,
    isAllLecturesDone: totalLectures > 0 && totalDone === totalLectures,
  };
}

export function canRedeemReward(currentPoints: number, pointsCost: number): boolean {
  return currentPoints >= pointsCost && pointsCost > 0;
}

export function redeemRewardLogic(
  currentPoints: number,
  reward: RewardItem
): { success: boolean; newPoints: number; record?: RedemptionRecord; error?: string } {
  if (!canRedeemReward(currentPoints, reward.pointsCost)) {
    return {
      success: false,
      newPoints: currentPoints,
      error: `عذراً، تحتاج إلى ${reward.pointsCost} نقطة (رصيدك الحالي ${currentPoints})`,
    };
  }

  const newPoints = currentPoints - reward.pointsCost;
  const now = new Date();
  const record: RedemptionRecord = {
    id: `redemption_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    rewardId: reward.id,
    rewardTitle: reward.title,
    pointsSpent: reward.pointsCost,
    timestamp: now.toISOString(),
    dateStr: now.toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };

  return {
    success: true,
    newPoints,
    record,
  };
}

export function applyPenaltyLogic(
  currentPoints: number,
  reason: string,
  pointsDeducted: number
): { newPoints: number; record: PenaltyRecord } {
  const effectiveDeduction = Math.max(1, pointsDeducted);
  const newPoints = Math.max(0, currentPoints - effectiveDeduction);
  const now = new Date();

  const record: PenaltyRecord = {
    id: `penalty_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    reason,
    pointsDeducted: effectiveDeduction,
    timestamp: now.toISOString(),
    dateStr: now.toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };

  return { newPoints, record };
}

export function checkAndCalculateQuduratPenalties(
  lectures: LectureItem[],
  settings: PenaltySettings
): { totalPenalty: number; reasons: string[] } {
  let totalPenalty = 0;
  const reasons: string[] = [];

  const verbalIncomplete = lectures.filter((l) => l.category === 'verbal' && !l.completed);
  const quantIncomplete = lectures.filter((l) => l.category === 'quantitative' && !l.completed);

  if (verbalIncomplete.length > 0) {
    const penalty = verbalIncomplete.length * settings.quduratVerbalPenalty;
    totalPenalty += penalty;
    reasons.push(
      `عدم إنجاز ${verbalIncomplete.length} محاضرات لفظي (-${penalty} نقطة)`
    );
  }

  if (quantIncomplete.length > 0) {
    const penalty = quantIncomplete.length * settings.quduratQuantLessonPenalty;
    totalPenalty += penalty;
    reasons.push(`عدم إنجاز درس الكمي الكامل المقرر لليوم (-${penalty} نقطة)`);
  }

  return { totalPenalty, reasons };
}

export function calculateLevel(totalPoints: number): {
  level: number;
  title: string;
  progressPercent: number;
  currentLevelPoints: number;
  nextLevelPoints: number;
} {
  const pointsPerLevel = 150;
  const level = Math.floor(totalPoints / pointsPerLevel) + 1;
  const currentLevelPoints = totalPoints % pointsPerLevel;
  const nextLevelPoints = pointsPerLevel;
  const progressPercent = Math.min(100, Math.round((currentLevelPoints / pointsPerLevel) * 100));

  const titles = [
    'مبتدئ طموح 🚀',
    'طالب ثاني ثانوي مثابر 📚',
    'باحث ذكي 💡',
    'فارس المذاكرة ⚔️',
    'خبير قدرات 🎯',
    'أسطورة التفوق 👑',
    'عبقري القياس ⭐',
  ];

  const titleIndex = Math.min(level - 1, titles.length - 1);

  return {
    level,
    title: titles[titleIndex],
    progressPercent,
    currentLevelPoints,
    nextLevelPoints,
  };
}

export function formatDurationInArabic(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} دقيقة`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return hours === 1 ? 'ساعة واحدة' : hours === 2 ? 'ساعتان' : `${hours} ساعات`;
  }
  const hoursText = hours === 1 ? 'ساعة' : `${hours} ساعات`;
  return `${hoursText} و ${remainingMinutes} دقيقة`;
}

export function generateStudyExportDoc(
  lectures: LectureItem[],
  homework: HomeworkItem[],
  exams: ExamItem[],
  preps: PrepItem[],
  rewards: RewardItem[],
  totalPoints: number
): string {
  const dateStr = new Date().toLocaleDateString('ar-SA', { dateStyle: 'full' });
  const progress = calculateLectureProgress(lectures);

  let doc = `# تقرير وجدول المذاكرة - تطبيق ويجب (ثاني ثانوي)\n`;
  doc += `تاريخ التقرير: ${dateStr}\n`;
  doc += `مجموع النقاط المكتسبة: ${totalPoints} نقطة\n\n`;

  doc += `## 1. قسم القدرات (كل يوم درس كمي كامل + 5 محاضرات لفظي)\n`;
  doc += `نسبة الإنجاز الإجمالية: ${progress.percent}% (${progress.totalDone} من ${progress.totalLectures} مكتملة)\n\n`;

  doc += `### أ) درس الكمي الكامل (${progress.quantDone}/${progress.quantTotal} مكتمل):\n`;
  lectures
    .filter((l) => l.category === 'quantitative')
    .forEach((l, idx) => {
      doc += `${idx + 1}. [${l.completed ? 'تم الإنجاز ✅' : 'قيد الانتظار ⏳'}] ${l.title} - ${l.durationMinutes} دقيقة\n`;
    });

  doc += `\n### ب) محاضرات اللفظي الـ 5 (${progress.verbalDone}/${progress.verbalTotal} مكتمل):\n`;
  lectures
    .filter((l) => l.category === 'verbal')
    .forEach((l, idx) => {
      doc += `${idx + 1}. [${l.completed ? 'تم الإنجاز ✅' : 'قيد الانتظار ⏳'}] ${l.title} - ${l.durationMinutes} دقيقة\n`;
    });

  doc += `\n## 2. واجبات ثاني ثانوي المقررة\n`;
  homework.forEach((hw, idx) => {
    doc += `${idx + 1}. [${hw.completed ? 'منجز ✅' : 'غير منجز ❌'}] (${hw.subject}) ${hw.title} - الصفحة: ${hw.pageNumber} - استحقاق: ${hw.dueDate} (${hw.points} نقطة)\n`;
  });

  doc += `\n## 3. اختبارات ثاني ثانوي\n`;
  exams.forEach((ex, idx) => {
    doc += `${idx + 1}. [${ex.completed ? 'تمت المذاكرة ✅' : 'قيد المذاكرة 📖'}] (${ex.subject}) ${ex.title} - موعد الاختبار: ${ex.examDate}\n   المقرر: ${ex.studyDetails}\n`;
  });

  return doc;
}

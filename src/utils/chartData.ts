export interface DailyProgressPoint {
  dayName: string;
  dayShort: string;
  verbalDone: number;
  quantDone: number;
  homeworkDone: number;
  totalLectures: number;
  targetLectures: number;
  pointsEarned: number;
}

export function generateWeeklyChartData(
  todayVerbalDone: number,
  todayQuantDone: number,
  todayHomeworkDone: number,
  todayPoints: number
): DailyProgressPoint[] {
  // Days of week in Saudi academic order (5 verbal lectures + 1 full quant lesson daily)
  const days = [
    { dayName: 'السبت', dayShort: 'سبت', v: 4, q: 1, hw: 2, pts: 190 },
    { dayName: 'الأحد', dayShort: 'أحد', v: 5, q: 1, hw: 3, pts: 240 },
    { dayName: 'الإثنين', dayShort: 'إثنين', v: 3, q: 1, hw: 2, pts: 170 },
    { dayName: 'الثلاثاء', dayShort: 'ثلاثاء', v: 5, q: 1, hw: 2, pts: 210 },
    { dayName: 'الأربعاء', dayShort: 'أربعاء', v: 4, q: 0, hw: 1, pts: 110 },
    { dayName: 'الخميس', dayShort: 'خميس', v: 5, q: 1, hw: 3, pts: 240 },
    {
      dayName: 'الجمعة (اليوم)',
      dayShort: 'جمعة',
      v: todayVerbalDone,
      q: todayQuantDone,
      hw: todayHomeworkDone,
      pts: Math.max(
        todayPoints,
        todayVerbalDone * 20 + todayQuantDone * 50 + todayHomeworkDone * 30
      ),
    },
  ];

  return days.map((d) => ({
    dayName: d.dayName,
    dayShort: d.dayShort,
    verbalDone: d.v,
    quantDone: d.q,
    homeworkDone: d.hw,
    totalLectures: d.v + d.q,
    targetLectures: 6, // 5 verbal + 1 full quant lesson
    pointsEarned: d.pts,
  }));
}

export function calculateWeeklyTotals(data: DailyProgressPoint[]) {
  const totalVerbal = data.reduce((acc, d) => acc + d.verbalDone, 0);
  const totalQuant = data.reduce((acc, d) => acc + d.quantDone, 0);
  const totalLectures = totalVerbal + totalQuant;
  const totalHomework = data.reduce((acc, d) => acc + d.homeworkDone, 0);
  const totalPoints = data.reduce((acc, d) => acc + d.pointsEarned, 0);
  const targetTotal = data.length * 6; // 42 lectures/lessons per week
  const complianceRate = Math.min(100, Math.round((totalLectures / targetTotal) * 100));

  return {
    totalVerbal,
    totalQuant,
    totalLectures,
    totalHomework,
    totalPoints,
    complianceRate,
  };
}

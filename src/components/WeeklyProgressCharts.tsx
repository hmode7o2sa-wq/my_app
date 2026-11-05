import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Brain,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Calendar,
  Flame,
  Award,
  PieChart as PieIcon,
} from 'lucide-react';
import { generateWeeklyChartData, calculateWeeklyTotals } from '../utils/chartData';
import { LectureItem, HomeworkItem, ExamItem, PrepItem } from '../types';

interface WeeklyProgressChartsProps {
  todayVerbalDone: number;
  todayQuantDone: number;
  todayHomeworkDone: number;
  todayPoints: number;
  lectures?: LectureItem[];
  homework?: HomeworkItem[];
  exams?: ExamItem[];
  preps?: PrepItem[];
}

export const WeeklyProgressCharts: React.FC<WeeklyProgressChartsProps> = ({
  todayVerbalDone,
  todayQuantDone,
  todayHomeworkDone,
  todayPoints,
  lectures = [],
  homework = [],
  exams = [],
  preps = [],
}) => {
  const [activeChartType, setActiveChartType] = useState<'lectures_and_hw' | 'points_trend' | 'task_distribution'>('lectures_and_hw');

  const chartData = generateWeeklyChartData(
    todayVerbalDone,
    todayQuantDone,
    todayHomeworkDone,
    todayPoints
  );

  const totals = calculateWeeklyTotals(chartData);

  // Calculate task distribution for Pie Chart (completed vs pending across 3 categories)
  const quduratCompleted = lectures.filter((l) => l.completed).length;
  const quduratPending = lectures.filter((l) => !l.completed).length;

  const homeworkCompleted = homework.filter((h) => h.completed).length + exams.filter((e) => e.completed).length;
  const homeworkPending = homework.filter((h) => !h.completed).length + exams.filter((e) => !e.completed).length;

  const prepsCompleted = preps.filter((p) => p.completed).length;
  const prepsPending = preps.filter((p) => !p.completed).length;

  const taskDistributionData = [
    { name: 'قدرات (منجزة)', value: quduratCompleted, color: '#4f46e5' },
    { name: 'قدرات (متأخرة/متبقية)', value: quduratPending, color: '#818cf8' },
    { name: 'واجبات واختبارات (منجزة)', value: homeworkCompleted, color: '#10b981' },
    { name: 'واجبات واختبارات (متأخرة/متبقية)', value: homeworkPending, color: '#6ee7b7' },
    { name: 'استعدادات (منجزة)', value: prepsCompleted, color: '#f59e0b' },
    { name: 'استعدادات (متأخرة/متبقية)', value: prepsPending, color: '#fcd34d' },
  ].filter(item => item.value >= 0);

  // Custom RTL Tooltip for Bar/Area Charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 p-3 rounded-2xl shadow-xl text-white text-xs space-y-2 min-w-[180px] text-right dir-rtl">
          <p className="font-bold text-amber-400 border-b border-slate-700 pb-1 flex items-center justify-between">
            <span>{label}</span>
            <span className="text-[10px] text-slate-400">يوم دراسي</span>
          </p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={`item-${index}`} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: entry.color || entry.fill }}
                  />
                  <span>{entry.name}:</span>
                </span>
                <span className="font-extrabold text-white">
                  {entry.value} {entry.dataKey === 'pointsEarned' ? 'نقطة' : 'محاضرة/واجب'}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 border border-white/15 text-xs font-semibold">
            <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
            <span>رسوم بيانية تفاعلية عبر Recharts</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            مؤشرات وتقدم الأسبوع
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            رصد دقيق لإنجازك في محاضرات القدرات (5 محاضرات لفظي + درس كمي كامل يومياً) والواجبات المدرسية مع منحنى النقاط على مدار الأسبوع.
          </p>
        </div>

        {/* View Switcher Controls */}
        <div className="flex flex-wrap items-center gap-2 p-1 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 shrink-0">
          <button
            onClick={() => setActiveChartType('lectures_and_hw')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeChartType === 'lectures_and_hw'
                ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>المحاضرات والواجبات</span>
          </button>
          <button
            onClick={() => setActiveChartType('points_trend')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeChartType === 'points_trend'
                ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>منحنى النقاط</span>
          </button>
          <button
            onClick={() => setActiveChartType('task_distribution')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeChartType === 'task_distribution'
                ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <PieIcon className="w-4 h-4" />
            <span>توزيع المهام (دائري)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">قدرات هذا الأسبوع</span>
            <div className="text-xl sm:text-2xl font-black text-indigo-700 dark:text-indigo-400">
              {totals.totalLectures} <span className="text-xs text-slate-400 font-medium">محاضرة</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              {totals.totalVerbal} لفظي + {totals.totalQuant} كمي
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Brain className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">واجبات المدرسة</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400">
              {totals.totalHomework} <span className="text-xs text-slate-400 font-medium">مهمة منجزة</span>
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">
              تم تسليمها بنجاح ✅
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">معدل التزام القدرات</span>
            <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
              {totals.complianceRate}%
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              مقارنة بـ 42 محاضرة أسبوعياً
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">نقاط الأسبوع المحصودة</span>
            <div className="text-xl sm:text-2xl font-black text-purple-700 dark:text-purple-400">
              {totals.totalPoints} <span className="text-xs text-slate-400 font-medium">نقطة</span>
            </div>
            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold block">
              متاحة في كافيه المكافآت 🎁
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>
                {activeChartType === 'lectures_and_hw'
                  ? 'مقارنة إنجاز المحاضرات اليومية (لفظي وكمي) والواجبات على مدار الأسبوع'
                  : activeChartType === 'points_trend'
                  ? 'منحنى النقاط الدراسية المكتسبة يومياً خلال الأسبوع'
                  : 'توزيع المهام المنجزة مقابل المهام المتأخرة عبر تصنيفاتها الثلاثة (قدرات، واجبات، استعدادات)'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {activeChartType === 'lectures_and_hw'
                ? 'الهدف اليومي: 5 محاضرات لفظي + درس كمي كامل = 6 مهام قدرات يومياً'
                : activeChartType === 'points_trend'
                ? 'تراكم النقاط يساعدك على استبدال المكافآت المخصصة في الكافيه'
                : 'رسم بياني دائري يوضح نسبة المهام المنجزة مقابل المتأخرة لكل من القدرات، الواجبات والاختبارات، والاستعدادات'}
            </p>
          </div>

          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl self-start sm:self-auto">
            {activeChartType === 'task_distribution' ? 'تصنيفات النظام الثلاثة' : 'أيام الأسبوع (السبت - الجمعة)'}
          </span>
        </div>

        {/* Recharts Render Area */}
        <div className="w-full h-80 sm:h-96 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {activeChartType === 'lectures_and_hw' ? (
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 15, left: -10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="dayShort"
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  domain={[0, 8]}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 15, fontSize: 12, fontWeight: 700 }}
                  formatter={(value) => {
                    const map: Record<string, string> = {
                      verbalDone: 'قدرات: لفظي (مطلوب 5)',
                      quantDone: 'قدرات: كمي (درس كامل)',
                      homeworkDone: 'واجبات واختبارات ثاني ثانوي',
                    };
                    return map[value] || value;
                  }}
                />
                {/* Target line for total daily lectures = 6 */}
                <ReferenceLine
                  y={3}
                  stroke="#fbbf24"
                  strokeDasharray="4 4"
                  label={{
                    value: 'هدف القسم (3)',
                    fill: '#b45309',
                    fontSize: 10,
                    position: 'insideTopLeft',
                  }}
                />
                <Bar
                  dataKey="verbalDone"
                  name="verbalDone"
                  fill="#4f46e5"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  dataKey="quantDone"
                  name="quantDone"
                  fill="#0284c7"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  dataKey="homeworkDone"
                  name="homeworkDone"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            ) : activeChartType === 'points_trend' ? (
              <AreaChart
                data={chartData}
                margin={{ top: 20, right: 15, left: -10, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="dayShort"
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 15, fontSize: 12, fontWeight: 700 }}
                  formatter={() => 'النقاط اليومية المكتسبة'}
                />
                <Area
                  type="monotone"
                  dataKey="pointsEarned"
                  name="pointsEarned"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorPoints)"
                  dot={{ r: 5, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 7 }}
                />
              </AreaChart>
            ) : (
              <PieChart>
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      const data = payload[0];
                      return (
                        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 p-3 rounded-2xl shadow-xl text-white text-xs space-y-1 text-right dir-rtl min-w-[180px]">
                          <p className="font-bold text-amber-400 border-b border-slate-700 pb-1">
                            {data.name}
                          </p>
                          <p className="text-slate-200 font-extrabold text-sm pt-1">
                            العدد: {data.value} مهمة
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: 15, fontSize: 12, fontWeight: 700 }}
                  formatter={(value) => <span className="text-slate-700 dark:text-slate-300">{value}</span>}
                />
                <Pie
                  data={taskDistributionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={55}
                  paddingAngle={5}
                  label={({ name, percent }: any) => `${name.split(' ')[0]}: ${(percent * 100).toFixed(0)}%`}
                >
                  {taskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};


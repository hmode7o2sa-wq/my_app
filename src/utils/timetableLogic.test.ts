import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getPeriodArabicName,
  getSlotTaskStatus,
  getSlotColorClass,
  calculateDailySummary,
} from './timetableLogic';
import { HomeworkItem, ExamItem, TimetableSlot } from '../types';

test('getPeriodArabicName returns correct Arabic labels for periods 1 to 7', () => {
  assert.equal(getPeriodArabicName(1), 'الحصة الأولى');
  assert.equal(getPeriodArabicName(2), 'الحصة الثانية');
  assert.equal(getPeriodArabicName(3), 'الحصة الثالثة');
  assert.equal(getPeriodArabicName(4), 'الحصة الرابعة');
  assert.equal(getPeriodArabicName(5), 'الحصة الخامسة');
  assert.equal(getPeriodArabicName(6), 'الحصة السادسة');
  assert.equal(getPeriodArabicName(7), 'الحصة السابعة');
});

test('getSlotTaskStatus identifies homework_only, exam_only, both, completed and none', () => {
  const dummyHw: HomeworkItem = {
    id: 'hw-1',
    subject: 'الرياضيات',
    title: 'حل تمارين التفاضل',
    dueDate: 'الأحد',
    completed: false,
    dayOfWeek: 'الأحد',
    periodNumber: 4,
    points: 30,
    description: 'تمارين 1-5',
    pageNumber: '45',
    durationMinutes: 30,
    priority: 'normal',
  };

  const dummyExam: ExamItem = {
    id: 'ex-1',
    subject: 'الكيمياء',
    title: 'اختبار دوري أول',
    studyDetails: 'فصل 1 و 2',
    examDate: 'الأحد',
    durationMinutes: 45,
    points: 50,
    completed: false,
    dayOfWeek: 'الأحد',
    periodNumber: 2,
  };

  // Case 1: Slot with homework only (Sunday Period 4)
  const status1 = getSlotTaskStatus('الأحد', 4, 'الرياضيات', [dummyHw], []);
  assert.equal(status1, 'homework_only');

  // Case 2: Slot with exam only (Sunday Period 2)
  const status2 = getSlotTaskStatus('الأحد', 2, 'الكيمياء', [], [dummyExam]);
  assert.equal(status2, 'exam_only');

  // Case 3: Slot with both homework and exam
  const status3 = getSlotTaskStatus('الأحد', 4, 'الرياضيات', [dummyHw], [
    { ...dummyExam, periodNumber: 4, subject: 'الرياضيات' },
  ]);
  assert.equal(status3, 'both');

  // Case 4: Slot with completed items
  const status4 = getSlotTaskStatus(
    'الأحد',
    4,
    'الرياضيات',
    [{ ...dummyHw, completed: true }],
    []
  );
  assert.equal(status4, 'completed');

  // Case 5: Empty slot with no items
  const status5 = getSlotTaskStatus('الأحد', 1, 'الإنجليزية', [dummyHw], [dummyExam]);
  assert.equal(status5, 'none');
});

test('getSlotColorClass returns appropriate styles for each task status', () => {
  const bothStyle = getSlotColorClass('both');
  assert.match(bothStyle.badge, /واجب \+ اختبار/);
  assert.match(bothStyle.border, /purple/);

  const examStyle = getSlotColorClass('exam_only');
  assert.match(examStyle.badge, /موعد اختبار/);
  assert.match(bothStyle.border, /purple/);

  const hwStyle = getSlotColorClass('homework_only');
  assert.match(hwStyle.badge, /واجب مدرسي مطلوب/);

  const completedStyle = getSlotColorClass('completed');
  assert.match(completedStyle.badge, /تم الإنجاز/);

  const noneStyle = getSlotColorClass('none');
  assert.match(noneStyle.badge, /حصة بدون مهام/);
});

test('calculateDailySummary computes correct count of slots, tasks, exams, and points', () => {
  const sampleSlots: TimetableSlot[] = [
    { day: 'الأحد', period: 1, timeRange: '7:00 ص - 7:50 ص', subject: 'الإنجليزية', teacher: 'عبدالعزيز' },
    { day: 'الأحد', period: 2, timeRange: '7:50 ص - 8:40 ص', subject: 'الكيمياء', teacher: 'حسن' },
  ];

  const sampleHw: HomeworkItem[] = [
    { id: '1', subject: 'الإنجليزية', title: 'Unit 1 Homework', dueDate: 'الأحد', completed: true, points: 20, dayOfWeek: 'الأحد', periodNumber: 1, description: '', pageNumber: '12', durationMinutes: 20, priority: 'normal' },
    { id: '2', subject: 'الكيمياء', title: 'واجب الجدول الدوري', dueDate: 'الأحد', completed: false, points: 30, dayOfWeek: 'الأحد', periodNumber: 2, description: '', pageNumber: '88', durationMinutes: 25, priority: 'high' },
  ];

  const sampleExams: ExamItem[] = [
    { id: 'e1', subject: 'الكيمياء', title: 'اختبار كيمياء', studyDetails: 'تسمية المركبات', examDate: 'الأحد', durationMinutes: 45, points: 50, completed: false, dayOfWeek: 'الأحد', periodNumber: 2 },
  ];

  const summary = calculateDailySummary('الأحد', sampleSlots, sampleHw, sampleExams);
  assert.equal(summary.totalSlots, 2);
  assert.equal(summary.homeworkCount, 2);
  assert.equal(summary.examCount, 1);
  assert.equal(summary.totalPoints, 100); // 20 + 30 + 50
  assert.equal(summary.completedCount, 1); // 1 hw completed
});

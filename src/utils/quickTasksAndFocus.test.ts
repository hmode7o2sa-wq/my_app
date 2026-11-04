import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addQuickTask,
  toggleQuickTask,
  deleteQuickTask,
  clearCompletedQuickTasks,
  filterQuickTasks,
  calculateQuickTasksSummary,
  formatTimeMMSS,
  getPresetDurationSeconds,
} from './quickTasksAndFocusLogic';
import { QuickTask } from '../types';

test('addQuickTask adds new task with default values and trimmed title', () => {
  const initial: QuickTask[] = [];
  const res = addQuickTask(initial, '  شرب 2 لتر ماء 💧  ', 'habit', 'normal', 5);

  assert.equal(res.newTask !== null, true);
  assert.equal(res.newTask?.title, 'شرب 2 لتر ماء 💧');
  assert.equal(res.newTask?.category, 'habit');
  assert.equal(res.newTask?.priority, 'normal');
  assert.equal(res.newTask?.points, 5);
  assert.equal(res.newTask?.completed, false);
  assert.equal(res.updatedTasks.length, 1);
});

test('addQuickTask rejects empty or whitespace-only title', () => {
  const initial: QuickTask[] = [];
  const res = addQuickTask(initial, '   ');

  assert.equal(res.newTask, null);
  assert.equal(res.updatedTasks.length, 0);
  assert.ok(res.error);
});

test('toggleQuickTask marks completed and returns points delta', () => {
  const tasks: QuickTask[] = [
    {
      id: 'task_1',
      title: 'ترتيب طاولة المذاكرة',
      completed: false,
      category: 'organize',
      priority: 'normal',
      points: 5,
      createdAt: '2026-11-04T00:00:00.000Z',
    },
  ];

  // Toggle to completed
  const res1 = toggleQuickTask(tasks, 'task_1');
  assert.equal(res1.isCompleted, true);
  assert.equal(res1.pointsDelta, 5);
  assert.equal(res1.toggledTask?.completed, true);
  assert.ok(res1.toggledTask?.completedAt);

  // Toggle back to incomplete
  const res2 = toggleQuickTask(res1.updatedTasks, 'task_1');
  assert.equal(res2.isCompleted, false);
  assert.equal(res2.pointsDelta, -5);
  assert.equal(res2.toggledTask?.completed, false);
  assert.equal(res2.toggledTask?.completedAt, undefined);
});

test('deleteQuickTask removes specific task by id', () => {
  const tasks: QuickTask[] = [
    { id: '1', title: 'A', completed: false, category: 'general', priority: 'normal', points: 5, createdAt: '' },
    { id: '2', title: 'B', completed: true, category: 'habit', priority: 'important', points: 5, createdAt: '' },
  ];

  const updated = deleteQuickTask(tasks, '1');
  assert.equal(updated.length, 1);
  assert.equal(updated[0].id, '2');
});

test('clearCompletedQuickTasks removes only completed tasks', () => {
  const tasks: QuickTask[] = [
    { id: '1', title: 'A', completed: true, category: 'general', priority: 'normal', points: 5, createdAt: '' },
    { id: '2', title: 'B', completed: false, category: 'habit', priority: 'normal', points: 5, createdAt: '' },
    { id: '3', title: 'C', completed: true, category: 'organize', priority: 'normal', points: 5, createdAt: '' },
  ];

  const res = clearCompletedQuickTasks(tasks);
  assert.equal(res.removedCount, 2);
  assert.equal(res.updatedTasks.length, 1);
  assert.equal(res.updatedTasks[0].id, '2');
});

test('filterQuickTasks filters accurately by status and category', () => {
  const tasks: QuickTask[] = [
    { id: '1', title: 'A', completed: false, category: 'habit', priority: 'normal', points: 5, createdAt: '' },
    { id: '2', title: 'B', completed: true, category: 'habit', priority: 'normal', points: 5, createdAt: '' },
    { id: '3', title: 'C', completed: false, category: 'organize', priority: 'normal', points: 5, createdAt: '' },
  ];

  const pendingOnly = filterQuickTasks(tasks, 'pending');
  assert.equal(pendingOnly.length, 2);

  const completedOnly = filterQuickTasks(tasks, 'completed');
  assert.equal(completedOnly.length, 1);

  const habitsOnly = filterQuickTasks(tasks, 'all', 'habit');
  assert.equal(habitsOnly.length, 2);

  const pendingHabits = filterQuickTasks(tasks, 'pending', 'habit');
  assert.equal(pendingHabits.length, 1);
  assert.equal(pendingHabits[0].id, '1');
});

test('calculateQuickTasksSummary calculates rate and totals accurately', () => {
  const tasks: QuickTask[] = [
    { id: '1', title: 'A', completed: true, category: 'habit', priority: 'normal', points: 5, createdAt: '' },
    { id: '2', title: 'B', completed: true, category: 'habit', priority: 'normal', points: 10, createdAt: '' },
    { id: '3', title: 'C', completed: false, category: 'organize', priority: 'normal', points: 5, createdAt: '' },
    { id: '4', title: 'D', completed: false, category: 'personal', priority: 'normal', points: 5, createdAt: '' },
  ];

  const summary = calculateQuickTasksSummary(tasks);
  assert.equal(summary.total, 4);
  assert.equal(summary.completed, 2);
  assert.equal(summary.pending, 2);
  assert.equal(summary.rate, 50);
  assert.equal(summary.totalEarnedPoints, 15);
});

test('formatTimeMMSS formats seconds properly', () => {
  assert.equal(formatTimeMMSS(0), '00:00');
  assert.equal(formatTimeMMSS(65), '01:05');
  assert.equal(formatTimeMMSS(1500), '25:00');
  assert.equal(formatTimeMMSS(3000), '50:00');
});

test('getPresetDurationSeconds returns expected seconds', () => {
  assert.equal(getPresetDurationSeconds('pomodoro'), 1500);
  assert.equal(getPresetDurationSeconds('deep_work'), 3000);
  assert.equal(getPresetDurationSeconds('sprint'), 900);
  assert.equal(getPresetDurationSeconds('short_break'), 300);
  assert.equal(getPresetDurationSeconds('custom', 45), 2700);
  assert.equal(getPresetDurationSeconds('stopwatch'), 0);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateLectureProgress,
  canRedeemReward,
  redeemRewardLogic,
  applyPenaltyLogic,
  checkAndCalculateQuduratPenalties,
  calculateLevel,
  formatDurationInArabic,
} from './studyLogic';
import { LectureItem, RewardItem, PenaltySettings } from '../types';

test('calculateLectureProgress works for 5 verbal lectures and 1 full quant lesson', () => {
  const lectures: LectureItem[] = [
    { id: 'v1', category: 'verbal', order: 1, title: 'v1', topic: 't', description: '', durationMinutes: 20, completed: true, points: 20, summaryBullets: [] },
    { id: 'v2', category: 'verbal', order: 2, title: 'v2', topic: 't', description: '', durationMinutes: 20, completed: true, points: 20, summaryBullets: [] },
    { id: 'v3', category: 'verbal', order: 3, title: 'v3', topic: 't', description: '', durationMinutes: 20, completed: false, points: 20, summaryBullets: [] },
    { id: 'v4', category: 'verbal', order: 4, title: 'v4', topic: 't', description: '', durationMinutes: 20, completed: false, points: 20, summaryBullets: [] },
    { id: 'v5', category: 'verbal', order: 5, title: 'v5', topic: 't', description: '', durationMinutes: 20, completed: false, points: 20, summaryBullets: [] },
    { id: 'q_full', category: 'quantitative', order: 1, title: 'درس كمي كامل', topic: 't', description: '', durationMinutes: 55, completed: true, points: 50, summaryBullets: [], isFullLesson: true },
  ];

  const progress = calculateLectureProgress(lectures);
  assert.equal(progress.verbalDone, 2);
  assert.equal(progress.verbalTotal, 5);
  assert.equal(progress.quantDone, 1);
  assert.equal(progress.quantTotal, 1);
  assert.equal(progress.totalDone, 3);
  assert.equal(progress.totalLectures, 6);
  assert.equal(progress.percent, 50);
});

test('applyPenaltyLogic deducts points and creates penalty record', () => {
  const result = applyPenaltyLogic(100, 'عدم مذاكرة درس الكمي', 35);
  assert.equal(result.newPoints, 65);
  assert.equal(result.record.pointsDeducted, 35);
  assert.equal(result.record.reason, 'عدم مذاكرة درس الكمي');

  // Should floor at 0
  const floorResult = applyPenaltyLogic(20, 'عقوبة تأخير', 30);
  assert.equal(floorResult.newPoints, 0);
});

test('checkAndCalculateQuduratPenalties calculates correct deduction for uncompleted items', () => {
  const settings: PenaltySettings = {
    autoPenaltyEnabled: true,
    quduratVerbalPenalty: 15,
    quduratQuantLessonPenalty: 35,
    homeworkLatePenalty: 25,
  };

  const lectures: LectureItem[] = [
    { id: 'v1', category: 'verbal', order: 1, title: 'v1', topic: 't', description: '', durationMinutes: 20, completed: false, points: 20, summaryBullets: [] },
    { id: 'v2', category: 'verbal', order: 2, title: 'v2', topic: 't', description: '', durationMinutes: 20, completed: false, points: 20, summaryBullets: [] },
    { id: 'q_full', category: 'quantitative', order: 1, title: 'درس كمي كامل', topic: 't', description: '', durationMinutes: 55, completed: false, points: 50, summaryBullets: [] },
  ];

  const penalties = checkAndCalculateQuduratPenalties(lectures, settings);
  assert.equal(penalties.totalPenalty, 2 * 15 + 35); // 65
  assert.equal(penalties.reasons.length, 2);
});

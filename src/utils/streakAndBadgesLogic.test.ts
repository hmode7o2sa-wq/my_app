import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTimeRemaining,
  updateStreakOnActivity,
  evaluateBadges,
  createBackupJson,
  validateAndParseBackupJson,
  INITIAL_BADGES,
  INITIAL_STREAK,
} from './streakAndBadgesLogic';

test('calculateTimeRemaining returns days, hours, minutes, seconds correctly', () => {
  const now = new Date('2026-11-04T10:00:00Z');
  const target = '2026-11-06T15:30:00Z'; // 2 days, 5 hours, 30 minutes later

  const rem = calculateTimeRemaining(target, now);
  assert.equal(rem.isPast, false);
  assert.equal(rem.days, 2);
  assert.equal(rem.hours, 5);
  assert.equal(rem.minutes, 30);
  assert.equal(rem.seconds, 0);
  assert.match(rem.formattedArabic, /متبقي 2 يوم/);
});

test('calculateTimeRemaining handles past dates gracefully', () => {
  const now = new Date('2026-11-04T10:00:00Z');
  const target = '2026-11-01T10:00:00Z';

  const rem = calculateTimeRemaining(target, now);
  assert.equal(rem.isPast, true);
  assert.match(rem.formattedArabic, /حان موعد الاختبار/);
});

test('updateStreakOnActivity increments streak when active on consecutive day', () => {
  const streak = {
    currentStreak: 3,
    longestStreak: 5,
    lastActiveDate: '2026-11-03',
    freezesRemaining: 2,
  };

  const res = updateStreakOnActivity(streak, '2026-11-04', '2026-11-03');
  assert.equal(res.streakIncreased, true);
  assert.equal(res.streak.currentStreak, 4);
  assert.equal(res.streak.lastActiveDate, '2026-11-04');
});

test('updateStreakOnActivity does not duplicate streak on same day', () => {
  const streak = {
    currentStreak: 4,
    longestStreak: 5,
    lastActiveDate: '2026-11-04',
    freezesRemaining: 2,
  };

  const res = updateStreakOnActivity(streak, '2026-11-04', '2026-11-03');
  assert.equal(res.streakIncreased, false);
  assert.equal(res.streak.currentStreak, 4);
});

test('updateStreakOnActivity uses freeze on missed day if available', () => {
  const streak = {
    currentStreak: 5,
    longestStreak: 5,
    lastActiveDate: '2026-11-01', // missed 2 days
    freezesRemaining: 2,
  };

  const res = updateStreakOnActivity(streak, '2026-11-04', '2026-11-03');
  assert.equal(res.freezeUsed, true);
  assert.equal(res.streak.currentStreak, 5); // preserved
  assert.equal(res.streak.freezesRemaining, 1);
});

test('evaluateBadges unlocks badges when criteria are met', () => {
  const stats = {
    totalVerbalCompleted: 15,
    totalQuantCompleted: 5,
    totalHomeworkCompleted: 10,
    totalPoints: 600,
    currentStreak: 7,
    totalReviewsCount: 5,
    totalRedemptionsCount: 3,
  };

  const res = evaluateBadges(INITIAL_BADGES, stats);
  // qudurat_verbal_master (15), qudurat_quant_beast (5), school_homework_hero (10), streak_7_days (7), points_collector_500 (600), review_faithful (5), reward_enjoyer (3)
  assert.ok(res.newlyUnlocked.length > 0);
  assert.ok(res.totalBonusPoints > 0);
  const verbalBadge = res.updatedBadges.find((b) => b.id === 'qudurat_verbal_master');
  assert.equal(verbalBadge?.unlocked, true);
});

test('createBackupJson and validateAndParseBackupJson round-trip accurately', () => {
  const original = { testKey: 'hello', points: 150 };
  const json = createBackupJson(original);
  const parsed = validateAndParseBackupJson(json);
  assert.equal(parsed.success, true);
  assert.equal((parsed.data as any)?.points, 150);
});

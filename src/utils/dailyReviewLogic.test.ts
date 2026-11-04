import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getRatingDescriptor,
  getTodayDateKey,
  getArabicDayName,
  saveOrUpdateReviewRecord,
  deleteReviewRecord,
  calculateReviewStats,
  checkHasReviewedToday,
  DAILY_REVIEW_BONUS_POINTS,
} from './dailyReviewLogic';
import { DailyReviewRecord } from '../types';

test('getRatingDescriptor handles all 1 to 5 star ratings correctly', () => {
  const r5 = getRatingDescriptor(5);
  assert.equal(r5.stars, 5);
  assert.match(r5.label, /أسطوري/);

  const r4 = getRatingDescriptor(4);
  assert.equal(r4.stars, 4);
  assert.match(r4.label, /ممتاز/);

  const r3 = getRatingDescriptor(3);
  assert.equal(r3.stars, 3);
  assert.match(r3.label, /جيد/);

  const r2 = getRatingDescriptor(2);
  assert.equal(r2.stars, 2);
  assert.match(r2.label, /مقبول/);

  const r1 = getRatingDescriptor(1);
  assert.equal(r1.stars, 1);
  assert.match(r1.label, /تحسين/);

  // Clamping test
  const rClamped = getRatingDescriptor(10);
  assert.equal(rClamped.stars, 5);
});

test('getTodayDateKey formats YYYY-MM-DD properly', () => {
  const d = new Date(2026, 10, 4); // Nov 4, 2026
  assert.equal(getTodayDateKey(d), '2026-11-04');
});

test('saveOrUpdateReviewRecord adds a new review or updates existing by dateStr', () => {
  const initial: DailyReviewRecord[] = [
    {
      id: 'rev_1',
      dateStr: '2026-11-03',
      dayName: 'الثلاثاء',
      rating: 4,
      note: 'ملاحظة قديمة',
      quduratDone: 6,
      quduratTotal: 6,
      homeworkDone: 2,
      pointsEarned: 150,
      createdAt: '2026-11-03T18:00:00Z',
    },
  ];

  // Adding a new date review
  const newRecord: DailyReviewRecord = {
    id: 'rev_2',
    dateStr: '2026-11-04',
    dayName: 'الأربعاء',
    rating: 5,
    note: 'يوم جديد رائع',
    quduratDone: 6,
    quduratTotal: 6,
    homeworkDone: 3,
    pointsEarned: 220,
    createdAt: '2026-11-04T18:00:00Z',
  };

  const res1 = saveOrUpdateReviewRecord(initial, newRecord);
  assert.equal(res1.isNew, true);
  assert.equal(res1.records.length, 2);
  assert.equal(res1.records[0].dateStr, '2026-11-04');

  // Updating existing date review
  const updatedRecord: DailyReviewRecord = {
    ...newRecord,
    rating: 3,
    note: 'ملاحظة معدلة ومحدثة',
  };

  const res2 = saveOrUpdateReviewRecord(res1.records, updatedRecord);
  assert.equal(res2.isNew, false);
  assert.equal(res2.records.length, 2);
  const found = res2.records.find((r) => r.dateStr === '2026-11-04');
  assert.equal(found?.rating, 3);
  assert.equal(found?.note, 'ملاحظة معدلة ومحدثة');
});

test('deleteReviewRecord removes specific review by id', () => {
  const list: DailyReviewRecord[] = [
    {
      id: 'rev_1',
      dateStr: '2026-11-03',
      dayName: 'الثلاثاء',
      rating: 4,
      note: 'ملاحظة',
      quduratDone: 6,
      quduratTotal: 6,
      homeworkDone: 1,
      pointsEarned: 100,
      createdAt: '2026-11-03T18:00:00Z',
    },
  ];

  const after = deleteReviewRecord(list, 'rev_1');
  assert.equal(after.length, 0);
});

test('calculateReviewStats accurately computes average, counts, and streak', () => {
  const reviews: DailyReviewRecord[] = [
    {
      id: 'rev_3',
      dateStr: '2026-11-03',
      dayName: 'الثلاثاء',
      rating: 5,
      note: '',
      quduratDone: 6,
      quduratTotal: 6,
      homeworkDone: 2,
      pointsEarned: 200,
      createdAt: '',
    },
    {
      id: 'rev_2',
      dateStr: '2026-11-02',
      dayName: 'الإثنين',
      rating: 4,
      note: '',
      quduratDone: 5,
      quduratTotal: 6,
      homeworkDone: 1,
      pointsEarned: 160,
      createdAt: '',
    },
    {
      id: 'rev_1',
      dateStr: '2026-11-01',
      dayName: 'الأحد',
      rating: 5,
      note: '',
      quduratDone: 6,
      quduratTotal: 6,
      homeworkDone: 3,
      pointsEarned: 240,
      createdAt: '',
    },
  ];

  const stats = calculateReviewStats(reviews);
  assert.equal(stats.totalReviews, 3);
  assert.equal(stats.fiveStarCount, 2);
  // (5+4+5)/3 = 14/3 = 4.666 -> 4.7
  assert.equal(stats.averageRating, 4.7);
  assert.equal(stats.highRatingPercentage, 100);
});

test('checkHasReviewedToday identifies if today is evaluated', () => {
  const records: DailyReviewRecord[] = [
    {
      id: 'rev_1',
      dateStr: '2026-11-04',
      dayName: 'الأربعاء',
      rating: 5,
      note: '',
      quduratDone: 6,
      quduratTotal: 6,
      homeworkDone: 2,
      pointsEarned: 200,
      createdAt: '',
    },
  ];

  assert.equal(checkHasReviewedToday(records, '2026-11-04'), true);
  assert.equal(checkHasReviewedToday(records, '2026-11-05'), false);
});

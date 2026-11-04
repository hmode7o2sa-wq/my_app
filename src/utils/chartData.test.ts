import test from 'node:test';
import assert from 'node:assert/strict';
import { generateWeeklyChartData, calculateWeeklyTotals } from './chartData';

test('generateWeeklyChartData populates 7 days with correct today values', () => {
  const data = generateWeeklyChartData(2, 3, 1, 150);
  assert.equal(data.length, 7);
  const today = data[6];
  assert.equal(today.verbalDone, 2);
  assert.equal(today.quantDone, 3);
  assert.equal(today.homeworkDone, 1);
  assert.equal(today.totalLectures, 5);
  assert.equal(today.targetLectures, 6);
});

test('calculateWeeklyTotals aggregates lectures, homework and compliance rate', () => {
  const data = generateWeeklyChartData(3, 3, 2, 200);
  const totals = calculateWeeklyTotals(data);
  assert.ok(totals.totalLectures > 30);
  assert.ok(totals.totalHomework >= 10);
  assert.ok(totals.complianceRate > 70);
});

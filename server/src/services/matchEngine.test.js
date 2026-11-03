import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceBall, getMatch, getMissed, resetMatch } from './matchEngine.js';

test('starts with the documented demo chase state', () => {
  const match = resetMatch('t-start-0001');
  assert.equal(match.score, 112);
  assert.equal(match.wickets, 4);
  assert.equal(match.overs, '14.2');
  assert.equal(match.target, 185);
  assert.equal(match.runsRequired, 73);
  assert.equal(match.ballsRemaining, 34);
  assert.equal(match.requiredRunRate, 12.88);
  assert.equal(match.battingTeam, 'Pune Panthers');
});

test('advances one legal delivery and recalculates chase metrics', () => {
  const id = 't-advance-01';
  resetMatch(id);
  const result = advanceBall(id);
  assert.equal(result.match.legalBalls, 87);
  assert.equal(result.match.overs, '14.3');
  assert.equal(result.match.score, 113);
  assert.equal(result.match.runsRequired, 72);
  assert.equal(result.match.ballsRemaining, 33);
  assert.equal(result.match.recentBalls.length, 6);
});

test('reset restores the initial state after a delivery', () => {
  const id = 't-reset-0001';
  advanceBall(id);
  const match = resetMatch(id);
  assert.equal(match.score, 112);
  assert.equal(match.legalBalls, 86);
});

test('match snapshots are copies and cannot mutate engine state', () => {
  const id = 't-copy-00001';
  const snapshot = getMatch(id);
  snapshot.score = -1;
  assert.equal(getMatch(id).score, 112);
});

test('each visitor session has its own match', () => {
  resetMatch('visitor-aaaa');
  resetMatch('visitor-bbbb');
  advanceBall('visitor-aaaa', 12);
  assert.equal(getMatch('visitor-aaaa').legalBalls, 98);
  assert.equal(getMatch('visitor-bbbb').legalBalls, 86);
});

test('a wicket removes the dismissed batter and resets the partnership', () => {
  const id = 't-wicket-001';
  resetMatch(id);
  advanceBall(id, 5); // the 5th ball of the scripted sequence is a wicket
  const m = getMatch(id);
  assert.equal(m.wickets, 5);
  assert.equal(m.batters.length, 2);
  assert.ok(m.batters.some((b) => b.name === 'S. Naik'));
  advanceBall(id, 6);
  assert.equal(getMatch(id).batters.length, 2);
  const after = resetMatch(id);
  assert.equal(after.partnership.balls, 6);
  advanceBall(id, 5);
  assert.equal(getMatch(id).partnership.balls, 0);
});

test('missed-ball window covers only what happened since the fan last looked', () => {
  const id = 't-missed-001';
  resetMatch(id);
  const before = getMatch(id).legalBalls;
  advanceBall(id, 12);
  const missed = getMissed(id, { sinceBalls: before });
  assert.equal(missed.count, 12);
  assert.equal(missed.fromBalls, before);
  assert.equal(missed.toBalls, before + 12);
  assert.equal(missed.runs, missed.balls.reduce((t, b) => t + b.runs, 0));
  assert.equal(getMissed(id, { sinceBalls: before + 12 }).count, 0);
  assert.equal(getMissed(id, { lastOvers: 2 }).count, 12);
});

test('asking for more history than exists is flagged as truncated', () => {
  const missed = getMissed('t-trunc-0001', { lastOvers: 10 });
  assert.equal(missed.count, 12);
  assert.equal(missed.truncated, true);
});

test('the innings ends cleanly and reports a result', () => {
  const id = 't-end-000001';
  resetMatch(id);
  for (let i = 0; i < 10; i += 1) advanceBall(id, 18);
  const m = getMatch(id);
  assert.ok(m.chaseStatus !== 'CHASE IN PROGRESS');
  assert.ok(typeof m.resultText === 'string');
  assert.equal(advanceBall(id).advanced, 0);
});

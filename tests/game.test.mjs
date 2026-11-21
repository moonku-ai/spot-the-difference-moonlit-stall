import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, LEVELS } from '../game/src/game.js';

const firstDiff = () => LEVELS[0].diffs[0];

test('new game starts on the title screen', () => {
  const g = createGame();
  assert.equal(g.status, 'title');
  assert.equal(g.levelIndex, 0);
  assert.equal(g.score, 0);
});

test('start begins level 1 with 7 remaining and a full timer', () => {
  const g = createGame();
  g.start(0);
  assert.equal(g.status, 'playing');
  assert.equal(g.remaining(), 7);
  assert.equal(g.found.size, 0);
  assert.equal(g.hintsLeft, 3);
  assert.ok(g.timeLeft > 0);
});

test('clicking a difference marks it found and adds score', () => {
  const g = createGame();
  g.start(0);
  const d = firstDiff();
  const res = g.click(d.x, d.y, 'left');
  assert.equal(res.hit, true);
  assert.equal(res.diffId, d.id);
  assert.equal(g.remaining(), 6);
  assert.ok(g.score >= 100);
});

test('clicking the same difference twice only counts once', () => {
  const g = createGame();
  g.start(0);
  const d = firstDiff();
  g.click(d.x, d.y, 'left');
  const score = g.score;
  const res = g.click(d.x, d.y, 'right');
  assert.equal(res.hit, false);
  assert.equal(res.alreadyFound, true);
  assert.equal(g.score, score);
});

test('the same coords hit on either panel', () => {
  const g = createGame();
  g.start(0);
  const d = LEVELS[0].diffs[1];
  const res = g.click(d.x, d.y, 'right');
  assert.equal(res.hit, true);
  assert.equal(res.diffId, d.id);
});

test('clicking empty space is a miss: mistake, streak reset, time penalty', () => {
  const g = createGame();
  g.start(0);
  const t0 = g.timeLeft;
  const res = g.click(300, 400, 'left'); // empty corner area (no diff there)
  assert.equal(res.hit, false);
  assert.equal(g.mistakes, 1);
  assert.ok(g.timeLeft < t0);
});

test('a streak adds a bonus on consecutive finds', () => {
  const g = createGame();
  g.start(0);
  const [a, b] = LEVELS[0].diffs;
  g.click(a.x, a.y, 'left');
  const s1 = g.score;
  g.click(b.x, b.y, 'left');
  assert.ok(g.score - s1 > 100, `streak bonus missing: ${g.score - s1}`);
});

test('hint reveals an unfound difference and spends one hint', () => {
  const g = createGame();
  g.start(0);
  const hinted = g.hint();
  assert.ok(hinted, 'hint should return a diff id');
  assert.equal(g.hintsLeft, 2);
  assert.ok(g.hinted.has(hinted));
  assert.equal(g.remaining(), 7, 'a hint does not count as found');
});

test('hint with no hints left returns null', () => {
  const g = createGame();
  g.start(0);
  g.hint(); g.hint(); g.hint();
  assert.equal(g.hint(), null);
  assert.equal(g.hintsLeft, 0);
});

test('finding all 7 completes the level with a time bonus', () => {
  const g = createGame();
  g.start(0);
  const before = g.score;
  for (const d of LEVELS[0].diffs) g.click(d.x, d.y, 'left');
  assert.equal(g.status, 'level-complete');
  assert.ok(g.score > before, 'time bonus missing');
});

test('timer running out ends the level', () => {
  const g = createGame();
  g.start(0);
  g.tick(g.timeLeft + 1);
  assert.equal(g.status, 'timeup');
});

test('clicks do nothing while not playing', () => {
  const g = createGame();
  const res = g.click(100, 100, 'left');
  assert.equal(res.hit, false);
  assert.equal(g.score, 0);
});

test('next level advances; finishing level 3 wins the game', () => {
  const g = createGame();
  g.start(0);
  for (const d of LEVELS[0].diffs) g.click(d.x, d.y, 'left');
  g.nextLevel();
  assert.equal(g.levelIndex, 1);
  assert.equal(g.status, 'playing');
  assert.equal(g.remaining(), 7);
  // finish levels 2 and 3
  for (const li of [1, 2]) {
    for (const d of LEVELS[li].diffs) g.click(d.x, d.y, 'left');
    if (li < 2) g.nextLevel();
  }
  assert.equal(g.status, 'won');
});

test('setTimeLeft freezes the clock (screenshot mode)', () => {
  const g = createGame();
  g.start(0);
  g.setTimeLeft(120);
  assert.equal(g.timeLeft, 120);
  assert.equal(g.status, 'playing');
});

test('restart resets the current level', () => {
  const g = createGame();
  g.start(0);
  const d = firstDiff();
  g.click(d.x, d.y, 'left');
  g.restart();
  assert.equal(g.status, 'playing');
  assert.equal(g.remaining(), 7);
  assert.equal(g.score, 0);
  assert.equal(g.mistakes, 0);
});

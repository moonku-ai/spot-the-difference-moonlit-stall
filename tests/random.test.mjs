import test from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32, pick, shuffle } from '../game/src/random.js';

test('mulberry32: same seed gives the same sequence', () => {
  const a = mulberry32(42);
  const b = mulberry32(42);
  for (let i = 0; i < 20; i++) assert.equal(a(), b());
});

test('mulberry32: outputs are in [0, 1)', () => {
  const rng = mulberry32(7);
  for (let i = 0; i < 1000; i++) {
    const v = rng();
    assert.ok(v >= 0 && v < 1, `out of range: ${v}`);
  }
});

test('mulberry32: different seeds give different sequences', () => {
  const a = mulberry32(1);
  const b = mulberry32(2);
  let same = 0;
  for (let i = 0; i < 10; i++) if (a() === b()) same++;
  assert.ok(same < 10, 'sequences should differ');
});

test('pick: returns an element of the array', () => {
  const rng = mulberry32(3);
  const arr = ['a', 'b', 'c'];
  for (let i = 0; i < 20; i++) assert.ok(arr.includes(pick(rng, arr)));
});

test('shuffle: keeps every element, changes order for a seeded rng', () => {
  const rng = mulberry32(9);
  const out = shuffle(rng, [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual([...out].sort((x, y) => x - y), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.notDeepEqual(out, [1, 2, 3, 4, 5, 6, 7, 8]);
});

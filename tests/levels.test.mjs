import test from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS, PANEL_W, PANEL_H, DIFFS_PER_LEVEL } from '../game/src/levels.js';

test('there are 3 levels, each with 7 differences', () => {
  assert.equal(LEVELS.length, 3);
  for (const level of LEVELS) {
    assert.equal(level.diffs.length, DIFFS_PER_LEVEL, level.id);
    assert.ok(level.name.length > 0);
    assert.ok(level.seed > 0);
  }
});

test('level ids and diff ids are unique', () => {
  const ids = LEVELS.map((l) => l.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const level of LEVELS) {
    const dIds = level.diffs.map((d) => d.id);
    assert.equal(new Set(dIds).size, dIds.length, level.id);
  }
});

test('every difference sits inside the panel with a sane hit radius', () => {
  for (const level of LEVELS) {
    for (const d of level.diffs) {
      assert.ok(d.x >= d.r && d.x <= PANEL_W - d.r, `${level.id}/${d.id} x=${d.x}`);
      assert.ok(d.y >= d.r && d.y <= PANEL_H - d.r, `${level.id}/${d.id} y=${d.y}`);
      assert.ok(d.r >= 20 && d.r <= 42, `${level.id}/${d.id} r=${d.r}`);
      assert.ok(typeof d.label === 'string' && d.label.length > 0);
      assert.ok(['remove', 'add', 'move', 'color', 'shape', 'count', 'text'].includes(d.kind));
    }
  }
});

test('differences are far enough apart that markers never overlap', () => {
  for (const level of LEVELS) {
    for (let i = 0; i < level.diffs.length; i++) {
      for (let j = i + 1; j < level.diffs.length; j++) {
        const a = level.diffs[i];
        const b = level.diffs[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        assert.ok(dist >= 64, `${level.id}: ${a.id} and ${b.id} only ${dist.toFixed(1)}px apart`);
      }
    }
  }
});

test('panel dimensions are 560x420', () => {
  assert.equal(PANEL_W, 560);
  assert.equal(PANEL_H, 420);
});

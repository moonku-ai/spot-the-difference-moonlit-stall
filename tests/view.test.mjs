import test from 'node:test';
import assert from 'node:assert/strict';
import { toPanelCoords } from '../game/src/input.js';
import { SHOT_PRESETS } from '../game/src/shots.js';

test('toPanelCoords maps a click to panel space', () => {
  const rect = { left: 100, top: 50, width: 560, height: 420 };
  assert.deepEqual(toPanelCoords(100, 50, rect), { x: 0, y: 0 });
  assert.deepEqual(toPanelCoords(380, 260, rect), { x: 280, y: 210 });
  assert.deepEqual(toPanelCoords(660, 470, rect), { x: 560, y: 420 });
});

test('toPanelCoords scales when the canvas is displayed smaller', () => {
  const rect = { left: 0, top: 0, width: 280, height: 210 };
  assert.deepEqual(toPanelCoords(140, 105, rect), { x: 280, y: 210 });
});

test('toPanelCoords returns null outside the panel', () => {
  const rect = { left: 100, top: 50, width: 560, height: 420 };
  assert.equal(toPanelCoords(99, 100, rect), null);
  assert.equal(toPanelCoords(200, 471, rect), null);
});

test('shot presets: start shows nothing found, play shows some found, end shows all found', () => {
  assert.deepEqual(SHOT_PRESETS.start.found, []);
  assert.ok(SHOT_PRESETS.play.found.length >= 2 && SHOT_PRESETS.play.found.length < 7);
  assert.equal(SHOT_PRESETS.end.found.length, 7);
  assert.equal(SHOT_PRESETS.play.remainingLabel, '4');
});

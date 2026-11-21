// Deterministic screenshot presets: `?shot=start|play|play2|end` drives the
// real game (clicks go through the normal rules) so every screenshot is a
// true render of the game's own code, with the same state every run.

import { LEVELS } from './levels.js';

const L0 = LEVELS[0].diffs.map((d) => d.id);
const L1 = LEVELS[1].diffs.map((d) => d.id);
const L2 = LEVELS[2].diffs.map((d) => d.id);

export const SHOT_PRESETS = {
  // Title screen over level 1, nothing found yet.
  start: { level: 0, found: [], overlay: 'title', remainingLabel: '7' },
  // Mid-play on level 1: 3 found (green rings), 4 still hidden.
  play: { level: 0, found: L0.slice(0, 3), overlay: null, remainingLabel: '4' },
  // Mid-play on level 2: 5 found, 2 still hidden.
  play2: { level: 1, found: L1.slice(0, 5), overlay: null, remainingLabel: '2' },
  // Mid-play on level 3: 4 found, 3 still hidden.
  play3: { level: 2, found: L2.slice(0, 4), overlay: null, remainingLabel: '3' },
  // Level 1 complete: all 7 found, completion overlay up.
  end: { level: 0, found: L0.slice(), overlay: 'level-complete', remainingLabel: '0' },
};

// Applies a preset to a fresh game by playing the clicks for real.
export function applyShot(game, name) {
  const preset = SHOT_PRESETS[name];
  if (!preset) return null;
  game.start(preset.level);
  for (const id of preset.found) {
    const d = game.level.diffs.find((x) => x.id === id);
    if (d) game.click(d.x, d.y, 'left');
  }
  return preset;
}

// Pure game state machine for Spot the Difference. No DOM, no canvas, no
// timers of its own: the view calls tick(dt) and click(x, y, panel) and reads
// the state back. That makes the whole ruleset unit-testable in Node.

import { LEVELS, DIFFS_PER_LEVEL } from './levels.js';

export { LEVELS } from './levels.js';

export const FIND_POINTS = 100;
export const STREAK_BONUS = 25;
export const MISS_PENALTY_SEC = 5;
export const HINTS_PER_LEVEL = 3;

export function createGame() {
  const state = {
    status: 'title', // title | playing | level-complete | won | timeup
    levelIndex: 0,
    score: 0,
    scoreAtLevelStart: 0,
    found: new Set(),
    hinted: new Set(),
    mistakes: 0,
    streak: 0,
    bestStreak: 0,
    hintsLeft: HINTS_PER_LEVEL,
    timeLeft: 0,
    timeBonus: 0,
  };

  function level() {
    return LEVELS[state.levelIndex];
  }

  function start(levelIndex) {
    state.levelIndex = levelIndex;
    state.scoreAtLevelStart = state.score;
    state.found = new Set();
    state.hinted = new Set();
    state.mistakes = 0;
    state.streak = 0;
    state.hintsLeft = HINTS_PER_LEVEL;
    state.timeLeft = level().timeLimit;
    state.timeBonus = 0;
    state.status = 'playing';
  }

  function remaining() {
    return DIFFS_PER_LEVEL - state.found.size;
  }

  function click(x, y, panel) {
    if (state.status !== 'playing') return { hit: false, ignored: true };
    if (panel !== 'left' && panel !== 'right') return { hit: false, ignored: true };
    for (const d of level().diffs) {
      if (Math.hypot(x - d.x, y - d.y) > d.r) continue;
      if (state.found.has(d.id)) return { hit: false, alreadyFound: true, diffId: d.id };
      state.found.add(d.id);
      state.hinted.delete(d.id);
      state.streak += 1;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
      const points = FIND_POINTS + STREAK_BONUS * (state.streak - 1);
      state.score += points;
      if (state.found.size === DIFFS_PER_LEVEL) {
        state.timeBonus = Math.round(state.timeLeft) * 2;
        state.score += state.timeBonus;
        state.status = state.levelIndex === LEVELS.length - 1 ? 'won' : 'level-complete';
      }
      return { hit: true, diffId: d.id, points, remaining: remaining() };
    }
    state.mistakes += 1;
    state.streak = 0;
    state.timeLeft = Math.max(0, state.timeLeft - MISS_PENALTY_SEC);
    return { hit: false, miss: true };
  }

  function hint() {
    if (state.status !== 'playing' || state.hintsLeft <= 0) return null;
    const unfound = level().diffs.filter((d) => !state.found.has(d.id) && !state.hinted.has(d.id));
    if (unfound.length === 0) return null;
    const d = unfound[Math.floor(Math.random() * unfound.length)];
    state.hinted.add(d.id);
    state.hintsLeft -= 1;
    return d.id;
  }

  function tick(dt) {
    if (state.status !== 'playing') return;
    state.timeLeft -= dt;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.status = 'timeup';
    }
  }

  function nextLevel() {
    if (state.status !== 'level-complete') return false;
    start(state.levelIndex + 1);
    return true;
  }

  function restart() {
    state.score = state.scoreAtLevelStart;
    start(state.levelIndex);
  }

  // Back to the title screen (view navigation only; no rule changes).
  function toTitle() {
    state.status = 'title';
  }

  // Freeze the clock at a fixed value (screenshot mode only).
  function setTimeLeft(seconds) {
    state.timeLeft = seconds;
  }

  return {
    get status() {
      return state.status;
    },
    get levelIndex() {
      return state.levelIndex;
    },
    get score() {
      return state.score;
    },
    get scoreAtLevelStart() {
      return state.scoreAtLevelStart;
    },
    get found() {
      return state.found;
    },
    get hinted() {
      return state.hinted;
    },
    get mistakes() {
      return state.mistakes;
    },
    get streak() {
      return state.streak;
    },
    get bestStreak() {
      return state.bestStreak;
    },
    get hintsLeft() {
      return state.hintsLeft;
    },
    get timeLeft() {
      return state.timeLeft;
    },
    get timeBonus() {
      return state.timeBonus;
    },
    get level() {
      return level();
    },
    start,
    remaining,
    click,
    hint,
    tick,
    nextLevel,
    restart,
    toTitle,
    setTimeLeft,
  };
}

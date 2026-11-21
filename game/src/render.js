// Rendering + HUD: draws both panels from the game state and keeps the DOM
// HUD (score, timer, dots, counter) in sync. The view never owns rules —
// every number it shows comes from the game object.

import { drawScene } from './scenes.js';

export function createRenderer(doc) {
  const left = doc.getElementById('panel-left');
  const right = doc.getElementById('panel-right');
  const lctx = left.getContext('2d');
  const rctx = right.getContext('2d');

  const el = (id) => doc.getElementById(id);
  const hud = {
    levelName: el('hud-level'),
    score: el('hud-score'),
    timerText: el('hud-timer'),
    timerFill: el('timer-fill'),
    remaining: el('hud-remaining'),
    dots: el('hud-dots'),
    hints: el('hud-hints'),
    foundList: el('found-list'),
  };

  function draw(game, timeMs = 0) {
    drawScene(lctx, game.level, 'A', game.found, game.hinted, timeMs);
    drawScene(rctx, game.level, 'B', game.found, game.hinted, timeMs);
  }

  function updateHud(game) {
    const level = game.level;
    hud.levelName.textContent = `Level ${game.levelIndex + 1} · ${level.name}`;
    hud.score.textContent = String(game.score);
    const secs = Math.max(0, Math.ceil(game.timeLeft));
    hud.timerText.textContent = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
    const pct = Math.max(0, Math.min(100, (game.timeLeft / level.timeLimit) * 100));
    hud.timerFill.style.transform = `scaleX(${pct / 100})`;
    hud.timerFill.classList.toggle('low', pct < 25);
    hud.remaining.textContent = String(game.remaining());
    hud.hints.textContent = `Petunjuk ${game.hintsLeft}`;
    hud.dots.innerHTML = '';
    for (let i = 0; i < 7; i++) {
      const dot = doc.createElement('span');
      dot.className = 'dot' + (i < game.found.size ? ' found' : '');
      hud.dots.appendChild(dot);
    }
    hud.foundList.innerHTML = '';
    for (const d of level.diffs) {
      if (!game.found.has(d.id)) continue;
      const li = doc.createElement('li');
      li.textContent = `✓ ${d.label}`;
      hud.foundList.appendChild(li);
    }
  }

  function showOverlay(name) {
    for (const ov of doc.querySelectorAll('.overlay')) ov.classList.remove('show');
    if (!name) return;
    const target = doc.getElementById(`overlay-${name}`);
    if (target) target.classList.add('show');
  }

  return { draw, updateHud, showOverlay, left, right };
}

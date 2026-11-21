// Boot + game loop: wires clicks, keyboard, buttons and the timer, and
// drives the renderer. Shot mode (?shot=...) renders one frozen preset for
// screenshots and never starts the timer.

import { createGame } from './game.js';
import { createRenderer } from './render.js';
import { toPanelCoords } from './input.js';
import { sfx, isMuted, setMuted } from './audio.js';
import { applyShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');

const game = createGame();
const renderer = createRenderer(document);

let lastTs = 0;
let shotMode = false;

function refresh(timeMs = 0) {
  renderer.draw(game, timeMs);
  renderer.updateHud(game);
}

function syncOverlays() {
  if (game.status === 'title') renderer.showOverlay('title');
  else if (game.status === 'level-complete') {
    document.getElementById('complete-title').textContent = 'Level selesai!';
    document.getElementById('complete-stats').textContent =
      `Bonus waktu +${game.timeBonus} · Skor ${game.score}`;
    document.getElementById('btn-next').style.display = '';
    renderer.showOverlay('complete');
  } else if (game.status === 'won') {
    document.getElementById('complete-title').textContent = 'Kamu menang!';
    document.getElementById('complete-stats').textContent =
      `Skor akhir ${game.score} · ${game.bestStreak} beruntun terbaik · ${game.mistakes} salah klik`;
    document.getElementById('btn-next').style.display = 'none';
    renderer.showOverlay('complete');
    sfx('win');
  } else if (game.status === 'timeup') {
    document.getElementById('timeup-stats').textContent =
      `${game.found.size} dari 7 ketemu · Skor ${game.score}`;
    renderer.showOverlay('timeup');
  } else {
    renderer.showOverlay(null);
  }
}

function onPanelClick(ev, side) {
  if (shotMode) return;
  const canvas = side === 'left' ? renderer.left : renderer.right;
  const pos = toPanelCoords(ev.clientX, ev.clientY, canvas.getBoundingClientRect());
  if (!pos) return;
  const res = game.click(pos.x, pos.y, side);
  if (res.hit) {
    sfx('find');
    if (game.status === 'level-complete') sfx('complete');
  } else if (res.miss) {
    sfx('miss');
  }
  refresh();
  syncOverlays();
}

renderer.left.addEventListener('click', (ev) => onPanelClick(ev, 'left'));
renderer.right.addEventListener('click', (ev) => onPanelClick(ev, 'right'));

document.getElementById('btn-hint').addEventListener('click', () => {
  if (shotMode) return;
  const id = game.hint();
  if (id) {
    sfx('hint');
    refresh();
  }
});
document.getElementById('btn-restart').addEventListener('click', () => {
  if (shotMode) return;
  sfx('click');
  game.restart();
  refresh();
  syncOverlays();
});
document.getElementById('btn-sound').addEventListener('click', (ev) => {
  setMuted(!isMuted());
  ev.currentTarget.textContent = isMuted() ? 'Suara: Mati' : 'Suara: Nyala';
});
document.getElementById('btn-play').addEventListener('click', () => {
  sfx('click');
  game.start(0);
  refresh();
  syncOverlays();
});
document.getElementById('btn-next').addEventListener('click', () => {
  sfx('click');
  game.nextLevel();
  refresh();
  syncOverlays();
});
document.getElementById('btn-retry').addEventListener('click', () => {
  sfx('click');
  game.restart();
  refresh();
  syncOverlays();
});
document.getElementById('btn-title').addEventListener('click', () => {
  sfx('click');
  game.toTitle();
  refresh();
  syncOverlays();
});
for (const btn of document.querySelectorAll('[data-level]')) {
  btn.addEventListener('click', () => {
    sfx('click');
    game.start(Number(btn.dataset.level));
    refresh();
    syncOverlays();
  });
}
document.getElementById('btn-howto').addEventListener('click', () => {
  renderer.showOverlay('howto');
});
document.getElementById('btn-howto-close').addEventListener('click', () => {
  syncOverlays();
});

window.addEventListener('keydown', (ev) => {
  if (ev.key === 'h' || ev.key === 'H') {
    if (!shotMode && game.status === 'playing') {
      const id = game.hint();
      if (id) {
        sfx('hint');
        refresh();
      }
    }
  } else if (ev.key === 'r' || ev.key === 'R') {
    if (!shotMode && game.status !== 'title') {
      game.restart();
      refresh();
      syncOverlays();
    }
  } else if (ev.key === 'm' || ev.key === 'M') {
    setMuted(!isMuted());
    document.getElementById('btn-sound').textContent = isMuted() ? 'Suara: Mati' : 'Suara: Nyala';
  } else if (ev.key >= '1' && ev.key <= '3') {
    if (!shotMode) {
      game.start(Number(ev.key) - 1);
      refresh();
      syncOverlays();
    }
  }
});

// Scale the fixed 1280x800 stage to fit the window.
function fitStage() {
  const stage = document.getElementById('stage');
  const scale = Math.min(window.innerWidth / 1280, window.innerHeight / 800, 1.15);
  stage.style.transform = `scale(${scale})`;
}
window.addEventListener('resize', fitStage);
fitStage();

// Initial state: title screen over level 1, or a frozen shot preset.
if (shotName) {
  shotMode = true;
  const preset = applyShot(game, shotName);
  if (preset) {
    // Freeze the clock for a stable screenshot.
    game.setTimeLeft(120);
    refresh(0);
    if (preset.overlay === 'title') renderer.showOverlay('title');
    else if (preset.overlay === 'level-complete') syncOverlays();
    else renderer.showOverlay(null);
  } else {
    game.start(0);
    refresh();
    syncOverlays();
  }
} else {
  game.start(0);
  game.toTitle();
  refresh();
  syncOverlays();
  // Timer + hint pulse loop (only while actually playing).
  const loop = (ts) => {
    const dt = lastTs === 0 ? 0 : Math.min(0.1, (ts - lastTs) / 1000);
    lastTs = ts;
    if (game.status === 'playing') {
      game.tick(dt);
      refresh(ts);
      renderer.updateHud(game);
      if (game.status === 'timeup') syncOverlays();
    } else if (game.hinted.size > 0) {
      refresh(ts);
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

document.getElementById('btn-sound').textContent = isMuted() ? 'Suara: Mati' : 'Suara: Nyala';

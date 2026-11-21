// Tiny WebAudio sound effects, synthesized — no audio files, no network.
// All sounds are short and quiet; the mute toggle is in the HUD.

let ctx = null;
let muted = false;

try {
  muted = localStorage.getItem('std-muted') === '1';
} catch {
  muted = false;
}

export function isMuted() {
  return muted;
}

export function setMuted(value) {
  muted = value;
  try {
    localStorage.setItem('std-muted', value ? '1' : '0');
  } catch {
    // storage unavailable (file:// in some browsers): mute still works in memory
  }
}

function ensureCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq, startAt, dur, type = 'sine', vol = 0.12) {
  const ac = ensureCtx();
  if (!ac || muted) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, ac.currentTime + startAt);
  gain.gain.linearRampToValueAtTime(vol, ac.currentTime + startAt + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + startAt + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(ac.currentTime + startAt);
  osc.stop(ac.currentTime + startAt + dur + 0.05);
}

export function sfx(name) {
  if (muted) return;
  switch (name) {
    case 'find': // bright two-note pop
      tone(660, 0, 0.12, 'sine', 0.14);
      tone(990, 0.07, 0.16, 'sine', 0.12);
      break;
    case 'miss': // low dull buzz
      tone(140, 0, 0.18, 'sawtooth', 0.06);
      break;
    case 'hint': // soft blip
      tone(880, 0, 0.1, 'triangle', 0.1);
      break;
    case 'click':
      tone(520, 0, 0.06, 'triangle', 0.08);
      break;
    case 'complete': // rising arpeggio
      [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.18, 'sine', 0.12));
      break;
    case 'win': // little fanfare
      [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.11, 0.22, 'triangle', 0.12));
      break;
    default:
      break;
  }
}

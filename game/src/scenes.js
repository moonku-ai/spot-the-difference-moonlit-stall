// Procedural scene art: every picture is drawn from code, so the game loads
// with no network request and no asset files. Each scene draws the same base
// picture on both panels from one seeded RNG; the seven scripted differences
// (levels.js) branch on `side` ('A' = left, 'B' = right). Found differences
// get a green ring, hinted ones a pulsing gold ring.

import { mulberry32 } from './random.js';
import { LEVELS, PANEL_W, PANEL_H } from './levels.js';

// ---- small drawing helpers -------------------------------------------------

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

function star4(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
}

function linGrad(ctx, x0, y0, x1, y1, stops) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  for (const [at, color] of stops) g.addColorStop(at, color);
  return g;
}

// A paper lantern with a warm glow.
function lantern(ctx, x, y, r, color) {
  const glow = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 2.2);
  glow.addColorStop(0, 'rgba(255, 190, 90, 0.55)');
  glow.addColorStop(1, 'rgba(255, 190, 90, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(x - r * 2.2, y - r * 2.2, r * 4.4, r * 4.4);
  ctx.fillStyle = color;
  circle(ctx, x, y, r);
  ctx.fill();
  ctx.strokeStyle = 'rgba(120, 40, 20, 0.55)';
  ctx.lineWidth = 2;
  for (const dy of [-r * 0.45, 0, r * 0.45]) {
    ctx.beginPath();
    ctx.moveTo(x - r * 0.85, y + dy);
    ctx.quadraticCurveTo(x, y + dy + r * 0.18, x + r * 0.85, y + dy);
    ctx.stroke();
  }
  ctx.fillStyle = '#7c2d12';
  ctx.fillRect(x - 5, y - r - 4, 10, 5);
  ctx.fillRect(x - 5, y + r - 1, 10, 5);
}

// A sitting cat silhouette (body, head, ears, tail).
function cat(ctx, x, y, s, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, 16 * s, 20 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  circle(ctx, x + 2 * s, y - 24 * s, 11 * s);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - 6 * s, y - 30 * s);
  ctx.lineTo(x - 3 * s, y - 40 * s);
  ctx.lineTo(x + 1 * s, y - 31 * s);
  ctx.moveTo(x + 6 * s, y - 31 * s);
  ctx.lineTo(x + 10 * s, y - 40 * s);
  ctx.lineTo(x + 13 * s, y - 30 * s);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 14 * s, y + 14 * s);
  ctx.quadraticCurveTo(x + 34 * s, y + 10 * s, x + 30 * s, y - 12 * s);
  ctx.quadraticCurveTo(x + 28 * s, y - 18 * s, x + 24 * s, y - 12 * s);
  ctx.quadraticCurveTo(x + 26 * s, y + 6 * s, x + 12 * s, y + 12 * s);
  ctx.fill();
}

// A steaming noodle bowl.
function bowl(ctx, x, y, s, steam) {
  if (steam) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    for (const [ox, ph] of [[-12, 0], [0, 2], [12, 1]]) {
      ctx.beginPath();
      ctx.moveTo(x + ox * s, y - 14 * s);
      ctx.bezierCurveTo(
        x + (ox - 8) * s, y - (26 + ph * 4) * s,
        x + (ox + 8) * s, y - (34 + ph * 4) * s,
        x + ox * s, y - (46 + ph * 3) * s,
      );
      ctx.stroke();
    }
  }
  // Rim, soup, then the bowl body hanging below the rim line.
  ctx.fillStyle = '#fde68a';
  ctx.beginPath();
  ctx.ellipse(x, y, 26 * s, 10 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#d97706';
  ctx.beginPath();
  ctx.ellipse(x, y, 21 * s, 7 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.moveTo(x - 26 * s, y);
  ctx.ellipse(x, y, 26 * s, 16 * s, 0, 0, Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#7c2d12';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 20 * s, y - 16 * s);
  ctx.lineTo(x + 8 * s, y - 30 * s);
  ctx.moveTo(x - 12 * s, y - 16 * s);
  ctx.lineTo(x + 16 * s, y - 30 * s);
  ctx.stroke();
}

// ---- scene 1: Warung Mie Bulan (moonlit noodle stall) -----------------------

function drawNoodleStall(ctx, side, rng) {
  // Night sky
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, PANEL_H, [[0, '#171d3d'], [0.6, '#2b3a6e'], [1, '#3d4a7d']]);
  ctx.fillRect(0, 0, PANEL_W, PANEL_H);

  // Stars (same positions both sides; one extra star is the 'star' diff)
  for (let i = 0; i < 42; i++) {
    const sx = 20 + rng() * (PANEL_W - 40);
    const sy = 12 + rng() * 150;
    const sr = 0.8 + rng() * 1.6;
    ctx.fillStyle = `rgba(255, 244, 200, ${0.35 + rng() * 0.6})`;
    circle(ctx, sx, sy, sr);
    ctx.fill();
  }
  if (side === 'B') star4(ctx, 200, 60, 9, '#fde68a');

  // Moon: full in A, crescent in B
  ctx.fillStyle = '#fde68a';
  circle(ctx, 478, 62, 26);
  ctx.fill();
  ctx.fillStyle = 'rgba(217, 160, 60, 0.5)';
  circle(ctx, 470, 56, 5);
  ctx.fill();
  circle(ctx, 486, 70, 4);
  ctx.fill();
  if (side === 'B') {
    ctx.fillStyle = '#232c55';
    circle(ctx, 490, 56, 23);
    ctx.fill();
  }

  // Distant rooftops
  ctx.fillStyle = '#131a33';
  ctx.beginPath();
  ctx.moveTo(0, 300);
  ctx.lineTo(70, 250);
  ctx.lineTo(140, 300);
  ctx.lineTo(210, 262);
  ctx.lineTo(300, 300);
  ctx.lineTo(380, 258);
  ctx.lineTo(460, 300);
  ctx.lineTo(560, 270);
  ctx.lineTo(560, 420);
  ctx.lineTo(0, 420);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(253, 230, 138, 0.85)';
  for (const [wx, wy] of [[90, 278], [250, 282], [420, 280]]) {
    ctx.fillRect(wx, wy, 10, 12);
  }

  // Stall awning (red / cream stripes) + posts
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#dc2626' : '#fef3c7';
    ctx.fillRect(120 + i * 40, 128, 40, 26);
  }
  ctx.fillStyle = '#7f1d1d';
  ctx.fillRect(120, 150, 320, 6);
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(128, 156, 8, 150);
  ctx.fillRect(424, 156, 8, 150);

  // Sign board: "MIE AYAM" in A, "MIE AYAN" in B
  ctx.fillStyle = '#3f2d1e';
  rr(ctx, 218, 168, 124, 34, 6);
  ctx.fill();
  ctx.strokeStyle = '#d9a066';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#fde68a';
  ctx.font = 'bold 20px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(side === 'A' ? 'MIE AYAM' : 'MIE AYAN', 280, 186);

  // Lanterns on a string (middle one is the 'lantern' diff)
  ctx.strokeStyle = '#3f2d1e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, 92);
  ctx.quadraticCurveTo(280, 108, 500, 92);
  ctx.stroke();
  lantern(ctx, 110, 96, 17, '#f97316');
  if (side === 'A') lantern(ctx, 280, 104, 17, '#ef4444');
  lantern(ctx, 450, 96, 17, '#f59e0b');

  // Counter
  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(90, 306, 380, 14);
  ctx.fillStyle = '#a06a35';
  for (let x = 90; x < 470; x += 24) ctx.fillRect(x, 320, 2, 34);
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(90, 320, 380, 34);
  ctx.fillStyle = '#54371c';
  ctx.fillRect(90, 354, 380, 10);

  // Bowls: three in A, two in B (middle bowl is the 'bowls' diff)
  bowl(ctx, 180, 292, 1, true);
  if (side === 'A') bowl(ctx, 290, 292, 1, true);
  bowl(ctx, 380, 292, 1, side === 'A');

  // Cat: on the stool in A, on the roof in B
  if (side === 'A') {
    ctx.fillStyle = '#6b4423';
    ctx.fillRect(70, 356, 44, 8);
    ctx.fillRect(76, 364, 6, 30);
    ctx.fillRect(102, 364, 6, 30);
    cat(ctx, 92, 336, 0.9, '#52525b');
  } else {
    cat(ctx, 432, 128, 0.85, '#52525b');
  }

  // String lights under the awning
  for (let i = 0; i < 9; i++) {
    const lx = 140 + i * 34;
    const ly = 162 + Math.sin(i * 1.1) * 4;
    ctx.fillStyle = ['#fbbf24', '#f472b6', '#a78bfa'][i % 3];
    circle(ctx, lx, ly, 4);
    ctx.fill();
  }

  // Ground: cobbles, a chili basket and a potted plant fill the foreground
  ctx.fillStyle = '#0f1530';
  ctx.fillRect(0, 380, PANEL_W, 40);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  for (let i = 0; i < 8; i++) ctx.fillRect(20 + i * 68, 396, 34, 3);
  ctx.fillStyle = '#a16207';
  ctx.beginPath();
  ctx.moveTo(452, 396);
  ctx.lineTo(500, 396);
  ctx.lineTo(494, 412);
  ctx.lineTo(458, 412);
  ctx.closePath();
  ctx.fill();
  for (const [cx, cy] of [[464, 392], [476, 390], [488, 392]]) {
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 5, 8, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#16a34a';
  ctx.beginPath();
  ctx.ellipse(520, 386, 8, 14, -0.4, 0, Math.PI * 2);
  ctx.ellipse(534, 388, 7, 12, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#b45309';
  ctx.fillRect(514, 396, 26, 14);
}

// ---- scene 2: Pasar Pagi (morning market) -----------------------------------

function drawCloud(ctx, x, y, s, color) {
  ctx.fillStyle = color;
  circle(ctx, x, y, 16 * s);
  ctx.fill();
  circle(ctx, x + 16 * s, y + 4 * s, 12 * s);
  ctx.fill();
  circle(ctx, x - 16 * s, y + 5 * s, 11 * s);
  ctx.fill();
  ctx.fillRect(x - 22 * s, y, 44 * s, 12 * s);
}

function drawMarket(ctx, side, rng) {
  // Morning sky
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, PANEL_H, [[0, '#ffe3b3'], [0.55, '#ffd194'], [1, '#ffc98a']]);
  ctx.fillRect(0, 0, PANEL_W, PANEL_H);

  // Sun with rays: 8 in A, 6 in B
  const rays = side === 'A' ? 8 : 6;
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  for (let i = 0; i < rays; i++) {
    const a = (i / rays) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(495 + Math.cos(a) * 30, 62 + Math.sin(a) * 30);
    ctx.lineTo(495 + Math.cos(a) * 42, 62 + Math.sin(a) * 42);
    ctx.stroke();
  }
  ctx.fillStyle = '#fbbf24';
  circle(ctx, 495, 62, 24);
  ctx.fill();
  ctx.fillStyle = '#f59e0b';
  circle(ctx, 488, 56, 4);
  ctx.fill();

  // Clouds: one extra in B
  drawCloud(ctx, 120, 60, 1, 'rgba(255,255,255,0.95)');
  drawCloud(ctx, 300, 44, 0.8, 'rgba(255,255,255,0.85)');
  if (side === 'B') drawCloud(ctx, 400, 58, 0.9, 'rgba(255,255,255,0.95)');

  // Birds on the wire: 2 in A, 3 in B
  ctx.strokeStyle = '#57534e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, 108);
  ctx.quadraticCurveTo(280, 118, 500, 104);
  ctx.stroke();
  const birds = side === 'A' ? [[200, 112], [260, 114]] : [[200, 112], [230, 113], [260, 114]];
  for (const [bx, by] of birds) {
    ctx.fillStyle = '#292524';
    ctx.beginPath();
    ctx.ellipse(bx, by, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    circle(ctx, bx + 6, by - 4, 3.5);
    ctx.fill();
  }

  // Stall: posts, striped awning (one stripe violet in B), counter
  ctx.fillStyle = '#7c4a21';
  ctx.fillRect(96, 150, 10, 180);
  ctx.fillRect(454, 150, 10, 180);
  for (let i = 0; i < 9; i++) {
    let c = i % 2 === 0 ? '#ec4899' : '#fff7ed';
    if (side === 'B' && i === 1) c = '#8b5cf6'; // the 'awning' diff
    ctx.fillStyle = c;
    ctx.fillRect(96 + i * 40, 118, 40, 32);
  }
  ctx.fillStyle = '#be185d';
  ctx.fillRect(96, 146, 360, 6);

  // Fruit baskets on the counter
  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(110, 300, 340, 12);
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(110, 312, 340, 34);
  const basket = (bx, fruit, color) => {
    ctx.fillStyle = '#a16207';
    ctx.beginPath();
    ctx.moveTo(bx - 34, 296);
    ctx.lineTo(bx + 34, 296);
    ctx.lineTo(bx + 26, 312);
    ctx.lineTo(bx - 26, 312);
    ctx.closePath();
    ctx.fill();
    for (let i = 0; i < fruit; i++) {
      const fx = bx - 22 + (i % 3) * 22;
      const fy = 288 - Math.floor(i / 3) * 14;
      ctx.fillStyle = color;
      circle(ctx, fx, fy, 10);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      circle(ctx, fx - 3, fy - 3, 3);
      ctx.fill();
    }
  };
  basket(160, 6, '#f97316'); // oranges
  basket(280, 6, '#dc2626'); // apples
  // Mango basket: 6 in A, 5 in B (one mango missing)
  basket(400, side === 'A' ? 6 : 5, '#84cc16');

  // Price chalkboard: "MANGGA 5000" in A, "MANGGA 6000" in B
  ctx.fillStyle = '#1c1917';
  rr(ctx, 218, 168, 124, 34, 6);
  ctx.fill();
  ctx.strokeStyle = '#d6a860';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#fef3c7';
  ctx.font = 'bold 17px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(side === 'A' ? 'MANGGA 5000' : 'MANGGA 6000', 280, 186);

  // Bicycle with basket (bell present in A, gone in B)
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 4;
  ctx.lineJoin = 'round';
  // Diamond frame: rear wheel - seat tube - top tube - head tube - front wheel
  ctx.beginPath();
  ctx.moveTo(80, 340);
  ctx.lineTo(122, 300);
  ctx.lineTo(168, 300);
  ctx.lineTo(190, 340);
  ctx.moveTo(122, 300);
  ctx.lineTo(150, 340);
  ctx.moveTo(168, 300);
  ctx.lineTo(150, 340);
  ctx.moveTo(122, 300);
  ctx.lineTo(116, 284);
  ctx.moveTo(168, 300);
  ctx.lineTo(182, 282);
  ctx.stroke();
  ctx.fillStyle = '#334155';
  circle(ctx, 80, 340, 18);
  ctx.fill();
  circle(ctx, 190, 340, 18);
  ctx.fill();
  ctx.fillStyle = '#f8fafc';
  circle(ctx, 80, 340, 7);
  ctx.fill();
  circle(ctx, 190, 340, 7);
  ctx.fill();
  // Saddle + handlebar grip
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(108, 280, 18, 6);
  ctx.fillRect(178, 278, 12, 6);
  if (side === 'A') {
    ctx.fillStyle = '#f59e0b';
    circle(ctx, 186, 268, 6);
    ctx.fill();
  }
  // Basket on the bicycle
  ctx.fillStyle = '#b45309';
  ctx.fillRect(140, 306, 34, 22);
  ctx.fillStyle = '#65a30d';
  circle(ctx, 150, 302, 7);
  ctx.fill();
  circle(ctx, 164, 302, 7);
  ctx.fill();

  // Vendor figure behind the stall, kept below the price sign
  ctx.fillStyle = '#0ea5e9';
  rr(ctx, 238, 246, 84, 54, 18);
  ctx.fill();
  ctx.fillStyle = '#fcd9b8';
  circle(ctx, 280, 232, 17);
  ctx.fill();
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(260, 224);
  ctx.quadraticCurveTo(280, 204, 300, 224);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(254, 222, 52, 4);

  // Ground
  ctx.fillStyle = '#d9a066';
  ctx.fillRect(0, 380, PANEL_W, 40);
  ctx.fillStyle = 'rgba(120, 70, 20, 0.25)';
  for (let i = 0; i < 9; i++) ctx.fillRect(10 + i * 62, 394, 40, 3);
}

// ---- scene 3: Jendela Kereta Hujan (rainy train window) ---------------------

function drawTrain(ctx, side, rng) {
  // Warm interior wall
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, PANEL_H, [[0, '#f7e8d0'], [1, '#ecd3ae']]);
  ctx.fillRect(0, 0, PANEL_W, PANEL_H);

  // Window: rainy mountains outside
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 300, [[0, '#7d94b5'], [0.6, '#9db1c9'], [1, '#b8c6d8']]);
  ctx.fillRect(70, 36, 420, 250);
  // Mountains
  ctx.fillStyle = '#5b7290';
  ctx.beginPath();
  ctx.moveTo(70, 286);
  ctx.lineTo(180, 150);
  ctx.lineTo(290, 286);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#6e86a5';
  ctx.beginPath();
  ctx.moveTo(220, 286);
  ctx.lineTo(360, 130);
  ctx.lineTo(490, 286);
  ctx.closePath();
  ctx.fill();
  // Snow cap on the far peak: present in A, gone in B
  if (side === 'A') {
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(336, 160);
    ctx.lineTo(360, 130);
    ctx.lineTo(384, 160);
    ctx.lineTo(372, 156);
    ctx.lineTo(360, 168);
    ctx.lineTo(348, 156);
    ctx.closePath();
    ctx.fill();
  }
  // Moon in the window: visible in A, behind a cloud in B
  const moonGlow = ctx.createRadialGradient(210, 65, 4, 210, 65, 44);
  moonGlow.addColorStop(0, 'rgba(253, 230, 138, 0.8)');
  moonGlow.addColorStop(1, 'rgba(253, 230, 138, 0)');
  ctx.fillStyle = moonGlow;
  ctx.fillRect(166, 21, 88, 88);
  ctx.fillStyle = '#fde68a';
  circle(ctx, 210, 65, 20);
  ctx.fill();
  ctx.fillStyle = 'rgba(217, 160, 60, 0.5)';
  circle(ctx, 204, 60, 3.5);
  ctx.fill();
  if (side === 'B') drawCloud(ctx, 210, 65, 1.1, '#dbe4ee');
  // Rain streaks on the glass
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 26; i++) {
    const rx = 84 + rng() * 392;
    const ry = 48 + rng() * 210;
    const len = 8 + rng() * 14;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx - 2, ry + len);
    ctx.stroke();
  }
  // One big raindrop: present in A, gone in B
  if (side === 'A') {
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.beginPath();
    ctx.arc(150, 120, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(150, 106);
    ctx.quadraticCurveTo(157, 116, 150, 120);
    ctx.quadraticCurveTo(143, 116, 150, 106);
    ctx.fill();
  }

  // Window frame + curtains
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(62, 28, 436, 10);
  ctx.fillRect(62, 286, 436, 10);
  ctx.fillRect(62, 28, 10, 268);
  ctx.fillRect(488, 28, 10, 268);
  ctx.fillRect(276, 28, 8, 258);
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.moveTo(62, 28);
  ctx.lineTo(120, 28);
  ctx.lineTo(96, 296);
  ctx.lineTo(62, 296);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(498, 28);
  ctx.lineTo(440, 28);
  ctx.lineTo(464, 296);
  ctx.lineTo(498, 296);
  ctx.closePath();
  ctx.fill();

  // Windowsill
  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(56, 296, 448, 14);
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(56, 310, 448, 8);

  // Potted plant on the sill: 5 leaves in A, 4 in B
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.moveTo(366, 296);
  ctx.lineTo(394, 296);
  ctx.lineTo(388, 272);
  ctx.lineTo(372, 272);
  ctx.closePath();
  ctx.fill();
  const leaves = side === 'A' ? 5 : 4;
  ctx.fillStyle = '#16a34a';
  for (let i = 0; i < leaves; i++) {
    const a = -Math.PI / 2 + (i - (leaves - 1) / 2) * 0.5;
    ctx.beginPath();
    ctx.ellipse(380 + Math.cos(a) * 16, 262 + Math.sin(a) * 14, 7, 16, a + Math.PI / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Book on the sill: red in A, teal in B
  ctx.fillStyle = side === 'A' ? '#dc2626' : '#0d9488';
  rr(ctx, 96, 322, 52, 14, 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillRect(100, 325, 44, 2);
  ctx.fillRect(100, 329, 44, 2);

  // Tea cup: full in A, half in B
  ctx.fillStyle = '#f8fafc';
  rr(ctx, 280, 318, 40, 26, 4);
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(322, 330, 8, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  ctx.fillStyle = '#b45309';
  const teaTop = side === 'A' ? 322 : 332;
  ctx.fillRect(284, teaTop, 32, 340 - teaTop);
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(292, 312);
  ctx.quadraticCurveTo(288, 304, 292, 298);
  ctx.moveTo(306, 312);
  ctx.quadraticCurveTo(310, 304, 306, 298);
  ctx.stroke();

  // Train ticket: present in A, gone in B
  if (side === 'A') {
    ctx.fillStyle = '#fef3c7';
    rr(ctx, 452, 292, 56, 20, 3);
    ctx.fill();
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#92400e';
    ctx.font = 'bold 10px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('TIKET', 480, 302);
  }

  // Lower wall + floor line
  ctx.fillStyle = '#d9b98c';
  ctx.fillRect(0, 360, PANEL_W, 60);
  ctx.fillStyle = 'rgba(120, 70, 20, 0.2)';
  ctx.fillRect(0, 360, PANEL_W, 3);
}

// ---- dispatcher + markers ----------------------------------------------------

const SCENES = {
  'noodle-stall': drawNoodleStall,
  'morning-market': drawMarket,
  'rainy-train': drawTrain,
};

export function drawScene(ctx, level, side, found, hinted, timeMs = 0) {
  ctx.clearRect(0, 0, PANEL_W, PANEL_H);
  const rng = mulberry32(level.seed);
  SCENES[level.id](ctx, side, rng);

  // Found markers: green ring + check, with a short pop.
  for (const d of level.diffs) {
    if (!found.has(d.id)) continue;
    const pop = 1; // markers are drawn at rest size; the pop animation is CSS on the HUD
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r * pop, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r * pop - 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(d.x, d.y, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(d.x - 5, d.y);
    ctx.lineTo(d.x - 1, d.y + 4);
    ctx.lineTo(d.x + 6, d.y - 4);
    ctx.stroke();
  }

  // Hinted markers: pulsing gold ring.
  for (const d of level.diffs) {
    if (!hinted.has(d.id)) continue;
    const pulse = 1 + 0.12 * Math.sin(timeMs / 180);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

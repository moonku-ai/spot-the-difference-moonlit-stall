// Pointer math: map a browser click to panel-local coordinates (0..560,
// 0..420), or null when the click missed the panel entirely. Pure function,
// so it is unit-tested in Node.

import { PANEL_W, PANEL_H } from './levels.js';

export function toPanelCoords(clientX, clientY, rect) {
  const x = ((clientX - rect.left) / rect.width) * PANEL_W;
  const y = ((clientY - rect.top) / rect.height) * PANEL_H;
  if (x < 0 || y < 0 || x > PANEL_W || y > PANEL_H) return null;
  return { x, y };
}

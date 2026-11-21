// Level data: three original scenes, seven differences each. Coordinates are
// panel-local (0..PANEL_W, 0..PANEL_H); both panels share the same coords, so
// a click hits on either side. `kind` describes how panel B differs from A:
// remove (present in A, gone in B), add (only in B), move, color, shape,
// count, text. The scenes are drawn procedurally in scenes.js from this data.

export const PANEL_W = 560;
export const PANEL_H = 420;
export const DIFFS_PER_LEVEL = 7;

export const LEVELS = [
  {
    id: 'noodle-stall',
    name: 'Warung Mie Bulan',
    subtitle: 'Moonlit Noodle Stall',
    seed: 101,
    timeLimit: 150,
    diffs: [
      { id: 'moon', kind: 'shape', x: 478, y: 62, r: 30, label: 'Bulan berubah bentuk' },
      { id: 'lantern', kind: 'remove', x: 110, y: 96, r: 26, label: 'Satu lampion hilang' },
      { id: 'cat', kind: 'move', x: 88, y: 330, r: 30, label: 'Kucingnya pindah' },
      { id: 'bowls', kind: 'count', x: 290, y: 290, r: 30, label: 'Satu mangkuk hilang' },
      { id: 'sign', kind: 'text', x: 280, y: 150, r: 28, label: 'Huruf di papan berubah' },
      { id: 'star', kind: 'add', x: 200, y: 60, r: 24, label: 'Ada bintang tambahan' },
      { id: 'steam', kind: 'remove', x: 380, y: 250, r: 26, label: 'Uapnya hilang' },
    ],
  },
  {
    id: 'morning-market',
    name: 'Pasar Pagi',
    subtitle: 'Morning Market',
    seed: 202,
    timeLimit: 150,
    diffs: [
      { id: 'awning', kind: 'color', x: 140, y: 70, r: 28, label: 'Warna tenda berubah' },
      { id: 'mango', kind: 'remove', x: 420, y: 320, r: 26, label: 'Satu mangga hilang' },
      { id: 'bell', kind: 'remove', x: 186, y: 268, r: 24, label: 'Bel sepeda hilang' },
      { id: 'cloud', kind: 'add', x: 400, y: 58, r: 26, label: 'Ada awan tambahan' },
      { id: 'sun', kind: 'count', x: 495, y: 62, r: 24, label: 'Sinar matahari berkurang' },
      { id: 'price', kind: 'text', x: 280, y: 180, r: 28, label: 'Harganya berubah' },
      { id: 'birds', kind: 'add', x: 230, y: 90, r: 24, label: 'Ada burung tambahan' },
    ],
  },
  {
    id: 'rainy-train',
    name: 'Jendela Kereta Hujan',
    subtitle: 'Rainy Train Window',
    seed: 303,
    timeLimit: 150,
    diffs: [
      { id: 'raindrop', kind: 'remove', x: 150, y: 120, r: 26, label: 'Satu tetes hujan hilang' },
      { id: 'snow', kind: 'remove', x: 450, y: 110, r: 28, label: 'Salju di puncak hilang' },
      { id: 'tea', kind: 'shape', x: 300, y: 330, r: 28, label: 'Tehnya berkurang' },
      { id: 'book', kind: 'color', x: 120, y: 330, r: 26, label: 'Warna buku berubah' },
      { id: 'ticket', kind: 'remove', x: 480, y: 300, r: 26, label: 'Tiketnya hilang' },
      { id: 'moon', kind: 'move', x: 210, y: 65, r: 28, label: 'Bulan tertutup awan' },
      { id: 'leaves', kind: 'count', x: 380, y: 200, r: 24, label: 'Daunnya berkurang' },
    ],
  },
];

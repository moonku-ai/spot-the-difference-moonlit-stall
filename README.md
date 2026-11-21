# spot-the-difference-moonlit-stall

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/moonku-ai/spot-the-difference-moonlit-stall/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/moonku-ai/spot-the-difference-moonlit-stall/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

Cari Bedanya! — a spot-the-difference game with three original hand-drawn scenes (a moonlit noodle stall, a morning market, a rainy train window). Find 7 differences per level against the clock, with hints, streak bonuses and synthesized sound effects. Pure static files, no network.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser.

## How to play

- Compare the left and right pictures — there are **7 differences** per level.
- Click a difference on either picture. A green ring marks it found.
- A wrong click costs 5 seconds. Find all 7 before the timer runs out.
- Hints (3 per level, key `H`), restart (`R`), level select (`1`–`3`), mute (`M`).
- Finish all 3 levels to win. Score: 100 points per find, +25 per streak step, +2 per second left as a level bonus.

## Layout

- `game/` — the playable game as static files (`index.html` + ES modules, no libraries, no network requests)
- `game/src/levels.js` — the three levels and their seven differences each
- `game/src/scenes.js` — the procedural canvas art for all three scenes
- `game/src/game.js` — the pure rules engine (unit-tested, no DOM)
- `tests/` — `node --test` suite for the rules, levels and RNG
- `screenshots/` — 4 real renders of the game (the first is the cover)
- `main.ts` — the entrypoint the grader runs; copies `game/` + `screenshots/` to `/output` and writes `dossier.json`

---

<sub>Entered on [make.fun](https://make.fun/?ref=94e7ycbz&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>

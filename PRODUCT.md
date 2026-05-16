# Product Snapshot

## What This Is
ZeroClaw is a browser-based 2D platformer built with Phaser 3, TypeScript, Vite, and pnpm. It is shipped as a static site and runs entirely in the browser.

## What It Does
- Boots into a preload scene, menu, gameplay scenes, and a game-over flow.
- Lets the player start a new run, continue from saved progress, or reset save data.
- Includes two configured stages: `1-1` and `1-2`.
- Persists unlocked stage progress and high score in browser `localStorage`.

## Current Gameplay Features
- Keyboard input for move, run, jump, menu navigation, confirm, and fireballs.
- Player movement with idle, walk, and run animations plus left/right facing.
- Player state progression for small, big, and fire forms, with damage and temporary invulnerability.
- Fireball projectile support when Fire Mario is active.
- Enemies include Goombas and Koopas.
- Collectibles and power-ups include coins, mushrooms, fire flowers, and stars.
- Stage timer, score, lives, HUD, goal pole completion, and stage-to-stage progression.
- Dedicated player preview scene for exercising player states and controls.

## Architecture
- Phaser scenes are the top-level flow: boot, menu, game, game-over, and player preview.
- The runtime uses Phaser's `CANVAS` renderer for deterministic browser compatibility and verification.
- Game rules are split into focused modules for player motion/state, enemies, collectibles, blocks, goal logic, score, audio, storage, and input.
- Stage progression is data-driven through a stage registry rather than per-level scene duplication.
- Assets are served from `public/assets`, and production output is a static `dist/` build.

## Conventions
- `pnpm build` performs type-checking plus a production Vite build.
- Unit tests run with Vitest; browser flows are covered with Playwright e2e tests.
- Save data is part of the product contract: high score and furthest unlocked stage should survive reloads.
- The game uses integer-multiple canvas scaling with letterboxing to preserve crisp pixel rendering.
- The menu is keyboard-first: `Enter` starts or confirms actions, and `Up`/`Down` always drive menu selection.

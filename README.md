# alex-ikfz-test-26

Browser-based platformer built with Phaser, Vite, TypeScript, and pnpm.

## Requirements

- Node.js 20+
- pnpm 10+

## Install

```bash
pnpm install
```

## Development

Start the local dev server on `0.0.0.0:8080`:

```bash
pnpm dev
```

Useful companion commands:

```bash
pnpm lint
pnpm test
pnpm e2e
```

## Controls

- `Arrow Left` / `A`: move left
- `Arrow Right` / `D`: move right
- `Shift`: run
- `Z` / `Space`: jump
- `X`: fireball when Fire Mario is active
- `Enter`: confirm menu and game-over actions
- `Arrow Up` / `Arrow Down`: change menu selection

## Build

Create the production build:

```bash
pnpm build
```

The compiled static site is written to `dist/`.

## Static Server Verification

The production build is designed to run from any simple static file server.

One local verification path is:

```bash
pnpm build
python -m http.server 8080 -d dist
```

Then open `http://127.0.0.1:8080/`.

Because this is a client-side Phaser game with relative asset paths, it does not
require a custom application server. A standard static host is sufficient.

## Deployment

Any static hosting platform that can serve the contents of `dist/` will work:

- GitHub Pages
- Netlify
- Vercel static output
- Nginx
- Caddy
- `python -m http.server` for local smoke testing

Typical deployment flow:

```bash
pnpm install
pnpm build
```

Publish the generated `dist/` directory to your host of choice.

## Notes

- The game uses integer-multiple canvas scaling with letterboxing to preserve
  crisp pixel rendering across viewport sizes.
- Save data is stored in browser `localStorage`, including high score and
  furthest unlocked stage.

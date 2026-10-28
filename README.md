# Parler

A small installable web app (PWA) that teaches everyday French to complete beginners who speak Vietnamese. The interface is entirely in Vietnamese; each card has the French word or phrase, its translation, a pronunciation tip and an example, with spaced repetition and offline use.

Specs: [`SPEC.md`](SPEC.md).

## Stack

Vite, React, TypeScript, vite-plugin-pwa, Vitest, zod. No server: the content is a JSON file reviewed before publication, and the progress is stored in the browser (with export and import).

## Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:5173/parler/> (the path matters: the site lives under `/parler/` on GitHub Pages).

The service worker is only active in the built version:

```bash
npm run build
npm run preview
```

| Command           | What it does                                            |
| ----------------- | ------------------------------------------------------- |
| `npm run dev`     | Development server                                      |
| `npm run build`   | Type-check and build into `dist/`                       |
| `npm run preview` | Serve the built site (PWA and offline testing)          |
| `npm test`        | Unit tests (review engine, storage, content validation) |
| `npm run lint`    | ESLint                                                  |
| `npm run format`  | Prettier                                                |
| `npm run review`  | Local card review screen (<http://localhost:5174>)      |

## Content

Cards live in `content/cards.json` and themes in `content/themes.json`. Only cards with `"status": "validated"` are published. Review draft cards locally with `npm run review`: it lets you correct, listen to, validate or reject each card. A validated card is never modified by the tool, and a card `id` never changes once published, because the learner's progress is attached to it.

Grammar lessons live in `content/grammar.json` (explanations and examples in Vietnamese). They open gradually, once the learner has started enough cards (`unlockAfterCards`), and each one can be marked as understood.

The roadmap shown on the home screen is A1 (current content), then A2 and B1 (locked, coming soon).

All interface texts are in `src/i18n/vi.json`. Pronunciation uses the browser's speech synthesis (French voice installed on the device).

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`: lint, tests, build, then publication on GitHub Pages (Settings, Pages, source: GitHub Actions). The site is served at `https://<account>.github.io/parler/`; with a custom domain, set `BASE` to `/` in `vite.config.ts`.

On a phone, open the address and add the app to the home screen (iPhone: Safari, Share, Add to Home Screen; Android: Chrome, Install app). Open it once online so that the files are cached.

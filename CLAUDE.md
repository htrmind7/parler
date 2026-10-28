# Project: French learning app for Vietnamese speakers (V0)

Read SPEC.md before any task. Work only on the requested step (M0..M9).

## Stack

Vite, React, TypeScript (strict, ~6.0 for typescript-eslint compatibility), vite-plugin-pwa, Vitest, zod. No server in V0.

## Hosting

GitHub Pages, public repo. Base path: /<repo-name>/ (Vite base, manifest start_url and scope, sound and font paths).
Deployed by .github/workflows/deploy.yml. The repo is private until M7.

## Look and feel

Dark theme described in the specs ("Look and feel"). Colors as CSS variables (src/styles/tokens.css), never hardcoded in components.
Fonts: Be Vietnam Pro (Vietnamese) and Poppins (French, app name), installed via @fontsource and served by the app, no CDN.
Reference mockups: docs/mockups.pdf (local only, git-ignored: it contains personal information, never commit it).

## Audio (V0 decision)

No generated mp3 and no Google TTS in V0: pronunciation uses the browser Web Speech API (speechSynthesis, fr-FR),
triggered only by a user tap. Card `audio` fields are optional for now.

## Content (V0 decision)

No Claude API script: cards are written directly in content/cards.json with status "draft", then reviewed by the user.
Only "validated" cards are published. Doubts go in `reviewNotes`.

## Commands

- npm run dev / build / test / lint / format
- npm run review (M2, local review screen)

## Rules

- Code and identifiers in English; UI texts only in src/i18n/vi.json.
- Never write API keys in code or in the repo; .env is git-ignored.
- Never modify a card whose status is validated; publish only validated cards.
- A card id never changes after publication.
- The review engine is pure logic, tested, with no browser access.
- Mobile first (360 to 430 px width), touch targets of at least 44 px.
- Sound only starts on a user tap.
- No dependency added without a one-sentence justification.

## Definition of done

Green tests, clean lint, successful build, summary of changes, commit message proposal.

# V0 Specs — French learning app for Vietnamese speakers

## Goal and scope of V0

V0 is a web app, installable on a phone, that teaches 100 to 200 common French words and phrases to a complete beginner who speaks Vietnamese, with translation, audio and tips in Vietnamese.

**Included in V0**

- Vocabulary cards grouped by everyday themes (greetings, numbers, food, family, getting around)
- On each card: the French word, its Vietnamese translation, pronunciation audio, a tip in Vietnamese and an example
- Short everyday phrases built from words already learned
- Spaced repetition of the words already seen
- A fully Vietnamese interface, since the learner does not read French
- Offline operation after the first load, with progress saved on the phone

**Excluded from V0**

- User accounts and sync between devices
- Voice recording and pronunciation scoring
- Live LLM feedback during use
- Grammar (next level)
- Gamification (streaks, leaderboards) and payments
- Publication on app stores

**Proposed success criterion**: the learner opens the app at least 5 days out of 7 for 4 weeks without being prompted, and orally recognizes and can say most of the words seen. This is a proposal to be adjusted.

## Architecture and technical choices

V0 is a static site (Vite + React + TypeScript) turned into an installable PWA: all content is built ahead of time, so there is no server to maintain and no secret in the app.

A PWA (Progressive Web App) is a website added to the phone's home screen; it opens full screen like an app and can work offline thanks to a service worker, a small script that keeps the files in cache.

| Decision             | Choice                                                       | Reason                                                                                                                                                                              |
| -------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App type             | PWA, not a native app                                        | No app store, one codebase for iPhone and Android                                                                                                                                   |
| Language and tooling | Vite + React + TypeScript                                    | Common, well-documented stack, produces a static site                                                                                                                               |
| PWA                  | vite-plugin-pwa (Workbox)                                    | Generates the manifest, the service worker and the offline cache                                                                                                                    |
| Content              | A JSON file in the repository                                | No database; each card is reviewed before publication                                                                                                                               |
| Audio                | Browser Web Speech API in V0 (pre-generated mp3 files later) | No account or generation step needed to test; quality depends on the phone's voice                                                                                                  |
| Progress             | Browser local storage, with export and import                | No account to create; the data is tiny                                                                                                                                              |
| Content generation   | Cards written directly and reviewed by the maintainer        | No API key or script needed for a V0 test                                                                                                                                           |
| Hosting              | GitHub Pages                                                 | Free for a public repository; commercial use is not allowed on this service ([GitHub docs](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)) |

The full path, from idea to phone:

1. Write the list of words and themes.
2. Write the cards (translation, Vietnamese tip, example) as drafts.
3. Review and validate each card.
4. Vite assembles the site (HTML, JavaScript, content) as static files.
5. GitHub Pages publishes the site on every push to GitHub, through a GitHub Actions workflow.
6. The learner opens the address on their phone and adds it to the home screen.

**Why no server**: in V0 nothing is computed live. A server only appears with live LLM feedback or sync between devices, which are planned after V0.

## Prerequisites: tools, accounts and costs

**On the development machine**

- [ ] Node.js (LTS version): runs the scripts and builds the site
- [ ] Git: keeps the code history and pushes it to GitHub
- [ ] Claude Code: the tool that writes the code from these specs

**Accounts**

| Account                        | Purpose                                                                                 | Cost in V0                                                                                                                                                |
| ------------------------------ | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GitHub                         | Hosts the code and the site (GitHub Pages); a workflow publishes the site on every push | Free (public repository)                                                                                                                                  |
| Google Cloud (optional, later) | Text-to-speech to pre-generate French audio files                                       | Free within the monthly quota; billing activation is required even for the free quota ([Google pricing](https://cloud.google.com/text-to-speech/pricing)) |

The Google Cloud free monthly quota for Text-to-Speech covers 4 million characters for Standard and WaveNet voices and 1 million for Neural2 and Chirp 3 HD ([CostBench](https://costbench.com/software/ai-voice-tools/google-cloud-text-to-speech/free-plan/)). This is far above V0 needs (a few tens of thousands of characters for 200 cards), but check the pricing page when creating the account.

**Optional**: a domain name (about 10 EUR per year, approximate). Without one, GitHub Pages provides an address like `<account>.github.io/<repo-name>/`.

**Security rule**: any API key goes in a `.env` file on the development machine, never in the GitHub repository or in the site code.

## Data model

There are two separate datasets: the content (cards and themes, identical for everyone, reviewed and published with the site) and the progress (specific to the learner, stored on their phone).

```ts
// content/themes.json
type Theme = {
  id: string // "greetings"
  order: number // display order
  titleVi: string // title shown in the interface (Vietnamese)
  titleFr: string // working title
}

// content/cards.json
type Card = {
  id: string // stable and unique, e.g. "greetings-hello"
  themeId: string
  order: number // order within the theme
  type: 'word' | 'phrase'
  fr: string // the French word or phrase
  vi: string // Vietnamese translation
  tipVi: string // tip / explanation in Vietnamese (to be reviewed)
  exampleFr?: string // example sentence (for words)
  exampleVi?: string // its translation
  audio: { main: string; example?: string } // mp3 paths
  requires?: string[] // ids of the words to know before this phrase
  status: 'draft' | 'validated' // only validated cards are published
}

// stored on the phone
type CardProgress = {
  cardId: string
  box: 0 | 1 | 2 | 3 | 4 | 5 // review box (see Screens)
  due: string // next review, ISO date (YYYY-MM-DD)
  seenCount: number
  lastSeen: string // ISO date
}

type AppState = {
  version: 1 // to migrate the data later
  settings: { newPerDay: 5 | 10 | 15 }
  progress: Record<string, CardProgress>
  today: { date: string; newIntroduced: number }
  activity: string[] // ISO dates of the days the app was opened (last 30 days)
}
```

**Card example** (the tip is still to be written and validated):

```json
{
  "id": "greetings-hello",
  "themeId": "greetings",
  "order": 1,
  "type": "word",
  "fr": "bonjour",
  "vi": "xin chào",
  "tipVi": "(pronunciation tip in Vietnamese, to be validated)",
  "audio": { "main": "audio/greetings-hello.mp3" },
  "status": "draft"
}
```

**Storage rules**

- Single browser key: `frlearn.v1`, containing the `AppState` object as JSON
- A version field allows migrating the data if the format changes
- An Export / Import button for the progress (JSON file) serves as a backup, because a phone may erase site data (see Known limitations)
- No personal data is collected in V0: no name, no email, no usage tracking

## Screens and behavior rules

The app has five screens, entirely in Vietnamese, usable with one thumb on a phone in portrait mode.

1. **Home**: the list of themes with their progress, a main button to learn today's new cards and a button to review (the number of due reviews is shown on it).
2. **Learn**: one card at a time. The French word, a button to listen to it, its translation, the Vietnamese tip, then the example with its audio. A Next button moves the card into the review system.
3. **Review**: see the rules below.
4. **My words**: the list of all the cards already seen, with audio playback and a reminder of the translation.
5. **Settings**: number of new cards per day (5, 10 or 15), export and import of the progress, reset, version number.

On first launch, a welcome screen (app name, choice of the number of new cards per day, Start button) is followed by an explanation in Vietnamese of how to add the app to the phone's home screen (iPhone: Safari, Share, Add to Home Screen; Android: Chrome, Install app).

**Review rules**

Each card sits in a box from 1 to 5. A successful card moves up one box and comes back after a longer interval; a missed card goes back to box 1.

| Box | Next review after success | Question direction                   |
| --- | ------------------------- | ------------------------------------ |
| 1   | 1 day                     | French (audio) → translation         |
| 2   | 2 days                    | French (audio) → translation         |
| 3   | 4 days                    | Translation → say the word in French |
| 4   | 8 days                    | Translation → say the word in French |
| 5   | 16 days                   | Translation → say the word in French |

The intervals are a starting proposal, easy to adjust in a configuration file. The "say it in French" direction reflects the end goal: being understood, so producing the word and not only recognizing it.

- The learner grades themselves after revealing the answer: an "I knew it" button and an "I didn't know it" button, or swiping the card right (knew it) or left (didn't know it), as in the mockups
- A missed card reappears once more later in the same session
- A session contains at most 10 cards; a button allows chaining another one
- Due reviews come before new cards
- A phrase (type `phrase`) is only offered if all the words in its `requires` list are at least in box 2
- Dates are computed in the phone's time zone, "today" starting at local midnight

**Interface rules**

- Touch targets of at least 44 pixels, French text of at least 20 pixels, high contrast
- Fonts: Be Vietnam Pro for all Vietnamese text, Poppins for French and the app name, served by the app itself (see Look and feel); no Vietnamese text is written inside an image
- Sound only starts on a user tap (mobile browsers block autoplay)
- All interface texts are in a `vi.json` file, to be written and validated by the maintainer; no text is hardcoded in the code

## Look and feel

The app reuses the dark style of the reference mockups: night-blue background, rounded cards, coral and teal accents, keeping only what applies to V0. The values below come from the code that generated the mockups. The app is named Parler, written in spaced coral letters.

**Colors**

| Role                    | Value     | Usage                                         |
| ----------------------- | --------- | --------------------------------------------- |
| App background          | `#0F1419` | Background of all screens                     |
| Card                    | `#1E293B` | List rows, panels                             |
| Secondary surface       | `#2D3748` | Learning card, square buttons, tiles          |
| Progress track          | `#374151` | Progress bar background                       |
| Subtle border           | `#334155` | Separators                                    |
| Main text               | `#F1F5F9` | Titles, words                                 |
| Secondary text          | `#94A3B8` | Hints, counters                               |
| Coral                   | `#FF6B6B` | App name, main button, "I didn't know it"     |
| Teal                    | `#4ECDC4` | Progress, French words in lists, card outline |
| Gold                    | `#FFD93D` | Phrases, situation labels                     |
| Blue                    | `#60A5FA` | Listen button                                 |
| Green                   | `#22C55E` | "I knew it", success                          |
| Flipped card background | `#1A3A2A` | With a green outline                          |
| Soft pink               | `#FCA5A5` | Example translation on the flipped card       |
| Purple                  | `#A78BFA` | Reserve accent, unused in V0                  |

**Fonts**

- **Be Vietnam Pro** for all Vietnamese text (interface, translations, tips). A family designed for Latin and Vietnamese, free under the OFL license, available on Google Fonts and as an npm package ([Fontsource](https://fontsource.org/fonts/be-vietnam-pro/install)).
- **Poppins** for French words and examples and for the app name. This font lacks the accented Vietnamese letters, which had made some letters disappear in the mockups.
- Both fonts are installed with the `@fontsource/poppins` and `@fontsource/be-vietnam-pro` packages and served by the app, to work offline; only the weights used and the Latin and Vietnamese character sets are loaded.
- Sizes: French word on the card 32 px bold, body text 16 to 18 px, hints 14 px minimum.

**Components taken from the mockups**

- **Gradient strip**: a thin coral-to-teal strip at the top of the screen.
- **Progress bar**: 6 px rounded track, teal fill, counter like "6 / 10" in gray on the right.
- **Learning card**: secondary background, 16 px corners, thin teal outline, centered bold word, a "tap to flip" hint in gray (in Vietnamese).
- **Flipped card**: dark green background and green outline, French word in bold green, example in gray, example translation in soft pink.
- **Swipe hints**: under the card, "I didn't know it" in coral on the left, "I knew it" in green on the right.
- **Bottom button row**: rounded buttons on a secondary background; in V0, listen (blue) and next (gray).
- **Buttons**: solid coral pill with dark text for the main action, outlined pill for secondary actions.
- **Welcome screen**: coral name, Vietnam-to-France flags, a gray tagline, choice pills, Start button.
- **My words**: rounded rows on a card background, French word in teal on the left, translation in gray on the right.
- **Phrases**: gold-outlined card, a gold pill with dark text for the situation (for example "at the café"), word-by-word breakdown under the card.
- **Progress (in Settings)**: tiles on a secondary background with a colored figure (words learned in teal, active days in gold) and a small bar chart of the week.

**Adaptations for V0**

- No pronunciation score and no microphone button (see Excluded from V0).
- No level choice: the pills of the welcome screen choose 5, 10 or 15 new cards per day.
- The tagline and all labels are in Vietnamese, with their accents; the mockups had to write Vietnamese without accents because of the font.
- The phonetic transcription between slashes shown on the mockup is not carried over, unless wanted; an optional `ipa` field could be added to the card.
- On the mockup, Vietnamese is on the front and French on the back; this is the direction of boxes 3 to 5 in review, whereas during learning everything is shown at once.
- Icons are drawn as SVG rather than emoji, whose appearance varies between phones.

**CSS variables to place in `src/styles/tokens.css`**

```css
:root {
  --bg: #0f1419;
  --card: #1e293b;
  --surface: #2d3748;
  --track: #374151;
  --border: #334155;
  --text: #f1f5f9;
  --text-muted: #94a3b8;
  --coral: #ff6b6b;
  --teal: #4ecdc4;
  --gold: #ffd93d;
  --blue: #60a5fa;
  --purple: #a78bfa;
  --green: #22c55e;
  --card-flipped: #1a3a2a;
  --pink-soft: #fca5a5;
  --font-fr: 'Poppins', system-ui, sans-serif;
  --font-vi: 'Be Vietnam Pro', system-ui, sans-serif;
}
```

**Visual reference**: keep the mockups PDF locally as `docs/mockups.pdf` (git-ignored, because it may contain personal information), so that Claude Code can consult it during step M5. Clickable HTML mockups of the V0 screens can also be produced from these rules to validate the look before the build.

## Content pipeline

The content goes through a few steps, and the manual review is what guarantees that no unverified explanation reaches the phone.

1. **Source list**: a `content/source/words.csv` file with one line per card (columns: id, themeId, type, fr, optional notes).
2. **Writing the cards**: each new card is written into `cards.json` with the `draft` status. In the original plan an API script produced them; for V0 they are written directly.
3. **Review** (`npm run review`): a review screen, run locally only, shows the draft cards; the reviewer fixes the fields and clicks Validate or Reject. This screen is not part of the published site.
4. **Audio**: in V0 the app uses the browser's speech synthesis, triggered by a tap. Generating mp3 files with a text-to-speech service is a later option; the `audio` field of the card is already planned for it.

**Rules**

- Never overwrite a `validated` card; only process new or explicitly re-run lines
- Any doubt (ambiguous translation, uncertain tip) is written in a `reviewNotes` field; the review screen shows these notes first
- If an audio generation script is added later: French voice chosen after listening to three candidates, a slightly slowed rate for words (about 0.9), mono low-bitrate mp3 named after the card id, and a count of characters sent to follow the free quota

**Check for each card (review)**

- [ ] The Vietnamese translation is natural and matches current usage
- [ ] The Vietnamese tip is accurate, short and understandable by a beginner
- [ ] The example is simple and useful in real life
- [ ] The audio is clear and matches the text

**Proposed V0 content** (about 150 cards, to be adjusted):

| Theme                    | Examples                                       | Cards (approx.) |
| ------------------------ | ---------------------------------------------- | --------------- |
| Greetings and politeness | hello, thank you, please, sorry                | 15              |
| Introducing yourself     | my name is, I live in, I am                    | 12              |
| Numbers and prices       | 0 to 10, 20, 50, 100, how much?                | 18              |
| Food and drinks          | water, bread, rice, chicken, coffee            | 25              |
| Family                   | husband, daughter, mother, friend              | 12              |
| Home                     | door, table, kitchen, key                      | 15              |
| Getting around           | to the left, straight ahead, station, pharmacy | 18              |
| Shopping                 | to buy, a kilo, pay by card                    | 15              |
| Health and emergencies   | it hurts, doctor, help                         | 10              |
| Time                     | today, tomorrow, the morning                   | 10              |

(French examples: bonjour, merci, s'il vous plaît, pardon; je m'appelle, j'habite, je suis; combien ?; eau, pain, riz, poulet, café; mari, fille, mère, ami; porte, table, cuisine, clé; à gauche, tout droit, gare, pharmacie; acheter, un kilo, payer par carte; j'ai mal, médecin, au secours; aujourd'hui, demain, le matin.)

## Build plan for Claude Code

The build is split into ten steps, one Claude Code session per step, each with a success criterion that can be checked before moving to the next.

**Setup**

1. Use the GitHub repository Claude Code works on (or create one). It must be public before publishing with free GitHub Pages; it can stay private during development.
2. Keep this document in the repository as `SPEC.md`.
3. Keep a `CLAUDE.md` file next to it: Claude Code reads it automatically at the start of each session.
4. Run Claude Code in this folder and work one step at a time: ask for a plan first, then the implementation, then run the tests.
5. Make a Git commit at the end of each validated step, so you can roll back if needed.

| Step               | Content                                                                                                                                                           | Done when                                                                 |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| M0 Setup           | Vite + React + TypeScript project, ESLint, Prettier, Vitest, folder structure, .gitignore (including .env), README, Vite base set to the repository name          | `npm run dev`, `npm test` and `npm run build` pass                        |
| M1 Content         | Types, zod schemas, themes.json and cards.json files, a loader that keeps only validated cards, 10 sample cards                                                   | Validation tests pass; an invalid card is rejected with a clear message   |
| M2 Content tools   | Local review screen, speech synthesis helper (and optional audio generation later)                                                                                | 10 cards written and reviewed; rerunning the tools changes nothing        |
| M3 Review engine   | Pure functions (introduce, grade, due cards, phrase unlocking, daily counter), no UI                                                                              | Tests cover each interval, the failure case, unlocking and the day change |
| M4 Storage         | Read and write `frlearn.v1`, version, export and import, handling of a corrupted file                                                                             | Tests pass; importing an export gives back the same progress              |
| M5 Interface       | Five screens faithful to the look and feel above, `vi.json` file, audio player, CSS variables for colors and fonts                                                | Complete playable flow on a phone: learn, review, find your words         |
| M6 PWA             | vite-plugin-pwa, manifest in standalone mode, icons (192, 512, 180 for Apple), `start_url` and scope aligned with the base path, offline cache of files and audio | Installable; works in airplane mode after a first load                    |
| M7 Deployment      | GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds the site and publishes it on GitHub Pages; Pages source set to GitHub Actions                | A public https address shows the app                                      |
| M8 Full content    | Writing and review of the 150 cards                                                                                                                               | All cards are validated; clean build                                      |
| M9 Real-world test | One month of real use, a log of the problems                                                                                                                      | Success criterion of V0 (see the beginning of this document)              |

**Request template for each step**

```text
Read SPEC.md and CLAUDE.md. Do only step M3 (review engine).
First propose a short plan. Write the tests before the code.
When done: run the tests, summarize the changes and propose a commit message.
```

## From zero to the phone: going live and installing

Once the code is on GitHub, GitHub Pages publishes the site on every update, and the installation on the phone is done from the browser in a few taps.

**Going live**

1. Push the code to the `main` branch of the (public) GitHub repository.
2. In the repository settings (Settings, then Pages), choose GitHub Actions as the publication source.
3. Check that `.github/workflows/deploy.yml` exists (created in step M7): it installs the dependencies, runs `npm run build` and publishes the `dist` folder. The Vite documentation gives a complete example ([Vite](https://vite.dev/guide/static-deploy.html)).
4. Every push to `main` triggers a deployment; the address is `https://<account>.github.io/<repo-name>/`.
5. Open this address on a phone to check that the app displays.
6. Optional: link a custom domain; the base path then becomes `/` (see Points of attention).

**Installing on the phone**

- iPhone: open the address in Safari, tap the Share button, choose "Add to Home Screen", then Add. Then launch the app from the icon, not from Safari.
- Android: open the address in Chrome, open the menu and choose "Install app" or "Add to Home Screen".
- In both cases, open the app once with a connection, so that the files are cached.

**Points of attention**

- The site must be served over https, otherwise the service worker does not activate. Locally, only `localhost` is an exception: testing on a phone with a local network address therefore cannot validate the offline part; use the public https address of GitHub Pages.
- The manifest must declare the standalone or fullscreen display mode. According to a WebKit engineer, an app installed in this mode is treated as a real app and not as a Safari page ([WebKit Bugzilla](https://bugs.webkit.org/show_bug.cgi?id=232302)).
- After a deployment, the app updates on the next launch; sometimes it must be fully closed and reopened.
- **Base path on GitHub Pages**: at the address `<account>.github.io/<repo-name>/`, the site lives in a subfolder. The Vite `base` setting, the manifest `start_url` and scope, and the paths of sounds and fonts must all start from `/<repo-name>/`; otherwise the page stays blank or the installation fails. With a custom domain, the base becomes `/`.
- **Public repository**: free GitHub Pages requires a public repository, so the code and the content cards are readable by everyone, but API keys never are, since they stay in `.env`. This service is not allowed for commercial activity ([GitHub](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)): if the app becomes paid, it will have to move to another host, for example Cloudflare Pages, which is simple for a static site.

**Test before handing the app to a learner**

- [ ] It installs on the home screen and opens full screen
- [ ] It works in airplane mode after a first load
- [ ] Sounds start on tap, including with the phone in silent mode (behavior varies on iPhone: to be tested)
- [ ] Progress is kept after closing and reopening
- [ ] Export then import of the progress works
- [ ] Vietnamese texts display correctly with their accents

## Tests, quality and known limitations

Automated tests protect the logic (review, storage, content validation), and the content review protects the content; the rest is checked by hand on a real phone.

**Automated tests (Vitest)**

- Review engine: each interval, a failure that sends the card back to box 1, phrase unlocking, the daily cap of new cards, the midnight rollover
- Storage: reading an empty state, version migration, corrupted file, export then identical import
- Content: a card with a missing required field or a missing audio file makes the build fail

**Measuring the success criterion**: the app state keeps the opening dates of the last 30 days (`activity` field), displayed in Settings. "5 days out of 7" can thus be verified by looking at the phone, without collecting any data.

**Known limitations**

- **Possible data erasure on iPhone**: Safari deletes a site's local storage (IndexedDB, localStorage, service workers) after seven days without interaction ([The Register](https://www.theregister.com/2020/03/26/apple_relax_were_not_totally/)). An app added to the home screen has its own usage counter, tied to its real use, and its data should not be erased as long as it is used ([OSNews, quoting the WebKit clarification](https://www.osnews.com/?p=131566)). Hence two recommendations: install the app on the home screen, and use the export backup.
- **No sync**: when changing phones, progress is only recovered through import.
- **Self-assessment**: the learner grades themselves and nothing verifies their pronunciation; this is a V0 choice.
- **Synthetic voice**: it may sound less natural than a human voice; the most important words could be recorded by a native speaker.
- **Card identifiers**: an id must never change after publication, because progress is attached to it. A card removed from the content is simply ignored in the progress.
- **Text-to-speech terms** (if audio files are generated later): check what the provider allows for redistributing the audio files, especially if the app is one day offered to other people.
- **Dialect**: Vietnamese tips must target a specific accent (North or South), to be decided (see open decisions).

## Open decisions and next steps

Seven decisions are to be made before or during the build; none blocks the start of step M0.

| Decision                               | Options                                                          | Recommendation                                                                              | Decide before |
| -------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------- |
| Accent targeted by the Vietnamese tips | North, South, neutral                                            | The learner's own accent, which the maintainer can judge by ear                             | M2            |
| French synthetic voice                 | Three candidate voices                                           | Listen to the three and choose by ear                                                       | M2            |
| Source of the card content             | Written directly, or generated by a Claude model through the API | Written directly for V0; revisit if content grows                                           | M2            |
| Direction of review questions          | Production (say the word) from box 3, or recognition only        | Keep production; adjust after use                                                           | M3            |
| Review intervals                       | 1, 2, 4, 8, 16 days or shorter                                   | Proposed start, to be corrected if too hard                                                 | M3            |
| App name and domain                    | Free                                                             | To be decided before going live                                                             | M7            |
| Site hosting                           | GitHub Pages (public repository) or Cloudflare Pages             | GitHub Pages for V0; Cloudflare Pages if the app becomes paid or the code must stay private | M7            |

**After V0, in this order if it is used**

1. **V0.5: live feedback after voice recording.** It requires a small server-side service to protect the API key, a usage budget, and a list of difficult French contrasts for Vietnamese speakers.
2. **V1: next level, simple grammar**, with phrases built from the acquired words.
3. **Later**: accounts and sync between devices, new language pairs, publication in app stores through a native wrapper if the need is confirmed, and a business model, to be studied only if V0 usage justifies it.

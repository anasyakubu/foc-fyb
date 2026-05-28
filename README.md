# The Class Quarterly

An editorial-style FYB Personality of the Week generator for the
**Faculty of Computing, Bayero University Kano · Class of 2022**.

Built with React + Vite + TypeScript + Tailwind. Warm cream paper, ink-black,
vermillion accents. Fraunces (display serif) + Inter (body) + JetBrains Mono (small caps).

## Features
- **Editorial card** — magazine-style layout with masthead, cover line, portrait, detail grid, colophon.
- **Editor's desk** (admin) protected by passcode **`FOC2022`** (session-only).
- **Home/landing** — magazine masthead, current cover story, recent issues, contact-sheet of older archive.
- **Single or bulk add** — queue several personalities, publish the whole issue at once.
- **Google Form import** — drop a CSV exported from your Form, headers map automatically.
- **AI polish** — fixes capitalization, smooths phrasing, writes a quote if missing.
- **AI portrait enhance** — one-click brightness/contrast/sharpen (offline canvas, always works).
- **Shareable links** — every personality has its own URL at `/p/:id`.
- **HD download** — export the card as a 2× PNG.
- **Archive** — searchable, sortable gallery with download/remove actions.

## Run
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into /dist
```

## Admin passcode
Default `FOC2022`. Change in `src/lib/auth.ts`. Stored in `sessionStorage`.

## Data storage
Cards live in `localStorage` (per-device). To go cross-device, replace the four functions in `src/lib/store.ts` with calls to your backend of choice.

## Google Form columns
Any order, case-insensitive partial match:
`Full Name`, `Nickname`, `Hobbies`, `Relationship`, `Favourite Lecturer`,
`Easiest Level`, `Most Stressful Level`, `If not Computing`, `Best Quote`,
`Social Handle`, `Department`, `Photo` (URL).

A `sample-responses.csv` template is included.

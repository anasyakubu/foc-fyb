# The Class Quarterly

An editorial-style FYB Personality of the Week generator for the
**Faculty of Computing, Bayero University Kano · Class of 2022**.

Built with React + Vite + TypeScript + Tailwind. Backed by **Supabase**
(Postgres for data, Storage for portraits). Warm cream paper, ink-black,
vermillion accents. Fraunces (display serif) + Inter (body) + JetBrains Mono.

---

## Setup (one-time, ~5 minutes)

### 1. Make a Supabase project
Free at [supabase.com](https://supabase.com). Sign in, click *New project*, pick any name and password, choose the region closest to Nigeria (eu-west-1 / Frankfurt is fine).

### 2. Run the schema
In your Supabase project: **SQL Editor → New query** → paste the contents of `supabase-schema.sql` (in this repo) → **Run**.
This creates the `people` table, the issue-number sequence, the `portraits` storage bucket, and open RLS policies suitable for a class-internal app.

### 3. Copy your API credentials
**Project Settings → API.** Copy the **Project URL** and the **anon / public** key.

### 4. Create a `.env` file
Copy `.env.example` to `.env` and fill in the values:
```bash
cp .env.example .env
```
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### 5. Install and run
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into /dist
```

If env vars are missing, the app shows a setup screen with these same instructions.

---

## Admin passcode
Default `FOC2022`. Change in `src/lib/auth.ts`. Session-only (cleared when the tab closes).
This is the UI gate — anyone with the URL can still read the archive (which is what you want for a public link-shareable magazine).

---

## Features
- **Editorial card** — magazine-style with masthead, cover line, portrait, detail grid, colophon.
- **Editor's desk** (passcode-protected) for composing personalities.
- **Single or bulk publish** — add to queue, publish a whole issue at once.
- **Google Form import** — CSV drop, headers auto-mapped, Drive photo URLs rewritten and prefetched.
- **AI polish** — fixes capitalization, smooths phrasing, writes a quote if missing.
- **AI portrait enhance** — one-click brightness/contrast/sharpen (offline canvas).
- **Shareable links** — every personality at `/p/:id`, fetched from Supabase, so links work across devices.
- **HD download** — export the card as a 2× PNG.
- **Archive** — searchable gallery, sorted by issue number, with download/remove actions.

---

## Storage & data layout

### `people` table (Postgres)
| column            | type        | notes                                  |
|-------------------|-------------|----------------------------------------|
| `id`              | uuid (pk)   | generated client-side                  |
| `name`            | text        | required                               |
| `nickname`        | text        |                                        |
| `department`      | text        |                                        |
| `hobbies`         | text        |                                        |
| `relationship`    | text        |                                        |
| `fav_lecturer`    | text        |                                        |
| `easiest_level`   | text        |                                        |
| `stressful_level` | text        |                                        |
| `if_not_cs`       | text        |                                        |
| `quote`           | text        |                                        |
| `social`          | text        | handle, `@` stripped                   |
| `social_platform` | text        | Instagram, X, TikTok, LinkedIn, etc.   |
| `photo`           | text        | Supabase Storage public URL            |
| `issue`           | int         | auto, from `people_issue_seq` sequence |
| `created_at`      | timestamptz | auto                                   |

### `portraits` storage bucket
Public read. One file per person, keyed by their UUID: `{personId}.jpg` (or `.png`, `.webp`).
When a person is deleted, the matching file is removed too.

---

## Google Form workflow
1. Make the form (see `GOOGLE_FORM_BLUEPRINT.md` if you have it, or use any matching headers).
2. Collect responses.
3. Export to CSV: **Responses → green Sheets icon → File → Download → CSV**.
4. In your Drive, find the folder Forms created for photo uploads, select all, set sharing to **"Anyone with the link → Viewer"**.
5. In the app: **Editor's Desk → Import CSV**. Drive URLs are auto-rewritten to a CORS-friendly CDN URL and prefetched as data URLs.
6. Click **Publish all** — each portrait uploads to Supabase Storage, then all rows insert at once.

---

## Going to production
RLS policies in this repo are **open** (anyone can read/write/delete) because the app uses a client-side passcode for the admin gate and is intended for class-internal use. Before exposing this publicly:

- Switch to **Supabase Auth** (e.g. magic-link email for admins).
- Tighten RLS to allow `insert/update/delete` only for authenticated admins.
- Move the passcode out of `src/lib/auth.ts`.

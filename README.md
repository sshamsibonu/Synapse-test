# Synapse

An interactive neuroscience platform: cognitive tests, articles, and (soon) video
lessons, built around the idea that understanding the brain takes many people.

**Live:** https://synapseuz.netlify.app

Uzbek is the default language and owns the bare URLs (`/`). English lives under
`/en`.

---

## Quick start

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

> **Node version matters.** This project is pinned to **Next.js 14.2.35** so it
> runs on **Node 20**. Newer Next majors require Node ≥ 20.9. If you are on a
> different Node, use `nvm use 20` before installing.

The site runs without any environment variables — tests, articles and lessons
all work. Features that need a backend (saving results, the dashboard, AI
reports, score sharing) degrade gracefully until `.env.local` is filled in.
Copy `.env.local.example` to `.env.local` to set those up.

---

## Stack

| | |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS **v4** + shadcn/ui (Base UI, not Radix) |
| i18n | next-intl — locales `uz` (default) and `en` |
| Motion | Framer Motion |
| Data | Supabase (optional) |
| AI | Anthropic SDK (optional) |
| Hosting | Netlify |

---

## Layout

```
app/[locale]/        routes — every page is locale-aware
  articles/          article catalogue + individual articles
  lessons/           deliberately empty (see below)
  tests/             the cognitive tests
components/
  home/              homepage sections
  articles/          article cover + reading progress
  brand/             the Synaptic Thread motif
  media/             EditorialImage — the one image treatment
  motion/            reveal + the fails-visible animation hooks
lib/
  articles/          article metadata (prose lives in messages/)
  tests/             test definitions and scoring
messages/
  uz.json  en.json   ALL user-facing text
images/              source images — see below
scripts/
  sync-images.mjs    mirrors images/ into public/
```

---

## Conventions worth knowing

**All text lives in `messages/`.** Never hardcode user-facing strings in a
component. `uz.json` and `en.json` must stay structurally identical — if you add
a key to one, add it to the other.

**Images go in `images/`, not `public/`.** Next.js only serves from `public/`,
so `scripts/sync-images.mjs` mirrors the folder automatically on `npm run dev`
and `npm run build`. In dev it watches for changes, so dropping a file in
appears within a second — no restart. `public/images/` is generated and
git-ignored; don't edit it.

**Animations must fail visible.** Components use `useEnterAnimation` /
`useCanAnimate` from `components/motion/`, which render the *final* state by
default and only animate when the browser can. This is deliberate: an earlier
version shipped `opacity: 0` in the server HTML, which meant no-JS readers saw a
blank page and a counter displayed `0` instead of `7`. Don't reintroduce a
hidden initial state that isn't gated behind those hooks.

**Lessons is intentionally empty.** Video lessons are authored by the Synapse
team and will be added later. The page shows a deliberate empty state. Do not
fill it with placeholder lessons.

**Scientific credibility is the product.** Articles must not contain invented
statistics, fabricated citations, or overstated claims. If a number can't be
sourced, don't publish it.

---

## Deploying

Deploys are manual from a local machine (the site is not wired to auto-deploy
from GitHub):

```bash
npx --yes netlify-cli@17 deploy --build --prod
```

> Pin to `netlify-cli@17`. The current major requires Node ≥ 22.13 and **exits
> silently with code 1** on Node 20 — no error message, which is a confusing
> failure to debug.

If a build fails with `Cannot find module './vendor-chunks/...'`, a dev server
was running against the same `.next` directory. Stop it and:

```bash
rm -rf .next
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Short version: org members can push
straight to `main` — no pull request or approval required.

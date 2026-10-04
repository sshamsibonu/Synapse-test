# Contributing to Synapse

## How access works

Members of the **NeuroProject** organisation have **write access** and can push
directly to `main`. There is no pull request requirement, no review step, and
nothing to approve. Push and it's in.

This is a deliberate choice to keep the project moving. It also means **there is
no safety net**, so the conventions below matter more than they would on a
reviewed repo. Read the "Before you push" checklist.

---

## Setup

```bash
git clone https://github.com/NeuroProject/synapse.git
cd synapse
npm install
npm run dev
```

You need **Node 20** (`nvm use 20`). The project is pinned to Next.js 14.2.35
for that reason.

No environment variables are needed to run the site. Copy
`.env.local.example` → `.env.local` only if you're working on the parts that
talk to Supabase or Anthropic.

---

## Day-to-day

Working directly on `main` is fine:

```bash
git pull            # always pull before you start
# ...make changes...
npm run build       # must pass before pushing
git add -A
git commit -m "short description of what changed"
git push
```

If you're doing something larger, a branch is still welcome — you just don't
have to wait for anyone:

```bash
git checkout -b my-change
# ...work...
git push -u origin my-change
```

...then merge it yourself on GitHub, or `git checkout main && git merge
my-change && git push`.

**`git pull` first, every time.** Because several people push to `main`
directly, the most common problem is a conflict from working on a stale copy.

---

## Before you push

- [ ] `npm run build` passes
- [ ] `npx tsc --noEmit` is clean
- [ ] If you added text: **both** `messages/uz.json` and `messages/en.json`
      updated, with identical key structure
- [ ] If you added an image: it's in `images/`, not `public/images/`
- [ ] No secrets. `.env.local` is git-ignored — keep it that way, and never
      commit an API key, token, or service-role key
- [ ] Checked the page in both languages and both light/dark themes

---

## Things that will bite you

**The dev server and a production build fight over `.next`.** Running
`npm run build` while `npm run dev` is running corrupts the cache and produces
`Cannot find module './vendor-chunks/...'`. Stop the dev server, then
`rm -rf .next`.

**Netlify CLI must be pinned.** `npx --yes netlify-cli@17`. The current major
needs Node ≥ 22.13 and fails *silently* on Node 20 — exit code 1, no message.

**Tailwind is v4, not v3.** Config lives in `app/[locale]/globals.css` via
`@theme inline`, not in a `tailwind.config.ts`. There is no such file.

**shadcn components here use Base UI, not Radix.** Composition uses a `render`
prop, not `asChild`.

**Supabase Row types must use `type`, not `interface`.** Using `interface`
breaks postgrest-js's conditional types and silently resolves queries to
`never`. See `types/database.ts`.

---

## Content rules

These are not style preferences — they're what the project is for.

- **No invented statistics, sources, or citations.** If a figure can't be
  attributed to real published work, it doesn't go in.
- **No placeholder content.** If something isn't ready, it gets a deliberate
  empty state (see the Lessons page). Don't fill space with filler.
- **Tests are educational, never diagnostic.** Never describe a result as a
  diagnosis or a clinical measure.
- **Both languages, always.** A change that ships in one language only is an
  incomplete change.

---

## If you'd rather review changes before they land

Direct push is the current setup, but it's one setting to change. On GitHub:

**Settings → Branches → Add branch protection rule** → branch name `main` →
tick *"Require a pull request before merging"*.

After that, contributors push branches and open pull requests, and merging takes
one click on the green **Merge pull request** button. Reviewing is just reading
the **Files changed** tab — there's nothing to install or remember.

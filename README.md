# Regain

A clean-slate, Vercel-ready focus dashboard built with Next.js and React.

## What's in this first web MVP

- Focus timer with 15, 25 and 45 minute presets.
- Daily intentions checklist.
- Local focus-session totals and a lightweight insights view.
- Suggested daily schedule screen.
- Selectable distraction list.
- Responsive dark interface and installable-web-app manifest.
- Browser-local persistence; no account or backend required for the first preview.

## Deploy to Vercel

1. Push this branch to GitHub.
2. In Vercel, choose **Add New → Project** and import `gattubai3939/Regain`.
3. Select the branch `rebuild/vercel-first-version`.
4. Keep the detected framework as **Next.js** and the root directory as `./`.
5. Click **Deploy**.

Vercel will install dependencies and run `next build`. No environment variables are needed for this MVP.

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Important platform boundary

This is a web app, not an Android native application. It can run a timer, manage intentions, and save preferences in the browser. A website hosted on Vercel cannot independently detect or block other Android apps, read Android-wide usage statistics, or guarantee background execution when the browser is closed.

To deliver actual Android app blocking, add a native Android companion later and design an explicit, permission-based integration. The current Blocks screen is an honest UI preview: selected apps are preferences only and are not blocked by this web app.

## Data and privacy

The current prototype stores settings and focus progress in browser `localStorage`. Clearing browser site data will reset this information. There is no account, analytics service, or server-side user database in this first version.

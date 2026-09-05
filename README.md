# Videha Literature Festival

A responsive, accessible GitHub Pages festival and publication portal for the Videha Maithili eJournal ecosystem.

## What is included

- One-search access to books, series, Videha issues and Sadeha issues.
- An expanded Gajendra Thakur shelf: 100 Parallel History volumes, six Panji volumes, 37 illustrated children’s novels, nine bilingual plays, history, philosophy, language and translation works.
- Direct archive records for 447 Videha issues and 37 Sadeha issues, with issue 5’s two preserved versions.
- Listen controls using browser speech, a 41-language Google Translate gateway, and reading accessibility controls.
- Source-led festival stages without invented event dates or speakers.

## Structure

- `public/` — the website, data and image assets.
- `scripts/sources/` — retained Videha archive sources used by the build.
- `scripts/build.mjs` — generates the deployable `dist/` package. Keep this file inside `scripts/`.
- `.github/workflows/deploy-pages.yml` — GitHub Pages deployment workflow.

## Local preview

Run `npm run dev`, then open `http://127.0.0.1:4173`.

## GitHub Pages

Create a public repository named `videha-literature-festival`, push the `main` branch, and set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. The included workflow publishes the site.

# Videha Literature Festival

A responsive, accessible GitHub Pages festival and publication portal for the Videha Maithili eJournal ecosystem.

## What is included

- One-search access to books, series, Videha issues and Sadeha issues.
- An expanded Gajendra Thakur shelf: four Parallel History tomes containing volumes 1–100 (Tome I: 1–25; Tome II: 26–50; Tome III: 51–75; Tome IV: 76–100), six Panji volumes, 37 illustrated children’s novels, nine bilingual plays, history, philosophy, language and translation works.
- Parallel History and Panji cards expose their supplied Pothi, Kindle, Google Playbook, audiobook and online-reading editions separately; GitHub-hosted archive materials use clean GitHub Pages addresses.
- Direct GitHub repository links for all 485 preserved Videha/Sadeha PDF files: 447 Videha issues and 38 Sadeha files covering issues 1–37, including issue 5’s second version.
- A generated catalogue of book, study and learning editions already published in the `videha-ejournal.github.io`, `videha-quiz` and `videha` repositories.
- Listen controls using browser speech, a 41-language Google Translate gateway, and reading accessibility controls.
- Source-led festival stages without invented event dates or speakers.

## Structure

- `public/` — the website, data and image assets.
- `scripts/sources/` — retained Videha archive sources used by the build.
- `scripts/build.mjs` — generates the deployable `dist/` package. Keep this file inside `scripts/`.
- `scripts/update-github-catalogue.mjs` — refreshes the cross-repository book catalogue from GitHub.
- `.github/workflows/deploy-pages.yml` — GitHub Pages deployment workflow.

## Local preview

Run `npm run dev`, then open `http://127.0.0.1:4173`.

## GitHub Pages

Create a public repository named `videha-literature-festival`, push the `main` branch, and set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. The included workflow publishes the site.

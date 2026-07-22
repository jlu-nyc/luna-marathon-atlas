# Luna Marathon Atlas

A browser-ready Next.js application built from Jerry's Garmin and Strava activity exports.

## What is included

- Career timeline and race archive
- Individual marathon pages
- Standardized 14-week training-cycle metrics where source data exist
- Weekly mileage charts
- Side-by-side comparison tool
- Compact activity dataset for future analytics
- Project vision, roadmap, constitution, and decision log
- Starter unit tests for the pre-race training window

The default pre-race window is intentionally defined as a **12-week build plus a 2-week lead-in**.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validation

```bash
npm test
npm run typecheck
npm run build
```

## Add to GitHub

1. Create a new **private** GitHub repository named `luna-marathon-atlas`.
2. Upload or commit every file and folder from this project.
3. Treat GitHub as the source of truth after this initial import.
4. Use short-lived feature branches and pull requests for subsequent work.

See [`docs/GIT_WORKFLOW.md`](docs/GIT_WORKFLOW.md) for the recommended collaboration workflow.

## Run in GitHub Codespaces

1. In the repository, click **Code → Codespaces → Create codespace on main**.
2. The included dev container installs dependencies automatically.
3. Run `npm run dev` in the Codespaces terminal.
4. Open forwarded port 3000 when GitHub offers it.

## Deploy with Vercel

1. Create or sign into a Vercel account.
2. Choose **Add New → Project** and import the private GitHub repository.
3. Keep the detected Next.js settings and deploy.
4. Each later GitHub push creates a new deployment.

## Project documents

- [`docs/VISION.md`](docs/VISION.md) — product purpose and guiding principles
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — staged development direction
- [`docs/CONSTITUTION.md`](docs/CONSTITUTION.md) — rules for data, analytics, and product behavior
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — durable architecture and product choices
- [`docs/GIT_WORKFLOW.md`](docs/GIT_WORKFLOW.md) — branch, validation, and collaboration workflow

## Data notes

- Garmin export covers early activity history, including the 2013 and 2014 builds.
- Strava export covers modern cycles through July 2026.
- `3:31:00*` for NYC 2025 is explicitly approximate and should be replaced when the official result is confirmed.
- The app currently reads precomputed metrics from versioned JSON. The new `analytics/` modules establish the tested foundation for moving all calculations into code.
- Training correlations should be interpreted cautiously because weather, course, age, injuries, and second-marathon effects are not yet fully modeled.

# Country Rank

A local, offline single-player geography strategy game built with React, TypeScript, and Vite. Assign randomly drawn countries to unused categories. The lowest total wins.

## Run locally

Requires Node.js 22 or later and npm. From this directory:

```sh
npm install
npm run dev
```

Open **http://127.0.0.1:5173**. The terminal prints a different port if 5173 is occupied. Stop the server with Ctrl+C. Installation needs internet; gameplay and all assets work without internet once dependencies are installed and the local server is running.

```sh
npm test          # Core rules, real dataset validation, and storage tests
npm run build     # TypeScript checks and offline production bundle
npm run preview   # Serve the production bundle at http://127.0.0.1:4173
```

## Data and categories

The unchanged `data/countries-master-list.csv` is the canonical 197-country pool. Existing SVGs in `data/flags_4x3` are bundled locally. Processed JSON records retain their original values, ranks, years, and gameplay points. No rankings are recalculated. The adapter validates the master, flags, metadata, record IDs, missing markers, ranks and capped points. A broken master prevents play; an invalid category is disabled with an on-screen development warning.

Six categories are currently enabled: CO₂ emissions, Olympic medals, life expectancy, area, GDP, and UNESCO sites. Press freedom and tourism are intentionally unavailable. The registry in `src/data/adapter.ts` includes all eight. To enable the remaining categories, add `data/processed/press-freedom.json` and `data/processed/tourism.json` using the existing schema: `category`, `unit`, `source` (organization and dataset), nonempty `reference`, and 197 `countries` records with `id`, `value`, `year`, `rank`, `points`, `missing`. Each file is validated before activation. Round counts and draws adapt automatically.

Source caveats, including Olympics sports-only verification limits and CO₂ source-edition limits, remain in the original files and are shown under “About the data & sources” after the game. Missing rank is displayed as “Not ranked” and earns the supplied 100 points. No source data, flags, or processing scripts are modified.

## Implementation

- `src/data`: typed normalization, validation, and local asset integration.
- `src/game`: immutable draw/assignment rules, final-only scoring, and best-score storage.
- `src/screens`: start, play, and results screens.
- `src/components`: shared flag rendering.
- `src/styles`: responsive styling and reduced-motion support.
- `tests`: automated tests using the actual processed files.

Fisher–Yates draws without replacement. Game state locks confirmed assignments and scoring functions refuse incomplete games. Best scores use a sorted category-ID configuration key and include category count; six- and eight-category scores are separate. Storage failure never blocks gameplay. Because this is a client-only local game, rankings are hidden by the interface, not protected against inspection in developer tools.

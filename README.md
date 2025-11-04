# Idle Oil Inc

You are the CEO of a scrappy extraction empire. This repo contains a complete Vite + React + TypeScript implementation of the "Idle Oil Inc" incremental game spec with automated testing, linting, Tailwind styling, and GitHub Pages deployment.

## Quick start


```bash
npm install
npm run dev
```

The development server lives at http://localhost:5173 by default. Tailwind is injected via CDN for the dev HTML preview and compiled through PostCSS during the build pipeline.

## Game rules

* properties never pay out passively unless a CEO is hired. progress bars must reach 100%.
* tapping a property nudges its progress bar forward. there is no cash until the bar is full.
* hired CEOs automatically cycle their assigned property at its effective `T_i`. each completion pays the full `B_i * L_i * M_i`.
* milestones arrive every 100 levels and triple the property multiplier `M_i`.
* prestige wipes levels/CEOs but keeps experience. the global income multiplier is `2 ^ (log_base_5(experience))`.
* offline earnings only accrue for CEO-managed properties using `floor(Δt / T_i_effective) * payout_i`.
* tech upgrades tweak multipliers, unlock bulk buying, or adjust cycle times.
* number formatting can swap between SI-compact and scientific notation.
* payouts, upgrades, and prestige events fire lightweight web-audio tones and toast notifications.

## Tooling scripts

| command | purpose |
| --- | --- |
| `npm run dev` | start the Vite dev server |
| `npm run build` | create a production build in `dist/` |
| `npm run preview` | preview the production bundle |
| `npm run lint` | run ESLint with TypeScript rules |
| `npm run test` | execute Vitest (jsdom environment) |

## Testing

Core economic rules are unit-tested via Vitest. Tests cover single tap payouts, CEO automation throughput, offline income, and prestige multipliers.

Run the suite with:

```bash
npm run test
```

## Deployment

A GitHub Actions workflow (`.github/workflows/deploy.yml`) builds, tests, and publishes the Vite `dist/` folder to GitHub Pages whenever `main` is updated.

## Automation scripts

* `scripts/setup.sh` — installs dependencies via `npm ci` and runs lint + test sanity checks.
* `scripts/publish_gh.sh` — bootstraps a git repo and pushes to GitHub using the GitHub CLI.
* `scripts/publish_with_pat.sh` — fallback instructions if `gh` is unavailable (manual remote with a personal access token).

## Save data

Game progress persists to `localStorage` with timestamped saves for offline income computation. clearing your browser storage resets the empire.

## License

Released under the MIT License. See [LICENSE](./LICENSE).

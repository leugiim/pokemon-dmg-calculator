# Merge the team planner into this repo (pokemon-tools), split by module

The calculator (this repo, formerly `pokemon-dmg-calculator`) and a separate React app, `pokemon-team-stats`, which tracks teams and match history, are being combined into one SvelteKit project so a match can open the calculator with both teams already loaded.

## Decisions

- **One repo, renamed `pokemon-tools`, no monorepo.** Two small apps don't justify workspaces. The Svelte stack (SvelteKit, Tailwind, Vitest) of this repo is the one that survives; the planner is rewritten in Svelte, not embedded.
- **Split by module.** `src/lib/modules/{damage-calculator,team-planner,shared}` holds business logic and `src/lib/components/{damage-calculator,team-planner,shared}` holds UI; tests mirror `modules`. The two tool modules never import from each other; anything both need goes in `shared`, and they integrate through each module's public `index.ts` or a thin adapter in the route. Components under `shared` don't import from any module (that's why `combobox/` and `display/`, which read engine data, stay under `damage-calculator` for now).
- **Routes**: `/` (home), `/calc` (calculator), `/teams` (planner).
- **Persistence**: `localStorage`, shared by both tools, with JSON export/import as a backup. Still no backend.
- **Rival with optional sets**: a Match keeps the quick "names only" mode; opening the calculator fills missing rival sets from Common Sets. Both tools share a plain serializable set type instead of the calculator's `TeamSlot` class (which holds `$state` and `@smogon/calc` objects).

## Consequences

- `vendor/smogon-calc` and `vendor/ncp-common-sets` stay as they are (ADR-0005, ADR-0006).
- localStorage is per origin, so moving to a new domain doesn't carry data over; export/import is the way to move it.
- The planner's page-by-page React `useState` routing is replaced by real URLs.

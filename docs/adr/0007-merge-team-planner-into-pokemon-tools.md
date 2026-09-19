# Merge the team planner into this repo (pokemon-tools), split by module

The calculator (this repo, formerly `pokemon-dmg-calculator`) and a separate React app, `pokemon-team-stats`, which tracks teams and match history, are being combined into one SvelteKit project so a match can open the calculator with both teams already loaded.

## Decisions

- **One repo, renamed `pokemon-tools`, no monorepo.** Two small apps don't justify workspaces. The Svelte stack (SvelteKit, Tailwind, Vitest) of this repo is the one that survives; the planner is rewritten in Svelte, not embedded.
- **Split by module.** `src/lib/modules/{damage-calculator,team-planner,shared}` holds business logic and `src/lib/components/{damage-calculator,team-planner,shared}` holds UI; tests mirror `modules`. The two tool modules never import from each other; anything both need goes in `shared`, and they integrate through each module's public `index.ts` or a thin adapter in the route. Components under `shared` don't import from any module (that's why `combobox/` and `display/`, which read engine data, stay under `damage-calculator` for now).
- **Routes**: `/` (home), `/calc` (calculator), `/teams` (planner: list, `/teams/new`, `/teams/[id]`, `/teams/[id]/edit`, `/teams/[id]/match/new` and `/teams/[id]/match/[matchId]`). The planner reads `localStorage` and has no fixed list of ids, so `routes/teams` is `ssr = false` / `prerender = false` and served by `adapter-static`'s SPA fallback (`200.html`); `/` and `/calc` stay prerendered.
- **Persistence**: `localStorage`, shared by both tools, with JSON export/import as a backup. Still no backend.
- **Rival with optional sets**: a Match keeps the quick "names only" mode; opening the calculator fills missing rival sets from Common Sets. Both tools share a plain serializable set type instead of the calculator's `TeamSlot` class (which holds `$state` and `@smogon/calc` objects).

- **Opening the calculator from a match**: the match form writes a short-lived handoff record (`pt:v1:calc-handoff:<id>`, the contract lives in `modules/shared/calc-handoff.ts`) and opens `/calc?handoff=<id>` in a new tab, so the unsaved form is untouched. The calculator gets the **whole team of each side** (up to 6), not just the 4 selected; the match's leads are put on the field and any member can be swapped in from the bench. Rival members without a saved set use the species' first common set. The calculator writes the rival sets back under `pt:v1:calc-result:<id>` and the match form, listening to `storage` events, picks them up and saves them with the match (`rivalSets`). Neither module imports the other: both only know the shared contract. The team page has the same button without a match: `purpose: 'team'` loads just the team's own six as Team A, with nothing to save back. The calculator's roster can also be edited by hand there: **Save** on a slot card adds it (up to 6) and a trash button removes a member, so a team can be built up from nothing. Records older than a day are pruned.

## Consequences

- `vendor/smogon-calc` and `vendor/ncp-common-sets` stay as they are (ADR-0005, ADR-0006).
- localStorage is per origin, so moving to a new domain doesn't carry data over; export/import is the way to move it.
- The planner's page-by-page React `useState` routing is replaced by real URLs (back button and deep links work).
- The static host has to serve `200.html` for unknown paths, otherwise a reload on `/teams/<id>` is a 404.

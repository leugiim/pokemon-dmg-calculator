# Pokemon Tools

VGC tools for Pokémon Champions (doubles, Reg M-C), in one SvelteKit app:

- **Damage Calculator** (`/calc`): a 2v2 damage calculator. You pick 2 Pokémon per side and get the damage of every attacker's moves against every opposing target, with doubles-specific mechanics (spread moves, ally support, field abilities...).
- **Team Planner** (`/teams`): keep your teams from a Pokepaste, log your matches and see win rates, leads and toughest opponents. Ported from the standalone [`pokemon-team-stats`](https://github.com/leugiim/pokemon-team-stats) app. Data lives in your browser (`localStorage`), with JSON export/import of a team's match history. From a team you can open the calculator with its six loaded; from a match, with both whole teams loaded (6 each; pick who's on the field) and save the rival sets you tweak back to the match.

This repo used to be `pokemon-dmg-calculator` (the calculator on its own).

## Damage Calculator

Inspired by the [NCP VGC Damage Calculator](https://nerd-of-now.github.io/NCP-VGC-Damage-Calculator/) (itself based on the official [Pokémon Showdown](https://calc.pokemonshowdown.com/) calculator), which only covers 1 attacker vs 1 defender. This one is built natively for **doubles**: 2 attackers and 2 defenders at once, with the resulting damage matrix between both sides. It is a point-in-time calculator, not a battle simulator or a teambuilder.

Rules follow Pokémon Champions: level 50, IVs fixed at 31, and Stat Points (0-32 per stat, 66 total) instead of EVs. There is no Tera, Dynamax or Z-Moves.

- Per Pokémon: species/form, item, ability, nature, Stat Points, stat stages (-6 to +6) and up to 4 moves (with crit and multi-hit options).
- Field: format (Singles/Doubles), weather, terrain, Gravity, and field abilities (Ruin abilities, Fairy Aura).
- Per team: ally support (Helping Hand, Tailwind, Friend Guard, Battery, Power Spot, Steely Spirit) and side conditions (Reflect, Light Screen, Aurora Veil, Protect, hazards, Intimidate).
- Import a single Pokémon from a PokePaste (and copy it back), or load a curated set from **Common Sets**.
- Output: for every attacker and move against each opposing target, the damage range as a % of the target's HP, and the KO chance.

See [`CONTEXT.md`](CONTEXT.md) for the domain glossary and [`docs/adr`](docs/adr) for design decisions.

## Moving your data from the old planner

The standalone [`pokemon-team-stats`](https://github.com/leugiim/pokemon-team-stats) app kept everything in the browser's `localStorage`, tied to the exact address it ran on (e.g. `http://localhost:5173`), so it can't follow you to a new address by itself. Two ways to bring it over:

**All teams and matches at once** (with a console, in Chrome/Edge):

1. Run the old app again on the same address you always used, open its DevTools console and run this. It copies your data to the clipboard as one line of text:

   ```js
   copy(
   	btoa(
   		unescape(
   			encodeURIComponent(
   				JSON.stringify(
   					Object.fromEntries(Object.entries(localStorage).filter(([k]) => k.startsWith('pts_')))
   				)
   			)
   		)
   	)
   );
   ```

2. Open the new site on `/teams`, open its console and run this, replacing `PASTE_HERE` with what you copied (it reloads on `/teams`; Chrome may ask you to type `allow pasting` first):

   ```js
   Object.entries(JSON.parse(decodeURIComponent(escape(atob('PASTE_HERE'))))).forEach(([k, v]) =>
   	localStorage.setItem(k, v)
   );
   location.href = '/teams';
   ```

The planner picks the old data up on first load and converts it (the old keys are left untouched, so you can repeat it). **This only works while the new site has no teams of its own yet**: once it has saved anything, it stops looking at the old data. If you already created teams there, either remove those keys first (`Object.keys(localStorage).filter((k) => k.startsWith('pt:v1:')).forEach((k) => localStorage.removeItem(k))`, which deletes what you made in the new one) or use the second way.

**One team at a time**: in the old app, open the team, use _Editar Pokepaste_ to copy its paste and _Exportar historial_ to copy its matches. In the new site, create the team from that paste and use _Import history_ on the team page.

## Tech stack

- **SvelteKit** (Svelte 5, runes) + TypeScript, **Tailwind CSS 4**, **pnpm**.
- **[`@smogon/calc`](https://www.npmjs.com/package/@smogon/calc)** as the damage engine, vendored from a pinned upstream commit (ADR-0005). Common Sets data is vendored from the NCP VGC Damage Calculator (ADR-0006).
- Sprites are served from Pokémon Showdown's public CDN; species abilities are fetched from PokéAPI at runtime.
- **ESLint** + **Prettier**, **Vitest** (unit) and **Playwright** (e2e, configured but no specs yet).
- **`@sveltejs/adapter-static`**: fully static build, no backend and no database.

## Folder structure

Code is split by tool. Anything specific to one tool lives under its own folder, both UI and business logic; what both use goes in `shared`. `damage-calculator` and `team-planner` never import from each other.

```
src/
  lib/
    components/
      damage-calculator/   # UI of the calculator
      team-planner/        # UI of the planner
      shared/              # generic UI kit (ui/, Footer)
    modules/
      damage-calculator/   # calc/ (engine) and stores/
      team-planner/        # business logic of the planner
      shared/              # code used by both tools
  routes/
    +page.svelte           # home
    calc/                  # damage calculator
    teams/                 # team planner
tests/
  modules/                 # mirrors src/lib/modules
vendor/                    # generated third-party code, never hand-edited
```

## Development

```sh
pnpm install
pnpm dev
```

```sh
pnpm check   # svelte-check
pnpm lint    # prettier + eslint
pnpm test:unit -- --run
```

## Deployment

`pnpm build` produces a static site in `build/`. `/` and `/calc` are prerendered; the planner's pages (`/teams/...`) render in the browser only, so the host must serve `200.html` (the SPA fallback) for any path that isn't a file, e.g. Caddy's `try_files {path} {path}.html /200.html`. Production deployment is described in `deploy.sh`.

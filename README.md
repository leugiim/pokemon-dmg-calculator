# Pokemon DMG Calculator

A competitive Pokémon (VGC, doubles format) damage calculator focused on
**2 vs 2** battles: you pick 2 Pokémon per side (4 total), and the tool
computes the damage of every attacker's moves against every opposing
target, accounting for doubles-specific interactions (spread moves, ally
support, etc.).

## Motivation

Inspired by the
[NCP VGC Damage Calculator](https://nerd-of-now.github.io/NCP-VGC-Damage-Calculator/)
(itself based on the official
[Pokémon Showdown](https://calc.pokemonshowdown.com/) damage calculator),
which only covers 1 attacker vs 1 defender. This tool aims for the same
level of mechanical detail but built natively for **doubles**: 2 attackers
and 2 defenders on screen at once, with the resulting damage matrix
between both sides.

It's not a turn-based battle simulator or a teambuilder — it's a
point-in-time damage calculator, same as its references.

## Features

### Team selection

- 2 Pokémon on the attacking side, 2 on the defending side.
- Each of the 4 Pokémon is configured independently (see next section),
  and also acts as the **ally** of the other Pokémon on its own side for
  doubles-specific support (Helping Hand, Friend Guard, Battery, Power
  Spot, Steely Spirit...).

### Per-Pokémon configuration

- **Identity**: species, form and weight.
- **Level**.
- **Stats**: base stats, IVs, EVs, nature (25 available) and the resulting
  computed stats.
- **Ability**, with a stage modifier where applicable (-5 to +6, e.g.
  stacked Intimidate, Simple, etc.).
- **Held item**.
- **Status condition**: healthy, poisoned (regular/toxic), burned,
  paralyzed, asleep, frozen.
- **Tera type** (Terastallization).
- **Dynamax / Gigantamax**.
- In-battle stat stage modifiers (-6 to +6) per stat.

### Moves

- Up to 4 moves per Pokémon, with:
  - Type, category (physical/special/status) and base power.
  - Target (a specific opponent, both opponents, ally, all...) — determines
    whether the doubles spread-move damage reduction (0.75×) applies.
  - Multi-hit moves (1-10 hits).
  - Z-Moves.
  - Pledge moves (Grass/Fire/Water Pledge), including the combo effect
    when both allies use different Pledges on the same turn.

### Field conditions and global effects

- **Weather**: sun, rain, sand, hail/snow, harsh sunlight, heavy rain,
  strong winds.
- **Terrain**: electric, grassy, psychic, none.
- **Screens** (per side): Reflect, Light Screen, Aurora Veil.
- **Hazards** (per side): Stealth Rock, Spikes (0-3 layers), Leech Seed.
- **Gravity**, **Neutralizing Gas**, **Weakness Policy**.

### Doubles-specific support

- **Helping Hand**: one ally boosting the other's attack.
- **Tailwind** (per side).
- **Friend Guard**: reduces damage taken by the ability holder's ally.
- **Battery**, **Power Spot**, **Steely Spirit**: power boosts to an
  ally's moves.

### Calculation output

- A 2×2 damage matrix: each of the 2 attackers against each of the 2
  opposing targets (and against its own ally, if the move allows it).
- For each attacker→target/move combination: damage range as a percentage
  of the target's total HP, and OHKO/2HKO/... probability (KO chance), same
  as the reference calculator.

## Out of scope

- No turn-based simulation or opponent AI — it's a point-in-time
  calculator, not a battle simulator.
- No user accounts, no team persistence across sessions, no backend: all
  configuration lives in page state while you're using it.

## Tech stack

- **SvelteKit** (Svelte 5) + TypeScript, scaffolded with `sv create`.
- **Tailwind CSS 4** for styling.
- **[`@smogon/calc`](https://www.npmjs.com/package/@smogon/calc)** as the
  damage calculation engine: it's the same library used by the Pokémon
  Showdown damage calculator (which the reference linked above is itself
  derived from). It already ships the damage formula and per-generation
  move/ability/item/base-stat data — we avoid reimplementing game
  mechanics and focus on the UI and the doubles-specific logic (2×2
  matrix, ally support). Vendored from a pinned upstream commit rather
  than installed from npm — see `docs/adr/0005-vendor-smogon-calc.md`.
- Pokémon sprites served from Pokémon Showdown's public CDN
  (`play.pokemonshowdown.com/sprites`), no self-hosted assets.
- **pnpm** as the package manager.
- **ESLint** (flat config) + **Prettier** (`prettier-plugin-svelte`,
  `prettier-plugin-tailwindcss`) for lint/formatting.
- **Vitest** (+ `vitest-browser-svelte`) for unit/component tests, and
  **Playwright** for a basic e2e of the calculation flow.
- **`@sveltejs/adapter-static`**: the build is fully static (no SSR/BFF),
  no Node server needed in production.

No backend and no database in this project — all logic runs in the
browser.

## Folder structure (proposed)

```
src/
  lib/
    calc/          # wrappers around @smogon/calc + doubles-specific logic
                    # (2x2 matrix, ally support, spread targeting)
    components/    # UI: Pokémon picker, set form, battlefield panel,
                    # results table...
    data/          # helper lists for selectors (species, moves, items...
                    # derived from @smogon/calc)
    stores/        # state for the 4 Pokémon + field conditions
  routes/
    +page.svelte   # single screen: team selection + results
static/
```

Being a single-screen tool (no backend, no separate views), no additional
SvelteKit routes beyond the main page are expected.

## Development

```sh
pnpm install
pnpm dev
```

No database to set up — this project doesn't use one.

## Deployment

Fully static frontend, no server component in production.

```sh
pnpm build
```

produces a static site in `build/` that can be served from any static
host (a CDN, a plain web server, GitHub Pages, etc.) — just point it at
that directory.

## Project status

Just the project definition for now — initial scaffolding (`sv create`)
and implementation are still pending.

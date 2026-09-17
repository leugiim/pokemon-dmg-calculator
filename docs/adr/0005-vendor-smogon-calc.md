# `@smogon/calc` is vendored from a pinned upstream commit instead of installed from npm

`@smogon/calc` on npm is stuck on `0.11.0` (published March 2026) — the newest version registered
there, and the gaps between releases are large and irregular (`0.10.0` → `0.11.0` was 22 months;
`0.6.0` → `0.7.0` was 2 years). Nobody publishes on a schedule or from CI; it's a manual, sporadic
act, decoupled from the repo's own git history (GitHub tags stopped in 2020, long before recent
npm releases). That data set predates real Pokémon Champions support entirely: it has no
Champions-specific generation slot at all, so every move base power it reports is Scarlet/Violet's,
even for moves Champions has since re-tuned (Slash 70 vs. Champions' 80, Mountain Gale 100 vs. 120,
...).

The real data already exists upstream: `smogon/damage-calc`'s `master` branch merged genuine
Champions support on 2026-09-09 (commit `fc17f51822249b44c9f4ff36c03ba40d0541a6e9`, _"Champions:
Support Regulation M-C"_) — a dedicated `Generations.get(0)` data set, confirmed byte-for-byte
identical to what `calc.pokemonshowdown.com` (the official site, built from this same repo) already
serves in production. It just hasn't been cut into an npm release.

## Considered options

- **Install directly from that git commit** (`pnpm add` supports git + subdirectory installs).
  Fails: `calc/`'s own build step (`node bundle`) needs `@babel/core`, which is only declared as an
  `optionalDependency` on the monorepo _root_ `package.json`, not inside `calc/`'s own — a
  subdirectory-only git install never sees it.
- **Wait for an official npm release.** Given the release cadence above, this could be another
  year or more — not something to block on.
- **Hand-type an override table** for the handful of moves we'd noticed differed (Slash, Mountain
  Gale). Works, but every entry has to be found and verified by hand against Bulbapedia one at a
  time, forever — no way to know if the list is complete, and it'd have caught only 2 of the ~26
  moves Regulation M-C actually changed.
- **Vendor the compiled output of a pinned commit** (chosen): clone the _whole_ monorepo (not just
  `calc/`) at a specific commit, `npm install` at its root — where `@babel/core` actually
  resolves — which triggers `calc/`'s own `postinstall`/`prepare` build, then copy the resulting
  `calc/dist/` into this repo and depend on it via `"@smogon/calc": "file:vendor/smogon-calc"`.
  Verified the built output matches `calc.pokemonshowdown.com`'s live, deployed data exactly.

## How it works

- `scripts/vendor-smogon-calc.sh` does the clone/build/copy above. `COMMIT` at the top of that
  script is the one thing to change to pick up a newer patch — bump it, rerun the script, review
  the diff under `vendor/smogon-calc/`, and run the test suite.
- `vendor/smogon-calc/` is committed to git (unlike `node_modules/`) — `pnpm install`'s `file:`
  resolution needs it there; there's no build step at `pnpm install` time, since the committed
  `dist/` already **is** the build output. `vendor/smogon-calc/PROVENANCE.md` records which commit
  it was built from and when.
- `generation.ts`'s `championsGen` (`Generations.get(0)`) is a second, narrow read of this same
  vendored package — **not** a `GEN_NUM` switch. Champions' own roster is still a much smaller
  subset of SV's (359 species/526 moves vs. SV's 1406/942 at the time this was checked), so
  building the species/move/item/ability pickers off it would silently drop most of what this app
  currently supports. `moves.ts`'s `effectiveBasePower` reads only `championsGen`'s base power,
  diffed implicitly against `gen`'s (SV) own — for a move Champions hasn't patched, both data sets
  agree, so the lookup is a safe no-op; for one it has, the real, current value wins. Nothing else
  (type, category, target, flags, ...) is read from `championsGen` — only base power was asked for.
- `eslint.config.js` and `.prettierignore` both exclude `vendor/` explicitly: it's tracked in git
  (so not covered by the `.gitignore`-derived eslint ignore) but is generated output, never
  hand-edited, and shouldn't be reformatted or relinted as if it were this app's own source.

## An unplanned side effect: Gigantamax forms

The pinned commit also carries an unrelated, earlier upstream fix (`20f43c4`, _"Don't show
GMax/duplicate formes in SV/Champions"_, 2026-05-05): Gigantamax was never actually available in
Scarlet/Violet (it's a Sword/Shield-only mechanic) or in Champions, and the old npm data had
incorrectly kept 34 `*-Gmax` species entries under gen 9 anyway. The two changes are inseparable —
both are baked into the same evolving `species.ts`/`moves.ts`, and any commit recent enough to
carry Regulation M-C support is also recent enough to have this fix.

This app's species/forme picker (`generation.ts`) previously supported picking a Gigantamax form
for any species that had one, alongside Mega Evolutions — `isBattleOnlyForme`'s generic
`baseSpecies`-suffix rule, plus hand-rolled `Urshifu-Gmax`/`Urshifu-Rapid-Strike-Gmax`/
`Toxtricity-Gmax`/`Toxtricity-Low-Key-Gmax` entries in `FORM_FAMILIES`. With those species gone
from the data, the hand-rolled entries would have thrown (`find()` errors on a name that no longer
resolves) the moment someone picked Urshifu or Toxtricity — so this was fixed alongside the
vendoring change, not deferred: `isBattleOnlyForme` only recognizes Mega Evolutions now, the
`FORM_ORDER`/`FORM_ORDER`-adjacent Gmax entries and the four hand-rolled forme entries above were
removed, and the three tests that had asserted the old (incorrect) Gmax data were updated to assert
the corrected one instead (`generation.spec.ts`, `items.spec.ts`).

## Consequences

- Bumping to a newer patch is a deliberate, reviewable act (rerun the script, diff `vendor/`,
  rerun tests) rather than an automatic `pnpm update` — appropriate for data with no real upstream
  release process to trust yet.
- `vendor/smogon-calc/dist/` adds ~2.9 MB of generated, non-authored code to this repo's git
  history. Never hand-edit it — always regenerate via the script.
- Any _other_ future upstream data correction bundled into the same commit range (the way the Gmax
  fix rode along with Champions support here) needs the same scrutiny: re-run the full test suite
  after bumping `COMMIT`, don't assume a bump only touches what you went looking for.

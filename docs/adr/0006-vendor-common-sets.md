# Common Sets are vendored from nerd-of-now/NCP-VGC-Damage-Calculator's own setdex

The "Common Sets" feature (`TeamSlotCard`'s button next to "Import") lets a reader load
a curated, named build onto a slot's already-selected species instead of building one by hand.
That data comes from [nerd-of-now/NCP-VGC-Damage-Calculator](https://github.com/nerd-of-now/NCP-VGC-Damage-Calculator)
(this app's own stated inspiration, `README.md`'s "Motivation") — specifically
`script_res/setdex_ncp-g10.js`, that project's own actively-maintained current-regulation set
library. MIT-licensed (`Copyright (c) 2013-2021 Honko, Tapin, Firestorm, Jake White
(squirrelboyVGC), nerd-of-now, and other contributors` — the same Honko lineage `@smogon/calc`
traces back to, ADR-0005), so reusing it is a licensing non-event as long as that notice travels
with it — same as `vendor/smogon-calc`.

Its `sps` field (Stat Points, 0-32 per stat) already matches this app's own Stat Point convention
exactly, not the real game's 0-252 EVs — no conversion needed, unlike PokePaste's `EVs:` line
(`pokepaste.ts`'s own doc comment). The file we pulled is also the one that got "Reg M-C sets"
added on 2026-09-12 — the regulation this app already targets — which is a strong sign it's kept
in sync with the same competitive format this app cares about, not a stale or off-format set list.

## How it works

- `scripts/vendor-common-sets.sh` fetches `setdex_ncp-g10.js` at a pinned commit and evaluates it
  (`new Function(source + '; return SETDEX_GEN10;')()`) to get a real object out of what's valid
  JS but not strict JSON (trailing commas, ...), then `JSON.stringify`s that into
  `vendor/ncp-common-sets/setdex.json` — committed to git, like `vendor/smogon-calc`, and excluded
  from lint/prettier the same way (ADR-0005). `COMMIT` at the top of the script is the one thing to
  bump for a newer patch.
- `calc/commonSets.ts` resolves that raw JSON against this app's own data — species (exact key
  match against `species.name`), item/nature/move names (`pokepaste.ts`'s own `findByName`, now
  exported for reuse), same leniency `importPokePaste` already has: an unrecognized name drops to
  `null`/neutral rather than failing the whole set.
- `ability` is a genuine exception to that leniency: **123 of the vendored data's 151 sets don't
  specify one at all** (`item` is missing on exactly one, Talonflame's intentionally itemless
  "Itemless Acrobatics" — everything else always has one). The source tool apparently leaves
  ability to whatever its own UI already has selected, rather than treating it as part of the set.
  `CommonSet.ability` is therefore `string | undefined` (not `string | null`): `undefined` means
  "this set has no opinion", and `applyCommonSet` leaves the slot's current ability untouched in
  that case rather than clearing it to `null` — clearing it would have thrown away a perfectly
  good ability (already auto-filled on species selection, `TeamSlotCard`'s `selectSpecies`) for
  the vast majority of common sets, not just the odd one that's actually silent about it.
- A Mega Evolution's sets live under its _base_ species key in the vendored data (e.g. Charizard's
  Mega Y sets are under `"Charizard"`, holding a Mega Stone `item`), never under a
  `"Charizard-Mega-Y"` key of their own — the same base-species/held-stone split `megaStoneFor`
  and this app's own Mega handling already use (`generation.ts`). Applying one of these sets
  doesn't switch the slot's forme, same as `importPokePaste` never does either — the reader still
  picks the Mega forme themselves via `FormeCombobox` to see its stats.
- The "Common Sets" button (`TeamSlotCard.svelte`) is disabled whenever `hasCommonSets(slot.species)`
  is false — no species selected, or one the vendored data doesn't cover at all (it's a curated 90-species
  list, not exhaustive). Clicking it opens `CommonSetsModal`, which lists every set for that species
  (name, item/ability/nature, `format.ts`'s new `formatStatPoints` spread summary, moves);
  picking one calls `applyCommonSet` and closes.

## Considered options

- Fork the site's own live UI/embed it: far more integration work for the same underlying data,
  and couples this app to that site's own markup/JS staying stable.
- Re-derive "common sets" from tournament usage stats ourselves (e.g. a Pikalytics/Limitless
  scrape): a much bigger undertaking (no existing curated, named-set data source) for a feature
  that's explicitly about quick presets, not a full usage-stats explorer.
- Hand-type a handful of sets for a few popular species: far less coverage (90 species' worth
  already exists, curated by people actively playing the format) for real, ongoing maintenance
  work this vendoring script instead gets for free from someone else's upkeep.

## Consequences

- Bumping to a newer vendored commit is a deliberate, reviewable act (rerun the script, diff
  `vendor/ncp-common-sets/setdex.json`, rerun tests) — same posture as `vendor/smogon-calc`
  (ADR-0005), appropriate for a third-party data source this app doesn't control the release
  cadence of.
- Coverage is whatever nerd-of-now's own set has: 90 species at vendoring time, not the full
  National Dex. A species/build not in there simply shows a disabled button — no way (or need)
  to distinguish that from "not currently viable" vs. "not yet added to their list".
- Only item/ability/nature/Stat Points/moves are read from each set — no
  secondary metadata (matchup notes, usage stats, ...) the source site might show alongside a set
  is carried over; this app's own summary (`CommonSetsModal`) is deliberately terse, matching how
  little of a full PokePaste a common set otherwise represents.

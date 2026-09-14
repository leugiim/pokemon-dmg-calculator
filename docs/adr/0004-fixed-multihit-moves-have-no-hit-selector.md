# The multi-hit selector only appears for a move whose hit count is genuinely variable

`multiHitRange` (and so the Damage Matrix's hit-count selector, #15) only covers a move whose
`@smogon/calc` data gives `multihit` as a `[min, max]` pair (Bullet Seed, Icicle Spear, ...), or as
a single number paired with `multiaccuracy: true` (Population Bomb, this generation's Triple Kick)
— moves whose hit count can genuinely land on more than one value in play. A move whose `multihit`
is a single number _without_ `multiaccuracy` (Double Hit, Bonemerang, Double Kick, Twineedle,
Surging Strikes) always hits exactly that many times; `@smogon/calc`'s own `Move` constructor
hard-codes `this.hits = data.multihit` for that shape and ignores any `hits` override entirely, so
these report `null` and get no selector at all, the same as a move with no `multihit` data.

## Considered options

- Show the selector for every move with any `multihit` data, fixed-count ones included: more
  uniform, but the selector would silently do nothing when moved — `@smogon/calc` ignores the
  override for these, so a reader who changes it would see no change in the result and wrongly
  read that as a bug.
- Hard-code the fixed-count move names into an exclusion list, the way `isAllyOnlyTarget` has to
  for ally-only targeting: works, but there's no need here — the data already exposes the exact
  distinction (`multiaccuracy`) that decides it, unlike targeting.

## Consequences

A future multi-hit move added to `@smogon/calc`'s data is covered automatically by `multiHitRange`
without a hand-curated list to update, as long as it follows the same `multihit`/`multiaccuracy`
shape as every existing one.

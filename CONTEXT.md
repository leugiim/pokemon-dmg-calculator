# Pokemon DMG Calculator

A VGC-style damage calculator for 2vs2 (doubles) battles: given two teams of two Pokémon each, computes damage for every attacker/target pairing. Not a turn simulator; each calculation is a point-in-time "what if".

## Language

**TeamId**:
Identifies which of the two battle sides a team belongs to (`teamA` | `teamB`). Renamed from the app's original `Side` type to avoid colliding with `@smogon/calc`'s own `Side`, which is a different concept (see below).
_Avoid_: Side (for this concept), Team (ambiguous with the roster itself)

**Side** _(library term, `@smogon/calc`)_:
The set of field-level flags scoped to one battling party for a single calculation (e.g. Tailwind, Helping Hand active, Friend Guard). Not the same concept as `TeamId`.

**Slot**:
One of the two positions within a `TeamId`'s roster (index 0 or 1), each holding a `TeamSlot` (species, item, ability, nature, stat points, moves). The two slots of one side are always allies of each other.

**Ally**:
The Pokémon occupying the other slot of the same side as a given attacker or defender. Every damage calculation involves exactly one ally per side (fixed 2vs2, no bench).

**Damage Matrix**:
The core result of a matchup: for every attacker (the 4 Pokémon across both sides) and every one of its up to 4 moves, the damage against each of the 2 opposing Pokémon, computed in both directions (A→B and B→A). Excludes friendly fire, except that an `allAdjacent` move's simultaneous ally damage is shown inline alongside its matrix row (see Friendly fire). Every move row is shown, including status moves (marked `—`, see below); no targeting is redirected (Follow Me, Rage Powder, Storm Drain, Lightning Rod are not modeled — the reader picks the target).
_Avoid_: 2x2 matrix (undersells that all 4 moves are shown, and ambiguous about whether it includes the ally)

A cell shows a %HP range (min-max) plus a KO chance annotation when relevant, matching the convention of Pokémon Showdown-style calculators; not a single number. A cell is `—` only for moves with no direct damage component at all (base power 0 and not a fixed-damage move like Seismic Toss) — any move with a damage formula always shows its computed number, even if that number is 0 (e.g. a Normal move into a Ghost-type). No critical hit is assumed by default; "assume crit" is a separate opt-in recalculation, not a second number shown by default. Multi-hit moves (Bullet Seed, Icicle Spear, ...) default to 3 hits (the expected average, matching `@smogon/calc`'s own default, overridden automatically when an ability fixes the count, e.g. Skill Link → 5), with a manual selector to override the hit count per move.

**Friendly fire**:
Damage calculated against a Pokémon's own ally rather than an opponent.

- Moves that can **only** target the ally (`adjacentAlly`, `allies`) are excluded from the Damage Matrix entirely — every such move is Status with no damage component, so there's nothing to show. (An earlier on-demand "vs ally" view for these was removed once that turned out to always read 0%.)
- Moves that hit the ally **simultaneously** with opponents in real play (`allAdjacent`, e.g. Earthquake) show that ally damage inline in the Damage Matrix itself — it isn't optional, since that's what using the move actually does.

**Ally support**:
Modifiers on a `Side` that originate from the acting Pokémon's ally rather than itself (Friend Guard, Battery, Power Spot, Steely Spirit, Helping Hand, Tailwind). The manual override for all six is one shared toggle per `TeamId`, not per `TeamSlot` — turning one on or off applies to the whole team at once, since these are conditions on the side, not a specific Pokémon. Auto mode (the default for the four static flags) still only credits whichever single slot's own `ability` actually grants it, never both team members at once.

- **Static ally support**: derived automatically from the ally's `ability` field (Friend Guard, Battery, Power Spot, Steely Spirit) — on by default when the specific ally has that ability, with a team-wide manual override toggle (Auto/On/Off).
- **Turn-dependent ally support**: Helping Hand, Tailwind — no static data source (they depend on an action taken that turn, not a fixed ability/item), so manual toggle only (team-wide), off by default.

**Field conditions**:
Weather and terrain (`@smogon/calc`'s own `Field.weather`/`.terrain`) — global to the whole battlefield, one shared value each, `None` by default. Unlike ally support, these are never scoped to a team: changing either affects both directions of the matchup (A→B and B→A) identically.

**Side conditions**:
Screens (Reflect, Light Screen, Aurora Veil), Protect, and entry hazards (Stealth Rock, Spikes) — real `@smogon/calc` `Side` state, but a distinct concept from ally support: none of these derive from any Pokémon's own `ability`, so there's no Auto mode, just plain manual toggles/counts, off/zero by default. Team-wide for the same reason as ally support (they describe a condition on the whole side, not one specific Pokémon), applying to whichever team is the _target_ in a given calculation. `protect` is a deliberate simplification of a real, single-turn, single-Pokémon action into a team-wide "what if" toggle.

Not every field/side toggle a reference damage calculator might expose is implemented: Leech Seed and Salt Cure are genuine `@smogon/calc` `Side` fields, but only affect its free-text `result.desc()` output, which this app never renders — wiring them would be a no-op. Ingrain, Curse, Binding, Charge and Aqua Ring aren't modeled by `@smogon/calc` at all (no `Side`/`Field`/`Pokemon` flag any mechanics function reads) — a toggle for them would be pure decoration with no effect on any number this app shows.

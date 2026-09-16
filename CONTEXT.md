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
- **Turn-dependent ally support**: Helping Hand, Tailwind — no static data source (they depend on an action taken that turn, not a fixed ability/item), so manual toggle only (team-wide), off by default. Tailwind also doubles the Speed number shown on each of that team's `TeamSlotCard`s — a display-only convenience in `StatPointBars`, separate from (and in addition to) the real `attackerSide.isTailwind` flag already passed into `computeDamage` for moves whose own power depends on a speed comparison (Electro Ball, Gyro Ball).

**Field conditions**:
Weather, terrain (`@smogon/calc`'s own `Field.weather`/`.terrain`) and Gravity (`Field.isGravity`) — global to the whole battlefield, one shared value each, off/`None` by default. Unlike ally support, these are never scoped to a team: changing any of them affects both directions of the matchup (A→B and B→A) identically. Gravity is a plain boolean, not Auto/On/Off like the field abilities below — it's a move effect (grounds Flying-types and Levitate/Air Balloon holders, so Ground-type moves can hit them), not derived from any Pokemon's `ability`, so there's nothing to auto-detect.

**Field abilities**:
Abilities whose effect (per `@smogon/calc`'s own mechanics, `gen789.ts`) applies to the whole field rather than one side — Ting-Lu's Vessel of Ruin, Wo-Chien's Tablets of Ruin, Chien-Pao's Sword of Ruin and Chi-Yu's Beads of Ruin (each lowers one stat — Sp. Atk/Atk/Def/Sp. Def respectively — for every Pokemon on the field except its own holder), plus Xerneas' Fairy Aura (boosts every Fairy-type move's power field-wide, whoever uses it). Modeled like a field condition (Auto/On/Off per ability, `null` = Auto, `calc/fieldAbilities.ts`), not like ally support: each reads off a single shared `Field.isX` flag, so Auto derives from whether _any_ of the 4 Pokemon across both teams has the ability — not just one team's own two, the way Friend Guard/Battery/Power Spot/Steely Spirit do (ADR-0003). A per-team override here would silently miss the case where the holder is on the opposing side.
_Avoid_: putting these on `TeamAllySupport` (per-team scope is mechanically wrong for an ability that isn't ally-only); Dark Aura and Aura Break (Yveltal/Zygarde's own field-wide abilities, the same shape as Fairy Aura) aren't implemented — not asked for yet

**Side conditions**:
Screens (Reflect, Light Screen, Aurora Veil), Protect, entry hazards (Stealth Rock, Spikes), and Intimidate — real `@smogon/calc` `Side` state for the first three groups, but a distinct concept from ally support: none of these derive from any Pokémon's own `ability`, so there's no Auto mode, just plain manual toggles/counts, off/zero by default. Team-wide for the same reason as ally support (they describe a condition on the whole side, not one specific Pokémon), applying to whichever team is the _target_ in a given calculation. `protect` is a deliberate simplification of a real, single-turn, single-Pokémon action into a team-wide "what if" toggle; `intimidate` is a similar simplification — a flat, unconditional -1 Attack stage on whichever Pokémon attacks this team, with none of real Intimidate's edge cases modeled (switch-in-only timing, Clear Body/Own Tempo/... blocking it, Contrary/Simple/Defiant reacting to it). Unlike the others, `intimidate` isn't a `@smogon/calc` `Side` flag at all — see Stat stages below for why.

Not every field/side toggle a reference damage calculator might expose is implemented: Leech Seed and Salt Cure are genuine `@smogon/calc` `Side` fields, but only affect its free-text `result.desc()` output, which this app never renders — wiring them would be a no-op. Ingrain, Curse, Binding, Charge and Aqua Ring aren't modeled by `@smogon/calc` at all (no `Side`/`Field`/`Pokemon` flag any mechanics function reads) — a toggle for them would be pure decoration with no effect on any number this app shows.

**Stat stages**:
A Pokémon's own in-battle Attack/Defense/Sp. Atk/Sp. Def/Speed boosts (Swords Dance, ...), -6..+6, 0 by default — never HP, which no stat stage ever touches. Stored per `TeamSlot` (`boosts`, `calc/format.ts`'s `StatBoosts`), not team-wide like ally support/side conditions, since it's a property of one specific Pokémon's build, same bucket as `statPoints` (reset together on a genuinely different species, carried over across a same-family forme change like a Mega Evolution). Feeds `@smogon/calc`'s own `Pokemon.boosts` directly (`toSmogonPokemon`), so it's a real input to `calculate()`, not a display-only convenience like Tailwind's Speed-doubling (`StatPointBars`' `tailwind` prop) — though `StatPointBars` shows the _combined_ effective stat (stage + Tailwind) on every `TeamSlotCard`, for the same reason the Damage Matrix shows a computed number rather than raw inputs.

Intimidate (`TeamSideConditions.intimidate`, see Side conditions above) is the one thing that adjusts a stat stage from _outside_ the attacking Pokémon's own `boosts` — `matrix.ts` computes the attacker's effective Atk stage (`boosts.atk` minus 1 if the target's team has Intimidate up, clamped) per row and passes it to `computeDamage` as `attackerBoosts`, which `toSmogonPokemon` layers on top of (not in place of) the slot's own `boosts` — the manual Atk stage a player picked is never destructively overwritten just because Intimidate is toggled on or off.
_Avoid_: mutating `TeamSlot.boosts.atk` directly when Intimidate is toggled (loses the player's own manual stage the moment Intimidate is toggled back off)

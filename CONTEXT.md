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
The core result of a matchup: the 8 attacker→target damage calculations formed by each side's 2 Pokémon attacking each of the opposing side's 2 Pokémon, computed in both directions (A→B and B→A). Excludes friendly fire.
_Avoid_: 2x2 matrix (ambiguous about whether it includes the ally)

**Friendly fire**:
Damage calculated against a Pokémon's own ally rather than an opponent, shown separately from the Damage Matrix rather than folded into it.

**Ally support**:
Modifiers on a `Side` that originate from the acting Pokémon's ally rather than itself (Friend Guard, Battery, Power Spot, Steely Spirit, Helping Hand, Tailwind).

- **Static ally support**: derived automatically from the ally's `ability` field (Friend Guard, Battery, Power Spot, Steely Spirit) — on by default when the ally has that ability, with a manual override toggle.

import { gen } from './generation';

/**
 * All moves available in this generation, sorted alphabetically —
 * excluding `(No Move)`, a synthetic entry `@smogon/calc` uses
 * internally to represent "no move selected" and not a real,
 * selectable move.
 */
export const allMoves = [...gen.moves]
	.filter((m) => m.name !== '(No Move)')
	.sort((a, b) => a.name.localeCompare(b.name));

export type MoveItem = (typeof allMoves)[number];

/** "Physical" | "Special" | "Status" — not itself exported by `@smogon/calc`. */
export type MoveCategory = NonNullable<MoveItem['category']>;

/**
 * Moves whose real target is `adjacentAlly` or `allies` — they can only
 * ever be aimed at the user's own ally, never an opponent (see
 * `CONTEXT.md`'s "Friendly fire" and ADR-0001). `@smogon/calc`'s own move
 * data only ever populates `target` with `allAdjacent`/`allAdjacentFoes`
 * (the two values its Doubles spread-damage modifier cares about, see
 * `damage.ts`'s `computeDamage`) — never `adjacentAlly` or `allies` — so
 * `MoveItem['target']` can't be used to detect these. Hand-curated instead
 * against Pokémon Showdown's own `data/moves.ts`, the upstream source
 * `@smogon/calc` draws its move data from.
 */
const ALLY_ONLY_TARGET_MOVES = new Set([
	'Aromatic Mist',
	'Coaching',
	'Dragon Cheer',
	'Helping Hand',
	'Hold Hands',
	'Howl',
	'Jungle Healing',
	'Life Dew',
	'Lunar Blessing'
]);

/**
 * True for a move that can only ever be aimed at the user's own ally —
 * never an opponent, and (unlike Acupressure's `adjacentAllyOrSelf`)
 * never the user itself either. Per ADR-0001, these moves are excluded
 * from the (future) Damage Matrix and get an on-demand friendly-fire view
 * instead.
 */
export function isAllyOnlyTarget(move: MoveItem): boolean {
	return ALLY_ONLY_TARGET_MOVES.has(move.name);
}

/**
 * True for a move with an actual damage formula — every category other
 * than Status, per `CONTEXT.md`'s Damage Matrix cell convention: a cell is
 * `—` only for a move with no direct damage component at all (base power
 * 0 and not a fixed-damage move like Seismic Toss). `@smogon/calc`'s own
 * move data gives every fixed/variable-damage move (Seismic Toss, Night
 * Shade, Dragon Rage, Sonic Boom, Super Fang, Final Gambit, Counter,
 * OHKO moves, ...) a `basePower` of 0 but a real `Physical`/`Special`
 * category — the same as every weight-/HP-based move (Low Kick, Heavy
 * Slam, ...) whose effective base power is computed elsewhere, never a
 * `Status` move — so checking category alone (rather than hand-curating a
 * move list, the way `isAllyOnlyTarget` has to) exactly separates the two,
 * confirmed in `moves.spec.ts` against every 0-base-power move this
 * generation has.
 */
export function hasDamageComponent(move: MoveItem): boolean {
	return move.category !== 'Status';
}

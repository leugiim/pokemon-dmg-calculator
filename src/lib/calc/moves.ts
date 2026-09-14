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

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

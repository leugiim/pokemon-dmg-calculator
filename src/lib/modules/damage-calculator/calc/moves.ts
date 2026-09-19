import { championsGen, gen } from '$lib/modules/shared/species/generation';

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
 * from the Damage Matrix entirely — every one of them is a Status move
 * with no damage component at all (they're purely supportive, which is
 * presumably *why* a move restricted to hitting only your own ally exists
 * in the first place), so there's no number to show for them anywhere.
 */
export function isAllyOnlyTarget(move: MoveItem): boolean {
	return ALLY_ONLY_TARGET_MOVES.has(move.name);
}

/**
 * True for a move whose real target is `allAdjacent` (Earthquake,
 * Discharge, ...) — it hits the user's own ally at the same time as both
 * opponents, unconditionally, whenever it's used. Unlike `isAllyOnlyTarget`,
 * `@smogon/calc`'s own move data does populate `target` with `allAdjacent`
 * (it's one of the two values, alongside `allAdjacentFoes`, its Doubles
 * spread-damage modifier cares about — see `damage.ts`), so this can check
 * it directly instead of hand-curating a list.
 *
 * Its ally damage is shown inline in the Damage Matrix row, unlike
 * `isAllyOnlyTarget` moves, which are excluded from the matrix entirely
 * rather than shown anywhere (ADR-0001, #12). `allAdjacentFoes` moves
 * (Rock Slide) are deliberately excluded — they never hit the ally at all.
 */
export function isAllAdjacentTarget(move: MoveItem): boolean {
	return move.target === 'allAdjacent';
}

/** The hit-count range `multiHitRange` reports for a multi-hit move. */
export interface MultiHitRange {
	min: number;
	max: number;
}

/**
 * The range of hit counts the user can manually pick between for a
 * multi-hit move, or `null` for a move that isn't multi-hit at all, or
 * whose hit count `@smogon/calc` treats as entirely fixed regardless of any
 * `hits` override passed to it (see its `Move` constructor) — Double Hit,
 * Bonemerang, Double Kick, Twineedle, Surging Strikes, ... (#15).
 *
 * A move whose own data gives `multihit` as a `[min, max]` pair (Bullet
 * Seed, Icicle Spear, ...) reports that pair directly — `@smogon/calc`
 * itself already defaults an un-overridden one of these to `min + 1` hits
 * (3, for every such move this generation), or `max` when the attacker's
 * ability is Skill Link, so no extra logic is needed here to get that
 * default right (see `computeDamage`, which just forwards this app's own
 * override, or none, straight through).
 *
 * A move whose `multihit` is a single fixed number *and* `multiaccuracy` is
 * set (Population Bomb, and this generation's Triple Kick) can still hit
 * fewer times than that in real play, since each hit can individually
 * miss — `@smogon/calc` does accept a manual `hits` override for these, so
 * they report a `1..multihit` range rather than `null`.
 */
export function multiHitRange(move: MoveItem): MultiHitRange | null {
	const { multihit, multiaccuracy } = move;
	if (multihit == null) return null;
	if (Array.isArray(multihit)) return { min: multihit[0], max: multihit[1] };
	return multiaccuracy ? { min: 1, max: multihit } : null;
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

/**
 * `championsGen`'s own base power for every move it has data for, keyed by
 * name — built once from `@smogon/calc`'s real Pokémon Champions data set,
 * not hand-curated (ADR-0005). A move `championsGen` includes but hasn't
 * had a Champions-specific balance patch on has the exact same base power
 * here as it does in `gen` (SV) — `championsGen`'s own data is SV's,
 * patched only where Champions has actually diverged — so looking this map
 * up unconditionally in `effectiveBasePower` is a safe no-op for every move
 * outside that patch.
 */
const championsBasePowerByName = new Map([...championsGen.moves].map((m) => [m.name, m.basePower]));

/**
 * A move's real, current base power: `championsGen`'s own value (Pokémon
 * Champions) when it has one, otherwise `@smogon/calc`'s SV value — falling
 * back to SV covers every move Champions doesn't have yet (its roster is
 * still a subset of SV's, see `generation.ts`'s `championsGen`), not just
 * ones with no Champions-specific patch.
 */
export function effectiveBasePower(move: MoveItem): number {
	return championsBasePowerByName.get(move.name) ?? move.basePower;
}

/** True for a move whose power scales with the user's fainted allies. */
export function scalesWithAlliesFainted(move: MoveItem): boolean {
	return move.name === 'Last Respects';
}

/**
 * `effectiveBasePower`, plus Last Respects' +50 per fainted ally —
 * `@smogon/calc` only has its flat 50 for it.
 */
export function basePowerWithAlliesFainted(move: MoveItem, alliesFainted: number): number {
	const base = effectiveBasePower(move);
	return scalesWithAlliesFainted(move) ? base + 50 * alliesFainted : base;
}

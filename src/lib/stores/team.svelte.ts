import type { SpeciesItem } from '$lib/calc/generation';
import type { HeldItem } from '$lib/calc/items';
import type { MoveItem } from '$lib/calc/moves';
import {
	emptyStatPoints,
	NEUTRAL_NATURE,
	type NatureInfo,
	type StatPoints
} from '$lib/calc/format';

/** A Pokémon's 4 move slots — any of them can be empty. */
export type MoveSlots = [MoveItem | null, MoveItem | null, MoveItem | null, MoveItem | null];

/**
 * A move slot's own Damage Matrix calculation overrides: "assume crit"
 * (#14), off by default, and a manual multi-hit hit-count override (#15) —
 * `null` means no override, falling back to `@smogon/calc`'s own default
 * (3 hits, or the attacker's ability's fixed count when it has one, e.g.
 * Skill Link — see `multiHitRange`). Kept as one object, rather than a
 * separate parallel array per field, since every reader/writer of these
 * (matrix.ts, and `species`'s reset below) always handles both together,
 * indexed by the same move slot.
 */
export interface MoveCalcOptions {
	isCrit: boolean;
	hits: number | null;
}

/** Per-move-slot Damage Matrix overrides — parallel to `MoveSlots`. */
export type MoveOptionsSlots = [MoveCalcOptions, MoveCalcOptions, MoveCalcOptions, MoveCalcOptions];

function emptyMoves(): MoveSlots {
	return [null, null, null, null];
}

function defaultMoveOptions(): MoveCalcOptions {
	return { isCrit: false, hits: null };
}

function defaultMoveOptionsSlots(): MoveOptionsSlots {
	return [defaultMoveOptions(), defaultMoveOptions(), defaultMoveOptions(), defaultMoveOptions()];
}

/**
 * A slot's manual overrides for the four ally-support flags tied to a
 * fixed ability (Friend Guard, Battery, Power Spot, Steely Spirit) — `null`
 * (the default) auto-derives from this slot's own `ability`; `true`/`false`
 * forces the flag on or off regardless of the actual ability, for testing
 * a hypothetical (ADR-0003, #13). See `allySupport.ts` for how these
 * combine with `ability` into an effective flag.
 */
export interface StaticAllySupportOverrides {
	friendGuard: boolean | null;
	battery: boolean | null;
	powerSpot: boolean | null;
	steelySpirit: boolean | null;
}

function defaultStaticAllySupportOverrides(): StaticAllySupportOverrides {
	return { friendGuard: null, battery: null, powerSpot: null, steelySpirit: null };
}

/**
 * The species' "family" root — the same for every forme of a given
 * Pokémon (Charizard, Charizard-Mega-X, and Charizard-Mega-Y all
 * resolve to `Charizard`), so switching between them can be told apart
 * from switching to a genuinely different Pokémon.
 */
function familyOf(species: SpeciesItem): string {
	return species.baseSpecies ?? species.name;
}

/**
 * Neither side is fixed as "the attacker" — damage is calculated both
 * ways (every Pokémon on team A against every Pokémon on team B, and
 * vice versa), so the two sides are just A and B.
 */
export type TeamId = 'teamA' | 'teamB';

/** A single team slot. */
export class TeamSlot {
	#species = $state<SpeciesItem | null>(null);
	item = $state<HeldItem | null>(null);
	ability = $state<string | null>(null);
	nature = $state<NatureInfo>(NEUTRAL_NATURE);
	statPoints = $state<StatPoints>(emptyStatPoints());
	moves = $state<MoveSlots>(emptyMoves());
	moveOptions = $state<MoveOptionsSlots>(defaultMoveOptionsSlots());
	/** Manual overrides for the support this slot provides its ally (ADR-0003, #13). */
	allySupportOverrides = $state<StaticAllySupportOverrides>(defaultStaticAllySupportOverrides());
	/** Manual-only ally support this slot provides its ally — no static data source (ADR-0003, #13). */
	providesHelpingHand = $state(false);
	providesTailwind = $state(false);

	get species(): SpeciesItem | null {
		return this.#species;
	}

	/**
	 * Switching to a genuinely different Pokémon voids the item, nature,
	 * stat points, moves, per-move Damage Matrix overrides (assume-crit,
	 * hit-count), and ally-support overrides chosen for the previous one.
	 * Switching formes within the same family (e.g. into or out of a Mega
	 * Evolution) only changes what its base stats (and the sprite/types
	 * derived from them) are — the rest of the build carries over.
	 *
	 * Ability is the one exception: it's voided on *any* species change,
	 * same family or not, since a different forme can have a wholly
	 * different valid ability (a Mega Evolution almost always does).
	 */
	set species(value: SpeciesItem | null) {
		if (value === this.#species) return;
		const sameFamily =
			value !== null && this.#species !== null && familyOf(value) === familyOf(this.#species);
		this.#species = value;
		this.ability = null;
		if (!sameFamily) {
			this.item = null;
			this.nature = NEUTRAL_NATURE;
			this.statPoints = emptyStatPoints();
			this.moves = emptyMoves();
			this.moveOptions = defaultMoveOptionsSlots();
			this.allySupportOverrides = defaultStaticAllySupportOverrides();
			this.providesHelpingHand = false;
			this.providesTailwind = false;
		}
	}

	/**
	 * Resets one move slot's own Damage Matrix overrides (assume-crit,
	 * hit-count) back to their defaults. Called whenever the move picked
	 * for that slot changes (see `MoveSlot.svelte`) — a crit assumption or
	 * manual hit count that made sense for the previous move would
	 * otherwise silently carry over and misrepresent an unrelated new move
	 * picked for the same slot (#14, #15).
	 */
	resetMoveOptions(index: number): void {
		this.moveOptions[index] = defaultMoveOptions();
	}
}

function createSide(): [TeamSlot, TeamSlot] {
	return [new TeamSlot(), new TeamSlot()];
}

// $state, not a plain array: TeamSlotCard binds into `teamA[i]` /
// `teamB[i]` (see +page.svelte), and Svelte's binding validator requires
// the container itself to be reactive for that — each TeamSlot's own
// fields being $state isn't enough, since a slot is never actually
// replaced wholesale, only the array's "this index is bindable" status
// is what's being checked.

/** The 2 Pokémon on team A. */
export const teamA = $state(createSide());

/** The 2 Pokémon on team B. */
export const teamB = $state(createSide());

export const sides: Record<TeamId, [TeamSlot, TeamSlot]> = { teamA, teamB };

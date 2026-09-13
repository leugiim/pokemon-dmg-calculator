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

function emptyMoves(): MoveSlots {
	return [null, null, null, null];
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
export type Side = 'teamA' | 'teamB';

/**
 * A single team slot. Ability is still missing — will be added once
 * the rest of the calculation side of the app needs it.
 */
export class TeamSlot {
	#species = $state<SpeciesItem | null>(null);
	item = $state<HeldItem | null>(null);
	nature = $state<NatureInfo>(NEUTRAL_NATURE);
	statPoints = $state<StatPoints>(emptyStatPoints());
	moves = $state<MoveSlots>(emptyMoves());

	get species(): SpeciesItem | null {
		return this.#species;
	}

	/**
	 * Switching to a genuinely different Pokémon voids the item, nature,
	 * stat points, and moves chosen for the previous one. Switching
	 * formes within the same family (e.g. into or out of a Mega
	 * Evolution) only changes what its base stats (and the sprite/types
	 * derived from them) are — the rest of the build carries over.
	 */
	set species(value: SpeciesItem | null) {
		if (value === this.#species) return;
		const sameFamily =
			value !== null && this.#species !== null && familyOf(value) === familyOf(this.#species);
		this.#species = value;
		if (!sameFamily) {
			this.item = null;
			this.nature = NEUTRAL_NATURE;
			this.statPoints = emptyStatPoints();
			this.moves = emptyMoves();
		}
	}
}

function createSide(): [TeamSlot, TeamSlot] {
	return [new TeamSlot(), new TeamSlot()];
}

/** The 2 Pokémon on team A. */
export const teamA = createSide();

/** The 2 Pokémon on team B. */
export const teamB = createSide();

export const sides: Record<Side, [TeamSlot, TeamSlot]> = { teamA, teamB };

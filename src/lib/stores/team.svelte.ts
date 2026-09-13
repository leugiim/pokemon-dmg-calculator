import type { SpeciesItem } from '$lib/calc/generation';
import type { HeldItem } from '$lib/calc/items';
import {
	emptyStatPoints,
	NEUTRAL_NATURE,
	type NatureInfo,
	type StatPoints
} from '$lib/calc/format';

/**
 * Neither side is fixed as "the attacker" — damage is calculated both
 * ways (every Pokémon on team A against every Pokémon on team B, and
 * vice versa), so the two sides are just A and B.
 */
export type Side = 'teamA' | 'teamB';

/**
 * A single team slot. Ability and moves are still missing — will be
 * added once the rest of the calculation side of the app needs them.
 */
export class TeamSlot {
	#species = $state<SpeciesItem | null>(null);
	item = $state<HeldItem | null>(null);
	nature = $state<NatureInfo>(NEUTRAL_NATURE);
	statPoints = $state<StatPoints>(emptyStatPoints());

	get species(): SpeciesItem | null {
		return this.#species;
	}

	/** Switching species voids the item, nature, and stat points chosen for the previous one. */
	set species(value: SpeciesItem | null) {
		if (value === this.#species) return;
		this.#species = value;
		this.item = null;
		this.nature = NEUTRAL_NATURE;
		this.statPoints = emptyStatPoints();
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

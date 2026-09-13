import type { SpeciesItem } from '$lib/calc/generation';

export type Side = 'attackers' | 'defenders';

/**
 * A single team slot. Only species selection for now — level, item,
 * ability, moves, EVs/IVs, etc. will be added once the calculation side
 * of the app needs them.
 */
export class TeamSlot {
	species = $state<SpeciesItem | null>(null);
}

function createSide(): [TeamSlot, TeamSlot] {
	return [new TeamSlot(), new TeamSlot()];
}

/** The 2 Pokémon on the attacking side. */
export const attackers = createSide();

/** The 2 Pokémon on the defending side. */
export const defenders = createSide();

export const sides: Record<Side, [TeamSlot, TeamSlot]> = { attackers, defenders };

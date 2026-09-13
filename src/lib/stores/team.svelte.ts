import type { SpeciesItem } from '$lib/calc/generation';

/**
 * Neither side is fixed as "the attacker" — damage is calculated both
 * ways (every Pokémon on team A against every Pokémon on team B, and
 * vice versa), so the two sides are just A and B.
 */
export type Side = 'teamA' | 'teamB';

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

/** The 2 Pokémon on team A. */
export const teamA = createSide();

/** The 2 Pokémon on team B. */
export const teamB = createSide();

export const sides: Record<Side, [TeamSlot, TeamSlot]> = { teamA, teamB };

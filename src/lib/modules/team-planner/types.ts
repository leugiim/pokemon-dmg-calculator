import type { PokemonSetData } from '$lib/modules/shared';

export interface Team {
	id: string;
	name: string;
	/** The pasted text the team was created from. */
	paste: string;
	pokemon: PokemonSetData[];
	createdAt: number;
}

export type MatchResult = 'win' | 'loss' | 'ongoing';

/**
 * One recorded game. Pokémon are referenced by `nickname || species` name,
 * as in the standalone planner this came from.
 */
export interface Match {
	id: string;
	teamId: string;
	date: number;
	result: MatchResult;
	/** The 6 names the team had when the match was played, frozen. */
	teamRoster: string[];
	/** 4 names brought to the match. */
	selection: string[];
	/** 2 names that start on the field. */
	lead: string[];
	/** Up to 6 rival names. Enough on its own for the stats. */
	rivalTeam: string[];
	rivalSelection: string[];
	rivalLead: string[];
	/** Full rival sets, when known. Optional: the quick "names only" mode stays. */
	rivalSets?: PokemonSetData[];
	/** The pasted text `rivalSets` came from. */
	rivalPaste?: string;
	notes: string;
}

/** Name a Pokémon goes by in matches and stats. */
export function displayName(set: PokemonSetData): string {
	return set.nickname || set.species;
}

import type { CalcHandoff, PokemonSetData } from '$lib/modules/shared';
import { displayName, type Team } from './types';

/** A handoff with just the six of `team`, for opening the calculator on its own and saving changes back. */
export function buildTeamHandoff(team: Team, createdAt = Date.now()): CalcHandoff {
	return {
		createdAt,
		purpose: 'team',
		teamId: team.id,
		teamName: team.name,
		own: team.pokemon.map((set) => ({ name: displayName(set), set })),
		ownLead: [],
		rival: [],
		rivalLead: []
	};
}

/**
 * A handoff to build a new team in the calculator: empty, or starting from
 * `sets` (e.g. what was already pasted in the new team form).
 */
export function buildNewTeamHandoff(
	sets: PokemonSetData[] = [],
	name = '',
	createdAt = Date.now()
): CalcHandoff {
	return {
		createdAt,
		purpose: 'new-team',
		teamName: name.trim() || undefined,
		own: sets.map((set) => ({ name: displayName(set), set })),
		ownLead: [],
		rival: [],
		rivalLead: []
	};
}

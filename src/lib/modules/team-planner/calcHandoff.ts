import type { CalcHandoff } from '$lib/modules/shared';
import { displayName, type Team } from './types';

/** A handoff with just the six of `team`, for opening the calculator on its own. */
export function buildTeamHandoff(team: Team, createdAt = Date.now()): CalcHandoff {
	return {
		createdAt,
		purpose: 'team',
		teamName: team.name,
		own: team.pokemon.map((set) => ({ name: displayName(set), set })),
		ownLead: [],
		rival: [],
		rivalLead: []
	};
}

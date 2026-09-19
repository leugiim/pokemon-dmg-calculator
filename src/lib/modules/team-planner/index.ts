// Public API of the team-planner module.
export {
	legacyMatchToMatch,
	legacySetToData,
	legacyTeamToTeam,
	type LegacyMatch,
	type LegacyPokemonSet,
	type LegacyTeam
} from './legacy';
export {
	deleteMatch,
	deleteTeam,
	getMatch,
	getMatchesByTeam,
	getTeams,
	saveMatch,
	saveTeam
} from './storage';
export { planner } from './teams.svelte';
export { displayName, type Match, type MatchResult, type Team } from './types';

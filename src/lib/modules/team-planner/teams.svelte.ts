import { exportTeamPaste, generateId, type PokemonSetData } from '$lib/modules/shared';
import {
	deleteMatch,
	deleteTeam,
	getMatchesByTeam,
	getTeams,
	saveMatch,
	saveTeam
} from './storage';
import { displayName, type Match, type Team } from './types';

/**
 * Reactive view over the planner's localStorage data. Nothing is read at
 * import time (prerendering has no `localStorage`): a page calls `load()`
 * once in the browser, and `loadMatches(teamId)` for the team it shows.
 */
class PlannerStore {
	teams = $state<Team[]>([]);
	/** Matches by team id, newest first. Only teams already loaded are present. */
	matches = $state<Record<string, Match[]>>({});
	loaded = $state(false);

	load(): void {
		this.teams = getTeams();
		this.loaded = true;
	}

	loadMatches(teamId: string): Match[] {
		const matches = getMatchesByTeam(teamId).sort((a, b) => b.date - a.date);
		this.matches[teamId] = matches;
		return matches;
	}

	saveTeam(team: Team): void {
		saveTeam(team);
		this.teams = getTeams();
	}

	/**
	 * A new team from these sets (its paste is written from them). Without a
	 * name, it's named after its Pokémon.
	 */
	createTeam(sets: PokemonSetData[], name = ''): Team {
		const team: Team = {
			id: generateId(),
			name: name.trim() || sets.map(displayName).join(' / '),
			paste: exportTeamPaste(sets),
			pokemon: sets,
			createdAt: Date.now()
		};
		this.saveTeam(team);
		return team;
	}

	/**
	 * Replaces the Pokémon of an existing team, keeping its name, id and
	 * creation date, and rewrites its paste. `null` if the team is gone.
	 */
	updateTeamSets(id: string, sets: PokemonSetData[]): Team | null {
		const existing = getTeams().find((t) => t.id === id);
		if (!existing) return null;
		const team: Team = { ...existing, paste: exportTeamPaste(sets), pokemon: sets };
		this.saveTeam(team);
		return team;
	}

	deleteTeam(id: string): void {
		deleteTeam(id);
		delete this.matches[id];
		this.teams = getTeams();
	}

	saveMatch(match: Match): void {
		saveMatch(match);
		this.loadMatches(match.teamId);
	}

	deleteMatch(id: string, teamId: string): void {
		deleteMatch(id, teamId);
		this.loadMatches(teamId);
	}
}

export const planner = new PlannerStore();

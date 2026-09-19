import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { planner, type Match, type Team } from '$lib/modules/team-planner';
import { installMemoryStorage } from './memoryStorage';

beforeEach(() => {
	installMemoryStorage();
	planner.teams = [];
	planner.matches = {};
	planner.loaded = false;
});
afterEach(() => vi.unstubAllGlobals());

const team: Team = { id: 't1', name: 'Team', paste: '', pokemon: [], createdAt: 1 };
const match = (id: string, date: number): Match => ({
	id,
	teamId: 't1',
	date,
	result: 'win',
	teamRoster: [],
	selection: [],
	lead: [],
	rivalTeam: [],
	rivalSelection: [],
	rivalLead: [],
	notes: ''
});

describe('planner store', () => {
	it('reads nothing until load() is called', () => {
		expect(planner.loaded).toBe(false);
		expect(planner.teams).toEqual([]);
	});

	it('saves and lists teams', () => {
		planner.saveTeam(team);
		expect(planner.teams.map((t) => t.id)).toEqual(['t1']);
		planner.teams = [];
		planner.load();
		expect(planner.loaded).toBe(true);
		expect(planner.teams.map((t) => t.id)).toEqual(['t1']);
	});

	it('keeps the matches of a team sorted newest first', () => {
		planner.saveMatch(match('old', 1));
		planner.saveMatch(match('new', 9));
		expect(planner.matches.t1.map((m) => m.id)).toEqual(['new', 'old']);
		planner.deleteMatch('new', 't1');
		expect(planner.matches.t1.map((m) => m.id)).toEqual(['old']);
	});

	it('forgets the matches of a deleted team', () => {
		planner.saveTeam(team);
		planner.saveMatch(match('a', 1));
		planner.deleteTeam('t1');
		expect(planner.teams).toEqual([]);
		expect(planner.matches.t1).toBeUndefined();
	});
});

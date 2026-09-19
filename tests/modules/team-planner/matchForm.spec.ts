import { describe, expect, it } from 'vitest';
import {
	padRivalSlots,
	syncRivalPicks,
	toggleLead,
	toggleSelection,
	validateMatch
} from '$lib/modules/team-planner';

describe('toggleSelection', () => {
	it('adds up to 4 and ignores the fifth', () => {
		let state = { selection: [] as string[], lead: [] as string[] };
		for (const n of ['A', 'B', 'C', 'D', 'E']) state = toggleSelection(state, n);
		expect(state.selection).toEqual(['A', 'B', 'C', 'D']);
	});

	it('removes a Pokémon from the lead when it leaves the selection', () => {
		const state = toggleSelection({ selection: ['A', 'B', 'C', 'D'], lead: ['A', 'B'] }, 'A');
		expect(state).toEqual({ selection: ['B', 'C', 'D'], lead: ['B'] });
	});
});

describe('toggleLead', () => {
	it('adds up to 2 and toggles off', () => {
		expect(toggleLead([], 'A')).toEqual(['A']);
		expect(toggleLead(['A', 'B'], 'C')).toEqual(['A', 'B']);
		expect(toggleLead(['A', 'B'], 'A')).toEqual(['B']);
	});
});

describe('padRivalSlots', () => {
	it('pads to 6 and truncates beyond that', () => {
		expect(padRivalSlots(['A'])).toEqual(['A', '', '', '', '', '']);
		expect(padRivalSlots(['1', '2', '3', '4', '5', '6', '7'])).toHaveLength(6);
	});
});

describe('syncRivalPicks', () => {
	it('drops picks that are no longer in the rival team, keeping the rest', () => {
		const picks = { selection: ['A', 'B', 'C'], lead: ['A', 'B'] };
		expect(syncRivalPicks(['A', ' B ', '', 'X'], picks)).toEqual({
			selection: ['A', 'B'],
			lead: ['A', 'B']
		});
		expect(syncRivalPicks(['B'], picks)).toEqual({ selection: ['B'], lead: ['B'] });
	});
});

describe('validateMatch', () => {
	const ok = { result: 'win' as const, selection: ['A', 'B', 'C', 'D'], lead: ['A', 'B'] };

	it('accepts a complete match', () => {
		expect(validateMatch(ok)).toBeNull();
		expect(validateMatch({ ...ok, result: 'ongoing' })).toBeNull();
	});

	it('reports the first problem', () => {
		expect(validateMatch({ ...ok, result: '' })).toMatch(/result/i);
		expect(validateMatch({ ...ok, selection: ['A'] })).toMatch(/4/);
		expect(validateMatch({ ...ok, lead: ['A'] })).toMatch(/lead/i);
	});
});

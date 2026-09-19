import { describe, expect, it } from 'vitest';
import { buildTeamHandoff, type Team } from '$lib/modules/team-planner';

const pokemon = (species: string, nickname?: string) => ({
	species,
	...(nickname ? { nickname } : {}),
	statPoints: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
	moves: ['Protect']
});

const team: Team = {
	id: 't1',
	name: 'My team',
	paste: '',
	pokemon: [pokemon('Charizard'), pokemon('Rotom-Wash', 'Sparky'), pokemon('Garchomp')],
	createdAt: 1
};

describe('buildTeamHandoff', () => {
	const handoff = buildTeamHandoff(team, 123);

	it('carries every Pokémon of the team, named as the planner names them, with its set', () => {
		expect(handoff.own.map((m) => m.name)).toEqual(['Charizard', 'Sparky', 'Garchomp']);
		expect(handoff.own[1].set).toEqual(team.pokemon[1]);
	});

	it('is a team handoff: no rival, no leads', () => {
		expect(handoff).toMatchObject({
			purpose: 'team',
			teamName: 'My team',
			createdAt: 123,
			ownLead: [],
			rival: [],
			rivalLead: []
		});
	});
});

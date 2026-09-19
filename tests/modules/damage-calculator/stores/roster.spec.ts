import { describe, expect, it } from 'vitest';
import { commonSetData } from '$lib/modules/damage-calculator';
import {
	isBareSet,
	membersFromHandoff,
	TeamRoster,
	type RosterMember
} from '$lib/modules/damage-calculator/stores/roster.svelte';
import { TeamSlot } from '$lib/modules/damage-calculator/stores/team.svelte';
import type { PokemonSetData } from '$lib/modules/shared';

const set = (species: string, over: Partial<PokemonSetData> = {}): PokemonSetData => ({
	species,
	statPoints: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
	moves: [],
	...over
});

const SIX = ['Garchomp', 'Incineroar', 'Rillaboom', 'Rotom-Wash', 'Charizard', 'Kingambit'];

function members(over: Record<string, Partial<PokemonSetData>> = {}): RosterMember[] {
	return SIX.map((species) => ({
		name: species,
		data: set(species, over[species]),
		source: 'saved' as const
	}));
}

function setup() {
	const slots: [TeamSlot, TeamSlot] = [new TeamSlot(), new TeamSlot()];
	return { slots, roster: new TeamRoster(slots) };
}

const speciesOf = (slot: TeamSlot) => slot.species?.name ?? null;

describe('TeamRoster.load', () => {
	it('keeps the whole team and puts the first two on the field by default', () => {
		const { slots, roster } = setup();
		roster.load(members());
		expect(roster.members).toHaveLength(6);
		expect(roster.active).toEqual([0, 1]);
		expect(slots.map(speciesOf)).toEqual(['Garchomp', 'Incineroar']);
	});

	it('puts the named lead on the field, case-insensitively, in the order given', () => {
		const { slots, roster } = setup();
		roster.load(members(), ['kingambit', 'Rotom-Wash']);
		expect(roster.active).toEqual([5, 3]);
		expect(slots.map(speciesOf)).toEqual(['Kingambit', 'Rotom-Wash']);
	});

	it('fills a missing lead spot with the next member', () => {
		const { slots, roster } = setup();
		roster.load(members(), ['Rillaboom', 'Not There']);
		expect(roster.active).toEqual([2, 0]);
		expect(slots.map(speciesOf)).toEqual(['Rillaboom', 'Garchomp']);
	});

	it('handles fewer than two members', () => {
		const { slots, roster } = setup();
		roster.load(members().slice(0, 1));
		expect(roster.active).toEqual([0, null]);
		expect(speciesOf(slots[0])).toBe('Garchomp');
		expect(slots[1].species).toBeNull();
	});

	it('hydrates the slots with the members builds', () => {
		const { slots, roster } = setup();
		roster.load(
			members({ Garchomp: { item: 'Choice Scarf', moves: ['Earthquake'], nature: 'Jolly' } })
		);
		expect(slots[0].item?.name).toBe('Choice Scarf');
		expect(slots[0].nature.name).toBe('Jolly');
		expect(slots[0].moves[0]?.name).toBe('Earthquake');
	});
});

describe('TeamRoster.activate', () => {
	it('brings a bench member into a slot', () => {
		const { slots, roster } = setup();
		roster.load(members());
		roster.activate(1, 4);
		expect(roster.active).toEqual([0, 4]);
		expect(slots.map(speciesOf)).toEqual(['Garchomp', 'Charizard']);
	});

	it('swaps the slots when the member is already on the field in the other one', () => {
		const { slots, roster } = setup();
		roster.load(members());
		roster.activate(0, 1);
		expect(roster.active).toEqual([1, 0]);
		expect(slots.map(speciesOf)).toEqual(['Incineroar', 'Garchomp']);
	});

	it('does nothing for the member already in that slot or an unknown one', () => {
		const { slots, roster } = setup();
		roster.load(members());
		slots[0].boosts.atk = 2;
		roster.activate(0, 0);
		roster.activate(0, 99);
		expect(roster.active).toEqual([0, 1]);
		expect(slots[0].boosts.atk).toBe(2);
	});

	it('leaves the other slot untouched, stat stages included', () => {
		const { slots, roster } = setup();
		roster.load(members());
		slots[0].boosts.atk = 3;
		roster.activate(1, 4);
		expect(slots[0].boosts.atk).toBe(3);
	});

	it('keeps edits made to a slot when it goes to the bench and comes back', () => {
		const { slots, roster } = setup();
		roster.load(members());
		slots[1].statPoints = { hp: 32, atk: 0, def: 0, spa: 0, spd: 0, spe: 2 };
		roster.activate(1, 4);
		roster.activate(1, 1);
		expect(slots[1].statPoints).toEqual({ hp: 32, atk: 0, def: 0, spa: 0, spd: 0, spe: 2 });
	});

	it('resets in-battle stat stages of a member that comes back', () => {
		const { slots, roster } = setup();
		roster.load(members());
		slots[1].boosts.atk = 4;
		roster.activate(1, 4);
		roster.activate(1, 1);
		expect(slots[1].boosts.atk).toBe(0);
	});
});

describe('TeamRoster.toData', () => {
	it('includes the edits of the active slots, in roster order', () => {
		const { slots, roster } = setup();
		roster.load(members());
		slots[0].item = null;
		slots[0].statPoints = { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 };
		const data = roster.toData();
		expect(data.map((d) => d.species)).toEqual(SIX);
		expect(data[0].statPoints).toMatchObject({ atk: 32, spe: 32 });
	});

	it('keeps the nickname while the species is unchanged, and drops it otherwise', () => {
		const { slots, roster } = setup();
		roster.load([
			{ name: 'Sparky', data: set('Rotom-Wash', { nickname: 'Sparky' }), source: 'saved' },
			{ name: 'Chompy', data: set('Garchomp', { nickname: 'Chompy' }), source: 'saved' }
		]);
		expect(roster.toData()[0].nickname).toBe('Sparky');
		slots[1].species = slots[0].species;
		expect(roster.toData()[1].nickname).toBeUndefined();
	});

	it('keeps a member whose slot was emptied', () => {
		const { slots, roster } = setup();
		roster.load(members());
		slots[0].species = null;
		expect(roster.toData()[0].species).toBe('Garchomp');
	});

	it('is empty after clear()', () => {
		const { roster } = setup();
		roster.load(members());
		roster.clear();
		expect(roster.toData()).toEqual([]);
		expect(roster.active).toEqual([null, null]);
	});
});

describe('membersFromHandoff', () => {
	it('uses a given set as is', () => {
		const given = set('Incineroar', { item: 'Safety Goggles' });
		expect(membersFromHandoff([{ name: 'Incineroar', set: given }])).toEqual([
			{ name: 'Incineroar', data: given, source: 'saved' }
		]);
	});

	it('falls back to the first common set, then to the bare name', () => {
		const common = commonSetData('Incineroar');
		// The vendored set data is what this relies on.
		expect(common).not.toBeNull();
		const [a, b] = membersFromHandoff([{ name: 'Incineroar' }, { name: 'Made Up Mon' }]);
		expect(a).toEqual({ name: 'Incineroar', data: common, source: 'common' });
		expect(b.source).toBe('none');
		expect(b.data.species).toBe('Made Up Mon');
		expect(isBareSet(b.data)).toBe(true);
	});

	it('hydrates a bare name that is a real species even without common sets', () => {
		const { slots, roster } = setup();
		roster.load(membersFromHandoff([{ name: 'Made Up Mon' }, { name: 'Garchomp' }]));
		expect(slots[0].species).toBeNull();
		expect(speciesOf(slots[1])).toBe('Garchomp');
	});
});

describe('commonSetData', () => {
	it('gives a complete build for a species that has common sets', () => {
		const data = commonSetData('Incineroar')!;
		expect(data.species).toBe('Incineroar');
		expect(data.moves.length).toBeGreaterThan(0);
		expect(isBareSet(data)).toBe(false);
	});

	it('is null for unknown species', () => {
		expect(commonSetData('Made Up Mon')).toBeNull();
	});
});

describe('isBareSet', () => {
	it('is true only with nothing but a species', () => {
		expect(isBareSet(set('Garchomp'))).toBe(true);
		expect(isBareSet(set('Garchomp', { item: 'Choice Scarf' }))).toBe(false);
		expect(
			isBareSet(set('Garchomp', { statPoints: { hp: 1, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 } }))
		).toBe(false);
	});
});

import { describe, expect, it } from 'vitest';
import { allNatures } from '$lib/modules/damage-calculator/calc/format';
import { allSpecies } from '$lib/modules/damage-calculator/calc/generation';
import { applySetData, slotToData } from '$lib/modules/damage-calculator/calc/setData';
import { TeamSlot } from '$lib/modules/damage-calculator/stores/team.svelte';
import { parseTeamPaste, type PokemonSetData } from '$lib/modules/shared';

const set = (over: Partial<PokemonSetData> = {}): PokemonSetData => ({
	species: 'Garchomp',
	item: 'Choice Scarf',
	ability: 'Rough Skin',
	nature: 'Jolly',
	statPoints: { hp: 2, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 },
	moves: ['Earthquake', 'Dragon Claw'],
	...over
});

describe('TeamSlot.fromData / toData', () => {
	it('round-trips a full set', () => {
		expect(TeamSlot.fromData(set()).toData()).toEqual(set());
	});

	it('fills the slot with real calculator data', () => {
		const slot = TeamSlot.fromData(set());
		expect(slot.species?.name).toBe('Garchomp');
		expect(slot.item?.name).toBe('Choice Scarf');
		expect(slot.ability).toBe('Rough Skin');
		expect(slot.nature.name).toBe('Jolly');
		expect(slot.statPoints).toEqual({ hp: 2, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 });
		expect(slot.moves.map((m) => m?.name ?? null)).toEqual([
			'Earthquake',
			'Dragon Claw',
			null,
			null
		]);
	});

	it('omits what was never set', () => {
		const bare = set({ item: undefined, ability: undefined, nature: undefined, moves: [] });
		expect(TeamSlot.fromData(bare).toData()).toEqual({
			species: 'Garchomp',
			statPoints: bare.statPoints,
			moves: []
		});
	});

	it('gives null for an empty slot', () => {
		expect(new TeamSlot().toData()).toBeNull();
		expect(slotToData(new TeamSlot())).toBeNull();
	});

	it('matches names case-insensitively', () => {
		const slot = TeamSlot.fromData(set({ species: 'garchomp', item: 'choice scarf' }));
		expect(slot.species?.name).toBe('Garchomp');
		expect(slot.item?.name).toBe('Choice Scarf');
	});

	it('does not keep a nickname (a slot has none)', () => {
		expect(TeamSlot.fromData(set({ nickname: 'Chompy' })).toData()).not.toHaveProperty('nickname');
	});

	it('clamps Stat Points into 0-32', () => {
		const slot = TeamSlot.fromData(
			set({ statPoints: { hp: 252, atk: -3, def: 1.6, spa: 0, spd: 0, spe: 0 } })
		);
		expect(slot.statPoints).toMatchObject({ hp: 32, atk: 0, def: 2 });
	});
});

describe('applySetData', () => {
	it('reports names it cannot match and skips them', () => {
		const slot = new TeamSlot();
		const issues = applySetData(
			slot,
			set({ item: 'Nope Berry', nature: 'Grumpy', moves: ['Earthquake', 'Not A Move'] })
		);
		expect(issues).toEqual(['item: "Nope Berry"', 'nature: "Grumpy"', 'move: "Not A Move"']);
		expect(slot.species?.name).toBe('Garchomp');
		expect(slot.item).toBeNull();
		expect(slot.nature.name).toBe('Hardy');
		expect(slot.moves.map((m) => m?.name ?? null)).toEqual(['Earthquake', null, null, null]);
	});

	it('leaves the slot empty for an unknown species', () => {
		const slot = TeamSlot.fromData(set());
		expect(applySetData(slot, set({ species: 'Missingno' }))).toEqual(['species: "Missingno"']);
		expect(slot.species).toBeNull();
		expect(slot.toData()).toBeNull();
	});

	it('overwrites the previous build, stat stages included', () => {
		const slot = TeamSlot.fromData(set());
		slot.boosts.atk = 3;
		applySetData(slot, set({ item: undefined, moves: ['Protect'] }));
		expect(slot.item).toBeNull();
		expect(slot.boosts.atk).toBe(0);
		expect(slot.moves.map((m) => m?.name ?? null)).toEqual(['Protect', null, null, null]);
	});

	it('keeps the build when only the forme changes within a family', () => {
		const slot = TeamSlot.fromData(set({ species: 'Charizard', item: 'Charizardite Y' }));
		applySetData(slot, set({ species: 'Charizard-Mega-Y', item: 'Charizardite Y' }));
		expect(slot.species?.name).toBe('Charizard-Mega-Y');
		expect(slot.item?.name).toBe('Charizardite Y');
	});
});

describe('planner paste -> calculator', () => {
	const PASTE = `Sparky (Rotom-Wash) @ Sitrus Berry
Ability: Levitate
EVs: 32 HP / 4 Def / 32 SpD
Calm Nature
- Hydro Pump
- Volt Switch
- Will-O-Wisp
- Protect

Froslass-Mega @ Froslassite
Ability: Snow Warning
EVs: 32 SpA / 32 Spe
Timid Nature
- Blizzard
- Shadow Ball
- Icy Wind
- Protect`;

	it('hydrates a parsed team paste with no unresolved names', () => {
		for (const data of parseTeamPaste(PASTE)) {
			const slot = new TeamSlot();
			expect(applySetData(slot, data)).toEqual([]);
			expect(slot.species).not.toBeNull();
			expect(slot.moves.filter(Boolean)).toHaveLength(4);
		}
	});

	it('knows every nature the parser can produce', () => {
		expect(allNatures.map((n) => n.name)).toContain('Calm');
		expect(allSpecies.some((s) => s.name === 'Froslass-Mega')).toBe(true);
	});
});

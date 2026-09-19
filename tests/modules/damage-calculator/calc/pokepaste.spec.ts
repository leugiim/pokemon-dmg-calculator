import { describe, expect, it } from 'vitest';
import { allSpecies } from '$lib/modules/damage-calculator/calc/generation';
import { allMoves } from '$lib/modules/damage-calculator/calc/moves';
import { allItems } from '$lib/modules/damage-calculator/calc/items';
import { allNatures, type NatureName } from '$lib/modules/damage-calculator/calc/format';
import { TeamSlot } from '$lib/modules/damage-calculator/stores/team.svelte';
import { exportPokePaste, importPokePaste } from '$lib/modules/damage-calculator/calc/pokepaste';

function species(name: string) {
	return allSpecies.find((s) => s.name === name)!;
}

function move(name: string) {
	return allMoves.find((m) => m.name === name)!;
}

function item(name: string) {
	return allItems.find((i) => i.name === name)!;
}

function nature(name: NatureName) {
	return allNatures.find((n) => n.name === name)!;
}

describe('exportPokePaste', () => {
	it('throws when the slot has no species selected', () => {
		expect(() => exportPokePaste(new TeamSlot())).toThrow();
	});

	it('renders a known build as the exact Showdown/PokePaste export text', () => {
		const slot = new TeamSlot();
		slot.species = species('Garchomp');
		slot.item = item('Life Orb');
		slot.ability = 'Rough Skin';
		slot.nature = nature('Jolly');
		// Stat Points go straight into the EVs line as-is (0-32) — not
		// converted to a real-game 0-252 EV (see exportPokePaste's own
		// doc comment for why).
		slot.statPoints = { hp: 0, atk: 20, def: 0, spa: 0, spd: 0, spe: 32 };
		slot.moves = [move('Earthquake'), move('Dragon Claw'), null, null];

		expect(exportPokePaste(slot)).toBe(
			[
				'Garchomp @ Life Orb  ',
				'Ability: Rough Skin  ',
				'Level: 50  ',
				'EVs: 20 Atk / 32 Spe  ',
				'Jolly Nature  ',
				'- Earthquake  ',
				'- Dragon Claw'
			].join('\n')
		);
	});

	it('omits empty move slots rather than exporting a blank move line', () => {
		const slot = new TeamSlot();
		slot.species = species('Garchomp');
		slot.moves = [move('Earthquake'), null, null, null];

		const moveLines = exportPokePaste(slot)
			.split('\n')
			.filter((line) => line.startsWith('- '));

		// The trailing "  " (Showdown's markdown soft-break) is only ever
		// absent on the very last line, stripped by exportPokePaste's own
		// trim() of the whole text — irrelevant to what this test checks.
		expect(moveLines).toEqual(['- Earthquake']);
	});

	it('omits the item/ability/EVs lines entirely when unset', () => {
		const slot = new TeamSlot();
		slot.species = species('Garchomp');

		const text = exportPokePaste(slot);

		expect(text).not.toContain(' @ ');
		expect(text).not.toContain('Ability:');
		expect(text).not.toContain('EVs:');
		// A neutral nature (plus === minus) still names a real Nature —
		// Showdown/PokePaste has no "no nature" concept to fall back to.
		expect(text).toContain('Hardy Nature');
	});
});

describe('importPokePaste', () => {
	it('throws when the pasted text has no species line at all', () => {
		expect(() => importPokePaste(new TeamSlot(), '- Earthquake')).toThrow();
	});

	it('throws when the species is not one this app recognizes', () => {
		expect(() => importPokePaste(new TeamSlot(), 'Not A Real Species')).toThrow();
	});

	it('round-trips a full build through exportPokePaste and back', () => {
		const original = new TeamSlot();
		original.species = species('Garchomp');
		original.item = item('Life Orb');
		original.ability = 'Rough Skin';
		original.nature = nature('Jolly');
		original.statPoints = { hp: 0, atk: 20, def: 0, spa: 0, spd: 0, spe: 32 };
		original.moves = [move('Earthquake'), move('Dragon Claw'), null, null];

		const imported = new TeamSlot();
		importPokePaste(imported, exportPokePaste(original));

		expect(imported.species).toBe(original.species);
		expect(imported.item).toBe(original.item);
		expect(imported.ability).toBe(original.ability);
		expect(imported.nature).toBe(original.nature);
		expect(imported.statPoints).toEqual(original.statPoints);
		expect(imported.moves).toEqual(original.moves);
	});

	it('resets stat stages to 0 — a set has no concept of them', () => {
		const slot = new TeamSlot();
		slot.species = species('Garchomp');
		slot.boosts.atk = 4;

		importPokePaste(slot, 'Incineroar @ Sitrus Berry\nAbility: Intimidate\n- Fake Out');

		expect(slot.boosts.atk).toBe(0);
	});

	it('drops an unrecognized item/ability/move rather than failing the whole import', () => {
		const slot = new TeamSlot();

		importPokePaste(
			slot,
			[
				'Garchomp @ Not A Real Item',
				'Ability: Not A Real Ability',
				'- Earthquake',
				'- Not A Real Move'
			].join('\n')
		);

		expect(slot.species).toBe(species('Garchomp'));
		expect(slot.item).toBeNull();
		// `ability` has no this-app validity check (see pokepaste.ts) — it's
		// carried over as free text same as anywhere else a slot's ability
		// is set directly.
		expect(slot.ability).toBe('Not A Real Ability');
		expect(slot.moves).toEqual([move('Earthquake'), null, null, null]);
	});

	it('clamps an EV value above this app’s 0-32 Stat Point range rather than accepting it as-is', () => {
		const slot = new TeamSlot();

		importPokePaste(slot, 'Garchomp\nEVs: 252 Atk\n- Earthquake');

		expect(slot.statPoints.atk).toBe(32);
	});
});

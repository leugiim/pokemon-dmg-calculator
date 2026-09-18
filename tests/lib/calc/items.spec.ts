import { describe, expect, it } from 'vitest';
import { allSpecies } from '$lib/calc/generation';
import { allItems, megaFormFor, megaStoneFor } from '$lib/calc/items';

function species(name: string) {
	const s = allSpecies.find((s) => s.name === name);
	if (!s) throw new Error(`unknown species in test data: ${name}`);
	return s;
}

describe('megaStoneFor', () => {
	it("finds a Mega Evolution's own Mega Stone", () => {
		expect(megaStoneFor(species('Garchomp-Mega'))?.name).toBe('Garchompite');
	});

	it('finds the right stone for a species with more than one Mega (Charizard X vs. Y)', () => {
		expect(megaStoneFor(species('Charizard-Mega-X'))?.name).toBe('Charizardite X');
		expect(megaStoneFor(species('Charizard-Mega-Y'))?.name).toBe('Charizardite Y');
	});

	it('is null for a non-Mega species', () => {
		expect(megaStoneFor(species('Garchomp'))).toBeNull();
	});

	it('is null for a species with a baseSpecies that is not a Mega Evolution (a regional forme)', () => {
		expect(megaStoneFor(species('Meowth-Galar'))).toBeNull();
	});
});

function item(name: string) {
	const i = allItems.find((i) => i.name === name);
	if (!i) throw new Error(`unknown item in test data: ${name}`);
	return i;
}

describe('megaFormFor', () => {
	it('maps a Mega Stone to the Mega form of its own species', () => {
		expect(megaFormFor(item('Garchompite'), species('Garchomp'))?.name).toBe('Garchomp-Mega');
	});

	it('picks the right form for a species with two Mega Stones', () => {
		expect(megaFormFor(item('Charizardite Y'), species('Charizard'))?.name).toBe(
			'Charizard-Mega-Y'
		);
	});

	it('switches between Mega forms of the same family', () => {
		expect(megaFormFor(item('Charizardite Y'), species('Charizard-Mega-X'))?.name).toBe(
			'Charizard-Mega-Y'
		);
	});

	it('is null when the slot is already that Mega form', () => {
		expect(megaFormFor(item('Garchompite'), species('Garchomp-Mega'))).toBeNull();
	});

	it("is null for a stone that doesn't fit the species, or a non-stone item", () => {
		expect(megaFormFor(item('Garchompite'), species('Charizard'))).toBeNull();
		expect(megaFormFor(item('Leftovers'), species('Garchomp'))).toBeNull();
	});
});

import { describe, expect, it } from 'vitest';
import { allSpecies } from '$lib/calc/generation';
import { megaStoneFor } from '$lib/calc/items';

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

import { describe, expect, it } from 'vitest';
import { findSpecies } from '$lib/modules/shared/species/generation';

describe('findSpecies', () => {
	it('finds a species by its name, ignoring case and surrounding spaces', () => {
		expect(findSpecies('Garchomp')?.name).toBe('Garchomp');
		expect(findSpecies('  garchomp ')?.name).toBe('Garchomp');
		expect(findSpecies('Rotom-Wash')?.name).toBe('Rotom-Wash');
	});

	it('finds formes that are not in the picker, e.g. a Mega', () => {
		expect(findSpecies('Charizard-Mega-Y')?.name).toBe('Charizard-Mega-Y');
	});

	it('finds a species by the label the picker shows for it', () => {
		expect(findSpecies('Aegislash')?.name).toBe('Aegislash-Shield');
	});

	it('is undefined for empty text, nicknames and typos', () => {
		expect(findSpecies('')).toBeUndefined();
		expect(findSpecies('   ')).toBeUndefined();
		expect(findSpecies('Sparky')).toBeUndefined();
		expect(findSpecies('Garchompp')).toBeUndefined();
	});
});

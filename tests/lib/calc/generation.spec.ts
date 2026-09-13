import { describe, expect, it } from 'vitest';
import { allSpecies } from '$lib/calc/generation';

function hasSpecies(name: string): boolean {
	return allSpecies.some((s) => s.name === name);
}

describe('allSpecies', () => {
	it('excludes CAP/non-standard mons', () => {
		expect(hasSpecies('Syclant')).toBe(false);
		expect(hasSpecies('Aegislash-Both')).toBe(false);
	});

	it('keeps real alt formes that share a name prefix with a CAP mon check', () => {
		expect(hasSpecies('Aegislash-Blade')).toBe(true);
		expect(hasSpecies('Aegislash-Shield')).toBe(true);
	});

	it('has no duplicate species names', () => {
		const names = allSpecies.map((s) => s.name);
		expect(new Set(names).size).toBe(names.length);
	});

	it('is sorted alphabetically', () => {
		const names = allSpecies.map((s) => s.name);
		const sorted = [...names].sort((a, b) => a.localeCompare(b));
		expect(names).toEqual(sorted);
	});
});

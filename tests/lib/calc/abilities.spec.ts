import { describe, expect, it } from 'vitest';
import { allSpecies } from '$lib/calc/generation';
import { pokeApiSlug } from '$lib/calc/abilities';

function species(name: string) {
	const s = allSpecies.find((s) => s.name === name);
	if (!s) throw new Error(`fixture species not found: ${name}`);
	return s;
}

// Every slug here was checked by hand against the real PokeAPI.
describe('pokeApiSlug', () => {
	it('is just the compact id for a species with no baseSpecies', () => {
		expect(pokeApiSlug(species('Pikachu'))).toBe('pikachu');
	});

	it('keeps the suffix hyphenated for a regular alt forme', () => {
		expect(pokeApiSlug(species('Charizard-Mega-X'))).toBe('charizard-mega-x');
		expect(pokeApiSlug(species('Meowth-Galar'))).toBe('meowth-galar');
		expect(pokeApiSlug(species('Toxtricity-Low-Key'))).toBe('toxtricity-low-key');
	});

	it("hand-corrects species whose default forme isn't PokeAPI's bare name", () => {
		expect(pokeApiSlug(species('Landorus'))).toBe('landorus-incarnate');
		expect(pokeApiSlug(species('Darmanitan'))).toBe('darmanitan-standard');
		expect(pokeApiSlug(species('Urshifu'))).toBe('urshifu-single-strike');
	});

	it('hand-corrects gender-based species, which need an explicit -male/-female', () => {
		expect(pokeApiSlug(species('Basculegion'))).toBe('basculegion-male');
		expect(pokeApiSlug(species('Basculegion-F'))).toBe('basculegion-female');
		expect(pokeApiSlug(species('Indeedee'))).toBe('indeedee-male');
		expect(pokeApiSlug(species('Indeedee-F'))).toBe('indeedee-female');
		expect(pokeApiSlug(species('Oinkologne'))).toBe('oinkologne-male');
		expect(pokeApiSlug(species('Oinkologne-F'))).toBe('oinkologne-female');
	});

	it('hand-corrects Aegislash, same data quirk as sprites.ts', () => {
		expect(pokeApiSlug(species('Aegislash-Blade'))).toBe('aegislash-blade');
		expect(pokeApiSlug(species('Aegislash-Shield'))).toBe('aegislash-shield');
	});
});

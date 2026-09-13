import { describe, expect, it } from 'vitest';
import { allSpecies } from '$lib/calc/generation';
import { spriteUrl } from '$lib/calc/sprites';

function species(name: string) {
	const s = allSpecies.find((s) => s.name === name);
	if (!s) throw new Error(`fixture species not found: ${name}`);
	return s;
}

describe('spriteUrl', () => {
	it('is the plain compact id for a species with no baseSpecies', () => {
		expect(spriteUrl(species('Pikachu'))).toBe(
			'https://play.pokemonshowdown.com/sprites/home/pikachu.png'
		);
	});

	it('splits base + forme suffix for a regular alt forme', () => {
		expect(spriteUrl(species('Charizard-Mega-X'))).toBe(
			'https://play.pokemonshowdown.com/sprites/home/charizard-megax.png'
		);
		expect(spriteUrl(species('Landorus-Therian'))).toBe(
			'https://play.pokemonshowdown.com/sprites/home/landorus-therian.png'
		);
	});

	it("hand-corrects Aegislash, whose data has no plain 'Aegislash' baseSpecies to split against", () => {
		// Blade has no baseSpecies at all — the generic compact id (`aegislashblade`) would 404.
		expect(spriteUrl(species('Aegislash-Blade'))).toBe(
			'https://play.pokemonshowdown.com/sprites/home/aegislash-blade.png'
		);
		// Shield's baseSpecies ("Aegislash-Blade") isn't a prefix of its own
		// name, so the general split would slice garbage out of it.
		expect(spriteUrl(species('Aegislash-Shield'))).toBe(
			'https://play.pokemonshowdown.com/sprites/home/aegislash.png'
		);
	});
});

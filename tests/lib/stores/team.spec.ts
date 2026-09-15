import { describe, expect, it } from 'vitest';
import { allSpecies } from '$lib/calc/generation';
import { allMoves } from '$lib/calc/moves';
import { TeamSlot } from '$lib/stores/team.svelte';

function species(name: string) {
	return allSpecies.find((s) => s.name === name)!;
}

function move(name: string) {
	return allMoves.find((m) => m.name === name)!;
}

describe('TeamSlot', () => {
	describe('moveOptions defaults', () => {
		it('starts every move slot with crit off and no manual hit-count override', () => {
			const slot = new TeamSlot();

			expect(slot.moveOptions).toEqual([
				{ isCrit: false, hits: null },
				{ isCrit: false, hits: null },
				{ isCrit: false, hits: null },
				{ isCrit: false, hits: null }
			]);
		});
	});

	describe('resetMoveOptions', () => {
		it("resets only the given slot's assume-crit/hit-count overrides, leaving the others untouched", () => {
			const slot = new TeamSlot();
			slot.moveOptions[0].isCrit = true;
			slot.moveOptions[0].hits = 5;
			slot.moveOptions[1].isCrit = true;

			slot.resetMoveOptions(0);

			expect(slot.moveOptions[0]).toEqual({ isCrit: false, hits: null });
			expect(slot.moveOptions[1]).toEqual({ isCrit: true, hits: null });
		});
	});

	describe('species change (#14, #15 overrides)', () => {
		it('resets every move-slot override when switching to a genuinely different Pokemon', () => {
			const slot = new TeamSlot();
			slot.species = species('Garchomp');
			slot.moves[0] = move('Earthquake');
			slot.moveOptions[0].isCrit = true;
			slot.moveOptions[0].hits = 5;

			slot.species = species('Snorlax');

			expect(slot.moveOptions).toEqual([
				{ isCrit: false, hits: null },
				{ isCrit: false, hits: null },
				{ isCrit: false, hits: null },
				{ isCrit: false, hits: null }
			]);
		});

		it('carries move-slot overrides over when switching formes within the same family', () => {
			const slot = new TeamSlot();
			slot.species = species('Charizard');
			slot.moves[0] = move('Flamethrower');
			slot.moveOptions[0].isCrit = true;

			slot.species = species('Charizard-Mega-X');

			expect(slot.moveOptions[0]).toEqual({ isCrit: true, hits: null });
		});
	});

	describe('ally support defaults and reset (ADR-0003, #13)', () => {
		it('starts with no static overrides and both manual toggles off', () => {
			const slot = new TeamSlot();

			expect(slot.allySupportOverrides).toEqual({
				friendGuard: null,
				battery: null,
				powerSpot: null,
				steelySpirit: null
			});
			expect(slot.providesHelpingHand).toBe(false);
			expect(slot.providesTailwind).toBe(false);
		});

		it('resets static overrides and manual toggles when switching to a genuinely different Pokemon', () => {
			const slot = new TeamSlot();
			slot.species = species('Garchomp');
			slot.allySupportOverrides.friendGuard = true;
			slot.providesHelpingHand = true;
			slot.providesTailwind = true;

			slot.species = species('Snorlax');

			expect(slot.allySupportOverrides).toEqual({
				friendGuard: null,
				battery: null,
				powerSpot: null,
				steelySpirit: null
			});
			expect(slot.providesHelpingHand).toBe(false);
			expect(slot.providesTailwind).toBe(false);
		});

		it('carries ally support overrides over when switching formes within the same family', () => {
			const slot = new TeamSlot();
			slot.species = species('Charizard');
			slot.allySupportOverrides.battery = true;
			slot.providesTailwind = true;

			slot.species = species('Charizard-Mega-X');

			expect(slot.allySupportOverrides.battery).toBe(true);
			expect(slot.providesTailwind).toBe(true);
		});
	});
});

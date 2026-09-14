import { describe, expect, it } from 'vitest';
import { allMoves, isAllyOnlyTarget } from '$lib/calc/moves';

function move(name: string) {
	const m = allMoves.find((m) => m.name === name);
	if (!m) throw new Error(`moves.spec.ts: expected move not found: ${name}`);
	return m;
}

describe('isAllyOnlyTarget', () => {
	it.each([
		'Aromatic Mist',
		'Coaching',
		'Dragon Cheer',
		'Helping Hand',
		'Hold Hands',
		'Howl',
		'Jungle Healing',
		'Life Dew',
		'Lunar Blessing'
	])('is true for %s, whose real target is adjacentAlly or allies', (name) => {
		expect(isAllyOnlyTarget(move(name))).toBe(true);
	});

	it('is false for a move that only ever targets a single opponent', () => {
		expect(isAllyOnlyTarget(move('Flamethrower'))).toBe(false);
	});

	it('is false for a move that targets any single adjacent Pokemon, ally or foe', () => {
		// Pollen Puff can be aimed at either, so it doesn't belong here —
		// unlike Helping Hand, it isn't ally-only.
		expect(isAllyOnlyTarget(move('Pollen Puff'))).toBe(false);
	});

	it('is false for a move that can target the ally or the user itself, not the ally only', () => {
		// Acupressure's real target is adjacentAllyOrSelf, not adjacentAlly.
		expect(isAllyOnlyTarget(move('Acupressure'))).toBe(false);
	});

	it('is false for a spread move that hits both the ally and opponents at once', () => {
		// allAdjacent moves (Earthquake, ...) show their ally damage inline
		// in the main Damage Matrix instead (ADR-0001), not here.
		expect(isAllyOnlyTarget(move('Earthquake'))).toBe(false);
	});
});

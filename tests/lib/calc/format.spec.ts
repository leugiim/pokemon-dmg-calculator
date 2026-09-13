import { describe, expect, it } from 'vitest';
import {
	allNatures,
	calcChampionsStat,
	totalStatPoints,
	emptyStatPoints,
	MAX_SP_TOTAL,
	MAX_SP_PER_STAT,
	type NatureName
} from '$lib/calc/format';

function nature(name: NatureName) {
	return allNatures.find((n) => n.name === name)!;
}

describe('calcChampionsStat', () => {
	it('matches the standard level 50 / 31 IV / 0 SP baseline for HP', () => {
		// Base 100 HP, no SP: floor((2*100+31)*50/100) + 50 + 10 = 115 + 60 = 175
		expect(calcChampionsStat(100, 'hp', 0, nature('Hardy'))).toBe(175);
	});

	it('adds SP as a flat +1 to a non-HP stat before the nature modifier', () => {
		const withoutSp = calcChampionsStat(100, 'atk', 0, nature('Hardy'));
		const withSp = calcChampionsStat(100, 'atk', 10, nature('Hardy'));
		expect(withSp - withoutSp).toBe(10);
	});

	it('applies a +10% boost for a nature-boosted stat', () => {
		// Base 100, 0 SP, neutral: floor((2*100+31)*50/100)+5 = 115+5 = 120
		expect(calcChampionsStat(100, 'atk', 0, nature('Hardy'))).toBe(120);
		// Adamant boosts Atk: floor(120 * 1.1) = 132
		expect(calcChampionsStat(100, 'atk', 0, nature('Adamant'))).toBe(132);
		// ...and hinders SpA: floor(120 * 0.9) = 108
		expect(calcChampionsStat(100, 'spa', 0, nature('Adamant'))).toBe(108);
	});

	it('never lets nature affect HP', () => {
		expect(calcChampionsStat(100, 'hp', 0, nature('Adamant'))).toBe(
			calcChampionsStat(100, 'hp', 0, nature('Hardy'))
		);
	});
});

describe('stat points', () => {
	it('starts empty and sums to 0', () => {
		expect(totalStatPoints(emptyStatPoints())).toBe(0);
	});

	it('the total cap is the binding constraint, not the per-stat one', () => {
		// You can't just max every stat (6 * 32 = 192) — the 66 total is
		// what actually limits the allocation.
		expect(MAX_SP_TOTAL).toBeLessThan(6 * MAX_SP_PER_STAT);
	});
});

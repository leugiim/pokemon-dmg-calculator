import { describe, expect, it } from 'vitest';
import {
	allNatures,
	calcChampionsStat,
	statPointBreakpoints,
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

describe('statPointBreakpoints', () => {
	it('marks where a boosted stat jumps by 2 instead of 1', () => {
		const points = statPointBreakpoints(100, 'atk', nature('Adamant'));
		// floor((2*100+31)*50/100) = 115; (115+5+sp)*1.1 crosses an extra
		// integer roughly every 10 points.
		expect(points).toEqual([10, 20, 30]);
	});

	it('marks where a hindered stat gets +0 instead of +1', () => {
		const points = statPointBreakpoints(100, 'spa', nature('Adamant'));
		expect(points).toEqual([1, 11, 21, 31]);
	});

	it('is empty for a neutral nature', () => {
		expect(statPointBreakpoints(100, 'atk', nature('Hardy'))).toEqual([]);
	});

	it("is empty for a stat the nature doesn't touch", () => {
		expect(statPointBreakpoints(100, 'def', nature('Adamant'))).toEqual([]);
	});

	it('is empty for HP — nature never affects it', () => {
		// Bashful boosts/hinders SpA equally (neutral), so pick a nature
		// pair that excludes HP entirely: Adamant (Atk/SpA) still can't
		// touch HP either way.
		expect(statPointBreakpoints(100, 'hp', nature('Adamant'))).toEqual([]);
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

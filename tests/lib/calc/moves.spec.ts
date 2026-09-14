import { describe, expect, it } from 'vitest';
import { allMoves, hasDamageComponent, isAllyOnlyTarget } from '$lib/calc/moves';

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

/**
 * Every basePower-0, non-Status move this generation's move data has —
 * hand-enumerated from `@smogon/calc`'s own gen 9 data, an oracle
 * independent of `hasDamageComponent`'s own category check (unlike
 * filtering `allMoves` by `category !== 'Status'` inline, which would
 * just restate the implementation under test). Includes both the
 * fixed-damage moves `CONTEXT.md` itself names as examples (Seismic
 * Toss, Night Shade, Dragon Rage, Sonic Boom, Super Fang, Final Gambit)
 * and every counter-attack, OHKO move, and weight-/HP-/recoil-based move
 * whose effective base power the engine computes elsewhere.
 */
const ZERO_BASE_POWER_DAMAGE_MOVES = [
	'Seismic Toss',
	'Night Shade',
	'Dragon Rage',
	'Sonic Boom',
	'Super Fang',
	'Final Gambit',
	'Bide',
	'Counter',
	'Fissure',
	'Guillotine',
	'Horn Drill',
	'Psywave',
	'Low Kick',
	'Beat Up',
	'Flail',
	'Mirror Coat',
	'Present',
	'Reversal',
	'Magnitude',
	'Frustration',
	'Return',
	'Spit Up',
	'Endeavor',
	'Sheer Cold',
	'Crush Grip',
	'Fling',
	'Metal Burst',
	'Natural Gift',
	'Wring Out',
	'Gyro Ball',
	'Grass Knot',
	'Punishment',
	'Trump Card',
	'Electro Ball',
	'Heat Crash',
	'Heavy Slam',
	'Guardian of Alola',
	"Nature's Madness",
	'Comeuppance',
	'Hard Press',
	'Ruination'
];

describe('hasDamageComponent', () => {
	it('is false for a pure status move', () => {
		expect(hasDamageComponent(move('Swords Dance'))).toBe(false);
		expect(hasDamageComponent(move('Will-O-Wisp'))).toBe(false);
	});

	it('is true for an ordinary base-power move', () => {
		expect(hasDamageComponent(move('Flamethrower'))).toBe(true);
	});

	it.each(ZERO_BASE_POWER_DAMAGE_MOVES)(
		'is true for %s, a fixed/variable-damage move whose own basePower is 0',
		(name) => {
			const m = move(name);
			expect(m.basePower).toBe(0);
			expect(hasDamageComponent(m)).toBe(true);
		}
	);

	it("covers every basePower-0, non-Status move this generation's move data has", () => {
		// Guards the list above against drifting out of date (a new move
		// added on a future gen bump, say) — every move shaped like the
		// ones above must actually appear in that list.
		const covered = new Set(ZERO_BASE_POWER_DAMAGE_MOVES);
		const uncovered = allMoves.filter(
			(m) => m.basePower === 0 && m.category !== 'Status' && !covered.has(m.name)
		);
		expect(uncovered.map((m) => m.name)).toEqual([]);
	});
});

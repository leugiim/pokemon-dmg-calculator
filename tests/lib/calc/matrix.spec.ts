import { describe, expect, it } from 'vitest';
import { allSpecies } from '$lib/calc/generation';
import { allMoves } from '$lib/calc/moves';
import { TeamSlot, type TeamId } from '$lib/stores/team.svelte';
import { buildDamageMatrix } from '$lib/calc/matrix';

function species(name: string) {
	return allSpecies.find((s) => s.name === name)!;
}

function move(name: string) {
	return allMoves.find((m) => m.name === name)!;
}

/**
 * A team slot with a species and up to 4 named moves — everything else
 * (nature, Stat Points) at `TeamSlot`'s own neutral/zero defaults, which
 * is all `buildDamageMatrix` itself cares about.
 */
function buildSlot({
	speciesName,
	moveNames = []
}: {
	speciesName: string;
	moveNames?: string[];
}): TeamSlot {
	const slot = new TeamSlot();
	slot.species = species(speciesName);
	slot.moves = [
		moveNames[0] ? move(moveNames[0]) : null,
		moveNames[1] ? move(moveNames[1]) : null,
		moveNames[2] ? move(moveNames[2]) : null,
		moveNames[3] ? move(moveNames[3]) : null
	];
	return slot;
}

function sidesOf(teamA: [TeamSlot, TeamSlot], teamB: [TeamSlot, TeamSlot]) {
	return { teamA, teamB } satisfies Record<TeamId, [TeamSlot, TeamSlot]>;
}

describe('buildDamageMatrix', () => {
	it('returns nothing when no slot on either team has a species picked', () => {
		const sides = sidesOf([new TeamSlot(), new TeamSlot()], [new TeamSlot(), new TeamSlot()]);

		expect(buildDamageMatrix(sides)).toEqual([]);
	});

	it('skips an empty slot but still includes its ally that does have a species', () => {
		const populated = buildSlot({ speciesName: 'Garchomp', moveNames: ['Earthquake'] });
		const sides = sidesOf([populated, new TeamSlot()], [new TeamSlot(), new TeamSlot()]);

		const attackers = buildDamageMatrix(sides);

		expect(attackers).toHaveLength(1);
		expect(attackers[0].attacker).toBe(populated);
	});

	it('gives an attacker an empty opponents list (not a thrown error) when no opponent has a species yet', () => {
		const attacker = buildSlot({ speciesName: 'Garchomp', moveNames: ['Earthquake'] });
		const sides = sidesOf([attacker, new TeamSlot()], [new TeamSlot(), new TeamSlot()]);

		const [row] = buildDamageMatrix(sides);

		expect(row.opponents).toEqual([]);
		expect(row.rows).toEqual([
			{
				move: move('Earthquake'),
				moveIndex: 0,
				cells: [],
				isAllAdjacentMove: true,
				allyDamage: null
			}
		]);
	});

	it('skips empty move slots rather than padding them', () => {
		// 2 filled, 2 empty move slots -> exactly 2 rows, not 4.
		const attacker = buildSlot({
			speciesName: 'Garchomp',
			moveNames: ['Earthquake', 'Dragon Claw']
		});
		const opponent = buildSlot({ speciesName: 'Snorlax' });
		const sides = sidesOf([attacker, new TeamSlot()], [opponent, new TeamSlot()]);

		const [row] = buildDamageMatrix(sides);

		expect(row.rows.map((r) => r.move.name)).toEqual(['Earthquake', 'Dragon Claw']);
	});

	it('keeps a move repeated across two slots as two separate rows, not deduped', () => {
		const attacker = buildSlot({
			speciesName: 'Garchomp',
			moveNames: ['Earthquake', 'Earthquake']
		});
		const opponent = buildSlot({ speciesName: 'Snorlax' });
		const sides = sidesOf([attacker, new TeamSlot()], [opponent, new TeamSlot()]);

		const [row] = buildDamageMatrix(sides);

		expect(row.rows).toHaveLength(2);
	});

	it('excludes ally-only-target moves from every row entirely', () => {
		const attacker = buildSlot({
			speciesName: 'Garchomp',
			moveNames: ['Helping Hand', 'Earthquake']
		});
		const opponent = buildSlot({ speciesName: 'Snorlax' });
		const sides = sidesOf([attacker, new TeamSlot()], [opponent, new TeamSlot()]);

		const [row] = buildDamageMatrix(sides);

		expect(row.rows.map((r) => r.move.name)).toEqual(['Earthquake']);
	});

	it('computes both directions: each side attacks the other', () => {
		const a = buildSlot({ speciesName: 'Garchomp', moveNames: ['Earthquake'] });
		const b = buildSlot({ speciesName: 'Snorlax', moveNames: ['Body Slam'] });
		const sides = sidesOf([a, new TeamSlot()], [b, new TeamSlot()]);

		const attackers = buildDamageMatrix(sides);

		const aRow = attackers.find((r) => r.attacker === a)!;
		const bRow = attackers.find((r) => r.attacker === b)!;
		expect(aRow.opponents).toEqual([b]);
		expect(aRow.rows[0].move.name).toBe('Earthquake');
		expect(bRow.opponents).toEqual([a]);
		expect(bRow.rows[0].move.name).toBe('Body Slam');
	});

	it('marks a pure status move with a null cell, rendered as "—" by the caller', () => {
		const attacker = buildSlot({ speciesName: 'Garchomp', moveNames: ['Swords Dance'] });
		const opponent = buildSlot({ speciesName: 'Snorlax' });
		const sides = sidesOf([attacker, new TeamSlot()], [opponent, new TeamSlot()]);

		const [row] = buildDamageMatrix(sides);

		expect(row.rows[0].cells[0].damage).toBeNull();
	});

	it('computes and shows a fixed-damage move despite its own basePower being 0', () => {
		const attacker = buildSlot({ speciesName: 'Garchomp', moveNames: ['Seismic Toss'] });
		const opponent = buildSlot({ speciesName: 'Snorlax' });
		const sides = sidesOf([attacker, new TeamSlot()], [opponent, new TeamSlot()]);

		const [row] = buildDamageMatrix(sides);

		expect(row.rows[0].cells[0].damage).not.toBeNull();
		expect(row.rows[0].cells[0].damage!.percentRange).toBe('21.2 - 21.2');
	});

	it('shows a computed 0, not "—", for a move that legitimately deals no damage', () => {
		// Tackle is Normal-type; Gengar is a pure Ghost-type, immune to it.
		const attacker = buildSlot({ speciesName: 'Machamp', moveNames: ['Tackle'] });
		const opponent = buildSlot({ speciesName: 'Gengar' });
		const sides = sidesOf([attacker, new TeamSlot()], [opponent, new TeamSlot()]);

		const [row] = buildDamageMatrix(sides);
		const { damage } = row.rows[0].cells[0];

		expect(damage).not.toBeNull();
		expect(damage!.percentRange).toBe('0.0 - 0.0');
	});

	it('never includes a same-team ally as an opponent', () => {
		const a1 = buildSlot({ speciesName: 'Garchomp', moveNames: ['Earthquake'] });
		const a2 = buildSlot({ speciesName: 'Dragonite' });
		const sides = sidesOf([a1, a2], [new TeamSlot(), new TeamSlot()]);

		const [row] = buildDamageMatrix(sides);

		expect(row.opponents).not.toContain(a2);
	});

	it("reports each row's move slot index, skipping the ones filtered out (ally-only moves)", () => {
		const attacker = buildSlot({
			speciesName: 'Garchomp',
			moveNames: ['Helping Hand', 'Earthquake', 'Dragon Claw']
		});
		const opponent = buildSlot({ speciesName: 'Snorlax' });
		const sides = sidesOf([attacker, new TeamSlot()], [opponent, new TeamSlot()]);

		const [row] = buildDamageMatrix(sides);

		// Helping Hand (slot 0) is filtered out entirely — Earthquake and
		// Dragon Claw keep their real slot indices (1, 2), not 0 and 1.
		expect(row.rows.map((r) => r.moveIndex)).toEqual([1, 2]);
	});

	describe('allAdjacent inline ally damage (#12)', () => {
		it("shows an allAdjacent move's damage against the attacker's own ally, inline in its row", () => {
			const a1 = buildSlot({ speciesName: 'Garchomp', moveNames: ['Earthquake'] });
			const a2 = buildSlot({ speciesName: 'Dragonite' });
			const opponent = buildSlot({ speciesName: 'Snorlax' });
			const sides = sidesOf([a1, a2], [opponent, new TeamSlot()]);

			const attackers = buildDamageMatrix(sides);
			const row = attackers.find((r) => r.attacker === a1)!.rows[0];

			expect(row.move.name).toBe('Earthquake');
			expect(row.isAllAdjacentMove).toBe(true);
			expect(row.allyDamage).not.toBeNull();
		});

		it('does not show ally damage for an allAdjacentFoes move (Rock Slide)', () => {
			const a1 = buildSlot({ speciesName: 'Garchomp', moveNames: ['Rock Slide'] });
			const a2 = buildSlot({ speciesName: 'Dragonite' });
			const opponent = buildSlot({ speciesName: 'Snorlax' });
			const sides = sidesOf([a1, a2], [opponent, new TeamSlot()]);

			const attackers = buildDamageMatrix(sides);
			const row = attackers.find((r) => r.attacker === a1)!.rows[0];

			expect(row.isAllAdjacentMove).toBe(false);
			expect(row.allyDamage).toBeNull();
		});

		it('does not show ally damage for an ordinary single-target move', () => {
			const a1 = buildSlot({ speciesName: 'Garchomp', moveNames: ['Dragon Claw'] });
			const a2 = buildSlot({ speciesName: 'Dragonite' });
			const opponent = buildSlot({ speciesName: 'Snorlax' });
			const sides = sidesOf([a1, a2], [opponent, new TeamSlot()]);

			const attackers = buildDamageMatrix(sides);
			const row = attackers.find((r) => r.attacker === a1)!.rows[0];

			expect(row.isAllAdjacentMove).toBe(false);
			expect(row.allyDamage).toBeNull();
		});

		it('is null when the ally has no species picked yet, even for an allAdjacent move', () => {
			const a1 = buildSlot({ speciesName: 'Garchomp', moveNames: ['Earthquake'] });
			const opponent = buildSlot({ speciesName: 'Snorlax' });
			const sides = sidesOf([a1, new TeamSlot()], [opponent, new TeamSlot()]);

			const attackers = buildDamageMatrix(sides);
			const row = attackers.find((r) => r.attacker === a1)!.rows[0];

			expect(row.isAllAdjacentMove).toBe(true);
			expect(row.allyDamage).toBeNull();
		});
	});

	describe('per-row calculation overrides (#14, #15)', () => {
		it("uses the attacker's per-move-slot assume-crit toggle", () => {
			const attacker = buildSlot({ speciesName: 'Garchomp', moveNames: ['Dragon Claw'] });
			attacker.moveOptions[0].isCrit = true;
			const opponent = buildSlot({ speciesName: 'Snorlax' });
			const sides = sidesOf([attacker, new TeamSlot()], [opponent, new TeamSlot()]);

			const [row] = buildDamageMatrix(sides);

			expect(row.rows[0].cells[0].damage!.result.move.isCrit).toBe(true);
		});

		it("uses the attacker's per-move-slot manual hit-count override", () => {
			const attacker = buildSlot({ speciesName: 'Garchomp', moveNames: ['Bullet Seed'] });
			attacker.moveOptions[0].hits = 5;
			const opponent = buildSlot({ speciesName: 'Snorlax' });
			const sides = sidesOf([attacker, new TeamSlot()], [opponent, new TeamSlot()]);

			const [row] = buildDamageMatrix(sides);

			expect(row.rows[0].cells[0].damage!.result.move.hits).toBe(5);
		});

		it('applies the same per-move-slot overrides to the inline ally cell of an allAdjacent move', () => {
			const a1 = buildSlot({ speciesName: 'Garchomp', moveNames: ['Earthquake'] });
			a1.moveOptions[0].isCrit = true;
			const a2 = buildSlot({ speciesName: 'Dragonite' });
			const opponent = buildSlot({ speciesName: 'Snorlax' });
			const sides = sidesOf([a1, a2], [opponent, new TeamSlot()]);

			const attackers = buildDamageMatrix(sides);
			const row = attackers.find((r) => r.attacker === a1)!.rows[0];

			expect(row.allyDamage!.result.move.isCrit).toBe(true);
		});
	});

	describe('ally support (ADR-0003, #13)', () => {
		it("boosts a matrix cell when the attacker's own ally has Power Spot", () => {
			const attacker = buildSlot({ speciesName: 'Garchomp', moveNames: ['Dragon Claw'] });
			const ally = buildSlot({ speciesName: 'Dragonite' });
			ally.ability = 'Power Spot';
			const opponent = buildSlot({ speciesName: 'Snorlax' });
			const sides = sidesOf([attacker, ally], [opponent, new TeamSlot()]);

			const attackers = buildDamageMatrix(sides);
			const row = attackers.find((r) => r.attacker === attacker)!.rows[0];

			expect(row.cells[0].damage!.result.field.attackerSide.isPowerSpot).toBe(true);
		});

		it("reduces a matrix cell's damage when the target's own ally has Friend Guard", () => {
			const attacker = buildSlot({ speciesName: 'Garchomp', moveNames: ['Dragon Claw'] });
			const opponent = buildSlot({ speciesName: 'Snorlax' });
			const opponentAlly = buildSlot({ speciesName: 'Dragonite' });
			opponentAlly.ability = 'Friend Guard';
			const sides = sidesOf([attacker, new TeamSlot()], [opponent, opponentAlly]);

			const attackers = buildDamageMatrix(sides);
			const row = attackers.find((r) => r.attacker === attacker)!.rows[0];

			expect(row.cells[0].damage!.result.field.defenderSide.isFriendGuard).toBe(true);
		});

		it("applies the manual Helping Hand toggle from the attacker's own ally to a matrix cell", () => {
			const attacker = buildSlot({ speciesName: 'Garchomp', moveNames: ['Dragon Claw'] });
			const ally = buildSlot({ speciesName: 'Dragonite' });
			ally.providesHelpingHand = true;
			const opponent = buildSlot({ speciesName: 'Snorlax' });
			const sides = sidesOf([attacker, ally], [opponent, new TeamSlot()]);

			const attackers = buildDamageMatrix(sides);
			const row = attackers.find((r) => r.attacker === attacker)!.rows[0];

			expect(row.cells[0].damage!.result.field.attackerSide.isHelpingHand).toBe(true);
		});

		it("still applies the attacker's ally's support to the inline ally-damage cell of an allAdjacent move", () => {
			const a1 = buildSlot({ speciesName: 'Garchomp', moveNames: ['Earthquake'] });
			const a2 = buildSlot({ speciesName: 'Dragonite' });
			a2.ability = 'Power Spot';
			const opponent = buildSlot({ speciesName: 'Snorlax' });
			const sides = sidesOf([a1, a2], [opponent, new TeamSlot()]);

			const attackers = buildDamageMatrix(sides);
			const row = attackers.find((r) => r.attacker === a1)!.rows[0];

			expect(row.allyDamage!.result.field.attackerSide.isPowerSpot).toBe(true);
		});

		it("applies the attacker's own Friend Guard to the damage it deals its own ally (an allAdjacent hit)", () => {
			const a1 = buildSlot({ speciesName: 'Garchomp', moveNames: ['Earthquake'] });
			a1.ability = 'Friend Guard';
			const a2 = buildSlot({ speciesName: 'Dragonite' });
			const opponent = buildSlot({ speciesName: 'Snorlax' });
			const sides = sidesOf([a1, a2], [opponent, new TeamSlot()]);

			const attackers = buildDamageMatrix(sides);
			const row = attackers.find((r) => r.attacker === a1)!.rows[0];

			expect(row.allyDamage!.result.field.defenderSide.isFriendGuard).toBe(true);
		});

		it('lets a manual override on the ally force Steely Spirit on despite a non-matching ability', () => {
			const attacker = buildSlot({ speciesName: 'Garchomp', moveNames: ['Iron Head'] });
			const ally = buildSlot({ speciesName: 'Dragonite' });
			ally.ability = 'Multiscale';
			ally.allySupportOverrides.steelySpirit = true;
			const opponent = buildSlot({ speciesName: 'Snorlax' });
			const sides = sidesOf([attacker, ally], [opponent, new TeamSlot()]);

			const attackers = buildDamageMatrix(sides);
			const row = attackers.find((r) => r.attacker === attacker)!.rows[0];

			expect(row.cells[0].damage!.result.field.attackerSide.isSteelySpirit).toBe(true);
		});
	});
});

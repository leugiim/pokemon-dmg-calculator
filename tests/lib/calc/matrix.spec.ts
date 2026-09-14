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
		expect(row.rows).toEqual([{ move: move('Earthquake'), cells: [] }]);
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
});

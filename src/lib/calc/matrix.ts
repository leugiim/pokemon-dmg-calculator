import type { TeamId, TeamSlot } from '../stores/team.svelte';
import { hasDamageComponent, isAllyOnlyTarget, type MoveItem } from './moves';
import { computeDamage, type DamageDisplay } from './damage';

/** One damage number in a `DamageMatrixRow`, against one opposing Pokemon. */
export interface DamageMatrixCell {
	target: TeamSlot;
	/** `null` for a move with no direct damage component (e.g. a Status move) — render as "—". */
	damage: DamageDisplay | null;
}

/** One of an attacker's filled move slots, computed against every current opponent. */
export interface DamageMatrixRow {
	move: MoveItem;
	cells: DamageMatrixCell[];
}

/** One attacker's full move set against its side of the matchup. */
export interface DamageMatrixAttacker {
	attacker: TeamSlot;
	/** The opposing team's slots with a species picked — empty until they are. */
	opponents: TeamSlot[];
	rows: DamageMatrixRow[];
}

const OTHER_TEAM: Record<TeamId, TeamId> = { teamA: 'teamB', teamB: 'teamA' };

/**
 * Builds the full Damage Matrix (`CONTEXT.md`): every one of the 4
 * Pokemon across both teams, every one of its filled move slots, against
 * each Pokemon on the opposing team — both directions at once, since
 * neither team is fixed as "the attacker" (this loops attacker over both
 * `teamA` and `teamB` in turn, so A→B and B→A both come out the other's
 * `opponents`).
 *
 * Ally-only-target moves (Helping Hand, ...) are left out of every row
 * entirely — they have nowhere to hit an opponent at all, and get their
 * own on-demand view in `MoveSlot.svelte` instead (ADR-0001, see
 * `isAllyOnlyTarget`). An attacker with no species picked is skipped, and
 * an attacker with one but no opponent picked yet still gets a (rowless
 * or column-less) entry — the caller decides how to render that, rather
 * than this function guessing at a placeholder.
 */
export function buildDamageMatrix(
	sides: Record<TeamId, [TeamSlot, TeamSlot]>
): DamageMatrixAttacker[] {
	const attackers: DamageMatrixAttacker[] = [];

	for (const teamId of ['teamA', 'teamB'] as TeamId[]) {
		const opponents = sides[OTHER_TEAM[teamId]].filter((slot) => slot.species);

		for (const attacker of sides[teamId]) {
			if (!attacker.species) continue;

			const rows: DamageMatrixRow[] = attacker.moves
				.filter((move): move is MoveItem => move !== null && !isAllyOnlyTarget(move))
				.map((move) => ({
					move,
					cells: opponents.map((target) => ({
						target,
						damage: hasDamageComponent(move) ? computeDamage(attacker, move, target) : null
					}))
				}));

			attackers.push({ attacker, opponents, rows });
		}
	}

	return attackers;
}

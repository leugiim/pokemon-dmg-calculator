import type { TeamId, TeamSlot } from '../stores/team.svelte';
import { hasDamageComponent, isAllAdjacentTarget, isAllyOnlyTarget, type MoveItem } from './moves';
import { computeDamage, type DamageDisplay, type DamageOptions } from './damage';

/** One damage number in a `DamageMatrixRow`, against one opposing Pokemon. */
export interface DamageMatrixCell {
	target: TeamSlot;
	/** `null` for a move with no direct damage component (e.g. a Status move) — render as "—". */
	damage: DamageDisplay | null;
}

/** One of an attacker's filled move slots, computed against every current opponent. */
export interface DamageMatrixRow {
	move: MoveItem;
	/**
	 * This move's index within `attacker.moves` (0-3) — lets a caller read
	 * or bind back onto that exact move slot's own `TeamSlot.moveOptions`
	 * entry (#14/#15), since ally-only moves are filtered out of `rows` and
	 * so `rows`' own array index can't be used for that.
	 */
	moveIndex: number;
	cells: DamageMatrixCell[];
	/**
	 * True for a move whose real target is `allAdjacent` (Earthquake, ...)
	 * — the one classification a caller needs to decide whether this row
	 * should render a "vs ally" cell at all (`allyDamage`'s own null
	 * doesn't distinguish "not applicable" from "ally has no species
	 * picked yet"). See ADR-0001, #12.
	 */
	isAllAdjacentMove: boolean;
	/**
	 * This move's damage against the attacker's own ally — populated only
	 * when `isAllAdjacentMove` is true and the ally has a species picked;
	 * `null` otherwise.
	 */
	allyDamage: DamageDisplay | null;
}

/** One attacker's full move set against its side of the matchup. */
export interface DamageMatrixAttacker {
	attacker: TeamSlot;
	/** The opposing team's slots with a species picked — empty until they are. */
	opponents: TeamSlot[];
	rows: DamageMatrixRow[];
}

const OTHER_TEAM: Record<TeamId, TeamId> = { teamA: 'teamB', teamB: 'teamA' };

/** One attacker/ally pairing from a 2-slot side — the other slot is always the ally. */
function pairings(slots: [TeamSlot, TeamSlot]): [attacker: TeamSlot, ally: TeamSlot][] {
	return slots.map((attacker, i) => [attacker, slots[1 - i]]);
}

/** One row per filled, non-ally-only move slot, keeping its original slot index. */
function buildRows(attacker: TeamSlot, ally: TeamSlot, opponents: TeamSlot[]): DamageMatrixRow[] {
	return attacker.moves.flatMap((move, moveIndex) => {
		if (move === null || isAllyOnlyTarget(move)) return [];

		const { isCrit, hits } = attacker.moveOptions[moveIndex];
		const options: DamageOptions = { isCrit, hits: hits ?? undefined };
		const damaging = hasDamageComponent(move);
		const isAllAdjacentMove = isAllAdjacentTarget(move);

		return [
			{
				move,
				moveIndex,
				cells: opponents.map((target) => ({
					target,
					damage: damaging ? computeDamage(attacker, move, target, options) : null
				})),
				isAllAdjacentMove,
				allyDamage:
					damaging && isAllAdjacentMove && ally.species
						? computeDamage(attacker, move, ally, options)
						: null
			}
		];
	});
}

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

		for (const [attacker, ally] of pairings(sides[teamId])) {
			if (!attacker.species) continue;

			attackers.push({ attacker, opponents, rows: buildRows(attacker, ally, opponents) });
		}
	}

	return attackers;
}

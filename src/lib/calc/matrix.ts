import {
	defaultTeamAllySupport,
	defaultTeamSideConditions,
	type TeamAllySupport,
	type TeamId,
	type TeamSideConditions,
	type TeamSlot
} from '../stores/team.svelte';
import { defaultFieldConditions, type FieldConditions } from '../stores/field.svelte';
import { hasDamageComponent, isAllAdjacentTarget, isAllyOnlyTarget, type MoveItem } from './moves';
import { computeDamage, type DamageDisplay, type DamageOptions } from './damage';
import { fieldAbilityFlags } from './fieldAbilities';
import { clampBoostStage } from './format';

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

/**
 * The other slot in a 2-slot side — every side is always exactly a pair, so
 * "the ally" of either slot is always just the other one. Used to look up
 * a given `target`'s own ally within its (unfiltered) side, for that
 * target's own `defenderSide` ally-support flags (Friend Guard, ADR-0003,
 * #13) — `target` itself always came from that same `pair` (see `opponents`
 * in `buildDamageMatrix`), so this never falls through to the `: pair[0]`
 * branch by mistake.
 */
function otherOf(pair: [TeamSlot, TeamSlot], slot: TeamSlot): TeamSlot {
	return pair[0] === slot ? pair[1] : pair[0];
}

/** One team's shared ally-support and side-condition state, bundled so a caller can't transpose "this team" and "the opposing team" at a `buildRows` call site. */
interface TeamContext {
	support: TeamAllySupport;
	sideConditions: TeamSideConditions;
}

/**
 * One row per filled, non-ally-only move slot, keeping its original slot
 * index. `opponentSlots` is the (unfiltered) 2-slot opposing side, used via
 * `otherOf` to find each target's own ally. `own`/`opponent` are the
 * attacker's own and the opposing team's shared state respectively;
 * `fieldConditions` is the shared weather/terrain (#24), identical for
 * every cell regardless of which side is attacking; `fieldAbilities` is
 * the already-derived Ruin-ability/Fairy Aura `Field` flags (also shared,
 * see `fieldAbilities.ts`).
 */
function buildRows(
	attacker: TeamSlot,
	ally: TeamSlot,
	opponents: TeamSlot[],
	opponentSlots: [TeamSlot, TeamSlot],
	own: TeamContext,
	opponent: TeamContext,
	fieldConditions: FieldConditions,
	fieldAbilities: ReturnType<typeof fieldAbilityFlags>
): DamageMatrixRow[] {
	return attacker.moves.flatMap((move, moveIndex) => {
		if (move === null || isAllyOnlyTarget(move)) return [];

		const { isCrit, hits } = attacker.moveOptions[moveIndex];
		const damaging = hasDamageComponent(move);
		const isAllAdjacentMove = isAllAdjacentTarget(move);
		const baseOptions: DamageOptions = {
			isCrit,
			hits: hits ?? undefined,
			attackerAlly: ally,
			attackerAllySupport: own.support,
			weather: fieldConditions.weather ?? undefined,
			terrain: fieldConditions.terrain ?? undefined,
			gravity: fieldConditions.gravity,
			fieldAbilities,
			// The *opponent's* Intimidate (not the attacker's own team's) is
			// what hits this attacker — same flat -1 Atk stage regardless of
			// which of the opponent's Pokemon or the attacker's own ally
			// ends up as `target` below, since it's the attacker's own
			// persistent stat stage, not something computed per matchup.
			attackerBoosts: opponent.sideConditions.intimidate
				? { atk: clampBoostStage(attacker.boosts.atk - 1) }
				: undefined
		};

		/** `baseOptions` plus one target's own `defenderSide` context — shared by both branches below so they can't drift out of sync. */
		function withDefender(defenderAlly: TeamSlot, context: TeamContext): DamageOptions {
			return {
				...baseOptions,
				defenderAlly,
				defenderAllySupport: context.support,
				defenderSideConditions: context.sideConditions
			};
		}

		return [
			{
				move,
				moveIndex,
				cells: opponents.map((target) => ({
					target,
					damage: damaging
						? computeDamage(
								attacker,
								move,
								target,
								withDefender(otherOf(opponentSlots, target), opponent)
							)
						: null
				})),
				isAllAdjacentMove,
				// The attacker's ally is also the target of this cell, and still
				// the source of attackerSide's support (Power Spot et al. boost a
				// hit against the ally itself just as they would against an
				// opponent) — its own defenderSide ally is the attacker, on the
				// *same* team as attacker/ally (a Friend-Guard-holding attacker
				// reduces damage it deals its own ally, since Friend Guard only
				// ever exempts the holder itself), so it shares `own` too.
				allyDamage:
					damaging && isAllAdjacentMove && ally.species
						? computeDamage(attacker, move, ally, withDefender(attacker, own))
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
 * entirely — they have nowhere to hit an opponent at all, and (unlike
 * `allAdjacent` moves) never deal damage at all either, so there's nothing
 * to show for them anywhere (ADR-0001, see `isAllyOnlyTarget`). An
 * attacker with no species picked is skipped, and
 * an attacker with one but no opponent picked yet still gets a (rowless
 * or column-less) entry — the caller decides how to render that, rather
 * than this function guessing at a placeholder.
 *
 * `allySupport`/`sideConditions`/`fieldConditions` default to "no
 * overrides, no side conditions, no weather, no terrain" when omitted —
 * every existing caller that doesn't care about any of these keeps working
 * unchanged.
 */
export function buildDamageMatrix(
	sides: Record<TeamId, [TeamSlot, TeamSlot]>,
	allySupport: Record<TeamId, TeamAllySupport> = {
		teamA: defaultTeamAllySupport(),
		teamB: defaultTeamAllySupport()
	},
	sideConditions: Record<TeamId, TeamSideConditions> = {
		teamA: defaultTeamSideConditions(),
		teamB: defaultTeamSideConditions()
	},
	fieldConditions: FieldConditions = defaultFieldConditions()
): DamageMatrixAttacker[] {
	const attackers: DamageMatrixAttacker[] = [];
	// Derived once from all 4 slots regardless of team — a Ruin ability or
	// Fairy Aura applies field-wide (see `fieldAbilities.ts`), not per
	// attacker/side.
	const fieldAbilities = fieldAbilityFlags([...sides.teamA, ...sides.teamB], fieldConditions);

	for (const teamId of ['teamA', 'teamB'] as TeamId[]) {
		const otherTeamId = OTHER_TEAM[teamId];
		const opponentSlots = sides[otherTeamId];
		const opponents = opponentSlots.filter((slot) => slot.species);
		const own: TeamContext = {
			support: allySupport[teamId],
			sideConditions: sideConditions[teamId]
		};
		const opponent: TeamContext = {
			support: allySupport[otherTeamId],
			sideConditions: sideConditions[otherTeamId]
		};

		for (const [attacker, ally] of pairings(sides[teamId])) {
			if (!attacker.species) continue;

			attackers.push({
				attacker,
				opponents,
				rows: buildRows(
					attacker,
					ally,
					opponents,
					opponentSlots,
					own,
					opponent,
					fieldConditions,
					fieldAbilities
				)
			});
		}
	}

	return attackers;
}

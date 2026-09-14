import { Pokemon, Move, Field, calculate, type Result, type StatID } from '@smogon/calc';
import { GEN_NUM } from './generation';
import { FIXED_IV, LEVEL, STAT_ORDER, type StatPoints } from './format';
import type { TeamSlot } from '../stores/team.svelte';
import type { MoveItem } from './moves';

/**
 * Converts one stat's Pokemon Champions Stat Point investment into the
 * `@smogon/calc` EV that makes the library's own (EV-based) stat formula
 * land on the exact same final value Champions' rules would give.
 *
 * This works only because Champions battles are fixed at level 50: at that
 * level the formula's `* level / 100` step is an exact `* 0.5`, which
 * cancels out the usual `floor(EV / 4)` dilution — doubling a Stat Point's
 * EV contribution (`8*sp - 4` instead of `4*sp`) lands the halved value on
 * the same rounding step Champions' own flat "+1 stat per SP" would.
 * `calculate()` clones its `Pokemon` arguments internally, and `clone()`
 * rebuilds from `ivs`/`evs`/`nature`, not from a Pokemon's `rawStats` —
 * so converting to an equivalent EV up front (rather than overwriting
 * `rawStats` after construction) is what survives that clone.
 *
 * Verified in `damage.spec.ts` against `calcChampionsStat` (this app's
 * already-tested source of truth) for every SP 0..32, and — at SP=0,
 * the one point with no `floor(EV/4)` step to diverge on — directly
 * against `@smogon/calc`'s own exported `calcStat`.
 */
function spToEv(sp: number): number {
	return sp === 0 ? 0 : 8 * sp - 4;
}

function toEvs(statPoints: StatPoints): Record<StatID, number> {
	return Object.fromEntries(STAT_ORDER.map((stat) => [stat, spToEv(statPoints[stat])])) as Record<
		StatID,
		number
	>;
}

function allIvs(): Record<StatID, number> {
	return Object.fromEntries(STAT_ORDER.map((stat) => [stat, FIXED_IV])) as Record<StatID, number>;
}

/** Builds a `@smogon/calc` `Pokemon` from a `TeamSlot`'s build. */
export function toSmogonPokemon(slot: TeamSlot): Pokemon {
	if (!slot.species) throw new Error('toSmogonPokemon: slot has no species selected');

	return new Pokemon(GEN_NUM, slot.species.name, {
		level: LEVEL,
		ability: slot.ability ?? undefined,
		item: slot.item?.name,
		nature: slot.nature.name,
		ivs: allIvs(),
		evs: toEvs(slot.statPoints)
	});
}

function toSmogonMove(move: MoveItem, attacker: TeamSlot): Move {
	return new Move(GEN_NUM, move.name, {
		ability: attacker.ability ?? undefined,
		item: attacker.item?.name
	});
}

export interface DamageDisplay {
	/** e.g. "24.3 - 28.9" — a %HP min-max range, per CONTEXT.md's Damage Matrix cell convention. */
	percentRange: string;
	/** e.g. "guaranteed 3HKO", "48.4% chance to 2HKO" — `@smogon/calc`'s own annotation text. */
	koChance: string;
	result: Result;
}

function toPercent(damage: number, maxHP: number): string {
	return (Math.floor((damage * 1000) / maxHP) / 10).toFixed(1);
}

/**
 * Computes damage for one (attacker, move, target) triple. Always uses a
 * `gameType: 'Doubles'` field — this app never models Singles — even
 * though no doubles-specific field flags (Follow Me redirection, spread
 * damage, ally support, ...) are wired up yet.
 */
export function computeDamage(attacker: TeamSlot, move: MoveItem, target: TeamSlot): DamageDisplay {
	const attackerMon = toSmogonPokemon(attacker);
	const targetMon = toSmogonPokemon(target);
	const smogonMove = toSmogonMove(move, attacker);
	const field = new Field({ gameType: 'Doubles' });

	const result = calculate(GEN_NUM, attackerMon, targetMon, smogonMove, field);
	const [min, max] = result.range();
	const maxHP = targetMon.maxHP();

	return {
		percentRange: `${toPercent(min, maxHP)} - ${toPercent(max, maxHP)}`,
		// err: false — a Status move, or a move the target is immune to, has
		// a top damage roll of 0, which @smogon/calc's own default (err:
		// true) treats as an error and throws on rather than reporting.
		koChance: result.kochance(false).text,
		result
	};
}

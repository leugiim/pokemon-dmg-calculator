import { Pokemon, Move, Field, calculate, type Result, type StatID } from '@smogon/calc';
import { GEN_NUM } from './generation';
import { FIXED_IV, LEVEL, STAT_ORDER, type StatPoints } from './format';
import type { TeamAllySupport, TeamSideConditions, TeamSlot } from '../stores/team.svelte';
import type { Terrain, Weather } from '../stores/field.svelte';
import type { MoveItem } from './moves';
import { attackerSideFlags, defenderSideFlags } from './allySupport';
import { sideConditionFlags } from './sideConditions';

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

/**
 * Per-calculation overrides layered on top of a move's own data — both
 * default to `@smogon/calc`'s own behavior when omitted: no crit assumed
 * (`isCrit`, #14), and (for a multi-hit move) 3 hits, or the attacker's
 * ability's fixed count when it has one, e.g. Skill Link (`hits`, #15).
 * See `multiHitRange` for which moves accept a `hits` override at all.
 */
export interface DamageOptions {
	isCrit?: boolean;
	hits?: number;
	/**
	 * The attacker's own ally, used to auto-derive `attackerSide`'s Battery,
	 * Power Spot and Steely Spirit flags from its `ability` (ADR-0003, #13)
	 * — Helping Hand/Tailwind and a manual static override come from
	 * `attackerAllySupport` alone and apply even when this is omitted (e.g.
	 * a lone on-demand calculation with no real ally object to pass).
	 */
	attackerAlly?: TeamSlot;
	/**
	 * `attackerAlly`'s own team's shared manual ally-support overrides
	 * (ADR-0003, #13) — omit to fall back to pure ability-based
	 * auto-derivation with no override capability at all.
	 */
	attackerAllySupport?: TeamAllySupport;
	/**
	 * The target's own ally, used (together with `defenderAllySupport`) to
	 * derive `defenderSide`'s Friend Guard flag (ADR-0003, #13). See
	 * `attackerAlly`.
	 */
	defenderAlly?: TeamSlot;
	/** `defenderAlly`'s own team's shared manual ally-support overrides. See `attackerAllySupport`. */
	defenderAllySupport?: TeamAllySupport;
	/**
	 * The target's own team's shared side conditions (screens, Stealth
	 * Rock, Spikes) — merged onto `defenderSide` alongside Friend Guard.
	 * Unlike ally support, these have no Auto mode, so there's nothing to
	 * "omit to fall back to" — omitting this just means none are active.
	 */
	defenderSideConditions?: TeamSideConditions;
	/** Field-wide weather (#24) — shared by both sides, unlike ally support. */
	weather?: Weather;
	/** Field-wide terrain (#24). See `weather`. */
	terrain?: Terrain;
}

function toSmogonMove(move: MoveItem, attacker: TeamSlot, options: DamageOptions = {}): Move {
	return new Move(GEN_NUM, move.name, {
		ability: attacker.ability ?? undefined,
		item: attacker.item?.name,
		isCrit: options.isCrit,
		hits: options.hits
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
 * though some doubles-specific mechanics (Follow Me redirection, spread
 * damage, ...) still aren't wired up. `options` layers the calculation-time
 * overrides callers opt into per move (assume-crit, a manual multi-hit
 * count, ally support, weather, terrain) on top of the move/attacker's own
 * data — see `DamageOptions`.
 */
export function computeDamage(
	attacker: TeamSlot,
	move: MoveItem,
	target: TeamSlot,
	options: DamageOptions = {}
): DamageDisplay {
	const attackerMon = toSmogonPokemon(attacker);
	const targetMon = toSmogonPokemon(target);
	const smogonMove = toSmogonMove(move, attacker, options);
	// attackerSideFlags/defenderSideFlags/sideConditionFlags are called
	// unconditionally — none of them require their TeamSlot/TeamAllySupport
	// arguments to be present (see attackerSideFlags' own doc comment): a
	// caller that passes attackerAllySupport with no attackerAlly still gets
	// Helping Hand/Tailwind/a forced static override applied, rather than
	// silently losing the whole side to all-false defaults. The two
	// defenderSide producers currently return disjoint flag names
	// (isFriendGuard vs. isProtected/isReflect/.../spikes) — if that ever
	// stops being true, the second spread below would silently win.
	const field = new Field({
		gameType: 'Doubles',
		weather: options.weather,
		terrain: options.terrain,
		attackerSide: attackerSideFlags(options.attackerAlly, options.attackerAllySupport),
		defenderSide: {
			...defenderSideFlags(options.defenderAlly, options.defenderAllySupport),
			...(options.defenderSideConditions ? sideConditionFlags(options.defenderSideConditions) : {})
		}
	});

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

import { NATURES, type StatID } from '@smogon/calc';

export type NatureName = Extract<keyof typeof NATURES, string>;

/**
 * Pokemon Champions' format rules — always in effect, no toggle:
 * https://champsdex.com/posts/pokemon-champions-ev-iv-stats-guide-2026/
 *
 * - Every Pokémon battles at level 50.
 * - IVs are fixed at 31 in every stat (no IV customization at all).
 * - The traditional 0-252-per-stat/508-total EV pool is replaced by
 *   Stat Points (SP): 0-32 per stat, 66 total across all six stats.
 *   Unlike EVs, an SP is a flat +1 to the final stat — there's no
 *   `floor(EV / 4)` step, so this does *not* plug into the standard
 *   games' stat formula and needs its own (see {@link calcStat}).
 */
export const LEVEL = 50;
export const FIXED_IV = 31;
export const MAX_SP_PER_STAT = 32;
export const MAX_SP_TOTAL = 66;

/** A Pokémon's Stat Point allocation across its six stats. */
export type StatPoints = Record<StatID, number>;

export const STAT_ORDER: StatID[] = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];

export const STAT_LABELS: Record<StatID, string> = {
	hp: 'HP',
	atk: 'Atk',
	def: 'Def',
	spa: 'SpA',
	spd: 'SpD',
	spe: 'Spe'
};

export function emptyStatPoints(): StatPoints {
	return { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
}

export function totalStatPoints(sp: StatPoints): number {
	return sp.hp + sp.atk + sp.def + sp.spa + sp.spd + sp.spe;
}

export interface NatureInfo {
	name: NatureName;
	/** Stat this nature raises by 10% — same as `minus` for a neutral nature. */
	plus: StatID;
	/** Stat this nature lowers by 10% — same as `plus` for a neutral nature. */
	minus: StatID;
}

/** All 25 natures, sorted alphabetically. A neutral nature has `plus === minus`. */
export const allNatures: NatureInfo[] = Object.entries(NATURES)
	.map(([name, [plus, minus]]) => ({ name: name as NatureName, plus, minus }))
	.sort((a, b) => a.name.localeCompare(b.name));

/** Default nature for a freshly picked (or reset) team slot — no +/- on any stat. */
export const NEUTRAL_NATURE: NatureInfo = allNatures.find((n) => n.name === 'Hardy')!;

function natureModifier(nature: NatureInfo, stat: StatID): number {
	if (stat === 'hp') return 1; // nature never affects HP
	if (nature.plus === nature.minus) return 1;
	if (stat === nature.plus) return 1.1;
	if (stat === nature.minus) return 0.9;
	return 1;
}

/**
 * Final stat value at level 50 under Champions' rules, given a base
 * stat, the SP invested in it, and the Pokémon's nature. Not to be
 * confused with `@smogon/calc`'s own `calcStat`, which implements the
 * mainline games' `floor(EV / 4)`-based formula — Champions' Stat
 * Points don't plug into that.
 */
export function calcChampionsStat(
	base: number,
	stat: StatID,
	sp: number,
	nature: NatureInfo
): number {
	const raw = Math.floor(((2 * base + FIXED_IV) * LEVEL) / 100);
	if (stat === 'hp') {
		return raw + LEVEL + 10 + sp;
	}
	return Math.floor((raw + 5 + sp) * natureModifier(nature, stat));
}

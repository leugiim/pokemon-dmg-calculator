/** The six stats a Stat Point allocation is keyed by. */
export type StatKey = 'hp' | 'atk' | 'def' | 'spa' | 'spd' | 'spe';

export const STAT_KEYS: readonly StatKey[] = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];

/** Pokémon Champions: 0-32 Stat Points per stat, 66 across all six. */
export const MAX_STAT_POINTS_PER_STAT = 32;

export type StatPointsData = Record<StatKey, number>;

/**
 * A Pokémon's build as plain, serializable data: the format both tools
 * agree on and what gets persisted (ADR-0007). It deliberately has no
 * `@smogon/calc` objects and no Svelte runes — the calculator's `TeamSlot`
 * turns it into live state with `TeamSlot.fromData` and back with `toData`.
 *
 * Everything is a display name (`"Rotom-Wash"`, `"Sitrus Berry"`), the same
 * spelling a PokePaste uses; the calculator resolves them against its own
 * data and reports whatever it can't match. Only the build is stored: in-
 * battle "what ifs" (stat stages, fainted allies, crit/hit-count options)
 * aren't part of a set. Level (50) and IVs (31) are fixed by the format.
 */
export interface PokemonSetData {
	species: string;
	/** What the planner shows instead of the species name, if the paste had one. */
	nickname?: string;
	item?: string;
	ability?: string;
	nature?: string;
	statPoints: StatPointsData;
	/** Up to 4 move names. */
	moves: string[];
}

export function emptyStatPointsData(): StatPointsData {
	return { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
}

/** Clamps to a whole number in 0-32. */
export function clampStatPoints(value: number): number {
	if (!Number.isFinite(value)) return 0;
	return Math.max(0, Math.min(MAX_STAT_POINTS_PER_STAT, Math.round(value)));
}

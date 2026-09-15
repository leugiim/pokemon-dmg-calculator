import type { State } from '@smogon/calc';

// `@smogon/calc`'s own `Weather`/`Terrain` types aren't re-exported from
// its package root (only `State`, `Field`, `Side`, ... are) — derived from
// `State.Field`'s own fields instead of reaching into an internal,
// unexported module path.
export type Weather = NonNullable<State.Field['weather']>;
export type Terrain = NonNullable<State.Field['terrain']>;

/**
 * Field-wide weather and terrain (`@smogon/calc`'s own `Field`, #24) —
 * global to the whole battlefield, shared by both sides alike, unlike ally
 * support (`TeamAllySupport`, per team) or a move's own calculation
 * overrides (per slot). `null` means "none" for either.
 */
export interface FieldConditions {
	weather: Weather | null;
	terrain: Terrain | null;
}

export function defaultFieldConditions(): FieldConditions {
	return { weather: null, terrain: null };
}

/**
 * Every selectable weather value except `Hail` — gen 9 replaced it with
 * `Snow`, and the two aren't equivalent (e.g. Snow's Ice-type Defense
 * boost only triggers on `Snow`, never `Hail` — see `@smogon/calc`'s
 * `mechanics/gen789.ts`), so offering `Hail` here would silently produce
 * an incomplete result for this app's fixed gen-9 ruleset (`GEN_NUM`).
 */
export const WEATHER_OPTIONS: Weather[] = [
	'Sun',
	'Rain',
	'Sand',
	'Snow',
	'Harsh Sunshine',
	'Heavy Rain',
	'Strong Winds'
];

export const TERRAIN_OPTIONS: Terrain[] = ['Electric', 'Grassy', 'Psychic', 'Misty'];

export const field = $state<FieldConditions>(defaultFieldConditions());

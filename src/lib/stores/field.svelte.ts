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
 *
 * `gravity` (the move Gravity's field effect — grounds Flying-types and
 * Levitate/Air Balloon holders, letting Ground-type moves hit them) is a
 * plain boolean here, not nullable like the flags below: it's a move
 * effect, not derived from any Pokemon's `ability`, so there's no Auto
 * mode to fall back to — off by default, same as `TeamSideConditions`.
 *
 * The four Ruin abilities (Vessel/Tablets/Sword/Beads, held by Ting-Lu,
 * Wo-Chien, Chien-Pao and Chi-Yu respectively) plus Fairy Aura (Xerneas)
 * belong here rather than on `TeamAllySupport` for the same reason:
 * `@smogon/calc`'s own mechanics apply each one field-wide — to every
 * Pokemon on the field (Fairy Aura: every Fairy-type move used by anyone),
 * not just one team's own side — from a single shared `Field.isX` flag
 * (see `calc/fieldAbilities.ts`), so a per-team override wouldn't match how
 * the ability actually works. `null` means Auto (derive from whether any
 * of the 4 Pokemon on the field has the ability), matching the
 * Auto/On/Off convention `TeamAllySupport`'s own static flags use.
 */
export interface FieldConditions {
	weather: Weather | null;
	terrain: Terrain | null;
	gravity: boolean;
	vesselOfRuin: boolean | null;
	tabletsOfRuin: boolean | null;
	swordOfRuin: boolean | null;
	beadsOfRuin: boolean | null;
	fairyAura: boolean | null;
}

export function defaultFieldConditions(): FieldConditions {
	return {
		weather: null,
		terrain: null,
		gravity: false,
		vesselOfRuin: null,
		tabletsOfRuin: null,
		swordOfRuin: null,
		beadsOfRuin: null,
		fairyAura: null
	};
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

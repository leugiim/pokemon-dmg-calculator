import type { FieldConditions, Terrain, Weather } from '../stores/field.svelte';

/**
 * Abilities that set a weather or terrain on switch-in, keyed by ability
 * name. Abilities that set the same condition through a different
 * mechanic (Orichalcum Pulse → Sun, Hadron Engine → Electric Terrain,
 * Seed Sower → Grassy Terrain) are included, since they read the same
 * from the user's side: pick the Pokémon, the condition is up.
 */
const WEATHER_ENTRY: Record<string, Weather> = {
	Drought: 'Sun',
	'Orichalcum Pulse': 'Sun',
	Drizzle: 'Rain',
	'Sand Stream': 'Sand',
	'Snow Warning': 'Snow',
	'Desolate Land': 'Harsh Sunshine',
	'Primordial Sea': 'Heavy Rain',
	'Delta Stream': 'Strong Winds'
};

const TERRAIN_ENTRY: Record<string, Terrain> = {
	'Electric Surge': 'Electric',
	'Hadron Engine': 'Electric',
	'Grassy Surge': 'Grassy',
	'Seed Sower': 'Grassy',
	'Misty Surge': 'Misty',
	'Psychic Surge': 'Psychic'
};

/**
 * Presets `field`'s weather and/or terrain for `ability`, if it's a known
 * entry-effect ability; a no-op otherwise. Only ever sets, never clears —
 * and only fires when the ability is picked, so the user can still
 * override the condition by hand afterwards.
 */
export function applyEntryEffect(
	ability: string | null,
	field: Pick<FieldConditions, 'weather' | 'terrain'>
): void {
	if (!ability) return;
	const weather = WEATHER_ENTRY[ability];
	if (weather) field.weather = weather;
	const terrain = TERRAIN_ENTRY[ability];
	if (terrain) field.terrain = terrain;
}

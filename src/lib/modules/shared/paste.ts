import { Sets, type PokemonSet } from '@pkmn/sets';
import {
	clampStatPoints,
	emptyStatPointsData,
	STAT_KEYS,
	type PokemonSetData
} from './pokemon-set';

/**
 * Parses one PokePaste/Showdown-export block into a set. Returns `null`
 * when there's no species to speak of. Gender, Level, Shiny, Tera Type and
 * IVs are read by `@pkmn/sets` but dropped: the format fixes level and IVs,
 * and neither tool models the rest.
 *
 * The `EVs:` line is taken as raw Stat Points (0-32, clamped), the same
 * convention `exportPokePaste`/`importPokePaste` use in the calculator —
 * never scaled as if it were a real 0-252 EV.
 */
export function parsePokePasteSet(text: string): PokemonSetData | null {
	const parsed = Sets.importSet(text.trim());
	// `importSet` returns undefined for text with nothing to parse.
	if (!parsed?.species) return null;

	const statPoints = emptyStatPointsData();
	for (const stat of STAT_KEYS) {
		const value = parsed.evs?.[stat];
		if (typeof value === 'number') statPoints[stat] = clampStatPoints(value);
	}

	const set: PokemonSetData = {
		species: parsed.species,
		statPoints,
		moves: (parsed.moves ?? []).filter((name): name is string => !!name).slice(0, 4)
	};
	if (parsed.name && parsed.name !== parsed.species) set.nickname = parsed.name;
	if (parsed.item) set.item = parsed.item;
	if (parsed.ability) set.ability = parsed.ability;
	if (parsed.nature) set.nature = parsed.nature;
	return set;
}

/** Parses a whole team paste: one set per blank-line separated block. Blocks without a species are skipped. */
export function parseTeamPaste(text: string): PokemonSetData[] {
	return text
		.split(/\n\s*\n/)
		.map((block) => block.trim())
		.filter(Boolean)
		.map(parsePokePasteSet)
		.filter((set): set is PokemonSetData => set !== null);
}

/** Level every Pokémon battles at in Pokémon Champions; written on export. */
const EXPORT_LEVEL = 50;

/**
 * Renders a set as a PokePaste/Showdown-export block, the format
 * `parsePokePasteSet` reads. Stat Points go into the `EVs:` line as they
 * are (0-32), the convention this app uses for pastes both ways.
 */
export function exportPokePasteSet(set: PokemonSetData): string {
	const paste: Partial<PokemonSet> = {
		name: set.nickname,
		species: set.species,
		item: set.item,
		ability: set.ability,
		moves: set.moves,
		nature: set.nature,
		evs: set.statPoints,
		level: EXPORT_LEVEL
	};
	return Sets.exportSet(paste).trim();
}

/** A whole team as one paste: a block per Pokémon, separated by a blank line. */
export function exportTeamPaste(sets: PokemonSetData[]): string {
	return sets.map(exportPokePasteSet).join('\n\n');
}

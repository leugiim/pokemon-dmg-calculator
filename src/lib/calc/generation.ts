import { Generations, toID } from '@smogon/calc';
import { NONSTANDARD_SPECIES } from './nonstandardSpecies';

/**
 * We only target the current generation (VGC is always played on the
 * latest one) — no generation switcher for now.
 */
export const GEN_NUM = 9;

export const gen = Generations.get(GEN_NUM);

/**
 * All species available in this generation, sorted alphabetically —
 * excluding CAP (fan-made) mons and other non-standard entries that
 * aren't real, in-game-obtainable Pokémon. See {@link NONSTANDARD_SPECIES}.
 */
export const allSpecies = [...gen.species]
	.filter((s) => !NONSTANDARD_SPECIES.has(s.name))
	.sort((a, b) => a.name.localeCompare(b.name));

export type SpeciesItem = (typeof allSpecies)[number];

export { toID };

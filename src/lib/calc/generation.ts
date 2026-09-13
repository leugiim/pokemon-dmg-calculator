import { Generations, toID } from '@smogon/calc';

/**
 * We only target the current generation (VGC is always played on the
 * latest one) — no generation switcher for now.
 */
export const GEN_NUM = 9;

export const gen = Generations.get(GEN_NUM);

/** All species available in this generation, sorted alphabetically. */
export const allSpecies = [...gen.species].sort((a, b) => a.name.localeCompare(b.name));

export type SpeciesItem = (typeof allSpecies)[number];

export { toID };

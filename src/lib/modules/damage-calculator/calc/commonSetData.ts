import type { PokemonSetData } from '$lib/modules/shared';
import { TeamSlot } from '../stores/team.svelte';
import { applyCommonSet, commonSetsFor } from './commonSets';
import { allSpecies, type SpeciesItem } from './generation';
import { findByName } from './pokepaste';
import { slotToData } from './setData';

/**
 * A common build (`commonSets.ts`) for the species called `name`, as plain
 * data, or `null` when the name isn't a species this app knows or it has
 * no common sets. Uses the first set listed, which is the species' main one.
 * The species keeps its own spelling, e.g. `"Incineroar"`.
 */
export function commonSetData(name: string): PokemonSetData | null {
	const species = findByName<SpeciesItem>(allSpecies, name);
	if (!species) return null;
	const [first] = commonSetsFor(species);
	if (!first) return null;

	const slot = new TeamSlot();
	slot.species = species;
	applyCommonSet(slot, first);
	return slotToData(slot);
}

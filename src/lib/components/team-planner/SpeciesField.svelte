<script lang="ts">
	import PokemonCombobox from '$lib/components/shared/species/PokemonCombobox.svelte';
	import { findSpecies, type SpeciesItem } from '$lib/modules/shared/species/generation';

	/**
	 * A Pokémon picked with the calculator's species combobox, but held as
	 * its name (text), which is how the planner stores it. A name that isn't
	 * a known species (a nickname or free text saved by the old planner) is
	 * shown as it is, with a button to clear it and pick a real one.
	 */
	let {
		value = $bindable(''),
		onchange = undefined
	}: {
		value?: string;
		onchange?: (value: string) => void;
	} = $props();

	const species = $derived(findSpecies(value));
	const unknown = $derived(value.trim() !== '' && !species);

	function pick(next: SpeciesItem | null) {
		value = next ? next.name : '';
		onchange?.(value);
	}
</script>

{#if unknown}
	<div
		class="flex items-center gap-2 rounded-md border border-amber-700 bg-amber-950/30 px-2 py-1.5 text-sm text-amber-200"
	>
		<span class="min-w-0 flex-1 truncate" title="Not a known species">{value}</span>
		<button
			type="button"
			aria-label="Clear {value}"
			title="Clear, then pick a Pokémon from the list"
			onclick={() => pick(null)}
			class="text-amber-300 hover:text-amber-100"
		>
			&times;
		</button>
	</div>
{:else}
	<PokemonCombobox bind:selected={() => species ?? null, pick} />
{/if}

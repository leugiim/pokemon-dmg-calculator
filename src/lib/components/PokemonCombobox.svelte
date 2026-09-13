<script lang="ts">
	import { allSpecies, type SpeciesItem } from '$lib/calc/generation';
	import SearchableCombobox from './SearchableCombobox.svelte';
	import SpeciesSprite from './SpeciesSprite.svelte';

	let { selected = $bindable(null) }: { selected?: SpeciesItem | null } = $props();
</script>

<SearchableCombobox
	items={allSpecies}
	bind:selected
	getLabel={(s) => s.name}
	placeholder="Select a Pokémon…"
>
	{#snippet icon(species: SpeciesItem)}
		<SpeciesSprite speciesName={species.name} size={24} />
	{/snippet}
</SearchableCombobox>

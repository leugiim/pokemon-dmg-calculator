<script lang="ts">
	import {
		pickableSpecies,
		speciesLabel,
		type SpeciesItem
	} from '$lib/modules/damage-calculator/calc/generation';
	import SearchableCombobox from '$lib/components/shared/ui/SearchableCombobox.svelte';
	import SpeciesSprite from '../display/SpeciesSprite.svelte';

	let { selected = $bindable(null) }: { selected?: SpeciesItem | null } = $props();
</script>

<SearchableCombobox
	items={pickableSpecies}
	bind:selected
	getLabel={speciesLabel}
	placeholder="Select a Pokémon…"
>
	{#snippet icon(species: SpeciesItem)}
		<SpeciesSprite {species} size={24} />
	{/snippet}
</SearchableCombobox>

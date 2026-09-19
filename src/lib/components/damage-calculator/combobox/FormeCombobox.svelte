<script lang="ts">
	import { formsOf, type SpeciesItem } from '$lib/modules/shared/species/generation';
	import SearchableCombobox from '$lib/components/shared/ui/SearchableCombobox.svelte';

	let {
		selected = $bindable(null),
		disabled = false
	}: { selected?: SpeciesItem | null; disabled?: boolean } = $props();

	const forms = $derived(selected ? formsOf(selected) : []);
</script>

{#if forms.length > 1}
	<SearchableCombobox
		items={forms}
		bind:selected={
			() => forms.find((f) => f.species.name === selected?.name) ?? null,
			(f) => {
				if (f) selected = f.species;
			}
		}
		getLabel={(f) => f.label}
		clearable={false}
		{disabled}
		class="max-w-20 min-w-0 flex-1"
	/>
{/if}

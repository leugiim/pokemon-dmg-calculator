<script lang="ts">
	import { abilitiesOf, type AbilityOption } from '$lib/calc/abilities';
	import type { SpeciesItem } from '$lib/calc/generation';
	import SearchableCombobox from './SearchableCombobox.svelte';

	let {
		species,
		selected = $bindable(null),
		disabled = false
	}: { species: SpeciesItem | null; selected?: string | null; disabled?: boolean } = $props();

	let options = $state<AbilityOption[]>([]);
	let loading = $state(false);

	$effect(() => {
		const current = species;
		if (!current) {
			options = [];
			return;
		}
		loading = true;
		abilitiesOf(current).then((result) => {
			// The species may have changed again while this was in flight.
			if (current === species) {
				options = result;
				loading = false;
			}
		});
	});

	function label(option: AbilityOption): string {
		return option.name;
	}
</script>

<SearchableCombobox
	items={options}
	bind:selected={
		() => options.find((o) => o.name === selected) ?? null, (o) => (selected = o?.name ?? null)
	}
	getLabel={label}
	placeholder={loading ? 'Loading…' : 'Select an ability…'}
	disabled={disabled || loading}
/>

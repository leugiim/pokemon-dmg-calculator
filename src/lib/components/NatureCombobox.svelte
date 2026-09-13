<script lang="ts">
	import { allNatures, STAT_LABELS, type NatureInfo } from '$lib/calc/format';
	import SearchableCombobox from './SearchableCombobox.svelte';

	let { selected = $bindable(), disabled = false }: { selected: NatureInfo; disabled?: boolean } =
		$props();

	function label(nature: NatureInfo): string {
		if (nature.plus === nature.minus) return nature.name;
		return `${nature.name} (+${STAT_LABELS[nature.plus]}/−${STAT_LABELS[nature.minus]})`;
	}
</script>

<SearchableCombobox
	items={allNatures}
	bind:selected
	getLabel={label}
	placeholder="Select a nature…"
	clearable={false}
	{disabled}
/>

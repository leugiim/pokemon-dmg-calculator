<script lang="ts">
	import { allItems, type HeldItem } from '$lib/calc/items';
	import SearchableCombobox from './SearchableCombobox.svelte';

	let { selected = $bindable(null) }: { selected?: HeldItem | null } = $props();
</script>

<SearchableCombobox
	items={allItems}
	bind:selected
	getLabel={(i) => i.name}
	placeholder="Select an item…"
/>

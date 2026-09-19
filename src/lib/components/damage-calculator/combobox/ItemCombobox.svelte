<script lang="ts">
	import { allItems, type HeldItem } from '$lib/modules/damage-calculator/calc/items';
	import ItemIcon from '../display/ItemIcon.svelte';
	import SearchableCombobox from '$lib/components/shared/ui/SearchableCombobox.svelte';

	let {
		selected = $bindable(null),
		disabled = false
	}: { selected?: HeldItem | null; disabled?: boolean } = $props();
</script>

<SearchableCombobox
	items={allItems}
	bind:selected
	getLabel={(i) => i.name}
	placeholder="Select an item…"
	{disabled}
>
	{#snippet icon(item: HeldItem)}
		<ItemIcon {item} size={24} />
	{/snippet}
</SearchableCombobox>

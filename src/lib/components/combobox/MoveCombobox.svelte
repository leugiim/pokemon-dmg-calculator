<script lang="ts">
	import { allMoves, type MoveItem } from '$lib/calc/moves';
	import SearchableCombobox from '../ui/SearchableCombobox.svelte';

	let {
		selected = $bindable(null),
		disabled = false
	}: { selected?: MoveItem | null; disabled?: boolean } = $props();
</script>

<SearchableCombobox
	items={allMoves}
	bind:selected
	getLabel={(m) => m.name}
	placeholder="Select a move…"
	{disabled}
/>

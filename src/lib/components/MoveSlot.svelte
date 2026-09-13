<script lang="ts">
	import type { MoveItem } from '$lib/calc/moves';
	import MoveCategoryIcon from './MoveCategoryIcon.svelte';
	import MoveCombobox from './MoveCombobox.svelte';
	import TypeBadge from './TypeBadge.svelte';

	let {
		selected = $bindable(null),
		disabled = false
	}: { selected?: MoveItem | null; disabled?: boolean } = $props();
</script>

<div class="flex w-full items-center gap-2">
	<div class="flex-1">
		<MoveCombobox bind:selected {disabled} />
	</div>
	<div class="flex w-20 shrink-0 justify-center">
		{#if selected}
			<TypeBadge type={selected.type} />
		{/if}
	</div>
	<div class="flex w-8 shrink-0 justify-center">
		{#if selected?.category}
			<MoveCategoryIcon category={selected.category} />
		{/if}
	</div>
	<span class="w-8 shrink-0 text-right text-[11px] font-semibold text-gray-700">
		{selected ? selected.basePower || '–' : ''}
	</span>
</div>

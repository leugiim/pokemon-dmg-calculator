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

<div class="flex w-full items-center gap-1">
	<div class="flex-1">
		<MoveCombobox bind:selected {disabled} />
	</div>
	<div class="flex w-20 shrink-0 justify-center">
		{#if selected}
			<TypeBadge type={selected.type} />
		{:else}
			<span
				class="flex h-5 w-16 items-center justify-center rounded bg-gray-800 text-[10px] text-gray-500"
				>–</span
			>
		{/if}
	</div>
	<div class="flex w-8 shrink-0 justify-center">
		{#if selected?.category}
			<MoveCategoryIcon category={selected.category} />
		{:else}
			<span class="text-[11px] text-gray-500">–</span>
		{/if}
	</div>
	<span class="w-8 shrink-0 text-right text-[11px] font-semibold text-gray-500">
		{selected?.basePower || '–'}
	</span>
</div>

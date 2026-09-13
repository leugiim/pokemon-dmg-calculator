<script lang="ts">
	import type { MoveItem } from '$lib/calc/moves';
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
	<div class="flex w-14 shrink-0 justify-center">
		{#if selected}
			<TypeBadge type={selected.type} />
		{/if}
	</div>
	<span class="w-8 shrink-0 text-right text-[11px] font-semibold text-gray-700">
		{selected ? selected.basePower || '–' : ''}
	</span>
</div>

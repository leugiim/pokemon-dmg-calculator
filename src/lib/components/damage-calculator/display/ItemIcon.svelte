<script lang="ts">
	import { ITEM_SPRITE_OFFSETS } from '$lib/modules/damage-calculator/calc/item-sprite-offsets';
	import type { HeldItem } from '$lib/modules/damage-calculator/calc/items';

	let { item, size = 24 }: { item: HeldItem; size?: number } = $props();

	const ICON_SIZE = 24;
	const COLUMNS = 16;
	const SHEET_URL = 'https://play.pokemonshowdown.com/sprites/itemicons-sheet.png';

	const offset = $derived(ITEM_SPRITE_OFFSETS[item.id]);
	const scale = $derived(size / ICON_SIZE);
</script>

{#if offset !== undefined}
	{@const col = offset % COLUMNS}
	{@const row = Math.floor(offset / COLUMNS)}
	<div
		class="shrink-0"
		style="width: {size}px; height: {size}px; background-image: url({SHEET_URL}); background-position: {-col *
			ICON_SIZE *
			scale}px {-row * ICON_SIZE * scale}px; background-size: {COLUMNS *
			ICON_SIZE *
			scale}px auto; image-rendering: pixelated;"
		role="img"
		aria-label={item.name}
	></div>
{:else}
	<div
		class="flex shrink-0 items-center justify-center rounded-full border border-amber-600 bg-amber-950 font-bold text-amber-400"
		style="width: {size}px; height: {size}px; font-size: {Math.round(size * 0.42)}px;"
		title="No icon found for {item.name}"
	>
		?
	</div>
{/if}

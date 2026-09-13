<script lang="ts">
	import { spriteUrl, altSpriteUrl } from '$lib/calc/sprites';

	let { speciesName, size = 24 }: { speciesName: string; size?: number } = $props();

	let triedAlt = $state(false);
	let failed = $state(false);

	// Reset fallback state whenever the species changes.
	$effect(() => {
		if (speciesName) {
			triedAlt = false;
			failed = false;
		}
	});

	const src = $derived(triedAlt ? altSpriteUrl(speciesName) : spriteUrl(speciesName));

	function onError() {
		if (!triedAlt) {
			triedAlt = true;
		} else {
			failed = true;
		}
	}
</script>

{#if failed}
	<div
		class="flex shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] text-gray-400"
		style="width: {size}px; height: {size}px;"
	>
		?
	</div>
{:else}
	<img
		{src}
		alt={speciesName}
		width={size}
		height={size}
		class="shrink-0 object-contain"
		style="width: {size}px; height: {size}px;"
		onerror={onError}
	/>
{/if}

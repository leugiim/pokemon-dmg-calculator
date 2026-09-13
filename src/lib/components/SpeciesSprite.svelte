<script lang="ts">
	import { spriteUrl, altSpriteUrl } from '$lib/calc/sprites';
	import type { SpeciesItem } from '$lib/calc/generation';

	let { species, size = 24 }: { species: SpeciesItem; size?: number } = $props();

	let triedAlt = $state(false);
	let failed = $state(false);

	// Reset fallback state whenever the species changes.
	$effect(() => {
		if (species) {
			triedAlt = false;
			failed = false;
		}
	});

	const src = $derived(triedAlt ? altSpriteUrl(species) : spriteUrl(species));

	function onError() {
		if (!triedAlt) {
			triedAlt = true;
		} else {
			failed = true;
		}
	}
</script>

{#if failed}
	<!-- Distinct from the "no Pokémon picked" placeholder: this one means we
	     have a species but genuinely couldn't find art for it (an amber
	     "something's wrong" look, not the neutral "nothing here yet" gray). -->
	<div
		class="flex shrink-0 items-center justify-center rounded-full border border-amber-600 bg-amber-950 font-bold text-amber-400"
		style="width: {size}px; height: {size}px; font-size: {Math.round(size * 0.42)}px;"
		title="No sprite found for {species.name}"
	>
		?
	</div>
{:else}
	<img
		{src}
		alt={species.name}
		width={size}
		height={size}
		class="shrink-0 object-contain"
		style="width: {size}px; height: {size}px;"
		onerror={onError}
	/>
{/if}

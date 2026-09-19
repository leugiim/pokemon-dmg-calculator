<script lang="ts">
	import { pokemonIconUrl } from '$lib/modules/team-planner';

	/**
	 * A small Pokémon icon; hides itself if the sprite doesn't exist. It's
	 * decorative when the name is written next to it; with `labelled` (an
	 * icon standing alone) it carries the name as its alt text and tooltip.
	 */
	let {
		name,
		species = undefined,
		labelled = false,
		class: className = 'h-6 w-6'
	}: {
		name: string;
		/** What the sprite is looked up by, when `name` is a nickname. */
		species?: string;
		labelled?: boolean;
		class?: string;
	} = $props();

	let failed = $state(false);

	$effect(() => {
		void name;
		failed = false;
	});
</script>

{#if !failed}
	<img
		src={pokemonIconUrl(species ?? name)}
		alt={labelled ? name : ''}
		title={labelled ? name : undefined}
		class="object-contain {className}"
		onerror={() => (failed = true)}
	/>
{/if}

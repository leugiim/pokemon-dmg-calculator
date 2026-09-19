<script lang="ts">
	import PokeIcon from './PokeIcon.svelte';

	/** A Pokémon's icon next to its name. `species` is for when `name` is a nickname. */
	let {
		name,
		species = undefined,
		class: className = ''
	}: { name: string; species?: string; class?: string } = $props();
</script>

<span class="inline-flex items-center gap-1 {className}">
	<PokeIcon {name} {species} />
	{name}
</span>

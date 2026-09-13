<script lang="ts">
	import type { TeamSlot } from '$lib/stores/team.svelte';
	import PokemonCombobox from './PokemonCombobox.svelte';
	import ItemCombobox from './ItemCombobox.svelte';
	import NatureCombobox from './NatureCombobox.svelte';
	import SpeciesSprite from './SpeciesSprite.svelte';
	import StatPointBars from './StatPointBars.svelte';
	import TypeBadge from './TypeBadge.svelte';

	let { slot, label }: { slot: TeamSlot; label: number } = $props();
</script>

<div
	class="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
>
	<span class="text-xs font-medium text-gray-400 uppercase">Pokémon {label}</span>

	<div class="flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
		{#if slot.species}
			<SpeciesSprite speciesName={slot.species.name} size={72} />
		{:else}
			<span class="text-3xl text-gray-300">?</span>
		{/if}
	</div>

	<div class="flex h-4 gap-1">
		{#if slot.species}
			{#each slot.species.types as type (type)}
				<TypeBadge {type} />
			{/each}
		{/if}
	</div>

	<div class="w-full">
		<PokemonCombobox bind:selected={slot.species} />
	</div>

	<div class="w-full">
		<ItemCombobox bind:selected={slot.item} />
	</div>

	<div class="w-full">
		<NatureCombobox bind:selected={slot.nature} />
	</div>

	<div class="w-full border-t border-gray-100 pt-2">
		<StatPointBars species={slot.species} nature={slot.nature} bind:statPoints={slot.statPoints} />
	</div>
</div>

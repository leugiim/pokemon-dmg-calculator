<script lang="ts">
	import type { TeamSlot } from '$lib/stores/team.svelte';
	import PokemonCombobox from './PokemonCombobox.svelte';
	import FormeSelect from './FormeSelect.svelte';
	import GenderToggle from './GenderToggle.svelte';
	import ItemCombobox from './ItemCombobox.svelte';
	import MoveSlot from './MoveSlot.svelte';
	import NatureCombobox from './NatureCombobox.svelte';
	import SpeciesSprite from './SpeciesSprite.svelte';
	import StatPointBars from './StatPointBars.svelte';
	import TypeBadge from './TypeBadge.svelte';

	let { slot, label }: { slot: TeamSlot; label: number } = $props();

	const disabled = $derived(!slot.species);
</script>

<div
	class="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
>
	<span class="text-xs font-medium text-gray-400 uppercase">Pokémon {label}</span>

	<div class="flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
		{#if slot.species}
			<SpeciesSprite species={slot.species} size={72} />
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

	<div class="flex w-full items-center gap-2">
		<div class="flex-1">
			<FormeSelect bind:selected={slot.species} {disabled} />
		</div>
		<GenderToggle bind:selected={slot.species} {disabled} />
	</div>

	<div class="w-full">
		<ItemCombobox bind:selected={slot.item} {disabled} />
	</div>

	<div class="w-full">
		<NatureCombobox bind:selected={slot.nature} {disabled} />
	</div>

	<div class="w-full border-t border-gray-100 pt-2">
		<StatPointBars species={slot.species} nature={slot.nature} bind:statPoints={slot.statPoints} />
	</div>

	<div class="flex w-full flex-col gap-1 border-t border-gray-100 pt-2">
		<div class="flex items-center gap-2 text-[10px] font-medium text-gray-400">
			<span class="flex-1">Move</span>
			<span class="w-14 shrink-0 text-center">Type</span>
			<span class="w-8 shrink-0 text-right">Power</span>
		</div>
		{#each [0, 1, 2, 3] as i (i)}
			<MoveSlot bind:selected={slot.moves[i]} {disabled} />
		{/each}
	</div>
</div>

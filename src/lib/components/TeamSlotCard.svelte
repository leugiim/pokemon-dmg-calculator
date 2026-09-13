<script lang="ts">
	import type { TeamSlot } from '$lib/stores/team.svelte';
	import AbilityCombobox from './AbilityCombobox.svelte';
	import PokemonCombobox from './PokemonCombobox.svelte';
	import FormeCombobox from './FormeCombobox.svelte';
	import GenderToggle from './GenderToggle.svelte';
	import ItemCombobox from './ItemCombobox.svelte';
	import MoveSlot from './MoveSlot.svelte';
	import NatureCombobox from './NatureCombobox.svelte';
	import SpeciesSprite from './SpeciesSprite.svelte';
	import StatPointBars from './StatPointBars.svelte';
	import TypeBadge from './TypeBadge.svelte';

	let { slot }: { slot: TeamSlot } = $props();

	const disabled = $derived(!slot.species);
</script>

<div class="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
	<!-- Build form: avatar+types on top (centered), then species/forme, item, nature. The
	     gender toggle is pinned to the right at the types' height, out of that flow. -->
	<div class="relative flex w-56 shrink-0 flex-col gap-2">
		<div class="flex items-center gap-4">
			<div class="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-gray-50">
				{#if slot.species}
					<SpeciesSprite species={slot.species} size={50} />
				{:else}
					<span class="text-3xl text-gray-300">?</span>
				{/if}
			</div>
			<div class="flex h-4 flex-col items-center justify-center gap-1">
				{#if slot.species}
					{#each slot.species.types as type (type)}
						<TypeBadge {type} />
					{/each}
				{/if}
			</div>
		</div>

		<div class="absolute top-[40px] right-0 flex h-4 items-center">
			<GenderToggle bind:selected={slot.species} {disabled} />
		</div>

		<div class="flex items-center gap-2">
			<div class="min-w-0 flex-1">
				<PokemonCombobox bind:selected={slot.species} />
			</div>
			<FormeCombobox bind:selected={slot.species} {disabled} />
		</div>

		<ItemCombobox bind:selected={slot.item} {disabled} />
		<AbilityCombobox species={slot.species} bind:selected={slot.ability} {disabled} />
		<NatureCombobox bind:selected={slot.nature} {disabled} />
	</div>

	<!-- Stats. -->
	<div class="min-w-0 flex-1 border-x border-gray-200 px-2">
		<StatPointBars species={slot.species} nature={slot.nature} bind:statPoints={slot.statPoints} />
	</div>

	<!-- Moves. -->
	<div class="flex min-w-0 flex-1 flex-col gap-1">
		<div class="flex items-center gap-2 text-[10px] font-medium text-gray-400">
			<span class="flex-1">Move</span>
			<span class="w-20 shrink-0 text-center">Type</span>
			<span class="w-8 shrink-0 text-center">Cat</span>
			<span class="w-8 shrink-0 text-right">Power</span>
		</div>
		{#each [0, 1, 2, 3] as i (i)}
			<MoveSlot bind:selected={slot.moves[i]} {disabled} />
		{/each}
	</div>
</div>

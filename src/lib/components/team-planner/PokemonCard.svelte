<script lang="ts">
	import type { PokemonSetData } from '$lib/modules/shared';
	import { pokemonIconUrl, pokemonSpriteUrl } from '$lib/modules/team-planner';

	import ItemIconImg from './ItemIconImg.svelte';

	let { pokemon }: { pokemon: PokemonSetData } = $props();

	let spriteSrc = $derived(pokemonSpriteUrl(pokemon.species));
	let spriteFailed = $state(false);

	$effect(() => {
		void pokemon;
		spriteFailed = false;
	});

	const STAT_LABELS = { hp: 'HP', atk: 'Atk', def: 'Def', spa: 'SpA', spd: 'SpD', spe: 'Spe' };
	const statPoints = $derived(
		(Object.keys(STAT_LABELS) as (keyof typeof STAT_LABELS)[])
			.filter((stat) => pokemon.statPoints[stat] > 0)
			.map((stat) => `${pokemon.statPoints[stat]} ${STAT_LABELS[stat]}`)
			.join(' / ')
	);
</script>

<div class="flex gap-3 rounded-xl border border-gray-800 bg-gray-900 p-3">
	<div class="flex h-20 w-20 shrink-0 items-center justify-center">
		<img
			src={spriteFailed ? pokemonIconUrl(pokemon.species) : spriteSrc}
			alt={pokemon.species}
			class="max-h-20 max-w-20 object-contain"
			onerror={() => (spriteFailed = true)}
		/>
	</div>
	<div class="flex min-w-0 flex-col gap-1 text-sm">
		<div class="font-semibold text-gray-100">
			{pokemon.nickname || pokemon.species}
			{#if pokemon.nickname}<span class="text-xs font-normal text-gray-400"
					>({pokemon.species})</span
				>{/if}
		</div>
		{#if pokemon.item}
			<div class="flex items-center gap-1 text-gray-300">
				<ItemIconImg item={pokemon.item} />
				{pokemon.item}
			</div>
		{/if}
		{#if pokemon.ability || pokemon.nature}
			<div class="text-xs text-gray-400">
				{[pokemon.ability, pokemon.nature].filter(Boolean).join(' · ')}
			</div>
		{/if}
		{#if statPoints}
			<div class="text-xs text-gray-500">{statPoints}</div>
		{/if}
		{#if pokemon.moves.length > 0}
			<ul class="mt-1 list-inside list-disc text-xs text-gray-300">
				{#each pokemon.moves as move (move)}
					<li>{move}</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>

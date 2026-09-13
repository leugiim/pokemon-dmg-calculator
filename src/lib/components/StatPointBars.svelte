<script lang="ts">
	import type { StatID } from '@smogon/calc';
	import {
		MAX_SP_PER_STAT,
		MAX_SP_TOTAL,
		STAT_LABELS,
		STAT_ORDER,
		calcChampionsStat,
		totalStatPoints,
		type NatureInfo,
		type StatPoints
	} from '$lib/calc/format';
	import type { SpeciesItem } from '$lib/calc/generation';

	let {
		species,
		nature,
		statPoints = $bindable()
	}: {
		species: SpeciesItem | null;
		nature: NatureInfo;
		statPoints: StatPoints;
	} = $props();

	const spent = $derived(totalStatPoints(statPoints));
	const remaining = $derived(MAX_SP_TOTAL - spent);

	// Neutral natures (plus === minus) get no +/- marker at all.
	const isNeutral = $derived(nature.plus === nature.minus);

	function setStat(stat: StatID, value: number) {
		// Can't exceed the per-stat cap, nor spend more than what's left
		// of the total budget once this stat's current points are given back.
		const budget = remaining + statPoints[stat];
		statPoints[stat] = Math.max(0, Math.min(value, MAX_SP_PER_STAT, budget));
	}
</script>

<div class="flex w-full flex-col gap-1">
	<div class="flex items-center justify-between text-[10px] font-medium text-gray-400">
		<span>Stat Points</span>
		<span class={remaining < 0 ? 'text-red-500' : ''}>{spent}/{MAX_SP_TOTAL}</span>
	</div>

	{#each STAT_ORDER as stat (stat)}
		<div class="flex items-center gap-2">
			<span class="w-9 shrink-0 text-[11px] text-gray-500">
				{STAT_LABELS[stat]}{#if !isNeutral && stat === nature.plus}<span
						class="font-semibold text-green-500">+</span
					>{:else if !isNeutral && stat === nature.minus}<span class="font-semibold text-red-500"
						>−</span
					>{/if}
			</span>
			<span class="w-6 shrink-0 text-right text-[11px] text-gray-400">
				{species ? species.baseStats[stat] : '–'}
			</span>
			<input
				type="range"
				min="0"
				max={MAX_SP_PER_STAT}
				value={statPoints[stat]}
				disabled={!species}
				oninput={(e) => setStat(stat, Number(e.currentTarget.value))}
				class="h-1.5 w-full accent-indigo-500 disabled:opacity-40"
			/>
			<input
				type="number"
				min="0"
				max={MAX_SP_PER_STAT}
				value={statPoints[stat]}
				disabled={!species}
				oninput={(e) => setStat(stat, Number(e.currentTarget.value))}
				class="w-10 shrink-0 rounded border border-gray-300 px-1 py-0.5 text-right text-[11px] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none disabled:opacity-40"
			/>
			<span class="w-8 shrink-0 text-right text-[11px] font-semibold text-gray-700">
				{species ? calcChampionsStat(species.baseStats[stat], stat, statPoints[stat], nature) : '–'}
			</span>
		</div>
	{/each}
</div>

<style>
	/* Browsers only show the spin buttons on hover/focus by default —
	   keep them visible all the time, since this is the primary way to
	   nudge a stat point value. */
	input[type='number']::-webkit-inner-spin-button,
	input[type='number']::-webkit-outer-spin-button {
		opacity: 1;
	}
</style>

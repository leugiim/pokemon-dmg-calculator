<script lang="ts">
	import type { StatID } from '@smogon/calc';
	import {
		MAX_SP_PER_STAT,
		MAX_SP_TOTAL,
		STAT_LABELS,
		STAT_ORDER,
		calcChampionsStat,
		statPointBreakpoints,
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

	/** One bar per possible SP value (1..32), click a bar to jump straight to it. */
	const SP_VALUES = Array.from({ length: MAX_SP_PER_STAT }, (_, i) => i + 1);
</script>

<div class="flex w-full flex-col gap-1">
	<div class="flex items-center justify-between text-[10px] font-medium text-gray-300">
		<span>Stat Points</span>
		<span class={remaining < 0 ? 'text-red-400' : ''}>{spent}/{MAX_SP_TOTAL}</span>
	</div>

	{#each STAT_ORDER as stat (stat)}
		{@const rowBreakpoints = species
			? statPointBreakpoints(species.baseStats[stat], stat, nature)
			: []}
		<div class="flex items-center gap-2">
			<span class="w-6 shrink-0 text-[11px] text-gray-300">
				{STAT_LABELS[stat]}{#if !isNeutral && stat === nature.plus}<span
						class="font-semibold text-red-400">+</span
					>{:else if !isNeutral && stat === nature.minus}<span class="font-semibold text-blue-400"
						>−</span
					>{/if}
			</span>
			<span class="w-6 shrink-0 text-right text-[11px] text-gray-500">
				{species ? species.baseStats[stat] : '–'}
			</span>
			<div class="flex h-6 flex-1 items-stretch gap-0 border border-[1px] border-gray-700">
				{#each SP_VALUES as sp (sp)}
					{@const isBreakpoint = rowBreakpoints.includes(sp)}
					<div
						class="group relative h-full !w-[3px] min-w-0 flex-1 disabled:pointer-events-none disabled:opacity-40 {isBreakpoint
							? stat === nature.plus
								? 'border border-red-400'
								: 'border border-blue-400'
							: ''} {sp <= statPoints[stat] ? 'bg-indigo-500' : 'bg-transparent'}"
					>
						<button
							type="button"
							disabled={!species}
							onclick={() => setStat(stat, sp)}
							aria-label="Set {STAT_LABELS[stat]} SP to {sp}"
							aria-pressed={sp <= statPoints[stat]}
							class="h-full w-full"
						></button>
						<span
							class="pointer-events-none absolute -top-4 left-1/2 z-10 hidden -translate-x-1/2 rounded bg-gray-950 px-1 text-[9px] whitespace-nowrap text-gray-100 group-hover:block"
						>
							{sp}
						</span>
					</div>
				{/each}
			</div>
			<div class="relative w-10 shrink-0">
				<input
					type="number"
					min="0"
					max={MAX_SP_PER_STAT}
					value={statPoints[stat]}
					disabled={!species}
					oninput={(e) => setStat(stat, Number(e.currentTarget.value))}
					class="stat-input w-full rounded border border-gray-700 bg-gray-800 py-0.5 pr-3.5 pl-1 text-right text-[11px] text-gray-100 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 focus:outline-none disabled:opacity-40"
				/>
				<div class="absolute inset-y-0 right-0.5 flex flex-col justify-center">
					<button
						type="button"
						tabindex="-1"
						disabled={!species}
						onclick={() => setStat(stat, statPoints[stat] + 1)}
						aria-label="Increase"
						class="flex h-2.5 w-3 items-center justify-center text-[8px] leading-none text-gray-500 hover:text-gray-300 disabled:pointer-events-none disabled:opacity-40"
					>
						▲
					</button>
					<button
						type="button"
						tabindex="-1"
						disabled={!species}
						onclick={() => setStat(stat, statPoints[stat] - 1)}
						aria-label="Decrease"
						class="flex h-2.5 w-3 items-center justify-center text-[8px] leading-none text-gray-500 hover:text-gray-300 disabled:pointer-events-none disabled:opacity-40"
					>
						▼
					</button>
				</div>
			</div>
			<span class="w-8 shrink-0 text-right text-[11px] font-semibold text-gray-500">
				{species ? calcChampionsStat(species.baseStats[stat], stat, statPoints[stat], nature) : '–'}
			</span>
		</div>
	{/each}
</div>

<style>
	/* Chrome only lets you fade its number spinner, not recolor it — so
	   hide it outright and use our own ▲▼ buttons instead, which we can
	   actually theme. `-moz-appearance` does the same for Firefox, which
	   doesn't expose the spinner as a styleable pseudo-element at all. */
	.stat-input::-webkit-inner-spin-button,
	.stat-input::-webkit-outer-spin-button {
		appearance: none;
		margin: 0;
	}
	.stat-input {
		appearance: textfield;
		-moz-appearance: textfield;
	}
</style>

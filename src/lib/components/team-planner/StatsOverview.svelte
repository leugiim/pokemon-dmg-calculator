<script lang="ts">
	import { winrateClass, type TeamStats } from '$lib/modules/team-planner';
	import ItemIconImg from './ItemIconImg.svelte';
	import PokeName from './PokeName.svelte';

	let { stats }: { stats: TeamStats } = $props();

	const th = 'py-1 pr-3 text-left text-xs font-medium text-gray-400';
	const td = 'py-1 pr-3 text-gray-200';
</script>

<div class="grid grid-cols-3 gap-3">
	<div class="flex flex-col items-center rounded-xl border border-gray-800 bg-gray-900 p-3">
		<span class="text-2xl font-bold text-gray-100">{stats.total}</span>
		<span class="text-xs text-gray-400">Matches</span>
	</div>
	<div class="flex flex-col items-center rounded-xl border border-gray-800 bg-gray-900 p-3">
		<span class="text-2xl font-bold text-gray-100">{stats.wins}</span>
		<span class="text-xs text-gray-400">Wins</span>
	</div>
	<div class="flex flex-col items-center rounded-xl border border-gray-800 bg-gray-900 p-3">
		<span class="text-2xl font-bold {winrateClass(stats.wr)}">{stats.wr}%</span>
		<span class="text-xs text-gray-400">Win rate</span>
	</div>
</div>

<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
	<div class="overflow-x-auto">
		<h3 class="mb-2 text-sm font-semibold text-gray-200">Picks by Pokémon</h3>
		<table class="w-full text-sm">
			<thead>
				<tr>
					<th class={th}>Pokémon</th>
					<th class={th}>Picked</th>
					<th class={th}>Wins</th>
					<th class={th}>Win rate</th>
				</tr>
			</thead>
			<tbody>
				{#each stats.pokeStats as s (s.name)}
					<tr class="border-t border-gray-800">
						<td class={td}>
							<span class="inline-flex items-center gap-1">
								<PokeName name={s.name} species={s.pokemon?.species} />
								{#if s.pokemon?.item}
									<ItemIconImg item={s.pokemon.item} labelled class="h-5 w-5" />
								{/if}
							</span>
						</td>
						<td class={td}>{s.times}</td>
						<td class={td}>{s.wins}</td>
						<td class={td}>
							{#if s.wr !== null}
								<span class={winrateClass(s.wr)}>{s.wr}%</span>
							{:else}
								—
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if stats.leadStats.length > 0}
		<div class="overflow-x-auto">
			<h3 class="mb-2 text-sm font-semibold text-gray-200">Win rate by lead</h3>
			<table class="w-full text-sm">
				<thead>
					<tr>
						<th class={th}>Lead</th>
						<th class={th}>Times</th>
						<th class={th}>Wins</th>
						<th class={th}>Win rate</th>
					</tr>
				</thead>
				<tbody>
					{#each stats.leadStats as s (s.lead)}
						<tr class="border-t border-gray-800">
							<td class={td}>
								<span class="inline-flex flex-wrap gap-x-3">
									{#each s.lead.split(' + ') as name (name)}<PokeName {name} />{/each}
								</span>
							</td>
							<td class={td}>{s.total}</td>
							<td class={td}>{s.wins}</td>
							<td class={td}><span class={winrateClass(s.wr)}>{s.wr}%</span></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

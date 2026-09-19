<script lang="ts">
	import {
		filterEnemyLeadStats,
		filterEnemyStats,
		winrateClass,
		type LeadStat,
		type NamedStat
	} from '$lib/modules/team-planner';
	import PokeName from './PokeName.svelte';

	let {
		enemyStats,
		enemyLeadStats
	}: {
		enemyStats: NamedStat[];
		enemyLeadStats: LeadStat[];
	} = $props();

	const TOP = 10;
	let nameFilter = $state('');
	let minMatches = $state(1);

	const pokemon = $derived(filterEnemyStats(enemyStats, nameFilter, minMatches).slice(0, TOP));
	const leads = $derived(
		filterEnemyLeadStats(enemyLeadStats, nameFilter, minMatches).slice(0, TOP)
	);

	const th = 'py-1 pr-3 text-left text-xs font-medium text-gray-400';
	const td = 'py-1 pr-3 text-gray-200';
</script>

{#if enemyStats.length > 0}
	<div class="flex flex-wrap items-center gap-3">
		<input
			type="text"
			placeholder="Search Pokémon…"
			bind:value={nameFilter}
			class="rounded-md border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-gray-100 placeholder:text-gray-500"
		/>
		<label class="flex items-center gap-2 text-xs text-gray-400">
			Min. matches
			<input
				type="number"
				min="1"
				value={minMatches}
				oninput={(e) => (minMatches = Math.max(1, Number(e.currentTarget.value) || 1))}
				class="w-16 rounded-md border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-gray-100"
			/>
		</label>
	</div>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<div class="overflow-x-auto">
			<h3 class="mb-2 text-sm font-semibold text-gray-200">Top opponents against you</h3>
			<table class="w-full text-sm">
				<thead>
					<tr>
						<th class={th}>Pokémon</th>
						<th class={th}>Seen</th>
						<th class={th}>Your losses</th>
						<th class={th}>Opponent win rate</th>
					</tr>
				</thead>
				<tbody>
					{#each pokemon as s (s.name)}
						<tr class="border-t border-gray-800">
							<td class={td}><PokeName name={s.name} /></td>
							<td class={td}>{s.total}</td>
							<td class={td}>{s.wins}</td>
							<td class={td}><span class={winrateClass(s.wr)}>{s.wr}%</span></td>
						</tr>
					{:else}
						<tr><td colspan="4" class="py-2 text-gray-500">No results.</td></tr>
					{/each}
				</tbody>
			</table>
		</div>

		{#if enemyLeadStats.length > 0}
			<div class="overflow-x-auto">
				<h3 class="mb-2 text-sm font-semibold text-gray-200">Top opposing leads against you</h3>
				<table class="w-full text-sm">
					<thead>
						<tr>
							<th class={th}>Lead</th>
							<th class={th}>Times</th>
							<th class={th}>Your losses</th>
							<th class={th}>Opponent win rate</th>
						</tr>
					</thead>
					<tbody>
						{#each leads as s (s.lead)}
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
						{:else}
							<tr><td colspan="4" class="py-2 text-gray-500">No results.</td></tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
{/if}

<script lang="ts">
	import type { TeamId, TeamSlot } from '$lib/stores/team.svelte';
	import { buildDamageMatrix } from '$lib/calc/matrix';
	import { hasDamageComponent, multiHitRange, type MultiHitRange } from '$lib/calc/moves';
	import DamageResult from './DamageResult.svelte';

	let { sides }: { sides: Record<TeamId, [TeamSlot, TeamSlot]> } = $props();

	const TEAM_LABELS: Record<TeamId, string> = { teamA: 'Team A', teamB: 'Team B' };

	/** Every whole hit count a `multiHitRange` allows, for a `<select>`'s options. */
	function hitOptions({ min, max }: MultiHitRange): number[] {
		const options: number[] = [];
		for (let n = min; n <= max; n++) options.push(n);
		return options;
	}

	/** "Team A #1: Garchomp" for any slot belonging to either side. */
	function labelFor(slot: TeamSlot): string {
		for (const teamId of ['teamA', 'teamB'] as TeamId[]) {
			const i = sides[teamId].indexOf(slot);
			if (i !== -1) return `${TEAM_LABELS[teamId]} #${i + 1}: ${slot.species?.name ?? ''}`;
		}
		return slot.species?.name ?? '';
	}

	const attackers = $derived(buildDamageMatrix(sides));
</script>

<section class="flex flex-col gap-4 rounded-xl border border-gray-800 bg-gray-900 p-4">
	<h2 class="text-sm font-semibold text-gray-300">Damage matrix</h2>

	{#if attackers.length === 0}
		<p class="text-center text-sm text-gray-500">Pick a species for at least one Pokémon.</p>
	{:else}
		{#each attackers as { attacker, opponents, rows } (attacker)}
			<!-- An "ally" column only makes sense for this attacker's table if at
			     least one of its rows is an allAdjacent move (#12) — most rows
			     never populate it, so it's left out entirely otherwise rather
			     than rendered as a permanently-empty column. -->
			{@const showsAllyColumn = rows.some((row) => row.isAllAdjacentMove)}
			<div class="flex flex-col gap-1 border-t border-gray-800 pt-3 first:border-t-0 first:pt-0">
				<h3 class="text-xs font-semibold text-gray-200">{labelFor(attacker)}</h3>
				{#if opponents.length === 0}
					<p class="pl-1 text-[11px] text-gray-500">
						Pick a species for at least one opposing Pokémon.
					</p>
				{:else if rows.length === 0}
					<p class="pl-1 text-[11px] text-gray-500">No moves selected yet.</p>
				{:else}
					<div class="overflow-x-auto">
						<table class="w-full min-w-max text-left text-[11px]">
							<thead>
								<tr class="text-gray-400">
									<th class="py-1 pr-4 font-medium">Move</th>
									<th class="py-1 pr-4 font-medium">Crit</th>
									<th class="py-1 pr-4 font-medium">Hits</th>
									{#each opponents as opponent (opponent)}
										<th class="py-1 pr-4 font-medium">vs {labelFor(opponent)}</th>
									{/each}
									{#if showsAllyColumn}
										<th class="py-1 pr-4 font-medium">vs ally</th>
									{/if}
								</tr>
							</thead>
							<tbody>
								{#each rows as { move, moveIndex, cells, isAllAdjacentMove, allyDamage } (moveIndex)}
									{@const damaging = hasDamageComponent(move)}
									{@const range = multiHitRange(move)}
									<tr class="border-t border-gray-800/60">
										<td class="py-1 pr-4 text-gray-200">{move.name}</td>
										<td class="py-1 pr-4">
											<!-- Only a damaging move's crit assumption changes anything it
											     computes — a Status move's row has nothing for it to affect. -->
											{#if damaging}
												<label class="flex items-center gap-1 text-gray-400">
													<input
														type="checkbox"
														bind:checked={attacker.moveOptions[moveIndex].isCrit}
													/>
													<span class="sr-only">Assume critical hit for {move.name}</span>
												</label>
											{/if}
										</td>
										<td class="py-1 pr-4">
											{#if damaging && range}
												<select
													class="rounded bg-gray-800 px-1 py-0.5 text-[11px] text-gray-200"
													aria-label="Hit count for {move.name}"
													bind:value={attacker.moveOptions[moveIndex].hits}
												>
													<option value={null}>Auto</option>
													{#each hitOptions(range) as n (n)}
														<option value={n}>{n}</option>
													{/each}
												</select>
											{/if}
										</td>
										{#each cells as { target, damage } (target)}
											<td class="py-1 pr-4 text-gray-100">
												{#if damage}
													<DamageResult {damage} koChanceClass="text-gray-500" />
												{:else}
													—
												{/if}
											</td>
										{/each}
										{#if showsAllyColumn}
											<td class="py-1 pr-4 text-gray-100">
												{#if allyDamage}
													<DamageResult damage={allyDamage} koChanceClass="text-gray-500" />
												{:else if isAllAdjacentMove}
													—
												{/if}
											</td>
										{/if}
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>
		{/each}
	{/if}
</section>

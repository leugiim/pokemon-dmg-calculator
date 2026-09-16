<script lang="ts">
	import type {
		TeamAllySupport,
		TeamId,
		TeamSideConditions,
		TeamSlot
	} from '$lib/stores/team.svelte';
	import type { FieldConditions } from '$lib/stores/field.svelte';
	import { buildDamageMatrix, type DamageMatrixAttacker } from '$lib/calc/matrix';
	import { hasDamageComponent, multiHitRange, type MultiHitRange } from '$lib/calc/moves';
	import DamageResult from './DamageResult.svelte';
	import SpeciesSprite from './SpeciesSprite.svelte';

	let {
		teamId,
		sides,
		allySupport,
		sideConditions,
		field
	}: {
		/** Which team's own 2 attacker tables this instance renders — the opposing team's own tables are a separate `DamageMatrix` instance in that team's own card. */
		teamId: TeamId;
		sides: Record<TeamId, [TeamSlot, TeamSlot]>;
		allySupport: Record<TeamId, TeamAllySupport>;
		sideConditions: Record<TeamId, TeamSideConditions>;
		field: FieldConditions;
	} = $props();

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

	/** The other slot of whichever side `slot` belongs to — same notion of "ally" as `matrix.ts`, needed here only to label the "vs ally" column's header. */
	function allyOf(slot: TeamSlot): TeamSlot | null {
		for (const teamId of ['teamA', 'teamB'] as TeamId[]) {
			const pair = sides[teamId];
			const i = pair.indexOf(slot);
			if (i !== -1) return pair[1 - i];
		}
		return null;
	}

	const matrixAttackers = $derived(buildDamageMatrix(sides, allySupport, sideConditions, field));

	/**
	 * Both of this team's slots, in order, paired with their computed
	 * `DamageMatrixAttacker` when they have one — `null` for a slot with no
	 * species picked yet. Keeps the grid below at a fixed 2 table columns
	 * regardless of which slots are filled, rather than the list of tables
	 * shrinking/reflowing as `matrixAttackers` (which omits unfilled slots
	 * entirely) changes.
	 */
	const ownAttackers = $derived(
		sides[teamId].map((slot) => matrixAttackers.find((a) => a.attacker === slot) ?? null)
	);

	const hasOwnSpecies = $derived(sides[teamId].some((slot) => slot.species));
</script>

<div class="flex flex-col gap-2">
	<h3 class="text-xs font-semibold text-gray-300">Damage matrix</h3>

	{#if !hasOwnSpecies}
		<p class="text-[11px] text-gray-500">Pick a species for at least one Pokémon.</p>
	{:else}
		<div class="grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
			{#each ownAttackers as entry, i (i)}
				{@render attackerTable(entry)}
			{/each}
		</div>
	{/if}
</div>

{#snippet attackerTable(entry: DamageMatrixAttacker | null)}
	<div class="flex flex-col gap-2 rounded-xl border border-gray-800 bg-gray-900 p-3">
		{#if entry === null}
			<p class="text-center text-[11px] text-gray-500">No Pokémon picked.</p>
		{:else}
			{@const { attacker, opponents, rows } = entry}
			{@const showsAllyColumn = rows.some((row) => row.isAllAdjacentMove)}
			{@const showsHitsColumn = rows.some(
				(row) => hasDamageComponent(row.move) && multiHitRange(row.move)
			)}
			{@const ally = allyOf(attacker)}
			<h3 class="flex items-center gap-1.5 text-xs font-semibold text-gray-200">
				{#if attacker.species}
					<SpeciesSprite species={attacker.species} size={20} />
				{/if}
				{labelFor(attacker)}
			</h3>
			{#if opponents.length === 0}
				<p class="text-[11px] text-gray-500">Pick a species for at least one opposing Pokémon.</p>
			{:else if rows.length === 0}
				<p class="text-[11px] text-gray-500">No moves selected yet.</p>
			{:else}
				<table class="w-full text-left text-[11px]">
					<thead>
						<tr class="text-gray-400">
							<th class="py-1 pr-2 font-medium">Move</th>
							<th class="py-1 pr-2 font-medium">Crit</th>
							{#if showsHitsColumn}
								<th class="py-1 pr-2 font-medium">Hits</th>
							{/if}
							{#each opponents as opponent (opponent)}
								<th class="py-1 pr-2 font-medium" title={labelFor(opponent)}>
									<div class="flex flex-col items-center gap-0.5">
										{#if opponent.species}
											<SpeciesSprite species={opponent.species} size={20} />
										{/if}
										<span class="text-center leading-tight">{opponent.species?.name}</span>
									</div>
								</th>
							{/each}
							{#if showsAllyColumn}
								<th class="py-1 pr-2 font-medium" title={ally ? labelFor(ally) : 'Ally'}>
									<div class="flex flex-col items-center gap-0.5">
										{#if ally?.species}
											<SpeciesSprite species={ally.species} size={20} />
										{/if}
										<span class="text-center leading-tight">{ally?.species?.name ?? 'Ally'}</span>
									</div>
								</th>
							{/if}
						</tr>
					</thead>
					<tbody>
						{#each rows as { move, moveIndex, cells, isAllAdjacentMove, allyDamage } (moveIndex)}
							{@const damaging = hasDamageComponent(move)}
							{@const range = multiHitRange(move)}
							<tr class="border-t border-gray-800/60">
								<td class="py-1 pr-2 text-gray-200">{move.name}</td>
								<td class="py-1 pr-2">
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
								{#if showsHitsColumn}
									<td class="py-1 pr-2">
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
								{/if}
								{#each cells as { target, damage } (target)}
									<td class="py-1 pr-2 text-center text-gray-100">
										{#if damage}
											<DamageResult {damage} koChanceClass="text-gray-500" />
										{:else}
											—
										{/if}
									</td>
								{/each}
								{#if showsAllyColumn}
									<td class="py-1 pr-2 text-center text-gray-100">
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
			{/if}
		{/if}
	</div>
{/snippet}

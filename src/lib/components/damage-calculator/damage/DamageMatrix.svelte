<script lang="ts">
	import type {
		TeamAllySupport,
		TeamId,
		TeamSideConditions,
		TeamSlot
	} from '$lib/modules/damage-calculator/stores/team.svelte';
	import type { FieldConditions } from '$lib/modules/damage-calculator/stores/field.svelte';
	import { buildDamageMatrix } from '$lib/modules/damage-calculator/calc/matrix';
	import AttackerTable from './AttackerTable.svelte';

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
	{#if !hasOwnSpecies}
		<p class="text-[11px] text-gray-500">Pick a species for at least one Pokémon.</p>
	{:else}
		<div class="grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
			{#each ownAttackers as entry, i (i)}
				<AttackerTable {entry} ally={allyOf(sides[teamId][i])} {labelFor} />
			{/each}
		</div>
	{/if}
</div>

<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import Button from '$lib/components/shared/ui/Button.svelte';
	import EnemyStats from '$lib/components/team-planner/EnemyStats.svelte';
	import MatchHistory from '$lib/components/team-planner/MatchHistory.svelte';
	import PokemonCard from '$lib/components/team-planner/PokemonCard.svelte';
	import StatsOverview from '$lib/components/team-planner/StatsOverview.svelte';
	import { generateId, writeHandoff } from '$lib/modules/shared';
	import {
		buildTeamHandoff,
		computeTeamStats,
		displayName,
		planner
	} from '$lib/modules/team-planner';

	const id = $derived(page.params.id ?? '');
	const team = $derived(planner.teams.find((t) => t.id === id));
	const matches = $derived(planner.matches[id] ?? []);
	const stats = $derived(team ? computeTeamStats(team, matches) : null);
	const speciesByName = $derived(
		Object.fromEntries((team?.pokemon ?? []).map((p) => [displayName(p), p.species]))
	);

	$effect(() => {
		if (id) planner.loadMatches(id);
	});

	let calcError = $state('');

	/** Opens the calculator in a new tab with just this team's six. */
	function openInCalculator() {
		if (!team) return;
		const handoffId = generateId();
		if (!writeHandoff(handoffId, buildTeamHandoff(team))) {
			calcError = "Couldn't open the calculator (browser storage unavailable).";
			return;
		}
		calcError = '';
		window.open(`${resolve('/calc')}?handoff=${encodeURIComponent(handoffId)}`, '_blank');
	}
</script>

{#if !planner.loaded}
	<p class="text-sm text-gray-500">Loading…</p>
{:else if !team || !stats}
	<p class="text-sm text-gray-300">Team not found.</p>
	<div><Button href={resolve('/teams')}>← Back to teams</Button></div>
{:else}
	<header class="flex flex-wrap items-center gap-3">
		<Button size="sm" href={resolve('/teams')}>← Back</Button>
		<h1 class="text-2xl font-bold text-gray-100">{team.name}</h1>
		<div class="ml-auto flex gap-2">
			<Button href={resolve('/teams/[id]/edit', { id })}>Edit Pokepaste</Button>
			<Button onclick={openInCalculator}>Open in calculator</Button>
			<Button variant="primary" href={resolve('/teams/[id]/match/new', { id })}>+ Add match</Button>
		</div>
	</header>

	{#if calcError}
		<p class="text-sm text-red-400">{calcError}</p>
	{/if}

	<section class="flex flex-col gap-3">
		<h2 class="text-lg font-semibold text-gray-100">Team</h2>
		<div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
			{#each team.pokemon as pokemon, i (i)}
				<PokemonCard {pokemon} />
			{/each}
		</div>
	</section>

	<section class="flex flex-col gap-4">
		<h2 class="text-lg font-semibold text-gray-100">Statistics</h2>
		{#if stats.total === 0}
			<p class="text-sm text-gray-500">No matches recorded yet.</p>
		{:else}
			<StatsOverview {stats} />
			<EnemyStats enemyStats={stats.enemyStats} enemyLeadStats={stats.enemyLeadStats} />
		{/if}
	</section>

	<section class="flex flex-col gap-3">
		<h2 class="text-lg font-semibold text-gray-100">Match history</h2>
		<MatchHistory teamId={id} {matches} allPokeNames={stats.allPokeNames} {speciesByName} />
	</section>
{/if}

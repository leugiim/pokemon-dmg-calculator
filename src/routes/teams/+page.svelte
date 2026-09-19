<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '$lib/components/shared/ui/Button.svelte';
	import CreateFromCalculator from '$lib/components/team-planner/CreateFromCalculator.svelte';
	import PlannerIntro from '$lib/components/team-planner/PlannerIntro.svelte';
	import PokeName from '$lib/components/team-planner/PokeName.svelte';
	import { displayName, planner, winrate, winrateClass } from '$lib/modules/team-planner';

	// The layout loads the teams; each team's matches feed its card.
	$effect(() => {
		for (const team of planner.teams) planner.loadMatches(team.id);
	});

	function deleteTeam(id: string) {
		if (!confirm('Delete this team and all its matches?')) return;
		planner.deleteTeam(id);
	}
</script>

<header class="flex items-center justify-between gap-4">
	<h1 class="text-2xl font-bold text-gray-100">Team Planner</h1>
	<div class="flex flex-wrap items-center gap-2">
		<CreateFromCalculator />
		<Button variant="primary" href={resolve('/teams/new')}>+ New team</Button>
	</div>
</header>

<PlannerIntro />

{#if !planner.loaded}
	<p class="text-sm text-gray-500">Loading…</p>
{:else if planner.teams.length === 0}
	<div class="flex flex-col items-center gap-3 rounded-xl border border-gray-800 bg-gray-900 p-10">
		<p class="text-sm text-gray-300">No teams yet.</p>
		<Button variant="primary" href={resolve('/teams/new')}>Create your first team</Button>
	</div>
{:else}
	<ul class="flex flex-col gap-3">
		{#each planner.teams as team (team.id)}
			{@const matches = planner.matches[team.id] ?? []}
			{@const wr = winrate(matches)}
			<li
				class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-800 bg-gray-900 p-4 hover:border-gray-600"
			>
				<a
					href={resolve('/teams/[id]', { id: team.id })}
					class="flex min-w-0 flex-1 flex-col gap-2"
				>
					<h2 class="font-semibold text-gray-100">{team.name}</h2>
					<div class="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-300">
						{#each team.pokemon as pokemon, i (i)}
							<PokeName name={displayName(pokemon)} species={pokemon.species} />
						{/each}
					</div>
				</a>
				<div class="flex items-center gap-3">
					<span class="text-xs text-gray-400">{matches.length} matches</span>
					{#if wr !== null}
						<span class="text-sm font-semibold {winrateClass(wr)}">{wr}% WR</span>
					{/if}
					<Button size="sm" variant="danger" onclick={() => deleteTeam(team.id)}>Delete</Button>
				</div>
			</li>
		{/each}
	</ul>
{/if}

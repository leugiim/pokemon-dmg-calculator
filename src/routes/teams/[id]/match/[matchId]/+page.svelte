<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import Button from '$lib/components/shared/ui/Button.svelte';
	import MatchForm from '$lib/components/team-planner/MatchForm.svelte';
	import { planner } from '$lib/modules/team-planner';

	const id = $derived(page.params.id ?? '');
	const team = $derived(planner.teams.find((t) => t.id === id));
</script>

{#if !planner.loaded}
	<p class="text-sm text-gray-500">Loading…</p>
{:else if !team}
	<p class="text-sm text-gray-300">Team not found.</p>
	<div><Button href={resolve('/teams')}>← Back to teams</Button></div>
{:else}
	<header class="flex items-center gap-3">
		<Button size="sm" href={resolve('/teams/[id]', { id })}>← Back</Button>
		<h1 class="text-2xl font-bold text-gray-100">Edit match — {team.name}</h1>
	</header>

	<MatchForm {team} matchId={page.params.matchId} />
{/if}

<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '$lib/components/shared/ui/Button.svelte';
	import TeamForm from '$lib/components/team-planner/TeamForm.svelte';
</script>

<header class="flex items-center gap-3">
	<Button size="sm" href={resolve('/teams')}>← Back</Button>
	<h1 class="text-2xl font-bold text-gray-100">New team</h1>
</header>

<TeamForm />

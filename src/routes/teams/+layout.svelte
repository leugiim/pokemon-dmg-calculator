<script lang="ts">
	import { onMount } from 'svelte';
	import { planner } from '$lib/modules/team-planner';

	let { children } = $props();

	onMount(() => planner.load());
</script>

<div class="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-8">
	{@render children()}
</div>

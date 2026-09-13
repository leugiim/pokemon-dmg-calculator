<script lang="ts">
	import { teamA, teamB } from '$lib/stores/team.svelte';
	import TeamSlotCard from '$lib/components/TeamSlotCard.svelte';
</script>

<div class="flex min-h-screen w-full flex-col gap-8 px-4 py-8 sm:px-8 lg:px-16">
	<header class="text-center">
		<h1 class="text-2xl font-bold text-gray-900">Pokemon DMG Calculator</h1>
		<p class="text-sm text-gray-500">2v2 VGC damage calculator</p>
	</header>

	<div class="grid grid-cols-1 items-start gap-6 sm:grid-cols-[1fr_auto_1fr]">
		<section class="flex flex-col gap-3">
			<h2 class="text-center text-sm font-semibold text-gray-400">Team A</h2>
			<div class="grid grid-cols-2 gap-4">
				{#each teamA as slot, i (i)}
					<TeamSlotCard {slot} label={i + 1} />
				{/each}
			</div>
		</section>

		<span class="justify-self-center text-sm font-bold text-gray-300 sm:mt-8">VS</span>

		<section class="flex flex-col gap-3">
			<h2 class="text-center text-sm font-semibold text-gray-400">Team B</h2>
			<div class="grid grid-cols-2 gap-4">
				{#each teamB as slot, i (i)}
					<TeamSlotCard {slot} label={i + 1} />
				{/each}
			</div>
		</section>
	</div>
</div>

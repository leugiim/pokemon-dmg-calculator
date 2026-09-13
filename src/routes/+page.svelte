<script lang="ts">
	import { attackers, defenders } from '$lib/stores/team.svelte';
	import TeamSlotCard from '$lib/components/TeamSlotCard.svelte';
</script>

<div class="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-4 py-8">
	<header class="text-center">
		<h1 class="text-2xl font-bold text-gray-900">Pokemon DMG Calculator</h1>
		<p class="text-sm text-gray-500">2v2 VGC damage calculator</p>
	</header>

	<div class="grid grid-cols-1 items-center gap-6 sm:grid-cols-[1fr_auto_1fr]">
		<section class="grid grid-cols-2 gap-4">
			{#each attackers as slot, i (i)}
				<TeamSlotCard {slot} label="Attacker {i + 1}" />
			{/each}
		</section>

		<span class="justify-self-center text-sm font-bold text-gray-300">VS</span>

		<section class="grid grid-cols-2 gap-4">
			{#each defenders as slot, i (i)}
				<TeamSlotCard {slot} label="Defender {i + 1}" />
			{/each}
		</section>
	</div>
</div>

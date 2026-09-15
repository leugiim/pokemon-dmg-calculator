<script lang="ts">
	import { teamA, teamB, sides, allySupport, sideConditions } from '$lib/stores/team.svelte';
	import { field } from '$lib/stores/field.svelte';
	import AllySupportToggles from '$lib/components/AllySupportToggles.svelte';
	import DamageMatrix from '$lib/components/DamageMatrix.svelte';
	import FieldConditionsPicker from '$lib/components/FieldConditionsPicker.svelte';
	import SideConditionsToggles from '$lib/components/SideConditionsToggles.svelte';
	import TeamSlotCard from '$lib/components/TeamSlotCard.svelte';

	const teamADisabled = $derived(!teamA[0].species && !teamA[1].species);
	const teamBDisabled = $derived(!teamB[0].species && !teamB[1].species);
</script>

<div class="flex min-h-screen w-full flex-col gap-2 bg-gray-950 px-4 py-8 sm:px-8 lg:px-16">
	<header class="text-center">
		<h1 class="text-2xl font-bold text-gray-100">Pokemon DMG Calculator</h1>
		<p class="text-sm text-gray-300">2v2 VGC damage calculator</p>
	</header>

	<FieldConditionsPicker />

	<div class="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_auto_1fr]">
		<h2 class="text-center text-sm font-semibold text-gray-300">Team A</h2>
		<span></span>
		<h2 class="text-center text-sm font-semibold text-gray-300">Team B</h2>
	</div>

	<div class="grid grid-cols-1 items-start gap-6 sm:grid-cols-[1fr_auto_1fr]">
		<section class="flex flex-col gap-4">
			{#each teamA as slot, i (i)}
				<TeamSlotCard bind:slot={teamA[i]} />
			{/each}
			<AllySupportToggles bind:support={allySupport.teamA} slots={teamA} disabled={teamADisabled} />
			<SideConditionsToggles bind:conditions={sideConditions.teamA} disabled={teamADisabled} />
		</section>

		<span class="self-center justify-self-center text-sm font-bold text-gray-500">VS</span>

		<section class="flex flex-col gap-4">
			{#each teamB as slot, i (i)}
				<TeamSlotCard bind:slot={teamB[i]} />
			{/each}
			<AllySupportToggles bind:support={allySupport.teamB} slots={teamB} disabled={teamBDisabled} />
			<SideConditionsToggles bind:conditions={sideConditions.teamB} disabled={teamBDisabled} />
		</section>
	</div>

	<DamageMatrix {sides} {allySupport} {sideConditions} {field} />
</div>

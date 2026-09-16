<script lang="ts">
	import { teamA, teamB, sides, allySupport, sideConditions } from '$lib/stores/team.svelte';
	import { field } from '$lib/stores/field.svelte';
	import AllySupportToggles from '$lib/components/conditions/AllySupportToggles.svelte';
	import DamageMatrix from '$lib/components/damage/DamageMatrix.svelte';
	import FieldConditionsPicker from '$lib/components/conditions/FieldConditionsPicker.svelte';
	import SideConditionsToggles from '$lib/components/conditions/SideConditionsToggles.svelte';
	import TeamSlotCard from '$lib/components/team/TeamSlotCard.svelte';

	const teamADisabled = $derived(!teamA[0].species && !teamA[1].species);
	const teamBDisabled = $derived(!teamB[0].species && !teamB[1].species);
</script>

<div class="flex min-h-screen w-full flex-col gap-2 bg-gray-950 px-4 py-8 sm:px-8 lg:px-16">
	<header class="text-center">
		<h1 class="text-2xl font-bold text-gray-100">Pokemon DMG Calculator</h1>
		<p class="text-sm text-gray-300">2v2 VGC damage calculator</p>
	</header>

	<div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_1fr]">
		<section class="flex flex-col gap-4">
			<h2 class="text-center text-sm font-semibold text-gray-300">Team A</h2>
			{#each [0, 1] as i (i)}
				<TeamSlotCard
					bind:slot={teamA[i]}
					tailwind={allySupport.teamA.tailwind}
					intimidated={sideConditions.teamB.intimidate}
				/>
			{/each}
		</section>

		<section class="flex flex-col gap-4">
			<h2 class="text-center text-sm font-semibold text-gray-300">Team B</h2>
			{#each [0, 1] as i (i)}
				<TeamSlotCard
					bind:slot={teamB[i]}
					tailwind={allySupport.teamB.tailwind}
					intimidated={sideConditions.teamA.intimidate}
				/>
			{/each}
		</section>
	</div>

	<FieldConditionsPicker />

	<div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_1fr]">
		<section class="flex flex-col gap-4">
			<div class="flex flex-col gap-4 rounded-xl border border-gray-800 bg-gray-900 p-4">
				<AllySupportToggles
					bind:support={allySupport.teamA}
					slots={teamA}
					disabled={teamADisabled}
				/>
				<SideConditionsToggles
					bind:conditions={sideConditions.teamA}
					bind:allySupport={allySupport.teamA}
					disabled={teamADisabled}
				/>
				<DamageMatrix teamId="teamA" {sides} {allySupport} {sideConditions} {field} />
			</div>
		</section>

		<section class="flex flex-col gap-4">
			<div class="flex flex-col gap-4 rounded-xl border border-gray-800 bg-gray-900 p-4">
				<AllySupportToggles
					bind:support={allySupport.teamB}
					slots={teamB}
					disabled={teamBDisabled}
				/>
				<SideConditionsToggles
					bind:conditions={sideConditions.teamB}
					bind:allySupport={allySupport.teamB}
					disabled={teamBDisabled}
				/>
				<DamageMatrix teamId="teamB" {sides} {allySupport} {sideConditions} {field} />
			</div>
		</section>
	</div>
</div>

<script lang="ts">
	import type { TeamAllySupport, TeamSideConditions } from '$lib/stores/team.svelte';
	import ToggleButton from './ToggleButton.svelte';

	// conditions/allySupport are $bindable: this two-way-binds into
	// conditions.protect / .reflect / ... and allySupport.helpingHand via
	// child bind: directives — see +page.svelte (where this is rendered)
	// for why that needs declaring explicitly. Both are shared by both of a
	// team's slots, same as `AllySupportToggles`' own `support` — this
	// renders once per team. Helping Hand lives here rather than in
	// `AllySupportToggles` because — unlike Friend Guard/Battery/Power
	// Spot/Steely Spirit — it has no Auto mode either, same as every other
	// toggle in this card.
	let {
		conditions = $bindable(),
		allySupport = $bindable(),
		disabled = false
	}: {
		conditions: TeamSideConditions;
		allySupport: TeamAllySupport;
		disabled?: boolean;
	} = $props();
</script>

<div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-gray-400">
	<span class="font-medium text-gray-300">Side conditions</span>
	<ToggleButton
		class="rounded border border-gray-700"
		active={conditions.protect}
		{disabled}
		onclick={() => (conditions.protect = !conditions.protect)}
	>
		Protect
	</ToggleButton>
	<ToggleButton
		class="rounded border border-gray-700"
		active={allySupport.tailwind}
		{disabled}
		onclick={() => (allySupport.tailwind = !allySupport.tailwind)}
	>
		Tailwind
	</ToggleButton>
	<ToggleButton
		class="rounded border border-gray-700"
		active={conditions.intimidate}
		{disabled}
		onclick={() => (conditions.intimidate = !conditions.intimidate)}
		title="Applies a flat -1 Attack stage to whichever Pokemon attacks this team"
	>
		Intimidate
	</ToggleButton>
	<ToggleButton
		class="rounded border border-gray-700"
		active={allySupport.helpingHand}
		{disabled}
		onclick={() => (allySupport.helpingHand = !allySupport.helpingHand)}
	>
		Helping Hand
	</ToggleButton>
	<ToggleButton
		class="rounded border border-gray-700"
		active={conditions.reflect}
		{disabled}
		onclick={() => (conditions.reflect = !conditions.reflect)}
	>
		Reflect
	</ToggleButton>
	<ToggleButton
		class="rounded border border-gray-700"
		active={conditions.lightScreen}
		{disabled}
		onclick={() => (conditions.lightScreen = !conditions.lightScreen)}
	>
		Light Screen
	</ToggleButton>
	<ToggleButton
		class="rounded border border-gray-700"
		active={conditions.auroraVeil}
		{disabled}
		onclick={() => (conditions.auroraVeil = !conditions.auroraVeil)}
	>
		Aurora Veil
	</ToggleButton>
	<ToggleButton
		class="rounded border border-gray-700"
		active={conditions.stealthRock}
		{disabled}
		onclick={() => (conditions.stealthRock = !conditions.stealthRock)}
	>
		Stealth Rock
	</ToggleButton>
	<span class="flex items-center gap-1">
		Spikes
		<span
			class="inline-flex divide-x divide-gray-700 overflow-hidden rounded-lg border border-gray-700"
		>
			{#each [0, 1, 2, 3] as layers (layers)}
				<ToggleButton
					active={conditions.spikes === layers}
					{disabled}
					onclick={() => (conditions.spikes = layers)}
				>
					{layers}
				</ToggleButton>
			{/each}
		</span>
	</span>
</div>

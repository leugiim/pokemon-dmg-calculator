<script lang="ts">
	import type {
		TeamAllySupport,
		TeamSideConditions,
		TeamSlot
	} from '$lib/modules/damage-calculator/stores/team.svelte';
	import { providesIntimidate } from '$lib/modules/damage-calculator/calc/sideConditions';
	import { resetOverrideOnAutoChange } from '$lib/modules/damage-calculator/calc/autoOverride.svelte';
	import ToggleButton from '$lib/components/shared/ui/ToggleButton.svelte';

	// conditions/allySupport are $bindable: this two-way-binds into
	// conditions.protect / .reflect / ... and allySupport.helpingHand via
	// child bind: directives — see +page.svelte (where this is rendered)
	// for why that needs declaring explicitly. Both are shared by both of a
	// team's slots, same as `AllySupportToggles`' own `support` — this
	// renders once per team. Helping Hand lives here rather than in
	// `AllySupportToggles` because — unlike Friend Guard/Battery/Power
	// Spot/Steely Spirit — it has no Auto mode either, same as every other
	// toggle in this card except Intimidate.
	let {
		conditions = $bindable(),
		allySupport = $bindable(),
		slots,
		disabled = false
	}: {
		conditions: TeamSideConditions;
		allySupport: TeamAllySupport;
		slots: [TeamSlot, TeamSlot];
		disabled?: boolean;
	} = $props();

	// Forcing Intimidate On/Off only lasts as long as the team state that
	// made it worth forcing — clears back to Auto the moment a Pokemon
	// with (or without) the Intimidate ability actually gets selected onto
	// or off this team, though it can always be forced again afterward
	// (`forceIntimidate`, below).
	resetOverrideOnAutoChange(
		() => slots.some((slot) => slot.ability === 'Intimidate'),
		() => (conditions.intimidate = null)
	);

	/**
	 * Forces Intimidate's own override to the opposite of whatever it
	 * currently, effectively shows (`providesIntimidate` — live
	 * auto-derived while `conditions.intimidate` is still `null`, or the
	 * standing override otherwise) — same convention
	 * `FieldConditionsPicker`'s field abilities use: `resetOverrideOnAutoChange`
	 * above clears that override back to Auto automatically once it stops
	 * matching the team's own state, and forcing it again afterward is
	 * always still one click away.
	 */
	function forceIntimidate() {
		conditions.intimidate = !providesIntimidate(slots, conditions);
	}

	/** Describes Intimidate's *actual* current state, same convention as `FieldConditionsPicker`'s own field-ability tooltips. */
	function intimidateTooltip(): string {
		const provider = slots.find((slot) => slot.ability === 'Intimidate') ?? null;
		if (conditions.intimidate === null) {
			return `Intimidate: Auto — ${provider ? `${provider.species?.name ?? 'that Pokémon'} has it` : 'neither Pokémon has it'}`;
		}
		return `Intimidate: forced ${conditions.intimidate ? 'on' : 'off'} for the whole team`;
	}

	/** Cycles Spikes' layer count 0 -> 1 -> 2 -> 3 -> back to 0, one button instead of 4. */
	function cycleSpikes() {
		conditions.spikes = (conditions.spikes + 1) % 4;
	}
</script>

<div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-gray-400">
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
		active={providesIntimidate(slots, conditions)}
		{disabled}
		onclick={forceIntimidate}
		title={intimidateTooltip()}
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
	<ToggleButton
		class="rounded border border-gray-700"
		active={conditions.spikes > 0}
		{disabled}
		onclick={cycleSpikes}
		title="Cycles 0 -> 1 -> 2 -> 3 layers of Spikes"
	>
		Spikes {conditions.spikes > 0 ? `(${conditions.spikes})` : ''}
	</ToggleButton>
</div>

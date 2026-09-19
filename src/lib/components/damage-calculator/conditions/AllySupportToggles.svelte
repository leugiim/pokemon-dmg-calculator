<script lang="ts">
	import type {
		TeamAllySupport,
		TeamSlot
	} from '$lib/modules/damage-calculator/stores/team.svelte';
	import {
		providesStaticSupport,
		staticAllySupportAbility,
		STATIC_ALLY_SUPPORT_FLAGS,
		type StaticAllySupportFlag
	} from '$lib/modules/damage-calculator/calc/allySupport';
	import { resetOverrideOnAutoChange } from '$lib/modules/damage-calculator/calc/autoOverride.svelte';
	import ToggleButton from '$lib/components/shared/ui/ToggleButton.svelte';

	// support is $bindable: this two-way-binds into support.friendGuard /
	// .battery / ... via child bind: directives — see +page.svelte (where
	// this is rendered) for why that needs declaring explicitly. One
	// `support` object is shared by both of a team's slots (ADR-0003, #13)
	// — this renders once per team, not once per Pokémon.
	let {
		support = $bindable(),
		slots,
		disabled = false
	}: { support: TeamAllySupport; slots: [TeamSlot, TeamSlot]; disabled?: boolean } = $props();

	/**
	 * Which of this team's two Pokémon Auto mode would credit for `flag` —
	 * at most one, since only one Pokémon can have a given ability equipped
	 * — or `null` if neither does. Routed through `providesStaticSupport`
	 * itself (with no `teamSupport`, so it falls straight through to the
	 * plain ability check) rather than re-implementing the match here, so
	 * this can never drift from the real derivation `computeDamage` uses.
	 */
	function autoProvider(flag: StaticAllySupportFlag): TeamSlot | null {
		return slots.find((slot) => providesStaticSupport(slot, flag)) ?? null;
	}

	// Forcing a static ally-support flag On/Off only lasts as long as the
	// team state that made it worth forcing — clears back to Auto the
	// moment a Pokemon with (or without) that flag's own ability actually
	// gets selected onto or off this team, though it can always be forced
	// again afterward (`forceSupport`, below).
	for (const flag of STATIC_ALLY_SUPPORT_FLAGS) {
		resetOverrideOnAutoChange(
			() => autoProvider(flag) !== null,
			() => (support[flag] = null)
		);
	}

	/**
	 * Describes `flag`'s *actual* current state — not just what Auto mode
	 * would derive — so a manual On/Off override doesn't leave the tooltip
	 * describing a state the calculator isn't actually using (a forced-Off
	 * flag next to "Auto: X has it" reads as still active).
	 */
	function tooltip(flag: StaticAllySupportFlag): string {
		const ability = staticAllySupportAbility(flag);
		const provider = autoProvider(flag);
		if (support[flag] === null) {
			return `${ability}: Auto — ${provider ? `${provider.species?.name ?? 'that Pokémon'} has it` : 'neither Pokémon has it'}`;
		}
		const active = providesStaticSupport(provider ?? slots[0], flag, support);
		return `${ability}: forced ${active ? 'on' : 'off'} for the whole team`;
	}

	/** `flag`'s current effective state — `support`'s own override, or (while unset) whether `autoProvider` found a teammate that grants it. */
	function effectiveSupport(flag: StaticAllySupportFlag): boolean {
		return support[flag] ?? autoProvider(flag) !== null;
	}

	/**
	 * Forces `flag`'s own override to the opposite of whatever it
	 * currently, effectively shows — same convention
	 * `FieldConditionsPicker`'s field abilities and `SideConditionsToggles`'
	 * Intimidate use in place of the 3-option `<select>` this replaced: while
	 * untouched the button tracks Auto live, one click pins it to a manual
	 * override, and `resetOverrideOnAutoChange` above clears that override
	 * back to Auto automatically once it stops matching the team's own
	 * state — forcing it again afterward is always still one click away.
	 */
	function forceSupport(flag: StaticAllySupportFlag) {
		support[flag] = !effectiveSupport(flag);
	}
</script>

<div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-gray-400">
	{#each STATIC_ALLY_SUPPORT_FLAGS as flag (flag)}
		{@const ability = staticAllySupportAbility(flag)}
		<ToggleButton
			class="rounded border border-gray-700"
			active={effectiveSupport(flag)}
			{disabled}
			onclick={() => forceSupport(flag)}
			title={tooltip(flag)}
		>
			{ability}
		</ToggleButton>
	{/each}
</div>

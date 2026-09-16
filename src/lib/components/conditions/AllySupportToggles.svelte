<script lang="ts">
	import type { TeamAllySupport, TeamSlot } from '$lib/stores/team.svelte';
	import {
		providesStaticSupport,
		staticAllySupportAbility,
		STATIC_ALLY_SUPPORT_FLAGS,
		type StaticAllySupportFlag
	} from '$lib/calc/allySupport';

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
</script>

<div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-gray-400">
	<span class="font-medium text-gray-300">Ally support</span>
	{#each STATIC_ALLY_SUPPORT_FLAGS as flag (flag)}
		{@const ability = staticAllySupportAbility(flag)}
		<label class="flex items-center gap-1" title={tooltip(flag)}>
			{ability}
			<select
				class="rounded bg-gray-800 px-1 py-0.5 text-[10px] text-gray-200 disabled:opacity-30"
				aria-label="{ability} override"
				{disabled}
				bind:value={support[flag]}
			>
				<option value={null}>Auto</option>
				<option value={true}>On</option>
				<option value={false}>Off</option>
			</select>
		</label>
	{/each}
</div>

<script lang="ts">
	import type { TeamAllySupport, TeamSlot } from '$lib/stores/team.svelte';
	import { staticAllySupportAbility, STATIC_ALLY_SUPPORT_FLAGS } from '$lib/calc/allySupport';

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
	 * Which of this team's two Pokémon Auto mode would currently credit for
	 * `ability` — at most one, since only one Pokémon can have a given
	 * ability equipped — or `null` if neither does. Shown as a tooltip so a
	 * user in Auto mode isn't left guessing whether the flag is actually in
	 * effect (it can only ever help one specific teammate's calculations,
	 * never both, even though the override next to it is team-wide).
	 */
	function autoProvider(ability: string): TeamSlot | null {
		return slots.find((slot) => slot.ability === ability) ?? null;
	}
</script>

<div
	class="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-gray-800 bg-gray-900 p-3 text-[10px] text-gray-400 shadow-sm"
>
	<span class="font-medium text-gray-300">Ally support</span>
	{#each STATIC_ALLY_SUPPORT_FLAGS as flag (flag)}
		{@const ability = staticAllySupportAbility(flag)}
		{@const provider = autoProvider(ability)}
		<label
			class="flex items-center gap-1"
			title="Auto: {provider
				? `${provider.species?.name ?? 'that Pokémon'} has ${ability}`
				: `neither Pokémon has ${ability}`}"
		>
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
	<label class="flex items-center gap-1">
		<input type="checkbox" {disabled} bind:checked={support.helpingHand} />
		Helping Hand
	</label>
	<label class="flex items-center gap-1">
		<input type="checkbox" {disabled} bind:checked={support.tailwind} />
		Tailwind
	</label>
</div>

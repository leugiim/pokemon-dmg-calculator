<script lang="ts">
	import type { TeamSlot } from '$lib/stores/team.svelte';
	import {
		providesStaticSupport,
		staticAllySupportAbility,
		STATIC_ALLY_SUPPORT_FLAGS
	} from '$lib/calc/allySupport';

	// slot is $bindable: this two-way-binds into slot.allySupportOverrides /
	// providesHelpingHand / providesTailwind via child bind: directives —
	// see TeamSlotCard.svelte for why that needs declaring explicitly.
	let { slot = $bindable(), disabled = false }: { slot: TeamSlot; disabled?: boolean } = $props();
</script>

<div
	class="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-gray-800 pt-2 text-[10px] text-gray-400"
>
	<span class="font-medium text-gray-300">Ally support</span>
	{#each STATIC_ALLY_SUPPORT_FLAGS as flag (flag)}
		{@const ability = staticAllySupportAbility(flag)}
		<label
			class="flex items-center gap-1"
			title="{ability}: currently {providesStaticSupport(slot, flag) ? 'active' : 'inactive'}"
		>
			{ability}
			<select
				class="rounded bg-gray-800 px-1 py-0.5 text-[10px] text-gray-200 disabled:opacity-30"
				aria-label="{ability} override"
				{disabled}
				bind:value={slot.allySupportOverrides[flag]}
			>
				<option value={null}>Auto</option>
				<option value={true}>On</option>
				<option value={false}>Off</option>
			</select>
		</label>
	{/each}
	<label class="flex items-center gap-1">
		<input type="checkbox" {disabled} bind:checked={slot.providesHelpingHand} />
		Helping Hand
	</label>
	<label class="flex items-center gap-1">
		<input type="checkbox" {disabled} bind:checked={slot.providesTailwind} />
		Tailwind
	</label>
</div>

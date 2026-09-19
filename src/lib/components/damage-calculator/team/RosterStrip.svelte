<script lang="ts">
	import { allSpecies } from '$lib/modules/shared/species/generation';
	import { findByName } from '$lib/modules/damage-calculator/calc/pokepaste';
	import type { TeamRoster } from '$lib/modules/damage-calculator/stores/roster.svelte';
	import SpeciesSprite from '$lib/components/shared/species/SpeciesSprite.svelte';

	/**
	 * The whole team behind a side (up to 6), with the two on the field
	 * marked. Each member has a "1" and a "2" button that bring it into that
	 * slot (swapping if it's in the other one), and a trash button that takes
	 * it out of the team.
	 */
	let { roster }: { roster: TeamRoster } = $props();

	const SOURCE_LABELS = { common: 'common set', none: 'no set' } as const;
</script>

{#if roster.members.length > 0}
	<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
		{#each roster.members as member, i (i)}
			{@const species = findByName(allSpecies, member.data.species)}
			{@const slotOn = roster.active[0] === i ? 1 : roster.active[1] === i ? 2 : null}
			<div
				class="flex flex-col gap-1 rounded-lg border p-2 {slotOn
					? 'border-sky-500 bg-sky-950/40'
					: 'border-gray-800 bg-gray-900'}"
			>
				<div class="flex items-center gap-2">
					{#if species}<SpeciesSprite {species} size={32} />{/if}
					<div class="min-w-0">
						<div class="truncate text-xs font-medium text-gray-100" title={member.name}>
							{member.name}
						</div>
						{#if member.source !== 'saved'}
							<div class="text-[10px] text-amber-400">{SOURCE_LABELS[member.source]}</div>
						{/if}
					</div>
					<button
						type="button"
						aria-label="Remove {member.name} from the team"
						title="Remove from the team"
						onclick={() => roster.remove(i)}
						class="ml-auto shrink-0 self-start rounded p-1 text-gray-500 hover:bg-gray-800 hover:text-red-400"
					>
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<polyline points="3 6 5 6 21 6" />
							<path
								d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
							/>
						</svg>
					</button>
				</div>
				<div class="flex items-center gap-1">
					<span class="mr-auto text-[10px] text-gray-500">
						{slotOn ? `On the field (slot ${slotOn})` : 'Bench'}
					</span>
					{#each [0, 1] as const as s (s)}
						<button
							type="button"
							aria-pressed={roster.active[s] === i}
							aria-label="Put {member.name} in slot {s + 1}"
							title="Put in slot {s + 1}"
							onclick={() => roster.activate(s, i)}
							class="h-5 w-6 rounded text-[10px] {roster.active[s] === i
								? 'bg-sky-600 text-white'
								: 'bg-gray-800 text-gray-300 hover:bg-gray-700'}"
						>
							{s + 1}
						</button>
					{/each}
				</div>
			</div>
		{/each}
	</div>
{/if}

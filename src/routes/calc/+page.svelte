<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import {
		teamA,
		teamB,
		sides,
		allySupport,
		sideConditions
	} from '$lib/modules/damage-calculator/stores/team.svelte';
	import { field } from '$lib/modules/damage-calculator/stores/field.svelte';
	import AllySupportToggles from '$lib/components/damage-calculator/conditions/AllySupportToggles.svelte';
	import DamageMatrix from '$lib/components/damage-calculator/damage/DamageMatrix.svelte';
	import FieldConditionsPicker from '$lib/components/damage-calculator/conditions/FieldConditionsPicker.svelte';
	import SideConditionsToggles from '$lib/components/damage-calculator/conditions/SideConditionsToggles.svelte';
	import TeamSlotCard from '$lib/components/damage-calculator/team/TeamSlotCard.svelte';
	import RosterStrip from '$lib/components/damage-calculator/team/RosterStrip.svelte';
	import TeamToolbar from '$lib/components/damage-calculator/team/TeamToolbar.svelte';
	import Button from '$lib/components/shared/ui/Button.svelte';
	import { loadHandoff, rivalSetsToSave, rosterA, rosterB } from '$lib/modules/damage-calculator';
	import {
		exportTeamPaste,
		generateId,
		readHandoff,
		writeHandoffResult,
		type PokemonSetData
	} from '$lib/modules/shared';
	import { displayName, planner } from '$lib/modules/team-planner';
	import { providesIntimidate } from '$lib/modules/damage-calculator/calc/sideConditions';

	// A match opened from the team planner (`/calc?handoff=<id>`): both whole
	// teams are loaded here. Read on mount, not from `page`, because this
	// page is prerendered and has no query string then.
	let handoffId = $state<string | null>(null);
	let handoffTitle = $state('');
	let fromMatch = $state(true);
	let handoffMissing = $state(false);
	let saved = $state<'idle' | 'saved' | 'failed'>('idle');

	onMount(() => {
		const id = new URLSearchParams(window.location.search).get('handoff');
		if (!id) return;
		const handoff = readHandoff(id);
		if (!handoff) {
			handoffMissing = true;
			return;
		}
		loadHandoff(handoff);
		handoffId = id;
		handoffTitle = handoff.teamName ?? 'your team';
		fromMatch = handoff.purpose !== 'team';
	});

	/** "Save as new team": the calculator hands the team over, the planner keeps it. */
	function saveAsNewTeam(sets: PokemonSetData[], name: string) {
		const team = {
			id: generateId(),
			name: name.trim() || sets.map(displayName).join(' / '),
			paste: exportTeamPaste(sets),
			pokemon: sets,
			createdAt: Date.now()
		};
		planner.saveTeam(team);
		return { id: team.id, name: team.name };
	}

	function saveRivalSets() {
		if (!handoffId) return;
		saved = writeHandoffResult(handoffId, rivalSetsToSave()) ? 'saved' : 'failed';
	}

	const teamADisabled = $derived(!teamA[0].species && !teamA[1].species);
	const teamBDisabled = $derived(!teamB[0].species && !teamB[1].species);
</script>

<div class="flex w-full flex-1 flex-col gap-2 bg-gray-950 px-4 py-8 sm:px-8 lg:px-16">
	<header class="text-center">
		<h1 class="text-2xl font-bold text-gray-100">Pokémon DMG Calculator</h1>
		<p class="text-sm text-gray-300">2v2 VGC damage calculator</p>
	</header>

	{#if handoffId}
		<div
			class="flex flex-wrap items-center gap-3 rounded-xl border border-sky-800 bg-sky-950/40 px-4 py-3 text-sm text-gray-200"
		>
			{#if fromMatch}
				<span>
					Loaded from your match: <strong>{handoffTitle}</strong> as Team A, the opposing team as Team
					B. Pick who's on the field with the 1 / 2 buttons.
				</span>
				<div class="ml-auto flex items-center gap-3">
					{#if saved === 'saved'}
						<span class="text-xs text-emerald-400">
							Saved. Go back to the match tab: the rival sets are there.
						</span>
					{:else if saved === 'failed'}
						<span class="text-xs text-red-400">Couldn't save (browser storage unavailable).</span>
					{/if}
					<Button size="sm" variant="primary" onclick={saveRivalSets}>
						Save rival sets to the match
					</Button>
				</div>
			{:else}
				<span>
					Loaded your team: <strong>{handoffTitle}</strong> as Team A. Pick who's on the field with the
					1 / 2 buttons; Team B is yours to fill in.
				</span>
			{/if}
		</div>
	{:else if handoffMissing}
		<p class="rounded-xl border border-amber-800 bg-amber-950/40 px-4 py-3 text-sm text-amber-200">
			That data is no longer available (it expires after a day). Open the calculator again from the
			team or the match.
		</p>
	{/if}

	<div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_1fr]">
		<section class="@container flex flex-col gap-4">
			<TeamToolbar
				title="Team A"
				roster={rosterA}
				onsaveteam={saveAsNewTeam}
				teamHref={(id) => resolve('/teams/[id]', { id })}
			/>
			<RosterStrip roster={rosterA} />
			{#each [0, 1] as i (i)}
				<TeamSlotCard
					bind:slot={teamA[i]}
					roster={rosterA}
					slotIndex={i as 0 | 1}
					tailwind={allySupport.teamA.tailwind}
					intimidated={providesIntimidate(teamB, sideConditions.teamB)}
				/>
			{/each}
		</section>

		<section class="@container flex flex-col gap-4">
			<TeamToolbar
				title="Team B"
				roster={rosterB}
				onsaveteam={saveAsNewTeam}
				teamHref={(id) => resolve('/teams/[id]', { id })}
			/>
			<RosterStrip roster={rosterB} />
			{#each [0, 1] as i (i)}
				<TeamSlotCard
					bind:slot={teamB[i]}
					roster={rosterB}
					slotIndex={i as 0 | 1}
					tailwind={allySupport.teamB.tailwind}
					intimidated={providesIntimidate(teamA, sideConditions.teamA)}
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
					slots={teamA}
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
					slots={teamB}
					disabled={teamBDisabled}
				/>
				<DamageMatrix teamId="teamB" {sides} {allySupport} {sideConditions} {field} />
			</div>
		</section>
	</div>
</div>

<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Button from '$lib/components/shared/ui/Button.svelte';
	import { generateId } from '$lib/modules/shared';
	import {
		displayName,
		getPokemonNames,
		LEAD_SIZE,
		padRivalSlots,
		planner,
		RESULT_LABELS,
		SELECTION_SIZE,
		syncRivalPicks,
		toggleLead,
		toggleSelection,
		validateMatch,
		type MatchResult,
		type Team
	} from '$lib/modules/team-planner';
	import PokeToggleGroup from './PokeToggleGroup.svelte';
	import PokemonInput from './PokemonInput.svelte';

	/** Records a match for `team`, or edits the match `matchId`. */
	let { team, matchId = undefined }: { team: Team; matchId?: string } = $props();

	const RESULTS: MatchResult[] = ['win', 'loss', 'ongoing'];

	// The saved match (when editing) seeds the fields once; they're the
	// reader's own from then on.
	// svelte-ignore state_referenced_locally
	const original = matchId
		? (planner.loadMatches(team.id).find((m) => m.id === matchId) ?? null)
		: null;

	let result = $state<MatchResult | ''>(original?.result ?? '');
	let selection = $state(original?.selection ?? []);
	let lead = $state(original?.lead ?? []);
	let rivalTeam = $state(padRivalSlots(original?.rivalTeam ?? []));
	let rivalSelection = $state(original?.rivalSelection ?? []);
	let rivalLead = $state(original?.rivalLead ?? []);
	let notes = $state(original?.notes ?? '');
	let error = $state('');
	let pokemonNames = $state<string[]>([]);

	onMount(() => {
		getPokemonNames().then((names) => (pokemonNames = names));
	});

	const ownNames = $derived(team.pokemon.map(displayName));
	const rivalFilled = $derived(rivalTeam.map((n) => n.trim()).filter(Boolean));
	const speciesByName = $derived(
		Object.fromEntries(team.pokemon.map((p) => [displayName(p), p.species]))
	);
	const backHref = $derived(resolve('/teams/[id]', { id: team.id }));

	function pickOwn(name: string) {
		({ selection, lead } = toggleSelection({ selection, lead }, name));
	}

	function pickRival(name: string) {
		({ selection: rivalSelection, lead: rivalLead } = toggleSelection(
			{ selection: rivalSelection, lead: rivalLead },
			name
		));
	}

	// Changing a rival's name only drops the picks that no longer exist.
	function onRivalChange() {
		({ selection: rivalSelection, lead: rivalLead } = syncRivalPicks(rivalTeam, {
			selection: rivalSelection,
			lead: rivalLead
		}));
	}

	function save() {
		error = validateMatch({ result, selection, lead }) ?? '';
		if (error || !result) return;

		planner.saveMatch({
			// Editing keeps the rival sets and paste that this form doesn't show.
			...original,
			id: original?.id ?? generateId(),
			teamId: team.id,
			date: original?.date ?? Date.now(),
			result,
			teamRoster: original?.teamRoster ?? ownNames,
			selection,
			lead,
			rivalTeam: rivalFilled,
			rivalSelection,
			rivalLead,
			notes: notes.trim()
		});
		goto(backHref);
	}

	const label = 'text-sm font-medium text-gray-200';
	const hint = 'text-xs font-normal text-gray-500';
</script>

<div class="flex flex-col gap-6">
	<section class="flex flex-col gap-2">
		<span class={label}>Result</span>
		<div class="flex gap-2">
			{#each RESULTS as r (r)}
				<Button
					class={result === r ? 'ring-2 ring-sky-500' : ''}
					variant={result === r ? 'primary' : 'secondary'}
					onclick={() => (result = r)}
				>
					{RESULT_LABELS[r]}
				</Button>
			{/each}
		</div>
	</section>

	<section class="flex flex-col gap-2">
		<span class={label}>
			Your selection <span class={hint}>({selection.length}/{SELECTION_SIZE} selected)</span>
		</span>
		<PokeToggleGroup names={ownNames} selected={selection} ontoggle={pickOwn} {speciesByName} />
	</section>

	{#if selection.length === SELECTION_SIZE}
		<section class="flex flex-col gap-2">
			<span class={label}
				>Your lead <span class={hint}>({lead.length}/{LEAD_SIZE} selected)</span></span
			>
			<PokeToggleGroup
				names={selection}
				selected={lead}
				ontoggle={(name) => (lead = toggleLead(lead, name))}
				icons={false}
			/>
		</section>
	{/if}

	<section class="flex flex-col gap-2">
		<span class={label}>Opposing team <span class={hint}>(optional, up to 6 Pokémon)</span></span>
		<div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
			{#each [...rivalTeam.keys()] as i (i)}
				<PokemonInput
					bind:value={rivalTeam[i]}
					allNames={pokemonNames}
					placeholder={`Pokémon ${i + 1}`}
					onchange={onRivalChange}
				/>
			{/each}
		</div>

		{#if rivalFilled.length >= 2}
			<span class="{label} mt-2">
				Opposing selection <span class={hint}>({rivalSelection.length}/{SELECTION_SIZE})</span>
			</span>
			<PokeToggleGroup
				names={rivalFilled}
				selected={rivalSelection}
				ontoggle={pickRival}
				icons={false}
			/>
		{/if}

		{#if rivalSelection.length >= 2}
			<span class="{label} mt-2">
				Opposing lead <span class={hint}>({rivalLead.length}/{LEAD_SIZE})</span>
			</span>
			<PokeToggleGroup
				names={rivalSelection}
				selected={rivalLead}
				ontoggle={(name) => (rivalLead = toggleLead(rivalLead, name))}
				icons={false}
			/>
		{/if}
	</section>

	<section class="flex flex-col gap-1">
		<label for="match-notes" class={label}>Notes <span class={hint}>(optional)</span></label>
		<textarea
			id="match-notes"
			bind:value={notes}
			rows="4"
			placeholder="Key crit, missed move, turning point…"
			class="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500"
		></textarea>
	</section>

	{#if error}
		<p class="text-sm text-red-400">{error}</p>
	{/if}

	<div class="flex justify-end gap-2">
		<Button href={backHref}>Cancel</Button>
		<Button variant="primary" onclick={save}>{matchId ? 'Save changes' : 'Save match'}</Button>
	</div>
</div>

<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/components/shared/ui/Button.svelte';
	import {
		filterMatches,
		getPokemonNames,
		historyToJson,
		jsonToHistory,
		jsonToMatch,
		matchToJson,
		planner,
		RESULT_LABELS,
		type Match,
		type MatchResult,
		type ResultFilter
	} from '$lib/modules/team-planner';
	import IOModal from './IOModal.svelte';
	import MatchItem from './MatchItem.svelte';
	import PokeToggleGroup from './PokeToggleGroup.svelte';
	import PokemonInput from './PokemonInput.svelte';

	let {
		teamId,
		matches,
		allPokeNames,
		speciesByName = {}
	}: {
		teamId: string;
		matches: Match[];
		allPokeNames: string[];
		speciesByName?: Record<string, string>;
	} = $props();

	const PAGE_SIZE = 10;
	const RESULTS: MatchResult[] = ['win', 'loss', 'ongoing'];

	type ModalState =
		| { mode: 'export'; title: string; content: string }
		| { mode: 'import'; title: string; onimport: (text: string) => void }
		| null;

	let modal = $state<ModalState>(null);
	let resultFilter = $state<ResultFilter>('');
	let ownFilter = $state('');
	let rivalFilter = $state('');
	let page = $state(0);
	let pokemonNames = $state<string[]>([]);

	onMount(() => {
		getPokemonNames().then((names) => (pokemonNames = names));
	});

	const filtered = $derived(
		filterMatches(matches, { result: resultFilter, own: ownFilter, rival: rivalFilter })
	);
	const totalPages = $derived(Math.ceil(filtered.length / PAGE_SIZE));
	const safePage = $derived(Math.min(page, Math.max(0, totalPages - 1)));
	const paginated = $derived(filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE));

	function toggleResult(r: MatchResult) {
		resultFilter = resultFilter === r ? '' : r;
		page = 0;
	}

	function toggleOwn(name: string) {
		ownFilter = ownFilter === name ? '' : name;
		page = 0;
	}

	function deleteMatch(match: Match) {
		if (!confirm('Delete this match?')) return;
		planner.deleteMatch(match.id, teamId);
	}

	function exportMatch(match: Match) {
		modal = { mode: 'export', title: 'Export match', content: matchToJson(match) };
	}

	function importMatch() {
		modal = {
			mode: 'import',
			title: 'Import match',
			onimport: (text) => {
				const match = jsonToMatch(text, teamId);
				if (!match) {
					alert('Invalid JSON or wrong format.');
					return;
				}
				planner.saveMatch(match);
				modal = null;
			}
		};
	}

	function exportHistory() {
		modal = { mode: 'export', title: 'Export history', content: historyToJson(matches) };
	}

	function importHistory() {
		modal = {
			mode: 'import',
			title: 'Import history',
			onimport: (text) => {
				const imported = jsonToHistory(text, teamId);
				if (!imported) {
					alert('Invalid JSON or wrong format.');
					return;
				}
				if (!confirm(`${imported.length} matches will be imported. Continue?`)) return;
				imported.forEach((m) => planner.saveMatch(m));
				modal = null;
			}
		};
	}
</script>

<div class="flex flex-col gap-3">
	<div class="flex flex-wrap gap-2">
		{#each RESULTS as r (r)}
			<Button
				size="sm"
				class={resultFilter === r ? 'ring-2 ring-sky-500' : ''}
				onclick={() => toggleResult(r)}
			>
				{RESULT_LABELS[r]}
			</Button>
		{/each}
	</div>

	<PokeToggleGroup
		names={allPokeNames}
		selected={[ownFilter]}
		ontoggle={toggleOwn}
		small
		{speciesByName}
	/>

	<div class="flex flex-wrap items-start gap-2">
		<div class="w-64 max-w-full">
			<PokemonInput
				bind:value={rivalFilter}
				allNames={pokemonNames}
				placeholder="Filter by opposing Pokémon…"
				onchange={() => (page = 0)}
			/>
		</div>
		{#if rivalFilter}
			<Button
				size="sm"
				onclick={() => {
					rivalFilter = '';
					page = 0;
				}}
			>
				Clear
			</Button>
		{/if}
		<div class="ml-auto flex flex-wrap gap-2">
			<Button size="sm" onclick={importMatch}>Import match</Button>
			<Button size="sm" onclick={importHistory}>Import history</Button>
			{#if matches.length > 0}
				<Button size="sm" onclick={exportHistory}>Export history</Button>
			{/if}
		</div>
	</div>

	{#if matches.length === 0}
		<p class="text-sm text-gray-500">No matches yet.</p>
	{:else if filtered.length === 0}
		<p class="text-sm text-gray-500">No matches with those filters.</p>
	{:else}
		<ul class="flex flex-col gap-2">
			{#each paginated as match (match.id)}
				<MatchItem {match} {speciesByName} onexport={exportMatch} ondelete={deleteMatch} />
			{/each}
		</ul>
		{#if totalPages > 1}
			<div class="flex items-center justify-center gap-3">
				<Button size="sm" disabled={safePage === 0} onclick={() => (page = safePage - 1)}>
					← Previous
				</Button>
				<span class="text-xs text-gray-400">Page {safePage + 1} of {totalPages}</span>
				<Button
					size="sm"
					disabled={safePage >= totalPages - 1}
					onclick={() => (page = safePage + 1)}
				>
					Next →
				</Button>
			</div>
		{/if}
	{/if}
</div>

{#if modal}
	{#if modal.mode === 'export'}
		<IOModal
			mode="export"
			title={modal.title}
			content={modal.content}
			onclose={() => (modal = null)}
		/>
	{:else}
		<IOModal
			mode="import"
			title={modal.title}
			onimport={modal.onimport}
			onclose={() => (modal = null)}
		/>
	{/if}
{/if}

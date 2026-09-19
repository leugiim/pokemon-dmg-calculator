<script lang="ts">
	import type { TeamRoster } from '$lib/modules/damage-calculator/stores/roster.svelte';
	import { importTeamPaste } from '$lib/modules/damage-calculator/stores/roster.svelte';
	import { exportTeamPaste, type PokemonSetData } from '$lib/modules/shared';

	/**
	 * A side's heading with what you can do with its whole team: **Export**
	 * copies it as one PokePaste, **Import** replaces it with a pasted one, and
	 * **Save as new team** hands it to `onsaveteam` (the page decides where it's
	 * kept, the calculator knows nothing about the planner).
	 */
	let {
		title,
		roster,
		onsaveteam = undefined,
		teamHref = undefined
	}: {
		title: string;
		roster: TeamRoster;
		/** Saves the team and returns what was created. Leave out to hide "Save as new team". */
		onsaveteam?: (sets: PokemonSetData[], name: string) => { id: string; name: string };
		/** Where the saved team can be opened. */
		teamHref?: (id: string) => string;
	} = $props();

	let copied = $state(false);
	/** Set only when the Clipboard API fails: shows the text so it can be copied by hand. */
	let pasteFallback = $state<string | null>(null);

	let importOpen = $state(false);
	let importText = $state('');
	let importError = $state<string | null>(null);

	let saveOpen = $state(false);
	let saveName = $state('');
	let saved = $state<{ id: string; name: string } | null>(null);
	let notice = $state<string | null>(null);

	const empty = $derived(!roster.hasPokemon);

	async function copyTeam() {
		const sets = roster.currentTeam();
		if (sets.length === 0) return;
		const text = exportTeamPaste(sets);
		try {
			await navigator.clipboard.writeText(text);
			pasteFallback = null;
			copied = true;
			setTimeout(() => (copied = false), 1500);
		} catch {
			pasteFallback = text;
		}
	}

	function submitImport() {
		const { imported, unknown } = importTeamPaste(roster, importText);
		if (imported === 0) {
			importError = "Couldn't find any Pokémon in that paste.";
			return;
		}
		importOpen = false;
		importText = '';
		importError = null;
		saved = null;
		notice =
			`Imported ${imported} Pokémon.` +
			(unknown.length > 0 ? ` Not recognized, left out: ${unknown.join(', ')}.` : '');
	}

	function cancelImport() {
		importOpen = false;
		importText = '';
		importError = null;
	}

	function submitSave() {
		const sets = roster.currentTeam();
		if (!onsaveteam || sets.length === 0) return;
		saved = onsaveteam(sets, saveName);
		saveOpen = false;
		saveName = '';
		notice = null;
	}

	const button =
		'rounded border border-gray-700 bg-gray-800 px-2 py-1 text-[10px] text-gray-300 hover:bg-gray-700 disabled:pointer-events-none disabled:opacity-30';
</script>

<div class="flex flex-col gap-2">
	<div class="flex flex-wrap items-center justify-between gap-2">
		<h2 class="text-sm font-semibold text-gray-300">{title}</h2>
		<div class="flex flex-wrap gap-1">
			<button
				type="button"
				disabled={empty}
				title="Copy the whole team as a PokePaste"
				onclick={copyTeam}
				class={button}
			>
				{copied ? 'Copied!' : 'Export'}
			</button>
			<button
				type="button"
				title="Replace this team with a pasted PokePaste"
				onclick={() => (importOpen = !importOpen)}
				class={button}
			>
				Import
			</button>
			{#if onsaveteam}
				<button
					type="button"
					disabled={empty}
					title="Save the whole team in the team planner"
					onclick={() => (saveOpen = !saveOpen)}
					class={button}
				>
					Save as new team
				</button>
			{/if}
		</div>
	</div>

	{#if pasteFallback}
		<textarea
			readonly
			value={pasteFallback}
			rows="8"
			aria-label="Team PokePaste (copy manually)"
			onclick={(e) => e.currentTarget.select()}
			class="w-full rounded border border-gray-700 bg-gray-800 p-1 font-mono text-[10px] text-gray-100"
		></textarea>
	{/if}

	{#if importOpen}
		<textarea
			bind:value={importText}
			rows="8"
			placeholder="Paste a team PokePaste here (up to 6 Pokémon)…"
			aria-label="Team PokePaste to import"
			class="w-full rounded border border-gray-700 bg-gray-800 p-1 font-mono text-[10px] text-gray-100 placeholder:text-gray-500 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 focus:outline-none"
		></textarea>
		{#if importError}
			<p class="text-[10px] text-red-400">{importError}</p>
		{/if}
		<div class="flex gap-1">
			<button
				type="button"
				onclick={submitImport}
				class="rounded border border-gray-700 bg-indigo-600 px-2 py-1 text-[10px] text-white hover:bg-indigo-500"
			>
				Import team
			</button>
			<button type="button" onclick={cancelImport} class={button}>Cancel</button>
		</div>
	{/if}

	{#if saveOpen}
		<div class="flex flex-wrap items-center gap-1">
			<input
				type="text"
				bind:value={saveName}
				placeholder="Team name (optional)"
				aria-label="Team name"
				class="min-w-0 flex-1 rounded border border-gray-700 bg-gray-800 px-2 py-1 text-[11px] text-gray-100 placeholder:text-gray-500"
			/>
			<button
				type="button"
				onclick={submitSave}
				class="rounded border border-gray-700 bg-indigo-600 px-2 py-1 text-[10px] text-white hover:bg-indigo-500"
			>
				Save team
			</button>
			<button type="button" onclick={() => (saveOpen = false)} class={button}>Cancel</button>
		</div>
	{/if}

	{#if saved}
		<p class="text-[11px] text-emerald-400">
			Saved as “{saved.name}”.
			{#if teamHref}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a href={teamHref(saved.id)} class="underline hover:text-emerald-300">Open the team</a>
			{/if}
		</p>
	{/if}
	{#if notice}
		<p class="text-[11px] text-gray-400">{notice}</p>
	{/if}
</div>

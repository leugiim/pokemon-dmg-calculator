<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Button from '$lib/components/shared/ui/Button.svelte';
	import { generateId, parseTeamPaste } from '$lib/modules/shared';
	import { displayName, planner } from '$lib/modules/team-planner';
	import PokemonCard from './PokemonCard.svelte';

	const MAX_TEAM_SIZE = 6;
	const PLACEHOLDER =
		'Paste your Pokepaste here…\n\nE.g.:\nFlutter Mane @ Choice Specs\nAbility: Protosynthesis\nEVs: 32 SpA / 2 SpD / 32 Spe\nTimid Nature\n- Moonblast\n- Shadow Ball\n- Psyshock\n- Dazzling Gleam';

	/** Creates a team, or edits the paste of the team `teamId`. */
	let { teamId = undefined }: { teamId?: string } = $props();

	const existing = $derived(planner.teams.find((t) => t.id === teamId));

	// Filled from the saved team the first time it's available, then the
	// reader's own edits.
	let name = $state('');
	let paste = $state('');
	let seeded = $state(false);
	let error = $state('');

	$effect(() => {
		if (existing && !seeded) {
			name = existing.name;
			paste = existing.paste;
			seeded = true;
		}
	});

	const preview = $derived(paste.trim() ? parseTeamPaste(paste) : []);
	const backHref = $derived(teamId ? resolve('/teams/[id]', { id: teamId }) : resolve('/teams'));

	function save() {
		error = '';
		const trimmed = paste.trim();
		if (!trimmed) {
			error = 'Paste a valid Pokepaste.';
			return;
		}
		const pokemon = parseTeamPaste(trimmed);
		if (pokemon.length === 0) {
			error = "Couldn't parse the Pokepaste. Check the format.";
			return;
		}
		if (pokemon.length > MAX_TEAM_SIZE) {
			error = `${pokemon.length} Pokémon found. A VGC team has at most ${MAX_TEAM_SIZE}.`;
			return;
		}

		const id = teamId ?? generateId();
		planner.saveTeam({
			id,
			name: name.trim() || pokemon.map(displayName).join(' / '),
			paste: trimmed,
			pokemon,
			// Editing keeps the original creation date.
			createdAt: existing?.createdAt ?? Date.now()
		});
		goto(resolve('/teams/[id]', { id }));
	}

	const input =
		'w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500';
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-col gap-1">
		<label for="team-name" class="text-sm font-medium text-gray-200">
			Team name <span class="text-xs font-normal text-gray-500">(optional)</span>
		</label>
		<input
			id="team-name"
			type="text"
			placeholder="E.g. Torkoal Rain"
			bind:value={name}
			class={input}
		/>
	</div>

	<div class="flex flex-col gap-1">
		<label for="team-paste" class="text-sm font-medium text-gray-200">Pokepaste</label>
		<textarea
			id="team-paste"
			bind:value={paste}
			rows="16"
			spellcheck="false"
			placeholder={PLACEHOLDER}
			class="{input} font-mono"></textarea>
	</div>

	{#if error}
		<p class="text-sm text-red-400">{error}</p>
	{/if}

	{#if preview.length > 0}
		<div class="flex flex-col gap-2">
			<h3 class="text-sm font-semibold text-gray-200">Preview ({preview.length} Pokémon found)</h3>
			<div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
				{#each preview as pokemon, i (i)}
					<PokemonCard {pokemon} />
				{/each}
			</div>
		</div>
	{/if}

	<div class="flex justify-end gap-2">
		<Button href={backHref}>Cancel</Button>
		<Button variant="primary" onclick={save}>{teamId ? 'Save changes' : 'Create team'}</Button>
	</div>
</div>

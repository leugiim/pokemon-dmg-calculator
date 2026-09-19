<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Button from '$lib/components/shared/ui/Button.svelte';
	import { generateId, writeHandoff, type PokemonSetData } from '$lib/modules/shared';
	import { buildNewTeamHandoff } from '$lib/modules/team-planner';

	/**
	 * Takes you to the calculator to build a new team there, then save it with
	 * "Save as new team". With `sets`, the calculator starts from them (e.g.
	 * what was already pasted in the new team form).
	 */
	let {
		sets = [],
		name = '',
		size = 'md'
	}: {
		sets?: PokemonSetData[];
		name?: string;
		size?: 'sm' | 'md';
	} = $props();

	let error = $state('');

	function open() {
		const id = generateId();
		if (!writeHandoff(id, buildNewTeamHandoff(sets, name))) {
			error = "Couldn't open the calculator (browser storage unavailable).";
			return;
		}
		error = '';
		goto(resolve(`/calc?handoff=${encodeURIComponent(id)}`));
	}
</script>

<Button {size} onclick={open}>Create from calculator</Button>
{#if error}
	<p class="text-sm text-red-400">{error}</p>
{/if}

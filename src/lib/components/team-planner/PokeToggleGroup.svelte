<script lang="ts">
	import PokeIcon from './PokeIcon.svelte';

	/**
	 * A row of Pokémon buttons to pick from. The caller owns `selected` and
	 * the rules (how many, what a click does): this only reports the click.
	 */
	let {
		names,
		selected,
		ontoggle,
		icons = true,
		small = false,
		speciesByName = {}
	}: {
		names: string[];
		selected: string[];
		ontoggle: (name: string) => void;
		icons?: boolean;
		small?: boolean;
		/** Species of each name that's a nickname, for the icons. */
		speciesByName?: Record<string, string>;
	} = $props();
</script>

<div class="flex flex-wrap gap-2">
	{#each names as name (name)}
		{@const active = selected.includes(name)}
		<button
			type="button"
			aria-pressed={active}
			onclick={() => ontoggle(name)}
			class="inline-flex items-center gap-1 rounded-md border {small
				? 'px-2 py-0.5 text-xs'
				: 'px-3 py-1.5 text-sm'} transition-colors {active
				? 'border-sky-500 bg-sky-600/30 text-sky-100'
				: 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700'}"
		>
			{#if icons}<PokeIcon
					{name}
					species={speciesByName[name]}
					class={small ? 'h-5 w-5' : 'h-6 w-6'}
				/>{/if}
			{name}
		</button>
	{/each}
</div>

<script lang="ts">
	import { genderPairOf, type SpeciesItem } from '$lib/calc/generation';

	let {
		selected = $bindable(null),
		disabled = false
	}: { selected?: SpeciesItem | null; disabled?: boolean } = $props();

	const pair = $derived(selected ? genderPairOf(selected) : null);
	const isFemale = $derived(pair !== null && selected?.name === pair.female.name);
</script>

{#if pair}
	<div class="flex flex-col items-center gap-1">
		<button
			type="button"
			{disabled}
			onclick={() => (selected = pair.male)}
			aria-label="Male"
			aria-pressed={!isFemale}
			class="rounded-full px-1.5 text-sm leading-6 disabled:opacity-30 {!isFemale
				? 'bg-blue-500/20 text-blue-400'
				: 'text-gray-500'}"
		>
			♂
		</button>
		<button
			type="button"
			{disabled}
			onclick={() => (selected = pair.female)}
			aria-label="Female"
			aria-pressed={isFemale}
			class="rounded-full px-1.5 text-sm leading-6 disabled:opacity-30 {isFemale
				? 'bg-pink-500/20 text-pink-400'
				: 'text-gray-500'}"
		>
			♀
		</button>
	</div>
{/if}

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
	<div class="flex items-center gap-1">
		<button
			type="button"
			{disabled}
			onclick={() => (selected = pair.male)}
			aria-label="Male"
			aria-pressed={!isFemale}
			class="rounded-full px-1.5 text-sm leading-6 disabled:opacity-30 {!isFemale
				? 'bg-blue-100 text-blue-600'
				: 'text-gray-300'}"
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
				? 'bg-pink-100 text-pink-600'
				: 'text-gray-300'}"
		>
			♀
		</button>
	</div>
{/if}

<script lang="ts">
	import { formsOf, type SpeciesItem } from '$lib/calc/generation';

	let {
		selected = $bindable(null),
		disabled = false
	}: { selected?: SpeciesItem | null; disabled?: boolean } = $props();

	const forms = $derived(selected ? formsOf(selected) : []);

	function onchange(e: Event & { currentTarget: HTMLSelectElement }) {
		const next = forms.find((f) => f.species.name === e.currentTarget.value);
		if (next) selected = next.species;
	}
</script>

<select
	value={selected?.name}
	{onchange}
	disabled={disabled || forms.length <= 1}
	class="w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none disabled:opacity-40"
>
	{#each forms as f (f.species.name)}
		<option value={f.species.name}>{f.label}</option>
	{/each}
</select>

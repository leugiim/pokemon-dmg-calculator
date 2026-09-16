<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * A plain boolean on/off button — clicking it always just flips `active`
	 * (the caller decides what "on"/"off" means and owns the state), styled
	 * with a visible active/inactive look. Used both standalone (Protect,
	 * Helping Hand, ...) and as one button of a mutually-exclusive group
	 * (Weather, Terrain) — the mutual-exclusivity itself lives in the
	 * caller's own `onclick`, not here.
	 */
	let {
		active,
		onclick,
		disabled = false,
		class: className = '',
		title = undefined,
		children
	}: {
		active: boolean;
		onclick: () => void;
		disabled?: boolean;
		class?: string;
		title?: string;
		children: Snippet;
	} = $props();
</script>

<button
	type="button"
	{disabled}
	{onclick}
	{title}
	aria-pressed={active}
	class="px-2 py-0.5 text-[10px] transition-colors disabled:opacity-30 {active
		? 'bg-sky-600 text-white'
		: 'bg-gray-800 text-gray-300 hover:bg-gray-700'} {className}"
>
	{@render children()}
</button>

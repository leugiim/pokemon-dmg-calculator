<script lang="ts">
	/**
	 * A free-text input with name suggestions. The value is whatever is
	 * typed, so names that aren't in `allNames` are still allowed.
	 */
	let {
		value = $bindable(''),
		allNames,
		placeholder = '',
		onchange = undefined
	}: {
		value?: string;
		allNames: string[];
		placeholder?: string;
		onchange?: (value: string) => void;
	} = $props();

	const MAX_VISIBLE = 10;

	let open = $state(false);
	let highlighted = $state(0);
	let root: HTMLDivElement | undefined;

	const matches = $derived.by(() => {
		const q = value.trim().toLowerCase();
		return q ? allNames.filter((n) => n.toLowerCase().includes(q)) : [];
	});
	const visible = $derived(matches.slice(0, MAX_VISIBLE));

	function set(next: string) {
		value = next;
		onchange?.(next);
	}

	function select(name: string) {
		set(name);
		open = false;
		highlighted = 0;
	}

	function onInput(e: Event) {
		set((e.currentTarget as HTMLInputElement).value);
		open = true;
		highlighted = 0;
	}

	function onKeydown(e: KeyboardEvent) {
		if (!open || visible.length === 0) return;
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			highlighted = Math.min(highlighted + 1, visible.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			highlighted = Math.max(highlighted - 1, 0);
		} else if (e.key === 'Enter' && visible[highlighted]) {
			e.preventDefault();
			select(visible[highlighted]);
		} else if (e.key === 'Escape') {
			open = false;
		}
	}

	function onWindowMousedown(e: MouseEvent) {
		if (root && !root.contains(e.target as Node)) open = false;
	}
</script>

<svelte:window onmousedown={onWindowMousedown} />

<div bind:this={root} class="relative">
	<input
		type="text"
		{value}
		{placeholder}
		autocomplete="off"
		oninput={onInput}
		onfocus={() => {
			if (value.trim()) open = true;
		}}
		onkeydown={onKeydown}
		class="w-full rounded-md border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm text-gray-100 placeholder:text-gray-500"
	/>
	{#if open && visible.length > 0}
		<ul
			class="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-gray-700 bg-gray-900 py-1 shadow-lg"
		>
			{#each visible as name, i (name)}
				<li>
					<button
						type="button"
						onmousedown={() => select(name)}
						onmouseenter={() => (highlighted = i)}
						class="block w-full px-2 py-1 text-left text-sm text-gray-200 {i === highlighted
							? 'bg-gray-800'
							: ''}"
					>
						{name}
					</button>
				</li>
			{/each}
			{#if matches.length > MAX_VISIBLE}
				<li class="px-2 py-1 text-xs text-gray-500">…</li>
			{/if}
		</ul>
	{/if}
</div>

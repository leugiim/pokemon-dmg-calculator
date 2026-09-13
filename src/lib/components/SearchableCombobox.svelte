<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';

	let {
		items,
		selected = $bindable(null),
		getLabel,
		placeholder = 'Select…',
		icon,
		clearable = true,
		disabled = false
	}: {
		items: T[];
		selected?: T | null;
		getLabel: (item: T) => string;
		placeholder?: string;
		icon?: Snippet<[T]>;
		/** Whether a selection can be cleared back to `null` (default true). */
		clearable?: boolean;
		disabled?: boolean;
	} = $props();

	let query = $state('');
	let open = $state(false);
	let highlighted = $state(0);
	let inputEl: HTMLInputElement | undefined;

	const results = $derived.by(() => {
		const q = query.trim().toLowerCase();
		const matches = q ? items.filter((item) => getLabel(item).toLowerCase().includes(q)) : items;
		return matches.slice(0, 30);
	});

	function select(item: T) {
		selected = item;
		query = '';
		open = false;
		inputEl?.blur();
	}

	function onFocus() {
		open = true;
		highlighted = 0;
	}

	function onKeydown(e: KeyboardEvent) {
		if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
			open = true;
			return;
		}
		if (!open) return;

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				highlighted = Math.min(highlighted + 1, results.length - 1);
				break;
			case 'ArrowUp':
				e.preventDefault();
				highlighted = Math.max(highlighted - 1, 0);
				break;
			case 'Enter':
				e.preventDefault();
				if (results[highlighted]) select(results[highlighted]);
				break;
			case 'Escape':
				open = false;
				break;
		}
	}

	function clear() {
		selected = null;
		query = '';
		inputEl?.focus();
	}
</script>

<div class="relative">
	<div
		class="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-2 py-1.5 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 {disabled
			? 'opacity-40'
			: ''}"
	>
		{#if selected && !open && icon}
			{@render icon(selected)}
		{/if}
		<input
			bind:this={inputEl}
			type="text"
			class="w-full border-none p-0 text-sm focus:ring-0"
			placeholder={selected && !open ? getLabel(selected) : placeholder}
			bind:value={query}
			{disabled}
			onfocus={onFocus}
			onblur={() => setTimeout(() => (open = false), 100)}
			onkeydown={onKeydown}
		/>
		{#if selected && clearable}
			<button
				type="button"
				class="shrink-0 text-gray-400 hover:text-gray-600"
				onclick={clear}
				{disabled}
				aria-label="Clear selection"
			>
				✕
			</button>
		{/if}
	</div>

	{#if open && results.length > 0}
		<ul
			class="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
		>
			{#each results as item, i (getLabel(item))}
				<li>
					<button
						type="button"
						class="flex w-full items-center gap-2 px-2 py-1.5 text-left text-sm hover:bg-indigo-50 {i ===
						highlighted
							? 'bg-indigo-50'
							: ''}"
						onmousedown={(e) => e.preventDefault()}
						onclick={() => select(item)}
					>
						{#if icon}{@render icon(item)}{/if}
						<span>{getLabel(item)}</span>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

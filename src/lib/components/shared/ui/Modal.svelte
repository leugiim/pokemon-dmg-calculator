<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * A dialog over a dimmed backdrop. Closes on Escape and on a click on
	 * the backdrop itself (not one that bubbled up from the panel).
	 */
	let {
		title,
		onclose,
		children,
		actions = undefined
	}: {
		title: string;
		onclose: () => void;
		children: Snippet;
		/** Buttons for the footer. */
		actions?: Snippet;
	} = $props();

	const titleId = $props.id();

	function onBackdropKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onclose();
	}

	function onBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) onclose();
	}
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
	onclick={onBackdropClick}
	onkeydown={onBackdropKeydown}
	role="presentation"
>
	<div
		role="dialog"
		aria-modal="true"
		aria-labelledby={titleId}
		tabindex="-1"
		class="flex max-h-[85vh] w-full max-w-lg flex-col rounded-xl border border-gray-800 bg-gray-900 shadow-lg"
	>
		<div class="flex items-center justify-between border-b border-gray-800 px-4 py-3">
			<h2 id={titleId} class="text-sm font-semibold text-gray-100">{title}</h2>
			<button
				type="button"
				onclick={onclose}
				aria-label="Close"
				class="text-gray-400 hover:text-gray-200"
			>
				&times;
			</button>
		</div>
		<div class="flex flex-col gap-3 overflow-y-auto p-4">
			{@render children()}
		</div>
		{#if actions}
			<div class="flex justify-end gap-2 border-t border-gray-800 px-4 py-3">
				{@render actions()}
			</div>
		{/if}
	</div>
</div>

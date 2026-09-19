<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * A plain button in one of a few looks. Renders an `<a>` when `href` is
	 * given, so links and buttons line up the same way in a toolbar.
	 */
	let {
		variant = 'secondary',
		size = 'md',
		href = undefined,
		type = 'button',
		disabled = false,
		title = undefined,
		class: className = '',
		onclick = undefined,
		children
	}: {
		variant?: 'primary' | 'secondary' | 'danger';
		size?: 'sm' | 'md';
		href?: string;
		type?: 'button' | 'submit';
		disabled?: boolean;
		title?: string;
		class?: string;
		onclick?: (e: MouseEvent) => void;
		children: Snippet;
	} = $props();

	const classes = $derived(
		[
			'inline-flex items-center justify-center gap-1 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40',
			size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm',
			variant === 'primary'
				? 'bg-sky-600 text-white hover:bg-sky-500'
				: variant === 'danger'
					? 'bg-red-900/60 text-red-200 hover:bg-red-800'
					: 'bg-gray-800 text-gray-200 hover:bg-gray-700',
			className
		].join(' ')
	);
</script>

{#if href}
	<!-- Callers pass an already `resolve()`d path. -->
	<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
	<a {href} {title} class={classes}>{@render children()}</a>
{:else}
	<button {type} {disabled} {title} {onclick} class={classes}>{@render children()}</button>
{/if}

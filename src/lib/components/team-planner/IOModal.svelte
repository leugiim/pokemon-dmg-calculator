<script lang="ts">
	import Button from '$lib/components/shared/ui/Button.svelte';
	import Modal from '$lib/components/shared/ui/Modal.svelte';

	/** Shows JSON to copy (`export`) or takes pasted JSON to import (`import`). */
	let {
		mode,
		title,
		content = '',
		onimport = undefined,
		onclose
	}: {
		mode: 'export' | 'import';
		title: string;
		content?: string;
		onimport?: (text: string) => void;
		onclose: () => void;
	} = $props();

	// The starting text only; from then on it's the textarea's own.
	// svelte-ignore state_referenced_locally
	let text = $state(mode === 'export' ? content : '');
	let copied = $state(false);
	let textarea: HTMLTextAreaElement | undefined = $state();

	$effect(() => {
		textarea?.focus();
		if (mode === 'export') textarea?.select();
	});

	async function copy() {
		try {
			await navigator.clipboard.writeText(text);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			// clipboard blocked: the text is selected, so Ctrl+C still works
		}
	}
</script>

<Modal {title} {onclose}>
	<textarea
		bind:this={textarea}
		bind:value={text}
		readonly={mode === 'export'}
		rows={14}
		spellcheck={false}
		placeholder={mode === 'import' ? 'Paste the JSON here…' : undefined}
		class="w-full rounded-md border border-gray-700 bg-gray-800 p-2 font-mono text-xs text-gray-100"
	></textarea>
	{#snippet actions()}
		<Button onclick={onclose}>Close</Button>
		{#if mode === 'export'}
			<Button variant="primary" onclick={copy}>{copied ? 'Copied!' : 'Copy'}</Button>
		{:else}
			<Button variant="primary" disabled={!text.trim()} onclick={() => onimport?.(text.trim())}>
				Import
			</Button>
		{/if}
	{/snippet}
</Modal>

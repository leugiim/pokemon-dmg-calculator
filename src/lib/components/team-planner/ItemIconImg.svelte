<script lang="ts">
	import { itemIconUrl } from '$lib/modules/team-planner';

	/**
	 * A held item's icon; hides itself if there's none for that item.
	 * Decorative when the item's name is written next to it; `labelled`
	 * for an icon on its own.
	 */
	let {
		item,
		labelled = false,
		class: className = 'h-6 w-6'
	}: { item: string; labelled?: boolean; class?: string } = $props();

	let failed = $state(false);

	$effect(() => {
		void item;
		failed = false;
	});
</script>

{#if !failed}
	<img
		src={itemIconUrl(item)}
		alt={labelled ? item : ''}
		title={labelled ? item : undefined}
		class={className}
		onerror={() => (failed = true)}
	/>
{/if}

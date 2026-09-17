<script lang="ts">
	import { commonSetsFor, type CommonSet } from '$lib/calc/commonSets';
	import { formatStatPoints } from '$lib/calc/format';
	import type { SpeciesItem } from '$lib/calc/generation';

	/**
	 * `open`/`species` come from `TeamSlotCard`'s own state — this
	 * component only reads `species` (via `commonSetsFor`) and reports
	 * which set was picked (`onselect`); it never touches a `TeamSlot`
	 * itself, so it stays usable regardless of what the caller does with
	 * that pick (`TeamSlotCard` applies it via `applyCommonSet` and closes
	 * the modal in the same callback).
	 */
	let {
		open = $bindable(false),
		species,
		onselect
	}: {
		open?: boolean;
		species: SpeciesItem | null;
		onselect: (set: CommonSet) => void;
	} = $props();

	const sets = $derived(species ? commonSetsFor(species) : []);

	function close() {
		open = false;
	}

	function pick(set: CommonSet) {
		onselect(set);
		close();
	}

	// On the backdrop itself, not a descendant — a keydown bubbles up to it
	// from anywhere focused inside the modal, so this closes on Escape
	// regardless of which element currently has focus.
	function onBackdropKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}

	// Closes only for a click on the backdrop itself, not one that bubbled
	// up from inside the dialog panel — checking `target === currentTarget`
	// here means the panel itself never needs a click handler (and so
	// never needs a matching keydown one either, unlike the backdrop).
	function onBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) close();
	}
</script>

{#if open && species}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
		onclick={onBackdropClick}
		onkeydown={onBackdropKeydown}
		role="presentation"
	>
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="common-sets-title"
			tabindex="-1"
			class="flex max-h-[80vh] w-full max-w-md flex-col rounded-xl border border-gray-800 bg-gray-900 shadow-lg"
		>
			<div class="flex items-center justify-between border-b border-gray-800 px-4 py-3">
				<h2 id="common-sets-title" class="text-sm font-semibold text-gray-100">
					Common sets for {species.name}
				</h2>
				<button
					type="button"
					onclick={close}
					aria-label="Close"
					class="text-gray-400 hover:text-gray-200"
				>
					&times;
				</button>
			</div>
			<div class="flex flex-col gap-2 overflow-y-auto p-3">
				{#each sets as set (set.name)}
					<button
						type="button"
						onclick={() => pick(set)}
						class="flex flex-col gap-1 rounded-lg border border-gray-700 bg-gray-800 p-2 text-left text-[11px] hover:border-indigo-400 hover:bg-gray-700"
					>
						<span class="font-semibold text-gray-100">{set.name}</span>
						<span class="text-gray-400">
							{set.item?.name ?? 'No item'} · {set.ability ?? 'Current ability'} · {set.nature.name} nature
						</span>
						<span class="text-gray-400">{formatStatPoints(set.statPoints)}</span>
						<span class="text-gray-300">
							{set.moves
								.filter((m) => m !== null)
								.map((m) => m.name)
								.join(', ')}
						</span>
					</button>
				{/each}
			</div>
		</div>
	</div>
{/if}

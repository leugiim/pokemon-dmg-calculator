<script lang="ts">
	import type { MoveItem } from '$lib/calc/moves';
	import { isAllyOnlyTarget } from '$lib/calc/moves';
	import { computeDamage, type DamageDisplay } from '$lib/calc/damage';
	import type { TeamSlot } from '$lib/stores/team.svelte';
	import DamageResult from './DamageResult.svelte';
	import MoveCategoryIcon from './MoveCategoryIcon.svelte';
	import MoveCombobox from './MoveCombobox.svelte';
	import TypeBadge from './TypeBadge.svelte';

	const uid = $props.id();
	const allyDamageId = `${uid}-ally-damage`;

	let {
		selected = $bindable(null),
		disabled = false,
		attacker,
		ally,
		moveIndex
	}: {
		selected?: MoveItem | null;
		disabled?: boolean;
		/** This move's owner — needed to compute ally damage on demand. */
		attacker: TeamSlot;
		/** `attacker`'s own ally (the other slot on the same side). */
		ally: TeamSlot;
		/** This slot's index within `attacker.moves` (0-3) — see the reset effect below. */
		moveIndex: number;
	} = $props();

	// Whenever the move picked for this slot changes, reset its Damage
	// Matrix overrides (assume-crit, hit-count) back to their defaults —
	// otherwise a crit assumption or manual hit count set for the previous
	// move would silently carry over onto an unrelated new one (#14, #15).
	// Re-picking the *same* move is not a real change and leaves an
	// existing override untouched.
	let previousSelected = selected;
	$effect(() => {
		if (selected !== previousSelected) {
			previousSelected = selected;
			attacker.resetMoveOptions(moveIndex);
		}
	});

	// Moves that can only ever be aimed at the ally (adjacentAlly/allies)
	// don't have anywhere else to show a damage number — they're excluded
	// from the main Damage Matrix by design (ADR-0001) — so this is their
	// one on-demand view. Needs the ally to have a species picked, same as
	// every other damage computation in the app.
	const canShowAllyDamage = $derived(
		!!selected && isAllyOnlyTarget(selected) && !!attacker.species && !!ally.species
	);

	let expanded = $state(false);
	$effect(() => {
		if (!canShowAllyDamage) expanded = false;
	});

	const allyDamage: DamageDisplay | null = $derived.by(() => {
		if (!expanded || !canShowAllyDamage) return null;
		return computeDamage(attacker, selected!, ally);
	});
</script>

<div class="flex w-full flex-col gap-1">
	<div class="flex w-full items-center gap-2">
		<div class="flex-1">
			<MoveCombobox bind:selected {disabled} />
		</div>
		<div class="flex w-20 shrink-0 justify-center">
			{#if selected}
				<TypeBadge type={selected.type} />
			{:else}
				<span
					class="flex h-5 w-16 items-center justify-center rounded bg-gray-800 text-[10px] text-gray-500"
					>–</span
				>
			{/if}
		</div>
		<div class="flex w-8 shrink-0 justify-center">
			{#if selected?.category}
				<MoveCategoryIcon category={selected.category} />
			{:else}
				<span class="text-[11px] text-gray-500">–</span>
			{/if}
		</div>
		<span class="w-8 shrink-0 text-right text-[11px] font-semibold text-gray-500">
			{selected?.basePower || '–'}
		</span>
		<div class="flex w-14 shrink-0 justify-center">
			{#if canShowAllyDamage}
				<button
					type="button"
					class="rounded bg-gray-800 px-1.5 py-0.5 text-[10px] font-medium text-gray-300 hover:bg-gray-700"
					aria-expanded={expanded}
					aria-controls={allyDamageId}
					onclick={() => (expanded = !expanded)}
				>
					vs ally
				</button>
			{/if}
		</div>
	</div>
	<!-- Kept in the DOM (just hidden) rather than an {#if} block, so the
	     button's aria-controls always resolves to a real element. -->
	<p id={allyDamageId} class="pl-1 text-[11px] text-gray-400" hidden={!allyDamage}>
		{#if allyDamage}
			vs ally: <DamageResult damage={allyDamage} />
		{/if}
	</p>
</div>

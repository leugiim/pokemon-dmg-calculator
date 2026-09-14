<script lang="ts">
	import type { TeamId, TeamSlot } from '$lib/stores/team.svelte';
	import type { MoveItem } from '$lib/calc/moves';
	import { computeDamage, type DamageDisplay } from '$lib/calc/damage';
	import DamageResult from './DamageResult.svelte';
	import SearchableCombobox from './SearchableCombobox.svelte';

	let { sides }: { sides: Record<TeamId, [TeamSlot, TeamSlot]> } = $props();

	/** One selectable attacker/target: a team slot with a species picked. */
	interface SlotOption {
		slot: TeamSlot;
		label: string;
	}

	const TEAM_LABELS: Record<TeamId, string> = { teamA: 'Team A', teamB: 'Team B' };

	const slotOptions = $derived.by(() => {
		const options: SlotOption[] = [];
		for (const teamId of ['teamA', 'teamB'] as TeamId[]) {
			for (const [i, slot] of sides[teamId].entries()) {
				if (slot.species) {
					options.push({ slot, label: `${TEAM_LABELS[teamId]} #${i + 1}: ${slot.species.name}` });
				}
			}
		}
		return options;
	});

	// $state.raw, not $state: these are only ever reassigned wholesale
	// (SearchableCombobox's bind:selected does `selected = item`, never an
	// in-place mutation), and the effects below compare them by reference
	// against freshly-derived plain objects. $state would wrap each
	// assignment in a Proxy, so a later comparison against the same
	// underlying (unproxied) object from slotOptions/targetOptions would
	// spuriously read as different — Svelte's state_proxy_equality_mismatch
	// warning — and the effect would reassign forever trying to "fix" it.
	let attacker = $state.raw<SlotOption | null>(null);
	let selectedMove = $state.raw<MoveItem | null>(null);
	let target = $state.raw<SlotOption | null>(null);

	// Deduped: nothing stops the same move from being assigned to two of a
	// Pokémon's four move slots, and SearchableCombobox keys its rows by
	// move name, so a duplicate would collide there.
	const moveOptions = $derived(
		attacker ? [...new Set(attacker.slot.moves.filter((m): m is MoveItem => m !== null))] : []
	);

	// Anyone but the attacker itself — including its own ally, since
	// friendly fire is a real (if not yet separately modeled) target.
	const targetOptions = $derived(slotOptions.filter((o) => o.slot !== attacker?.slot));

	// slotOptions/targetOptions rebuild their {slot, label} wrappers on
	// every recompute (any slot's species changing, anywhere, is enough),
	// so a stale wrapper is never `===` a fresh one even when its
	// underlying slot is still perfectly valid. Re-point at the current
	// wrapper for the same slot instead of comparing wrapper identity —
	// this also keeps the label current when a same-family forme change
	// (e.g. Mega Evolving) leaves the slot the "same" attacker.
	$effect(() => {
		if (!attacker) return;
		const current = slotOptions.find((o) => o.slot === attacker!.slot) ?? null;
		if (current !== attacker) attacker = current;
	});
	$effect(() => {
		if (!target) return;
		const current = targetOptions.find((o) => o.slot === target!.slot) ?? null;
		if (current !== target) target = current;
	});
	$effect(() => {
		if (selectedMove && !moveOptions.includes(selectedMove)) selectedMove = null;
	});

	const damage: DamageDisplay | null = $derived.by(() => {
		if (!attacker || !selectedMove || !target) return null;
		return computeDamage(attacker.slot, selectedMove, target.slot);
	});
</script>

<section class="flex flex-col gap-3 rounded-xl border border-gray-800 bg-gray-900 p-4">
	<h2 class="text-sm font-semibold text-gray-300">Damage preview</h2>

	<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
		<label class="flex flex-col gap-1 text-[11px] text-gray-400">
			Attacker
			<SearchableCombobox
				items={slotOptions}
				bind:selected={attacker}
				getLabel={(o) => o.label}
				placeholder="Select an attacker…"
			/>
		</label>
		<label class="flex flex-col gap-1 text-[11px] text-gray-400">
			Move
			<SearchableCombobox
				items={moveOptions}
				bind:selected={selectedMove}
				getLabel={(m) => m.name}
				placeholder="Select a move…"
				disabled={!attacker}
			/>
		</label>
		<label class="flex flex-col gap-1 text-[11px] text-gray-400">
			Target
			<SearchableCombobox
				items={targetOptions}
				bind:selected={target}
				getLabel={(o) => o.label}
				placeholder="Select a target…"
				disabled={!attacker}
			/>
		</label>
	</div>

	{#if damage}
		<p class="text-center text-lg font-semibold text-gray-100">
			<DamageResult {damage} koChanceClass="text-sm font-normal text-gray-400" />
		</p>
	{:else}
		<p class="text-center text-sm text-gray-500">Pick an attacker, a move, and a target.</p>
	{/if}
</section>

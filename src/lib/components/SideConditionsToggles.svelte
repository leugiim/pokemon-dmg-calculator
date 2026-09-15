<script lang="ts">
	import type { TeamSideConditions } from '$lib/stores/team.svelte';

	// conditions is $bindable: this two-way-binds into conditions.protect /
	// .reflect / ... via child bind: directives — see +page.svelte (where
	// this is rendered) for why that needs declaring explicitly. One
	// `conditions` object is shared by both of a team's slots, same as
	// `AllySupportToggles`' `support` — this renders once per team.
	let {
		conditions = $bindable(),
		disabled = false
	}: { conditions: TeamSideConditions; disabled?: boolean } = $props();
</script>

<div
	class="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-gray-800 bg-gray-900 p-3 text-[10px] text-gray-400 shadow-sm"
>
	<span class="font-medium text-gray-300">Side conditions</span>
	<label class="flex items-center gap-1">
		<input type="checkbox" {disabled} bind:checked={conditions.protect} />
		Protect
	</label>
	<label class="flex items-center gap-1">
		<input type="checkbox" {disabled} bind:checked={conditions.reflect} />
		Reflect
	</label>
	<label class="flex items-center gap-1">
		<input type="checkbox" {disabled} bind:checked={conditions.lightScreen} />
		Light Screen
	</label>
	<label class="flex items-center gap-1">
		<input type="checkbox" {disabled} bind:checked={conditions.auroraVeil} />
		Aurora Veil
	</label>
	<label class="flex items-center gap-1">
		<input type="checkbox" {disabled} bind:checked={conditions.stealthRock} />
		Stealth Rock
	</label>
	<label class="flex items-center gap-1">
		Spikes
		<select
			class="rounded bg-gray-800 px-1 py-0.5 text-[10px] text-gray-200 disabled:opacity-30"
			aria-label="Spikes layers"
			{disabled}
			bind:value={conditions.spikes}
		>
			<option value={0}>0</option>
			<option value={1}>1</option>
			<option value={2}>2</option>
			<option value={3}>3</option>
		</select>
	</label>
</div>

<script lang="ts">
	import { field, TERRAIN_OPTIONS, WEATHER_OPTIONS } from '$lib/stores/field.svelte';
</script>

<div
	class="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 rounded-xl border border-gray-800 bg-gray-900 p-3 text-[11px] text-gray-400 shadow-sm"
>
	<label class="flex items-center gap-1">
		Weather
		<select
			class="rounded bg-gray-800 px-1.5 py-0.5 text-gray-200"
			aria-label="Weather"
			bind:value={field.weather}
		>
			<option value={null}>None</option>
			{#each WEATHER_OPTIONS as weather (weather)}
				<option value={weather}>{weather}</option>
			{/each}
		</select>
	</label>
	<label class="flex items-center gap-1">
		Terrain
		<select
			class="rounded bg-gray-800 px-1.5 py-0.5 text-gray-200"
			aria-label="Terrain"
			bind:value={field.terrain}
		>
			<option value={null}>None</option>
			{#each TERRAIN_OPTIONS as terrain (terrain)}
				<option value={terrain}>{terrain}</option>
			{/each}
		</select>
	</label>
</div>

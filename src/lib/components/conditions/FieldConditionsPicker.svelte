<script lang="ts">
	import {
		field,
		TERRAIN_OPTIONS,
		WEATHER_OPTIONS,
		type Terrain,
		type Weather
	} from '$lib/stores/field.svelte';
	import { sides } from '$lib/stores/team.svelte';
	import {
		FIELD_ABILITY_FLAGS,
		fieldAbilityName,
		type FieldAbilityFlag
	} from '$lib/calc/fieldAbilities';
	import ToggleButton from '../ui/ToggleButton.svelte';

	const allSlots = $derived([...sides.teamA, ...sides.teamB]);

	/** Clicking the already-active option clears the selection back to "none" — the same click-to-deselect behavior for both mutually-exclusive groups. */
	function toggleWeather(weather: Weather) {
		field.weather = field.weather === weather ? null : weather;
	}
	function toggleTerrain(terrain: Terrain) {
		field.terrain = field.terrain === terrain ? null : terrain;
	}

	/** Which of the 4 on-field Pokemon Auto mode would credit for `flag` — or `null` if none does. */
	function autoProvider(flag: FieldAbilityFlag) {
		return allSlots.find((slot) => slot.ability === fieldAbilityName(flag)) ?? null;
	}

	/** Describes `flag`'s *actual* current state, same convention as `AllySupportToggles`' own tooltip. */
	function tooltip(flag: FieldAbilityFlag): string {
		const ability = fieldAbilityName(flag);
		const provider = autoProvider(flag);
		if (field[flag] === null) {
			return `${ability}: Auto — ${provider ? `${provider.species?.name ?? 'that Pokémon'} has it` : 'no Pokémon on the field has it'}`;
		}
		return `${ability}: forced ${field[flag] ? 'on' : 'off'} for the whole field`;
	}
</script>

<div
	class="flex flex-col gap-2 rounded-xl border border-gray-800 bg-gray-900 p-3 text-[10px] text-gray-400 shadow-sm"
>
	<div class="flex flex-wrap items-center gap-x-3 gap-y-1">
		<span class="font-medium text-gray-300">Weather</span>
		<div
			class="inline-flex divide-x divide-gray-700 overflow-hidden rounded-lg border border-gray-700"
		>
			{#each WEATHER_OPTIONS as weather (weather)}
				<ToggleButton active={field.weather === weather} onclick={() => toggleWeather(weather)}>
					{weather}
				</ToggleButton>
			{/each}
		</div>
	</div>

	<div class="flex flex-wrap items-center gap-x-3 gap-y-1">
		<span class="font-medium text-gray-300">Terrain</span>
		<div
			class="inline-flex divide-x divide-gray-700 overflow-hidden rounded-lg border border-gray-700"
		>
			{#each TERRAIN_OPTIONS as terrain (terrain)}
				<ToggleButton active={field.terrain === terrain} onclick={() => toggleTerrain(terrain)}>
					{terrain}
				</ToggleButton>
			{/each}
		</div>
	</div>

	<div class="flex flex-wrap items-center gap-x-3 gap-y-1">
		<ToggleButton
			class="rounded border border-gray-700"
			active={field.gravity}
			onclick={() => (field.gravity = !field.gravity)}
			title="Grounds Flying-types and Levitate/Air Balloon holders — Ground-type moves can hit them"
		>
			Gravity
		</ToggleButton>
	</div>

	<div class="flex flex-wrap items-center gap-x-3 gap-y-1">
		<span class="font-medium text-gray-300">Field abilities</span>
		{#each FIELD_ABILITY_FLAGS as flag (flag)}
			{@const ability = fieldAbilityName(flag)}
			<label class="flex items-center gap-1" title={tooltip(flag)}>
				{ability}
				<select
					class="rounded bg-gray-800 px-1 py-0.5 text-[10px] text-gray-200"
					aria-label="{ability} override"
					bind:value={field[flag]}
				>
					<option value={null}>Auto</option>
					<option value={true}>On</option>
					<option value={false}>Off</option>
				</select>
			</label>
		{/each}
	</div>
</div>

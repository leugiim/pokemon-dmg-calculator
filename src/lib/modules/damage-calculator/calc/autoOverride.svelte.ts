/**
 * Clears a single Auto/On/Off override the moment its own auto-derived
 * value actually changes — e.g. a Pokemon with the relevant ability
 * getting selected onto, or removed from, the roster `autoValue` reads —
 * so a manually forced flag (`FieldConditionsPicker`'s field abilities,
 * `SideConditionsToggles`' Intimidate, `AllySupportToggles`' static
 * flags) never silently outlives the team state that made forcing it
 * meaningful in the first place. A click can still force it again at any
 * time afterward (each caller's own `ToggleButton` `onclick`) — this only
 * ever *clears* an override back to Auto, never sets one.
 *
 * Must be called synchronously during a component's own setup, same as
 * any other rune (it uses `$effect` internally) — safe to call from a
 * plain `.svelte.ts` helper as long as that helper itself is invoked
 * synchronously from a component's `<script>`, same as `field.svelte.ts`/
 * `team.svelte.ts`'s own top-level `$state`.
 */
export function resetOverrideOnAutoChange(autoValue: () => boolean, clearOverride: () => void) {
	let last = autoValue();

	$effect(() => {
		const current = autoValue();
		if (current !== last) {
			last = current;
			clearOverride();
		}
	});
}

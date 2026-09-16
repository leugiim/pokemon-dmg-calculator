import type { TeamSideConditions } from '../stores/team.svelte';

/**
 * The `@smogon/calc` `defenderSide` flags a team's shared side conditions
 * contribute to a calculation whose target belongs to that team — screens
 * (Reflect/Light Screen/Aurora Veil) and Protect reduce or zero the damage
 * that side takes; Stealth Rock/Spikes matter narrowly, only for abilities
 * that check "is the defender at full HP" (Multiscale, Shadow Shield, Tera
 * Shell) — `@smogon/calc` treats hazards on the field as proof the
 * defender already lost HP on switch-in, unless it holds Heavy-Duty Boots.
 * Unlike ally support, none of these derive from any Pokémon's own
 * `ability` — there's no Auto mode, so this is a direct, unconditional
 * mapping with no override layer to apply.
 *
 * `intimidate` is deliberately left out: it isn't a `@smogon/calc` `Side`
 * flag at all, it's a per-Pokemon `boosts.atk` adjustment applied directly
 * in `matrix.ts` (see `TeamSideConditions.intimidate`'s own doc comment).
 */
export function sideConditionFlags(conditions: TeamSideConditions) {
	return {
		isProtected: conditions.protect,
		isReflect: conditions.reflect,
		isLightScreen: conditions.lightScreen,
		isAuroraVeil: conditions.auroraVeil,
		isSR: conditions.stealthRock,
		spikes: conditions.spikes
	};
}

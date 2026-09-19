import type { TeamSideConditions, TeamSlot } from '../stores/team.svelte';

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

/**
 * Whether Intimidate is currently up for `slots`' own team: `conditions`'
 * manual Auto/On/Off override when set, else auto-derived from whether
 * either of `slots` (this team's own two Pokemon, not just one ally) has
 * the Intimidate ability equipped — same Auto/On/Off convention field
 * abilities (`providesFieldAbility`) and static ally support
 * (`providesStaticSupport`) use, just scoped to the team's own roster
 * rather than one specific ally slot, since either teammate having
 * Intimidate puts it up for the whole side.
 */
export function providesIntimidate(
	slots: [TeamSlot, TeamSlot],
	conditions: TeamSideConditions
): boolean {
	return conditions.intimidate ?? slots.some((slot) => slot.ability === 'Intimidate');
}

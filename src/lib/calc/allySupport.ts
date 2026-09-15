import type { TeamSlot } from '../stores/team.svelte';

/**
 * The four ally-support flags tied to a fixed ability (ADR-0003): the
 * `@smogon/calc` ability name each one is auto-derived from. Keyed by the
 * same name `TeamSlot.allySupportOverrides` uses for its per-flag override.
 */
const STATIC_ALLY_SUPPORT_ABILITIES = {
	friendGuard: 'Friend Guard',
	battery: 'Battery',
	powerSpot: 'Power Spot',
	steelySpirit: 'Steely Spirit'
} as const;

export type StaticAllySupportFlag = keyof typeof STATIC_ALLY_SUPPORT_ABILITIES;

/** The four static flags, in display order — for iterating in the UI. */
export const STATIC_ALLY_SUPPORT_FLAGS = Object.keys(
	STATIC_ALLY_SUPPORT_ABILITIES
) as StaticAllySupportFlag[];

/** The ability name a static flag is auto-derived from — also its display label. */
export function staticAllySupportAbility(flag: StaticAllySupportFlag): string {
	return STATIC_ALLY_SUPPORT_ABILITIES[flag];
}

/**
 * Whether `slot` currently provides `flag`'s support to its ally: the
 * manual override when one is set, else auto-derived from whether `slot`'s
 * own equipped ability is the one that grants it (ADR-0003).
 */
export function providesStaticSupport(slot: TeamSlot, flag: StaticAllySupportFlag): boolean {
	const override = slot.allySupportOverrides[flag];
	return override ?? slot.ability === STATIC_ALLY_SUPPORT_ABILITIES[flag];
}

/**
 * The `@smogon/calc` `attackerSide` flags `ally` contributes to a
 * calculation where it is the acting Pokémon's own ally: Battery, Power
 * Spot, Steely Spirit (auto-derived from `ally.ability`, with a manual
 * override) plus Helping Hand and Tailwind (manual-only, ADR-0003, #13).
 * Friend Guard is deliberately excluded — it reduces damage *taken* by a
 * side, so it belongs on `defenderSideFlags` instead, never here.
 */
export function attackerSideFlags(ally: TeamSlot) {
	return {
		isBattery: providesStaticSupport(ally, 'battery'),
		isPowerSpot: providesStaticSupport(ally, 'powerSpot'),
		isSteelySpirit: providesStaticSupport(ally, 'steelySpirit'),
		isHelpingHand: ally.providesHelpingHand,
		isTailwind: ally.providesTailwind
	};
}

/**
 * The `@smogon/calc` `defenderSide` flags `ally` contributes to a
 * calculation where it is the defending Pokémon's own ally: Friend Guard,
 * auto-derived from `ally.ability` with a manual override (ADR-0003, #13).
 * The only one of the six ally-support flags that reduces damage taken
 * rather than boosting damage dealt — see `attackerSideFlags`.
 */
export function defenderSideFlags(ally: TeamSlot) {
	return {
		isFriendGuard: providesStaticSupport(ally, 'friendGuard')
	};
}

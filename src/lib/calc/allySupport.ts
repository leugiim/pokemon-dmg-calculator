import type { TeamAllySupport, TeamSlot } from '../stores/team.svelte';

/**
 * The four ally-support flags tied to a fixed ability (ADR-0003): the
 * `@smogon/calc` ability name each one is auto-derived from. Keyed by the
 * same name `TeamAllySupport` uses for its per-flag override.
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
 * Whether `ally` currently provides `flag`'s support: `teamSupport`'s
 * manual override for the whole team when one is set, else auto-derived
 * from whether `ally`'s own equipped ability is the one that grants it
 * (ADR-0003). The override is team-wide, but the auto fallback always
 * checks this *specific* `ally` slot's own ability — so Auto mode still
 * only credits the one real teammate that has it, never both. `ally` may
 * be omitted entirely (no ability to check, so Auto mode is always false —
 * an explicit `teamSupport` override still applies); `teamSupport` may be
 * omitted too, for a caller with no team context at all.
 */
export function providesStaticSupport(
	ally: TeamSlot | undefined,
	flag: StaticAllySupportFlag,
	teamSupport?: TeamAllySupport
): boolean {
	const override = teamSupport?.[flag];
	return override ?? ally?.ability === STATIC_ALLY_SUPPORT_ABILITIES[flag];
}

/**
 * The `@smogon/calc` `attackerSide` flags in effect for a calculation whose
 * attacker's ally is `ally`: Battery, Power Spot, Steely Spirit
 * (auto-derived from `ally.ability`, with `teamSupport`'s team-wide manual
 * override) plus Helping Hand and Tailwind (manual-only team toggles,
 * ADR-0003, #13). Friend Guard is deliberately excluded — it reduces
 * damage *taken* by a side, so it belongs on `defenderSideFlags` instead,
 * never here.
 *
 * `ally` is optional: Helping Hand/Tailwind and a manual static override
 * never actually depend on it (they come from `teamSupport` alone), so a
 * caller with a `teamSupport` but no concrete ally `TeamSlot` still gets
 * those applied correctly — only the ability-based Auto fallback needs
 * `ally` to mean anything.
 */
export function attackerSideFlags(ally: TeamSlot | undefined, teamSupport?: TeamAllySupport) {
	return {
		isBattery: providesStaticSupport(ally, 'battery', teamSupport),
		isPowerSpot: providesStaticSupport(ally, 'powerSpot', teamSupport),
		isSteelySpirit: providesStaticSupport(ally, 'steelySpirit', teamSupport),
		isHelpingHand: teamSupport?.helpingHand ?? false,
		isTailwind: teamSupport?.tailwind ?? false
	};
}

/**
 * The `@smogon/calc` `defenderSide` flags in effect for a calculation whose
 * defender's ally is `ally`: Friend Guard, auto-derived from `ally.ability`
 * with `teamSupport`'s team-wide manual override (ADR-0003, #13). The only
 * one of the six ally-support flags that reduces damage taken rather than
 * boosting damage dealt — see `attackerSideFlags`, including for why `ally`
 * is optional.
 */
export function defenderSideFlags(ally: TeamSlot | undefined, teamSupport?: TeamAllySupport) {
	return {
		isFriendGuard: providesStaticSupport(ally, 'friendGuard', teamSupport)
	};
}

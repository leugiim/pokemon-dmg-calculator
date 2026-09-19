import { describe, expect, it } from 'vitest';
import {
	defaultTeamAllySupport,
	TeamSlot,
	type TeamAllySupport
} from '$lib/modules/damage-calculator/stores/team.svelte';
import {
	attackerSideFlags,
	defenderSideFlags,
	providesStaticSupport,
	staticAllySupportAbility,
	STATIC_ALLY_SUPPORT_FLAGS,
	type StaticAllySupportFlag
} from '$lib/modules/damage-calculator/calc/allySupport';

function teamSupport(overrides: Partial<TeamAllySupport> = {}): TeamAllySupport {
	return { ...defaultTeamAllySupport(), ...overrides };
}

describe('staticAllySupportAbility', () => {
	it.each([
		['friendGuard', 'Friend Guard'],
		['battery', 'Battery'],
		['powerSpot', 'Power Spot'],
		['steelySpirit', 'Steely Spirit']
	] satisfies [StaticAllySupportFlag, string][])('%s -> %s', (flag, ability) => {
		expect(staticAllySupportAbility(flag)).toBe(ability);
	});

	it('STATIC_ALLY_SUPPORT_FLAGS lists exactly the four static flags', () => {
		expect(STATIC_ALLY_SUPPORT_FLAGS).toEqual([
			'friendGuard',
			'battery',
			'powerSpot',
			'steelySpirit'
		]);
	});
});

describe('providesStaticSupport', () => {
	it.each(STATIC_ALLY_SUPPORT_FLAGS)(
		'auto-derives %s from a matching ability when no team override is set',
		(flag) => {
			const slot = new TeamSlot();
			slot.ability = staticAllySupportAbility(flag);

			expect(providesStaticSupport(slot, flag, teamSupport())).toBe(true);
		}
	);

	it.each(STATIC_ALLY_SUPPORT_FLAGS)(
		'is false for %s when the ability does not match and no team override is set',
		(flag) => {
			const slot = new TeamSlot();
			slot.ability = 'Levitate';

			expect(providesStaticSupport(slot, flag, teamSupport())).toBe(false);
		}
	);

	it.each(STATIC_ALLY_SUPPORT_FLAGS)(
		'falls back to the plain ability check when no teamSupport is passed at all',
		(flag) => {
			const slot = new TeamSlot();
			slot.ability = staticAllySupportAbility(flag);

			expect(providesStaticSupport(slot, flag)).toBe(true);
		}
	);

	it.each(STATIC_ALLY_SUPPORT_FLAGS)(
		'lets a team override force %s on despite a non-matching ability',
		(flag) => {
			const slot = new TeamSlot();
			slot.ability = 'Levitate';

			expect(providesStaticSupport(slot, flag, teamSupport({ [flag]: true }))).toBe(true);
		}
	);

	it.each(STATIC_ALLY_SUPPORT_FLAGS)(
		'lets a team override force %s off despite a matching ability',
		(flag) => {
			const slot = new TeamSlot();
			slot.ability = staticAllySupportAbility(flag);

			expect(providesStaticSupport(slot, flag, teamSupport({ [flag]: false }))).toBe(false);
		}
	);

	it.each(STATIC_ALLY_SUPPORT_FLAGS)(
		'applies %s to the correct ally only, not to a teammate who lacks the ability',
		(flag) => {
			const holder = new TeamSlot();
			holder.ability = staticAllySupportAbility(flag);
			const other = new TeamSlot();
			other.ability = 'Levitate';
			const support = teamSupport();

			expect(providesStaticSupport(holder, flag, support)).toBe(true);
			expect(providesStaticSupport(other, flag, support)).toBe(false);
		}
	);

	it.each(STATIC_ALLY_SUPPORT_FLAGS)(
		'is false for %s with no ally and no override (nothing to derive from)',
		(flag) => {
			expect(providesStaticSupport(undefined, flag)).toBe(false);
		}
	);

	it.each(STATIC_ALLY_SUPPORT_FLAGS)(
		'still lets a team override force %s on with no ally TeamSlot at all',
		(flag) => {
			expect(providesStaticSupport(undefined, flag, teamSupport({ [flag]: true }))).toBe(true);
		}
	);
});

describe('attackerSideFlags', () => {
	it('derives isBattery, isPowerSpot, isSteelySpirit from the ally ability, and the team-wide isHelpingHand/isTailwind toggles', () => {
		const ally = new TeamSlot();
		ally.ability = 'Power Spot';
		const support = teamSupport({ helpingHand: true, tailwind: true });

		expect(attackerSideFlags(ally, support)).toEqual({
			isBattery: false,
			isPowerSpot: true,
			isSteelySpirit: false,
			isHelpingHand: true,
			isTailwind: true
		});
	});

	it('never includes isFriendGuard — that only ever reduces damage taken, not dealt', () => {
		const ally = new TeamSlot();
		ally.ability = 'Friend Guard';

		expect(attackerSideFlags(ally, teamSupport())).not.toHaveProperty('isFriendGuard');
	});

	it('defaults every flag to false/off when no teamSupport is passed at all', () => {
		const ally = new TeamSlot();
		ally.ability = 'Levitate';

		expect(attackerSideFlags(ally)).toEqual({
			isBattery: false,
			isPowerSpot: false,
			isSteelySpirit: false,
			isHelpingHand: false,
			isTailwind: false
		});
	});
});

describe('defenderSideFlags', () => {
	it("derives isFriendGuard from the ally's ability", () => {
		const ally = new TeamSlot();
		ally.ability = 'Friend Guard';

		expect(defenderSideFlags(ally, teamSupport())).toEqual({ isFriendGuard: true });
	});

	it('is false when the ally does not have Friend Guard and no override forces it', () => {
		const ally = new TeamSlot();
		ally.ability = 'Levitate';

		expect(defenderSideFlags(ally, teamSupport())).toEqual({ isFriendGuard: false });
	});

	it('lets the team override force Friend Guard on for the whole team', () => {
		const ally = new TeamSlot();
		ally.ability = 'Levitate';

		expect(defenderSideFlags(ally, teamSupport({ friendGuard: true }))).toEqual({
			isFriendGuard: true
		});
	});
});

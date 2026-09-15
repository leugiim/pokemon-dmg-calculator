import { describe, expect, it } from 'vitest';
import { TeamSlot } from '$lib/stores/team.svelte';
import {
	attackerSideFlags,
	defenderSideFlags,
	providesStaticSupport,
	staticAllySupportAbility,
	STATIC_ALLY_SUPPORT_FLAGS,
	type StaticAllySupportFlag
} from '$lib/calc/allySupport';

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
		'auto-derives %s from a matching ability when no override is set',
		(flag) => {
			const slot = new TeamSlot();
			slot.ability = staticAllySupportAbility(flag);

			expect(providesStaticSupport(slot, flag)).toBe(true);
		}
	);

	it.each(STATIC_ALLY_SUPPORT_FLAGS)(
		'is false for %s when the ability does not match and no override is set',
		(flag) => {
			const slot = new TeamSlot();
			slot.ability = 'Levitate';

			expect(providesStaticSupport(slot, flag)).toBe(false);
		}
	);

	it.each(STATIC_ALLY_SUPPORT_FLAGS)(
		'lets a manual override force %s on despite a non-matching ability',
		(flag) => {
			const slot = new TeamSlot();
			slot.ability = 'Levitate';
			slot.allySupportOverrides[flag] = true;

			expect(providesStaticSupport(slot, flag)).toBe(true);
		}
	);

	it.each(STATIC_ALLY_SUPPORT_FLAGS)(
		'lets a manual override force %s off despite a matching ability',
		(flag) => {
			const slot = new TeamSlot();
			slot.ability = staticAllySupportAbility(flag);
			slot.allySupportOverrides[flag] = false;

			expect(providesStaticSupport(slot, flag)).toBe(false);
		}
	);
});

describe('attackerSideFlags', () => {
	it('derives isBattery, isPowerSpot, isSteelySpirit from the ally ability, and the manual isHelpingHand/isTailwind toggles', () => {
		const ally = new TeamSlot();
		ally.ability = 'Power Spot';
		ally.providesHelpingHand = true;
		ally.providesTailwind = true;

		expect(attackerSideFlags(ally)).toEqual({
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

		expect(attackerSideFlags(ally)).not.toHaveProperty('isFriendGuard');
	});
});

describe('defenderSideFlags', () => {
	it("derives isFriendGuard from the ally's ability", () => {
		const ally = new TeamSlot();
		ally.ability = 'Friend Guard';

		expect(defenderSideFlags(ally)).toEqual({ isFriendGuard: true });
	});

	it('is false when the ally does not have Friend Guard and no override forces it', () => {
		const ally = new TeamSlot();
		ally.ability = 'Levitate';

		expect(defenderSideFlags(ally)).toEqual({ isFriendGuard: false });
	});
});

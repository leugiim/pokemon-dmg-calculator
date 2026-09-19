import { describe, expect, it } from 'vitest';
import {
	defaultTeamSideConditions,
	TeamSlot
} from '$lib/modules/damage-calculator/stores/team.svelte';
import {
	providesIntimidate,
	sideConditionFlags
} from '$lib/modules/damage-calculator/calc/sideConditions';

describe('sideConditionFlags', () => {
	it('maps every default (off/zero) condition to its @smogon/calc Side flag', () => {
		expect(sideConditionFlags(defaultTeamSideConditions())).toEqual({
			isProtected: false,
			isReflect: false,
			isLightScreen: false,
			isAuroraVeil: false,
			isSR: false,
			spikes: 0
		});
	});

	it('maps every condition on/set to its @smogon/calc Side flag', () => {
		const conditions = {
			protect: true,
			reflect: true,
			lightScreen: true,
			auroraVeil: true,
			stealthRock: true,
			spikes: 3,
			// intimidate isn't a @smogon/calc Side flag at all (see
			// sideConditions.ts's own doc comment) — included here only to
			// satisfy TeamSideConditions, irrelevant to this test's assertion.
			intimidate: true
		};

		expect(sideConditionFlags(conditions)).toEqual({
			isProtected: true,
			isReflect: true,
			isLightScreen: true,
			isAuroraVeil: true,
			isSR: true,
			spikes: 3
		});
	});
});

describe('providesIntimidate', () => {
	function slotWithAbility(ability: string | null): TeamSlot {
		const slot = new TeamSlot();
		slot.ability = ability;
		return slot;
	}

	it("auto-derives true when either of the team's two slots has the Intimidate ability", () => {
		const conditions = defaultTeamSideConditions();

		expect(
			providesIntimidate([slotWithAbility('Intimidate'), slotWithAbility(null)], conditions)
		).toBe(true);
		expect(
			providesIntimidate([slotWithAbility(null), slotWithAbility('Intimidate')], conditions)
		).toBe(true);
	});

	it('auto-derives false when neither slot has the Intimidate ability', () => {
		const conditions = defaultTeamSideConditions();

		expect(
			providesIntimidate([slotWithAbility('Rough Skin'), slotWithAbility(null)], conditions)
		).toBe(false);
	});

	it("lets a manual override win over the slots' own abilities either way", () => {
		expect(
			providesIntimidate([slotWithAbility(null), slotWithAbility(null)], {
				...defaultTeamSideConditions(),
				intimidate: true
			})
		).toBe(true);
		expect(
			providesIntimidate([slotWithAbility('Intimidate'), slotWithAbility(null)], {
				...defaultTeamSideConditions(),
				intimidate: false
			})
		).toBe(false);
	});
});

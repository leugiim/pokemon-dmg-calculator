import { describe, expect, it } from 'vitest';
import { defaultTeamSideConditions } from '$lib/stores/team.svelte';
import { sideConditionFlags } from '$lib/calc/sideConditions';

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
			spikes: 3
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

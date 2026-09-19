import { describe, expect, it } from 'vitest';
import { applyEntryEffect } from '$lib/modules/damage-calculator/calc/entryEffects';
import { defaultFieldConditions } from '$lib/modules/damage-calculator/stores/field.svelte';

describe('applyEntryEffect', () => {
	it('sets weather for a weather-setting ability', () => {
		const field = defaultFieldConditions();
		applyEntryEffect('Drought', field);
		expect(field.weather).toBe('Sun');
		expect(field.terrain).toBeNull();
	});

	it('sets terrain for a terrain-setting ability', () => {
		const field = defaultFieldConditions();
		applyEntryEffect('Grassy Surge', field);
		expect(field.terrain).toBe('Grassy');
		expect(field.weather).toBeNull();
	});

	it('replaces an existing condition of the same kind', () => {
		const field = defaultFieldConditions();
		field.weather = 'Rain';
		applyEntryEffect('Drought', field);
		expect(field.weather).toBe('Sun');
	});

	it('leaves the field alone for other abilities and null', () => {
		const field = defaultFieldConditions();
		field.weather = 'Rain';
		applyEntryEffect('Intimidate', field);
		applyEntryEffect(null, field);
		expect(field.weather).toBe('Rain');
		expect(field.terrain).toBeNull();
	});
});

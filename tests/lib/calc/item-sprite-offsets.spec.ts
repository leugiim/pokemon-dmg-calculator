import { describe, expect, it } from 'vitest';
import { allItems } from '$lib/calc/items';
import { ITEM_SPRITE_OFFSETS } from '$lib/calc/item-sprite-offsets';

describe('ITEM_SPRITE_OFFSETS', () => {
	it('has an offset for every held item', () => {
		const missing = allItems.filter((i) => ITEM_SPRITE_OFFSETS[i.id] === undefined);
		expect(missing.map((i) => i.name)).toEqual([]);
	});

	it('is a non-negative integer for every entry', () => {
		for (const offset of Object.values(ITEM_SPRITE_OFFSETS)) {
			expect(Number.isInteger(offset)).toBe(true);
			expect(offset).toBeGreaterThanOrEqual(0);
		}
	});
});

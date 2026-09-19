import { afterEach, describe, expect, it, vi } from 'vitest';
import { readJson, removeKey, writeJson } from '$lib/modules/shared';
import { installMemoryStorage } from '../team-planner/memoryStorage';

afterEach(() => vi.unstubAllGlobals());

describe('storage helpers', () => {
	it('round-trips JSON and removes keys', () => {
		installMemoryStorage();
		expect(writeJson('k', { a: [1, 2] })).toBe(true);
		expect(readJson('k')).toEqual({ a: [1, 2] });
		removeKey('k');
		expect(readJson('k')).toBeUndefined();
	});

	it('reads undefined for a missing key or invalid JSON', () => {
		const data = installMemoryStorage();
		expect(readJson('missing')).toBeUndefined();
		data.set('bad', '{nope');
		expect(readJson('bad')).toBeUndefined();
	});

	it('does nothing when localStorage does not exist (prerender)', () => {
		vi.stubGlobal('localStorage', undefined);
		expect(readJson('k')).toBeUndefined();
		expect(writeJson('k', 1)).toBe(false);
		expect(() => removeKey('k')).not.toThrow();
	});

	it('survives a localStorage that throws', () => {
		vi.stubGlobal('localStorage', {
			getItem: () => {
				throw new Error('blocked');
			},
			setItem: () => {
				throw new Error('quota');
			},
			removeItem: () => {
				throw new Error('blocked');
			}
		});
		expect(readJson('k')).toBeUndefined();
		expect(writeJson('k', 1)).toBe(false);
		expect(() => removeKey('k')).not.toThrow();
	});
});

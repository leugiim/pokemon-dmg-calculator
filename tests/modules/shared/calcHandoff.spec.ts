import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	handoffIdOfResultKey,
	readHandoff,
	readHandoffResult,
	writeHandoff,
	writeHandoffResult,
	type CalcHandoff
} from '$lib/modules/shared';
import { installMemoryStorage } from '../team-planner/memoryStorage';

let data: Map<string, string>;
beforeEach(() => {
	data = installMemoryStorage();
});
afterEach(() => vi.unstubAllGlobals());

const handoff = (createdAt = Date.now()): CalcHandoff => ({
	createdAt,
	teamName: 'Team',
	own: [
		{
			name: 'Sparky',
			set: {
				species: 'Rotom-Wash',
				statPoints: { hp: 1, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
				moves: []
			}
		}
	],
	ownLead: ['Sparky'],
	rival: [{ name: 'Incineroar' }],
	rivalLead: []
});

describe('calc handoff', () => {
	it('round-trips', () => {
		const h = handoff();
		expect(writeHandoff('a', h)).toBe(true);
		expect(readHandoff('a')).toEqual(h);
		expect(readHandoff('missing')).toBeUndefined();
	});

	it('drops records older than a day when a new one is written', () => {
		const day = 24 * 60 * 60 * 1000;
		writeHandoff('old', handoff(1000));
		writeHandoffResult('old', []);
		data.set('pt:v1:calc-result:old', JSON.stringify({ createdAt: 1000, rivalSets: [] }));
		writeHandoff('new', handoff(1000 + day + 1));
		expect(readHandoff('old')).toBeUndefined();
		expect(readHandoffResult('old')).toBeUndefined();
		expect(readHandoff('new')).toBeDefined();
	});

	it('keeps recent records and unrelated keys', () => {
		data.set('other', '1');
		writeHandoff('a', handoff(1000));
		writeHandoff('b', handoff(2000));
		expect(readHandoff('a')).toBeDefined();
		expect(data.get('other')).toBe('1');
	});

	it('round-trips the result the calculator writes back', () => {
		const sets = handoff().own.map((m) => m.set!);
		expect(writeHandoffResult('a', sets)).toBe(true);
		expect(readHandoffResult('a')?.rivalSets).toEqual(sets);
	});

	it('recognizes the result key in a storage event', () => {
		expect(handoffIdOfResultKey('pt:v1:calc-result:abc')).toBe('abc');
		expect(handoffIdOfResultKey('pt:v1:calc-handoff:abc')).toBeUndefined();
		expect(handoffIdOfResultKey(null)).toBeUndefined();
	});
});

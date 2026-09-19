import type { PokemonSetData } from './pokemon-set';
import { listKeys, readJson, removeKey, writeJson } from './storage';

/**
 * How the team planner hands a match over to the damage calculator: a
 * short-lived record in `localStorage` (the calculator opens in another tab,
 * so the match form keeps its unsaved state), plus a second record the
 * calculator writes back with the rival sets the reader edited there.
 * Neither tool imports the other; both only know this contract.
 */

/** One Pokémon of a side. `name` is what the planner calls it (nickname or species). */
export interface HandoffMember {
	name: string;
	/** Missing when only the name is known (a rival typed in without a set). */
	set?: PokemonSetData;
}

export interface CalcHandoff {
	createdAt: number;
	/** Shown in the calculator, e.g. the planner team's name. */
	teamName?: string;
	/** Up to 6, the whole team. */
	own: HandoffMember[];
	/** Names of the Pokémon that start on the field, if already picked. */
	ownLead: string[];
	/** Up to 6, the whole opposing team. */
	rival: HandoffMember[];
	rivalLead: string[];
}

const HANDOFF_PREFIX = 'pt:v1:calc-handoff:';
const RESULT_PREFIX = 'pt:v1:calc-result:';
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export const handoffKey = (id: string) => `${HANDOFF_PREFIX}${id}`;
export const handoffResultKey = (id: string) => `${RESULT_PREFIX}${id}`;

/** Stored records older than a day, so abandoned handoffs don't pile up. */
function pruneStale(now: number) {
	for (const key of [...listKeys(HANDOFF_PREFIX), ...listKeys(RESULT_PREFIX)]) {
		const record = readJson<{ createdAt?: number }>(key);
		if (!record || typeof record.createdAt !== 'number' || now - record.createdAt > MAX_AGE_MS) {
			removeKey(key);
		}
	}
}

/** Returns whether it was stored. */
export function writeHandoff(id: string, handoff: CalcHandoff): boolean {
	pruneStale(handoff.createdAt);
	return writeJson(handoffKey(id), handoff);
}

export function readHandoff(id: string): CalcHandoff | undefined {
	return readJson<CalcHandoff>(handoffKey(id));
}

export interface HandoffResult {
	createdAt: number;
	/** The opposing Pokémon's sets as the reader left them in the calculator. */
	rivalSets: PokemonSetData[];
}

export function writeHandoffResult(id: string, rivalSets: PokemonSetData[]): boolean {
	const result: HandoffResult = { createdAt: Date.now(), rivalSets };
	return writeJson(handoffResultKey(id), result);
}

export function readHandoffResult(id: string): HandoffResult | undefined {
	return readJson<HandoffResult>(handoffResultKey(id));
}

/** The handoff id a `storage` event is about, if its key is that handoff's result record. */
export function handoffIdOfResultKey(key: string | null): string | undefined {
	return key?.startsWith(RESULT_PREFIX) ? key.slice(RESULT_PREFIX.length) : undefined;
}

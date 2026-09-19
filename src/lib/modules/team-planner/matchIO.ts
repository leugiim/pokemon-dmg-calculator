import { generateId, type PokemonSetData } from '$lib/modules/shared';
import type { Match } from './types';

type MatchData = Omit<Match, 'id' | 'teamId'>;

// Short keys for the compact export
interface CompactMatch {
	d: number; // date
	r: string; // result
	tr?: string[]; // teamRoster
	s: string[]; // selection
	l: string[]; // lead
	rt: string[]; // rivalTeam
	rs: string[]; // rivalSelection
	rl: string[]; // rivalLead
	n: string; // notes
	rps?: PokemonSetData[]; // rivalSets
	rp?: string; // rivalPaste
}

function encode(m: MatchData): CompactMatch {
	const c: CompactMatch = {
		d: m.date,
		r: m.result,
		s: m.selection,
		l: m.lead,
		rt: m.rivalTeam,
		rs: m.rivalSelection,
		rl: m.rivalLead,
		n: m.notes
	};
	if (m.teamRoster?.length) c.tr = m.teamRoster;
	if (m.rivalSets?.length) c.rps = m.rivalSets;
	if (m.rivalPaste) c.rp = m.rivalPaste;
	return c;
}

function decode(c: CompactMatch): MatchData {
	const data: MatchData = {
		date: c.d,
		result: c.r as Match['result'],
		teamRoster: c.tr ?? [],
		selection: c.s,
		lead: c.l,
		rivalTeam: c.rt,
		rivalSelection: c.rs,
		rivalLead: c.rl,
		notes: c.n
	};
	if (c.rps?.length) data.rivalSets = c.rps;
	if (c.rp) data.rivalPaste = c.rp;
	return data;
}

function isCompact(obj: unknown): obj is CompactMatch {
	return typeof obj === 'object' && obj !== null && 'd' in obj && 's' in obj;
}

/** The match's data without the ids, which an import assigns anew. */
function withoutIds({ id, teamId, ...data }: Match): MatchData {
	void id;
	void teamId;
	return data;
}

export function matchToJson(match: Match): string {
	return JSON.stringify(encode(withoutIds(match)));
}

export function historyToJson(matches: Match[]): string {
	return JSON.stringify(matches.map((m) => encode(withoutIds(m))));
}

/** Reads one match (compact or full format), or `null` if it isn't one. */
export function jsonToMatch(json: string, teamId: string): Match | null {
	try {
		const parsed = JSON.parse(json);
		const raw = Array.isArray(parsed) ? parsed[0] : parsed;
		if (!raw) return null;
		const data = isCompact(raw) ? decode(raw) : (raw as MatchData);
		if (!data?.result || !data?.selection || !data?.lead) return null;
		return { id: generateId(), teamId, ...data };
	} catch {
		return null;
	}
}

/** Reads a list of matches, or `null` if the JSON isn't one. */
export function jsonToHistory(json: string, teamId: string): Match[] | null {
	try {
		const parsed = JSON.parse(json);
		const arr = Array.isArray(parsed) ? parsed : [parsed];
		if (!arr.length) return null;
		const matches = arr.map((raw: unknown) => {
			const data = isCompact(raw) ? decode(raw as CompactMatch) : (raw as MatchData);
			return { id: generateId(), teamId, ...data };
		});
		if (!matches[0]?.result) return null;
		return matches;
	} catch {
		return null;
	}
}

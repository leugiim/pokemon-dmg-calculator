import type { MatchResult } from './types';

export const SELECTION_SIZE = 4;
export const LEAD_SIZE = 2;
export const RIVAL_TEAM_SIZE = 6;

export interface PickState {
	selection: string[];
	lead: string[];
}

/**
 * Adds or removes `name` from the selection (at most 4). Removing a
 * Pokémon also removes it from the lead. Used for both sides.
 */
export function toggleSelection(state: PickState, name: string): PickState {
	if (state.selection.includes(name)) {
		return {
			selection: state.selection.filter((n) => n !== name),
			lead: state.lead.filter((n) => n !== name)
		};
	}
	if (state.selection.length >= SELECTION_SIZE) return state;
	return { ...state, selection: [...state.selection, name] };
}

/** Adds or removes `name` from the lead (at most 2). */
export function toggleLead(lead: string[], name: string): string[] {
	if (lead.includes(name)) return lead.filter((n) => n !== name);
	if (lead.length >= LEAD_SIZE) return lead;
	return [...lead, name];
}

/** The rival's 6 name inputs: the saved names, padded with empty slots. */
export function padRivalSlots(names: string[]): string[] {
	return [...names, ...Array<string>(RIVAL_TEAM_SIZE).fill('')].slice(0, RIVAL_TEAM_SIZE);
}

/** Drops from the rival's selection and lead whatever is no longer in their team. */
export function syncRivalPicks(rivalTeam: string[], picks: PickState): PickState {
	const present = new Set(rivalTeam.map((n) => n.trim()).filter(Boolean));
	return {
		selection: picks.selection.filter((n) => present.has(n)),
		lead: picks.lead.filter((n) => present.has(n))
	};
}

/** The first thing wrong with a match about to be saved, or `null`. */
export function validateMatch(input: {
	result: MatchResult | '';
	selection: string[];
	lead: string[];
}): string | null {
	if (!input.result) return 'Pick the result, or mark the match as ongoing.';
	if (input.selection.length !== SELECTION_SIZE) return 'Select exactly 4 of your Pokémon.';
	if (input.lead.length !== LEAD_SIZE) return 'Pick your lead (2 Pokémon).';
	return null;
}

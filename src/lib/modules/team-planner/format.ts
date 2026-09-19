import type { MatchResult } from './types';

export function formatDate(ts: number): string {
	return new Date(ts).toLocaleDateString('en-GB', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric'
	});
}

export const RESULT_LABELS: Record<MatchResult, string> = {
	win: 'Win',
	loss: 'Loss',
	ongoing: 'Ongoing'
};

/** Green at 50% or above, red below. */
export function winrateClass(wr: number | null): string {
	return wr !== null && wr >= 50 ? 'text-emerald-400' : 'text-red-400';
}

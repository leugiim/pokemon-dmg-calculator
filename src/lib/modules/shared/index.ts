// Public API of the shared module: code both the damage calculator and the
// team planner use. Neither tool imports from the other, only from here.
export {
	handoffIdOfResultKey,
	readHandoff,
	readHandoffResult,
	writeHandoff,
	writeHandoffResult,
	type CalcHandoff,
	type HandoffMember,
	type HandoffResult
} from './calc-handoff';
export { generateId } from './id';
export { parsePokePasteSet, parseTeamPaste } from './paste';
export {
	clampStatPoints,
	emptyStatPointsData,
	MAX_STAT_POINTS_PER_STAT,
	STAT_KEYS,
	type PokemonSetData,
	type StatKey,
	type StatPointsData
} from './pokemon-set';
export { listKeys, readJson, removeKey, writeJson } from './storage';

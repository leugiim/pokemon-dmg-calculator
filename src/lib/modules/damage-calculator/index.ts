// Public API of the damage-calculator module.
export { commonSetData } from './calc/commonSetData';
export { applySetData, slotToData } from './calc/setData';
export {
	importTeamPaste,
	isBareSet,
	MAX_ROSTER_SIZE,
	loadHandoff,
	membersFromHandoff,
	rivalSetsToSave,
	rosterA,
	rosterB,
	TeamRoster,
	type MemberSource,
	type RosterMember
} from './stores/roster.svelte';

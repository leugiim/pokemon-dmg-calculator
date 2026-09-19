// Public API of the damage-calculator module.
export { commonSetData } from './calc/commonSetData';
export { applySetData, slotToData } from './calc/setData';
export {
	isBareSet,
	loadHandoff,
	membersFromHandoff,
	rivalSetsToSave,
	rosterA,
	rosterB,
	TeamRoster,
	type MemberSource,
	type RosterMember
} from './stores/roster.svelte';

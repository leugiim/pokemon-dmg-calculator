import {
	emptyStatPointsData,
	type CalcHandoff,
	type HandoffMember,
	type PokemonSetData
} from '$lib/modules/shared';
import { commonSetData } from '../calc/commonSetData';
import { applySetData, slotToData } from '../calc/setData';
import { teamA, teamB, type TeamSlot } from './team.svelte';

/** Where a member's build came from. */
export type MemberSource =
	/** Saved by the reader (a planner team's set, or rival sets saved on a match). */
	| 'saved'
	/** Filled in from the species' first common set. */
	| 'common'
	/** Only the name is known. */
	| 'none';

export interface RosterMember {
	/** What the planner calls it (nickname or species). */
	name: string;
	data: PokemonSetData;
	source: MemberSource;
}

/** A team has at most this many members. */
export const MAX_ROSTER_SIZE = 6;

type SlotIndex = 0 | 1;
type ActivePair = [number | null, number | null];

const norm = (name: string) => name.trim().toLowerCase();

/** A set with only a species: nothing worth saving. */
export function isBareSet(set: PokemonSetData): boolean {
	return (
		!set.item &&
		!set.ability &&
		!set.nature &&
		set.moves.length === 0 &&
		Object.values(set.statPoints).every((points) => points === 0)
	);
}

/**
 * The whole team behind one side of the calculator (up to 6), of which two
 * are on the field. The side's two `TeamSlot`s stay the live, editable
 * builds of the active pair; bringing another member in first writes the
 * slot's current build back into its member, so edits aren't lost when it
 * goes to the bench (stat stages and other in-battle "what ifs" are).
 */
export class TeamRoster {
	readonly #slots: [TeamSlot, TeamSlot];
	members = $state<RosterMember[]>([]);
	active = $state<ActivePair>([null, null]);

	constructor(slots: [TeamSlot, TeamSlot]) {
		this.#slots = slots;
	}

	/**
	 * Replaces the roster. The members named in `lead` go on the field; any
	 * free spot is filled with the next members in order.
	 */
	load(members: RosterMember[], lead: string[] = []): void {
		this.members = members;

		const picked: number[] = [];
		for (const name of lead) {
			const index = members.findIndex((m, i) => norm(m.name) === norm(name) && !picked.includes(i));
			if (index >= 0 && picked.length < 2) picked.push(index);
		}
		for (let i = 0; i < members.length && picked.length < 2; i++) {
			if (!picked.includes(i)) picked.push(i);
		}

		this.active = [picked[0] ?? null, picked[1] ?? null];
		this.#hydrate(0);
		this.#hydrate(1);
	}

	/** Forgets the roster. The slots keep whatever build they had. */
	clear(): void {
		this.members = [];
		this.active = [null, null];
	}

	/**
	 * Puts member `memberIndex` on the field in `slotIndex`. If it was
	 * already on the field in the other slot, the two swap.
	 */
	activate(slotIndex: SlotIndex, memberIndex: number): void {
		if (!this.members[memberIndex]) return;
		this.sync();

		const other: SlotIndex = slotIndex === 0 ? 1 : 0;
		if (this.active[slotIndex] === memberIndex) return;

		const next: ActivePair = [...this.active];
		if (next[other] === memberIndex) next[other] = next[slotIndex];
		next[slotIndex] = memberIndex;

		const changed = ([0, 1] as const).filter((i) => next[i] !== this.active[i]);
		this.active = next;
		for (const i of changed) this.#hydrate(i);
	}

	/** Whether the roster has no room for another member. */
	get isFull(): boolean {
		return this.members.length >= MAX_ROSTER_SIZE;
	}

	/**
	 * Why `slotIndex`'s Pokémon can't be saved into the team, or `null` if
	 * it can: nothing picked, already a member, or no room left.
	 */
	addBlockedReason(slotIndex: SlotIndex): string | null {
		if (!this.#slots[slotIndex].species) return 'Pick a Pokémon first';
		if (this.active[slotIndex] !== null) return 'Already in the team';
		if (this.isFull) return `The team is full (${MAX_ROSTER_SIZE})`;
		return null;
	}

	/**
	 * Saves what's in `slotIndex` as a new member of the team, which then
	 * is that slot's member. Returns whether it was added (see
	 * `addBlockedReason`).
	 */
	add(slotIndex: SlotIndex): boolean {
		if (this.addBlockedReason(slotIndex) !== null) return false;
		const data = slotToData(this.#slots[slotIndex]);
		if (!data) return false;

		this.members = [...this.members, { name: data.species, data, source: 'saved' }];
		const next: ActivePair = [...this.active];
		next[slotIndex] = this.members.length - 1;
		this.active = next;
		return true;
	}

	/**
	 * Takes a member out of the team. If it was on the field, its slot keeps
	 * the build it has (it just isn't part of the team anymore).
	 */
	remove(memberIndex: number): void {
		if (!this.members[memberIndex]) return;
		this.members = this.members.filter((_, i) => i !== memberIndex);
		const shift = (a: number | null) =>
			a === null || a === memberIndex ? null : a > memberIndex ? a - 1 : a;
		this.active = [shift(this.active[0]), shift(this.active[1])];
	}

	/**
	 * Stops `slotIndex` being its member's slot, for when the Pokémon in it
	 * turns into a different one. Call `sync()` before the slot changes so
	 * the member keeps the build the slot had; syncing afterwards would
	 * overwrite it with the new Pokémon.
	 */
	detach(slotIndex: SlotIndex): void {
		const next: ActivePair = [...this.active];
		next[slotIndex] = null;
		this.active = next;
	}

	/** Writes the active slots' current builds back into their members. */
	sync(): void {
		for (const i of [0, 1] as const) {
			const index = this.active[i];
			if (index === null) continue;
			const member = this.members[index];
			const data = slotToData(this.#slots[i]);
			if (!member || !data) continue;
			// The nickname belongs to the Pokémon, not to the build.
			const sameSpecies = norm(data.species) === norm(member.data.species);
			this.members[index] = {
				...member,
				data:
					sameSpecies && member.data.nickname ? { ...data, nickname: member.data.nickname } : data
			};
		}
	}

	/** Every member's build, with the active ones as they are now. */
	toData(): PokemonSetData[] {
		this.sync();
		return this.members.map((m) => m.data);
	}

	#hydrate(slotIndex: SlotIndex): void {
		const index = this.active[slotIndex];
		const slot = this.#slots[slotIndex];
		if (index === null) {
			slot.species = null;
			return;
		}
		applySetData(slot, this.members[index].data);
	}
}

/** Team A's whole team; its active pair is `teamA`. */
export const rosterA = new TeamRoster(teamA);
/** Team B's whole team; its active pair is `teamB`. */
export const rosterB = new TeamRoster(teamB);

function bareSet(species: string): PokemonSetData {
	return { species, statPoints: emptyStatPointsData(), moves: [] };
}

/**
 * Turns the planner's members into roster members: a given set is used as
 * is, otherwise the species' first common set, otherwise just the name.
 */
export function membersFromHandoff(members: HandoffMember[]): RosterMember[] {
	return members.map((member) => {
		if (member.set) return { name: member.name, data: member.set, source: 'saved' };
		const common = commonSetData(member.name);
		if (common) return { name: member.name, data: common, source: 'common' };
		return { name: member.name, data: bareSet(member.name), source: 'none' };
	});
}

/** Loads both rosters from a planner handoff. */
export function loadHandoff(handoff: CalcHandoff): void {
	rosterA.load(membersFromHandoff(handoff.own), handoff.ownLead);
	rosterB.load(membersFromHandoff(handoff.rival), handoff.rivalLead);
}

/**
 * The opposing team's sets worth keeping: everything but members that are
 * still just a name.
 */
export function rivalSetsToSave(): PokemonSetData[] {
	return rosterB.toData().filter((set) => !isBareSet(set));
}

import { describe, expect, it } from 'vitest';
import {
	exportPokePasteSet,
	exportTeamPaste,
	parsePokePasteSet,
	parseTeamPaste
} from '$lib/modules/shared';

const PASTE = `Charizard @ Charizardite Y
Ability: Blaze
Level: 50
Shiny: Yes
Tera Type: Fire
EVs: 4 HP / 32 SpA / 32 Spe
Timid Nature
IVs: 0 Atk
- Heat Wave
- Solar Beam
- Protect
- Air Slash

Sparky (Rotom-Wash) (F) @ Sitrus Berry
Ability: Levitate
EVs: 32 HP / 4 Def / 32 SpD
Calm Nature
- Hydro Pump
- Volt Switch
- Will-O-Wisp
- Protect

Froslass-Mega @ Froslassite
Ability: Snow Warning
EVs: 32 SpA / 32 Spe
Timid Nature
- Blizzard
- Shadow Ball
- Icy Wind
- Protect`;

describe('parseTeamPaste', () => {
	const team = parseTeamPaste(PASTE);

	it('parses one set per blank-line separated block', () => {
		expect(team.map((s) => s.species)).toEqual(['Charizard', 'Rotom-Wash', 'Froslass-Mega']);
	});

	it('parses a set without a nickname', () => {
		expect(team[0]).toEqual({
			species: 'Charizard',
			item: 'Charizardite Y',
			ability: 'Blaze',
			nature: 'Timid',
			statPoints: { hp: 4, atk: 0, def: 0, spa: 32, spd: 0, spe: 32 },
			moves: ['Heat Wave', 'Solar Beam', 'Protect', 'Air Slash']
		});
	});

	it('keeps the nickname and drops the gender marker', () => {
		expect(team[1].nickname).toBe('Sparky');
		expect(team[1].species).toBe('Rotom-Wash');
		expect(team[1].statPoints).toEqual({ hp: 32, atk: 0, def: 4, spa: 0, spd: 32, spe: 0 });
	});

	it('leaves out Level, Shiny, Tera Type and IVs', () => {
		expect(Object.keys(team[0]).sort()).toEqual(
			['ability', 'item', 'moves', 'nature', 'species', 'statPoints'].sort()
		);
	});

	it('clamps EV-style values into Stat Points (0-32)', () => {
		const [set] = parseTeamPaste('Garchomp\nEVs: 252 Atk / 4 Spe');
		expect(set.statPoints).toMatchObject({ atk: 32, spe: 4 });
	});

	it('parses a move whose name contains "Nature" as a move', () => {
		const set = parsePokePasteSet('Pikachu\nAbility: Static\nTimid Nature\n- Nature Power');
		expect(set?.moves).toEqual(['Nature Power']);
		expect(set?.nature).toBe('Timid');
	});

	it('handles a set without item, nature or EVs', () => {
		expect(parsePokePasteSet('Pikachu\nAbility: Static\n- Thunderbolt')).toEqual({
			species: 'Pikachu',
			ability: 'Static',
			statPoints: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
			moves: ['Thunderbolt']
		});
	});

	it('returns nothing for empty or blank input', () => {
		expect(parseTeamPaste('')).toEqual([]);
		expect(parseTeamPaste('\n\n  \n')).toEqual([]);
		expect(parsePokePasteSet('')).toBeNull();
	});
});

describe('exportTeamPaste', () => {
	const sets = parseTeamPaste(PASTE);

	it('round-trips through the parser', () => {
		expect(parseTeamPaste(exportTeamPaste(sets))).toEqual(sets);
	});

	it('writes a block per Pokémon separated by a blank line', () => {
		const text = exportTeamPaste(sets);
		expect(text.split(/\n\s*\n/)).toHaveLength(3);
		expect(text).toContain('Sparky (Rotom-Wash) @ Sitrus Berry');
		expect(text).toContain('EVs: 32 HP / 4 Def / 32 SpD');
		expect(text).toContain('Timid Nature');
	});

	it('leaves out what a set does not have', () => {
		const text = exportPokePasteSet({
			species: 'Pikachu',
			statPoints: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
			moves: ['Thunderbolt']
		});
		expect(text).not.toContain('@');
		expect(text).not.toContain('EVs');
		expect(text).not.toContain('Nature');
		expect(text).toContain('- Thunderbolt');
	});

	it('is empty for an empty team', () => {
		expect(exportTeamPaste([])).toBe('');
	});
});

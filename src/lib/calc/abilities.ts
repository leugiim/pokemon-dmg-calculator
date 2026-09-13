import { toID, type SpeciesItem } from './generation';

export interface AbilityOption {
	name: string;
	isHidden: boolean;
}

/**
 * A species' real abilities — both regular slots and the hidden one.
 *
 * `@smogon/calc`'s bundled data only records a single ability per
 * species (see `Specie.abilities`), not the full set a real Pokémon
 * can have, so this fetches from PokeAPI instead. Results are cached
 * per species name; a species whose guessed PokeAPI slug doesn't
 * exist (a few of our hand-rolled forme families don't line up with
 * PokeAPI's own naming) falls back to that single known ability.
 */
export function abilitiesOf(species: SpeciesItem): Promise<AbilityOption[]> {
	const cached = cache.get(species.name);
	if (cached) return cached;

	const promise = fetchFromPokeApi(pokeApiSlug(species)).catch(() => fallback(species));
	cache.set(species.name, promise);
	return promise;
}

const cache = new Map<string, Promise<AbilityOption[]>>();

/**
 * A handful of species PokeAPI names differently than a straight
 * base+suffix split would produce — verified by hand against the real
 * API. Most are a species whose *default* forme isn't just the bare
 * name there: gender-based species need "-male"/"-female" (Indeedee,
 * Oinkologne, Basculegion, Meowstic), others "-standard" (Darmanitan),
 * "-incarnate" (Landorus/Thundurus/Tornadus/Enamorus), "-single-strike"
 * (Urshifu), etc. Aegislash and Necrozma's fusion formes are naming
 * quirks specific to each. Not exhaustive — Gmax formes, Ogerpon's Tera
 * states, Arceus/Silvally's per-type plates, and Pokémon Champions' own
 * gendered Meowstic Mega don't exist on PokeAPI at all (some genuinely
 * don't change ability by forme there either, like Arceus), so those
 * just fall back to the single ability `@smogon/calc` knows.
 */
const SLUG_OVERRIDES: Record<string, string> = {
	'Aegislash-Blade': 'aegislash-blade',
	'Aegislash-Shield': 'aegislash-shield',
	Giratina: 'giratina-altered',
	Landorus: 'landorus-incarnate',
	Thundurus: 'thundurus-incarnate',
	Tornadus: 'tornadus-incarnate',
	Enamorus: 'enamorus-incarnate',
	Darmanitan: 'darmanitan-standard',
	'Darmanitan-Galar': 'darmanitan-galar-standard',
	Urshifu: 'urshifu-single-strike',
	Toxtricity: 'toxtricity-amped',
	Wishiwashi: 'wishiwashi-solo',
	Mimikyu: 'mimikyu-disguised',
	Meloetta: 'meloetta-aria',
	Morpeko: 'morpeko-full-belly',
	Basculin: 'basculin-red-striped',
	Eiscue: 'eiscue-ice',
	Minior: 'minior-red-meteor',
	Palafin: 'palafin-zero',
	Pumpkaboo: 'pumpkaboo-average',
	Gourgeist: 'gourgeist-average',
	Meowstic: 'meowstic-male',
	'Meowstic-F': 'meowstic-female',
	Indeedee: 'indeedee-male',
	'Indeedee-F': 'indeedee-female',
	Oinkologne: 'oinkologne-male',
	'Oinkologne-F': 'oinkologne-female',
	Basculegion: 'basculegion-male',
	'Basculegion-F': 'basculegion-female',
	'Ogerpon-Wellspring': 'ogerpon-wellspring-mask',
	'Ogerpon-Hearthflame': 'ogerpon-hearthflame-mask',
	'Ogerpon-Cornerstone': 'ogerpon-cornerstone-mask',
	'Necrozma-Dusk-Mane': 'necrozma-dusk',
	'Necrozma-Dawn-Wings': 'necrozma-dawn'
};

/**
 * Best-effort PokeAPI slug for a species: `<base>-<suffix>`, keeping
 * whatever hyphens the suffix already has (PokeAPI, unlike Showdown's
 * sprites, doesn't compact a multi-word forme suffix — Charizard's
 * Mega X is "charizard-mega-x" there, not "charizard-megax").
 */
export function pokeApiSlug(species: SpeciesItem): string {
	const override = SLUG_OVERRIDES[species.name];
	if (override) return override;
	if (!species.baseSpecies) return toID(species.name);
	const suffix = species.name.slice(species.baseSpecies.length + 1).toLowerCase();
	return `${toID(species.baseSpecies)}-${suffix}`;
}

function fallback(species: SpeciesItem): AbilityOption[] {
	const name = species.abilities?.[0];
	return name ? [{ name, isHidden: false }] : [];
}

async function fetchFromPokeApi(slug: string): Promise<AbilityOption[]> {
	const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${slug}`);
	if (!res.ok) throw new Error(`PokeAPI returned ${res.status} for "${slug}"`);

	const data: { abilities: { ability: { name: string }; is_hidden: boolean }[] } = await res.json();
	const abilities = data.abilities.map((a) => ({
		name: titleCase(a.ability.name),
		isHidden: a.is_hidden
	}));
	if (abilities.length === 0) throw new Error(`PokeAPI listed no abilities for "${slug}"`);
	return abilities;
}

/** "solar-power" -> "Solar Power" */
function titleCase(slug: string): string {
	return slug
		.split('-')
		.map((word) => word[0].toUpperCase() + word.slice(1))
		.join(' ');
}

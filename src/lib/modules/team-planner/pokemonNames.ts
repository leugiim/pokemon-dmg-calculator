let cachedNames: string[] | null = null;

/**
 * Every Pokémon name Pokémon Showdown knows, for the rival autocomplete.
 * Fetched once and cached; falls back to an empty list if the request fails.
 */
export async function getPokemonNames(): Promise<string[]> {
	if (cachedNames) return cachedNames;

	try {
		const res = await fetch('https://play.pokemonshowdown.com/data/pokedex.json');
		const data = (await res.json()) as Record<string, { name: string }>;
		cachedNames = Object.values(data)
			.map((p) => p.name)
			.sort();
	} catch {
		cachedNames = [];
	}

	return cachedNames;
}

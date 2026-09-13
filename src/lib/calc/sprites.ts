import { toID, type SpeciesItem } from './generation';

const SPRITE_BASE = 'https://play.pokemonshowdown.com/sprites/home';

/**
 * `@smogon/calc`'s data has no plain "Aegislash" entry to be the
 * `baseSpecies` of its two formes (see the comment on
 * `NONSTANDARD_SPECIES`) — Aegislash-Blade has no `baseSpecies` at all
 * (so it'd fall through to the compact `aegislashblade`, which 404s;
 * it needs the hyphen), and Aegislash-Shield's `baseSpecies` points at
 * "Aegislash-Blade", which isn't actually a prefix of its own name, so
 * slicing it apart produces garbage. Showdown also has no separate
 * "Shield" art at all — the shield stance is Aegislash's default
 * look, filed under the plain `aegislash`. Both need spelling out by
 * hand instead of going through the general `baseSpecies` split below.
 */
const SPRITE_ID_OVERRIDES: Record<string, string> = {
	'Aegislash-Blade': 'aegislash-blade',
	'Aegislash-Shield': 'aegislash'
};

/**
 * Best-effort mapping from a species to its Showdown "home" sprite.
 *
 * Showdown's `dex` sprite set (a smaller, older render) is missing a lot
 * of alt formes outright — several regional forms and battle styles
 * 404 there with no fallback. `home` has much broader coverage, but its
 * filenames aren't simply `toID(name)`: a forme is `<base>-<suffix>`
 * where `<base>` is the compact id of `baseSpecies` and `<suffix>` is
 * the compact id of whatever comes after it in the display name (e.g.
 * `Charizard-Mega-X` -> `charizard-megax`, `Landorus-Therian` ->
 * `landorus-therian`). A species with no `baseSpecies` (including ones
 * whose own name happens to contain a hyphen, like `Jangmo-o` or
 * `Porygon-Z`) is just its own compact id, same as before.
 *
 * This covers the vast majority of formes, but a few forme-of-forme
 * combos (e.g. a Gmax stacked on a battle style) use a filename this
 * can't derive — {@link altSpriteUrl} is the fallback for those, and
 * a handful of Pokémon Champions' own new Mega Evolutions have no
 * official art anywhere yet, which the caller should show a
 * placeholder for.
 */
export function spriteUrl(species: SpeciesItem): string {
	const override = SPRITE_ID_OVERRIDES[species.name];
	if (override) return `${SPRITE_BASE}/${override}.png`;
	if (!species.baseSpecies) return `${SPRITE_BASE}/${toID(species.name)}.png`;
	const suffix = species.name.slice(species.baseSpecies.length + 1);
	return `${SPRITE_BASE}/${toID(species.baseSpecies)}-${toID(suffix)}.png`;
}

/** Fallback sprite URL: the plain compact id, with no forme-aware splitting. */
export function altSpriteUrl(species: SpeciesItem): string {
	return `${SPRITE_BASE}/${toID(species.name)}.png`;
}

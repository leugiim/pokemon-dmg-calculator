import { toID } from './generation';

const SPRITE_BASE = 'https://play.pokemonshowdown.com/sprites/dex';

/**
 * Best-effort mapping from a species name to its Showdown "dex" sprite.
 * Showdown's own id scheme (`toID`, no separators at all) covers the vast
 * majority of species, but a handful of alt formes keep a hyphen in their
 * sprite filename for legacy reasons (e.g. `landorus-therian`, while
 * `nidoran-f` does *not*). There's no reliable rule to derive one from the
 * other, so callers should fall back to {@link altSpriteUrl} on error.
 */
export function spriteUrl(speciesName: string): string {
	return `${SPRITE_BASE}/${toID(speciesName)}.png`;
}

/** Fallback sprite URL, keeping the hyphen before a forme suffix. */
export function altSpriteUrl(speciesName: string): string {
	const slug = speciesName.toLowerCase().replace(/[.'’]/g, '').replace(/\s+/g, '');
	return `${SPRITE_BASE}/${slug}.png`;
}

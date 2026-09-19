// Pokémon whose name has a hyphen that its sprite file doesn't
const NO_HYPHEN: Record<string, string> = {
	'kommo-o': 'kommoo',
	'hakamo-o': 'hakamoo',
	'jangmo-o': 'jangmoo',
	'wo-chien': 'wochien',
	'chien-pao': 'chienpao',
	'ting-lu': 'tinglu',
	'chi-yu': 'chiyu',
	'ho-oh': 'hooh',
	'porygon-z': 'porygonz'
};

const SPRITES = 'https://play.pokemonshowdown.com/sprites';

// Showdown id: lowercase, keeps hyphens, drops everything else
function toId(name: string): string {
	const lower = name
		.toLowerCase()
		.replace(/[^a-z0-9-]/g, '')
		.replace(/mega-/g, 'mega');
	return NO_HYPHEN[lower] ?? lower;
}

// Showdown item id: lowercase, spaces become hyphens
function toItemId(name: string): string {
	const lower = name
		.toLowerCase()
		.replace(/ /g, '-')
		.replace(/[^a-z0-9-]/g, '');
	return NO_HYPHEN[lower] ?? lower;
}

/** Animated GIF (~96px), for team cards. */
export function pokemonSpriteUrl(name: string): string {
	return `${SPRITES}/ani/${toId(name)}.gif`;
}

/** Static gen5 icon (~40px), for badges and small icons. */
export function pokemonIconUrl(name: string): string {
	return `${SPRITES}/gen5/${toId(name)}.png`;
}

/** Mega stone icon (24px). */
export function megaIconUrl(): string {
	return `${SPRITES}/misc/mega.png`;
}

/** Item icon (24px). Mega stones all share one icon. */
export function itemIconUrl(item: string): string {
	const id = toItemId(item);
	const baseId = id.replace(/-[xyz]$/, '');
	if (baseId.endsWith('ite') && baseId !== 'eviolite') return megaIconUrl();
	return `${SPRITES}/itemicons/${id}.png`;
}

<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	// Single-page app (see CONTEXT.md) — there's only ever one route, so a
	// site-wide title/description/canonical here covers every page the
	// same way a per-route one would, without duplicating it if a second
	// route is ever added.
	const SITE_URL = 'https://doubles-vgc-calc.leugiim.es/';
	const TITLE = 'Pokemon DMG Calculator — 2v2 VGC Damage Calculator';
	const DESCRIPTION =
		'A competitive Pokémon VGC (doubles) damage calculator: build 2v2 teams and see the full damage matrix — every attacker/move against every opposing target, including doubles-only mechanics like spread damage and ally support.';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" type="image/svg+xml" href={favicon} />
	<link rel="mask-icon" href={favicon} color="#ee1515" />
	<link rel="canonical" href={SITE_URL} />
	<title>{TITLE}</title>
	<meta name="description" content={DESCRIPTION} />
	<meta name="theme-color" content="#030712" />

	<meta property="og:type" content="website" />
	<meta property="og:url" content={SITE_URL} />
	<meta property="og:title" content={TITLE} />
	<meta property="og:description" content={DESCRIPTION} />

	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={TITLE} />
	<meta name="twitter:description" content={DESCRIPTION} />
</svelte:head>
{@render children()}

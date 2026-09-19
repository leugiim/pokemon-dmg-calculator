<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<div class="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-12 sm:px-8">
	<header class="text-center">
		<h1 class="text-3xl font-bold text-gray-100">Pokemon Tools</h1>
		<p class="mt-2 text-sm text-gray-300">VGC tools for Pokémon Champions (doubles)</p>
	</header>

	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
		<a
			href={resolve('/teams')}
			class="flex flex-col gap-2 rounded-xl border border-gray-800 bg-gray-900 p-6 hover:border-gray-600"
		>
			<h2 class="text-lg font-semibold text-gray-100">Team Planner</h2>
			<p class="text-sm text-gray-300">
				Keep your teams from a Pokepaste, log your matches and see your win rates, leads and
				toughest opponents.
			</p>
			<span class="mt-auto text-xs text-gray-500">Coming soon</span>
		</a>

		<a
			href={resolve('/calc')}
			class="flex flex-col gap-2 rounded-xl border border-gray-800 bg-gray-900 p-6 hover:border-gray-600"
		>
			<h2 class="text-lg font-semibold text-gray-100">Damage Calculator</h2>
			<p class="text-sm text-gray-300">
				2v2 damage matrix: every attacker and move against every opposing target, with doubles
				mechanics like spread damage and ally support.
			</p>
		</a>
	</div>
</div>

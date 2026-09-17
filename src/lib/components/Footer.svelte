<!--
	Credits are load-bearing, not decorative: @smogon/calc and @pkmn/sets are
	the actual dependencies this app's damage math runs on (see package.json,
	README.md's "Tech stack"), and the NCP VGC Damage Calculator is this
	app's own stated inspiration (README.md's "Motivation") — this footer is
	the one place a visitor sees any of that.
-->
<!-- No horizontal padding of its own — nests inside +page.svelte's own
     px-4/sm:px-8/lg:px-16 container, which already insets every other
     section the same way. -->
<footer class="mt-8 border-t border-gray-800 py-6 text-center text-[11px] text-gray-500">
	<p>
		<a
			href="https://github.com/leugiim/pokemon-dmg-calculator"
			target="_blank"
			rel="noopener noreferrer"
			class="text-gray-400 underline hover:text-gray-200"
		>
			Source on GitHub
		</a>
	</p>
	<p class="mx-auto mt-2 max-w-2xl">
		Damage calculations powered by
		<a
			href="https://www.npmjs.com/package/@smogon/calc"
			target="_blank"
			rel="noopener noreferrer"
			class="underline hover:text-gray-300"
		>
			@smogon/calc
		</a>
		and
		<a
			href="https://www.npmjs.com/package/@pkmn/sets"
			target="_blank"
			rel="noopener noreferrer"
			class="underline hover:text-gray-300"
		>
			@pkmn/sets
		</a>
		— the same engine behind the official
		<a
			href="https://calc.pokemonshowdown.com/"
			target="_blank"
			rel="noopener noreferrer"
			class="underline hover:text-gray-300"
		>
			Pokémon Showdown damage calculator
		</a>
		.
	</p>
	<p class="mt-1">
		Inspired by the
		<a
			href="https://nerd-of-now.github.io/NCP-VGC-Damage-Calculator/"
			target="_blank"
			rel="noopener noreferrer"
			class="underline hover:text-gray-300"
		>
			NCP VGC Damage Calculator
		</a>
		— built natively for doubles.
	</p>
</footer>

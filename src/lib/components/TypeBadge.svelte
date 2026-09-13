<script lang="ts">
	import { TYPE_COLORS } from '$lib/calc/typeColors';

	let { type }: { type: string } = $props();
</script>

<span
	class="flex h-5 w-16 shrink-0 items-center justify-center gap-1 rounded text-[10px] font-semibold tracking-wide text-white uppercase"
	style="background-color: {TYPE_COLORS[type] ?? '#68A090'}"
>
	<img
		src="https://play.pokemonshowdown.com/sprites/typeicons/{type}.png"
		alt=""
		width="12"
		height="12"
		class="shrink-0"
	/>
	{type}
</span>

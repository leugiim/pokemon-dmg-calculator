<script lang="ts">
	import { TYPE_COLORS } from '$lib/calc/typeColors';

	let { type }: { type: string } = $props();
</script>

<span
	class="rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase"
	style="background-color: {TYPE_COLORS[type] ?? '#68A090'}"
>
	{type}
</span>

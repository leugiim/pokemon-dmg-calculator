<script lang="ts">
	import type { MoveCategory } from '$lib/modules/damage-calculator/calc/moves';
	import physical from '$lib/assets/images/physical.png';
	import special from '$lib/assets/images/special.png';
	import status from '$lib/assets/images/status.png';

	let { category }: { category: MoveCategory } = $props();

	const ICONS: Record<MoveCategory, string> = {
		Physical: physical,
		Special: special,
		Status: status
	};
</script>

<img src={ICONS[category]} alt={category} title={category} class="h-5 w-auto shrink-0" />

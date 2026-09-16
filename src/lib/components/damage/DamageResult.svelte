<script lang="ts">
	import type { DamageDisplay } from '$lib/calc/damage';

	/**
	 * The `%HP range` / `KO chance` text convention shared by every damage
	 * cell in the app (see `CONTEXT.md`'s "Damage Matrix"), stacked on two
	 * lines so a cell's width is driven by whichever line is wider rather
	 * than their combined length. Callers own their own layout/typography
	 * around it; `koChanceClass` lets the KO chance annotation be styled
	 * distinctly from the %HP range the way `DamageMatrix` does.
	 */
	let { damage, koChanceClass = '' }: { damage: DamageDisplay; koChanceClass?: string } = $props();
</script>

<div class="flex flex-col leading-tight">
	<span>{damage.percentRange}%</span>
	{#if damage.koChance}
		<span class={koChanceClass}>{damage.koChance}</span>
	{/if}
</div>

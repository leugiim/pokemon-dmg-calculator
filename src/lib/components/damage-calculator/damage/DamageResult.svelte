<script lang="ts">
	import type { DamageDisplay } from '$lib/modules/damage-calculator/calc/damage';

	/**
	 * The `%HP range` / `KO chance` text convention shared by every damage
	 * cell in the app (see `CONTEXT.md`'s "Damage Matrix"), stacked on two
	 * lines so a cell's width is driven by whichever line is wider rather
	 * than their combined length. Callers own their own layout/typography
	 * around it; `koChanceClass` lets the KO chance annotation be styled
	 * distinctly from the %HP range the way `DamageMatrix` does.
	 *
	 * `max-w-24` caps how wide either line can grow: `@smogon/calc`'s own
	 * KO chance text can run long once it starts naming end-of-turn/hazard
	 * qualifiers ("48.4% chance to 2HKO after Stealth Rock and Leftovers
	 * recovery"), and without a cap it renders on one single unwrapped
	 * line, stretching every Damage Matrix column (and the table itself,
	 * `AttackerTable`'s `overflow-x-auto` wrapper especially readily lets
	 * it) out to fit — wrapping onto as many lines as it needs, at a fixed
	 * width, keeps a cell's footprint sane regardless of how long that
	 * text gets.
	 */
	let { damage, koChanceClass = '' }: { damage: DamageDisplay; koChanceClass?: string } = $props();
</script>

<div class="flex max-w-24 flex-col leading-tight">
	<span>{damage.percentRange}%</span>
	{#if damage.koChance}
		<span class={koChanceClass}>{damage.koChance}</span>
	{/if}
</div>

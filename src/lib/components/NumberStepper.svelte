<script lang="ts">
	/**
	 * A number `<input>` plus its own ▲▼ nudge buttons — used for both Stat
	 * Points and stat stages in `StatPointBars`. Deliberately dumb: it never
	 * clamps `value` itself (a Stat Point's cap also depends on the total
	 * budget spent elsewhere, a stat stage's doesn't), so every change —
	 * typed or via a nudge button — goes through the same `onChange`, and
	 * the caller decides what the new value is actually allowed to be.
	 */
	let {
		value,
		min,
		max,
		disabled = false,
		ariaLabel,
		onChange
	}: {
		value: number;
		min: number;
		max: number;
		disabled?: boolean;
		ariaLabel: string;
		onChange: (value: number) => void;
	} = $props();
</script>

<div class="relative w-10 shrink-0">
	<input
		type="number"
		{min}
		{max}
		{value}
		{disabled}
		oninput={(e) => onChange(Number(e.currentTarget.value))}
		aria-label={ariaLabel}
		class="stat-input w-full rounded border border-gray-700 bg-gray-800 py-0.5 pr-3.5 pl-1 text-right text-[11px] text-gray-100 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 focus:outline-none disabled:opacity-40"
	/>
	<div class="absolute inset-y-0 right-0.5 flex flex-col justify-center">
		<button
			type="button"
			tabindex="-1"
			{disabled}
			onclick={() => onChange(value + 1)}
			aria-label="Increase {ariaLabel}"
			class="flex h-2.5 w-3 items-center justify-center text-[8px] leading-none text-gray-500 hover:text-gray-300 disabled:pointer-events-none disabled:opacity-40"
		>
			▲
		</button>
		<button
			type="button"
			tabindex="-1"
			{disabled}
			onclick={() => onChange(value - 1)}
			aria-label="Decrease {ariaLabel}"
			class="flex h-2.5 w-3 items-center justify-center text-[8px] leading-none text-gray-500 hover:text-gray-300 disabled:pointer-events-none disabled:opacity-40"
		>
			▼
		</button>
	</div>
</div>

<style>
	/* Chrome only lets you fade its number spinner, not recolor it — so
	   hide it outright and use our own ▲▼ buttons instead, which we can
	   actually theme. `-moz-appearance` does the same for Firefox, which
	   doesn't expose the spinner as a styleable pseudo-element at all. */
	.stat-input::-webkit-inner-spin-button,
	.stat-input::-webkit-outer-spin-button {
		appearance: none;
		margin: 0;
	}
	.stat-input {
		appearance: textfield;
		-moz-appearance: textfield;
	}
</style>

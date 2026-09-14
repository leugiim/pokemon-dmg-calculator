# Ally support: auto-derive static flags, manual-only for turn-dependent ones

Side-level ally support flags split into two kinds, handled differently. Flags tied to a fixed ability the ally has equipped (Friend Guard, Battery, Power Spot, Steely Spirit) are derived automatically from the ally's `ability` field, with a manual override toggle for testing a hypothetical. Flags with no static data source, because they depend on an action taken that turn rather than a fixed attribute (Helping Hand, Tailwind), are manual-toggle-only and default off. This minimizes manual input where the calculator already has enough information to know a flag should be on, while staying honest that some conditions simply can't be inferred from team data.

## Considered options

- Manual toggle for every ally support flag, static or not: more uniform, but forces the reader to re-derive by hand something the app already knows from the ally's ability.
- Auto-derive everything, including turn-dependent flags, defaulting to some assumption (e.g. always-on Helping Hand): would silently misrepresent matchups where the assumption doesn't hold, with no data to justify the default either way.

## Consequences

Any future static ally-support mechanic should follow the auto-derive-plus-override pattern; any future turn-dependent one should stay manual-only unless a battle-state-tracking feature is added later (out of scope for this design, see `CONTEXT.md`).

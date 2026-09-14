# Damage Matrix shows all 4 moves per attacker, not one selected move

Rather than asking the user to pick one active move per Pokémon before showing a compact matrix, the Damage Matrix always computes and displays damage for all of an attacker's up to 4 moves against each opposing Pokémon. Comparing moveset coverage across a whole matchup in one view was judged more valuable for team-building and matchup analysis than a smaller grid, even though it means significantly more cells and `calculate()` calls per matchup (up to 4 moves × 2 targets × 4 attackers).

## Considered options

- Single move selector per Pokémon, matrix shrinks to one row per attacker: simpler UI, less to read, but hides the rest of the moveset and forces re-selecting to compare options.

## Consequences

Layout has to handle a wider table by design, not as an edge case. Empty move slots (a Pokémon with fewer than 4 moves chosen) are simply skipped as rows, not padded or shown as blanks.

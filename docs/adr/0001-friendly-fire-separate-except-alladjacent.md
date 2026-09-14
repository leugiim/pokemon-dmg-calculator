# Friendly fire is separate from the Damage Matrix, except `allAdjacent` moves

The Damage Matrix computes damage between opposing Pokémon only. Moves that can *only* target the ally (`adjacentAlly`, `allies`) are excluded from it and calculated on demand instead. The exception is `allAdjacent` moves (e.g. Earthquake): in real play, using one hits the ally at the same time as both opponents, unconditionally — so treating that ally damage as an opt-in extra would misrepresent what the move actually does. Its ally damage is shown inline in the matrix row instead.

## Considered options

- Treat all ally damage uniformly as opt-in: simpler and more consistent, but wrong for `allAdjacent` moves, since it makes an unconditional side effect of using the move look like something the reader has to think to ask for.
- Fold all ally damage into the main matrix unconditionally: more complete, but inflates the grid with ally columns for the (common) case of moves that can never or rarely target the ally on purpose.

## Consequences

Move-classification logic must special-case `target === 'allAdjacent'` specifically, rather than treating "can this move affect the ally" as a single boolean.

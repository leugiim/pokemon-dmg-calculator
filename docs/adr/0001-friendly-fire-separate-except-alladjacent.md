# Friendly fire is separate from the Damage Matrix, except `allAdjacent` moves

The Damage Matrix computes damage between opposing Pokémon only. Moves that can _only_ target the ally (`adjacentAlly`, `allies`) are excluded from it entirely. The exception is `allAdjacent` moves (e.g. Earthquake): in real play, using one hits the ally at the same time as both opponents, unconditionally — so treating that ally damage as an opt-in extra would misrepresent what the move actually does. Its ally damage is shown inline in the matrix row instead.

## Considered options

- Treat all ally damage uniformly as opt-in: simpler and more consistent, but wrong for `allAdjacent` moves, since it makes an unconditional side effect of using the move look like something the reader has to think to ask for.
- Fold all ally damage into the main matrix unconditionally: more complete, but inflates the grid with ally columns for the (common) case of moves that can never or rarely target the ally on purpose.

## Consequences

Move-classification logic must special-case `target === 'allAdjacent'` specifically, rather than treating "can this move affect the ally" as a single boolean.

## Update: the ally-only-target on-demand view was removed

The original version of this decision also gave `adjacentAlly`/`allies` moves an on-demand "vs ally" view (#10), separate from the matrix, so their damage wasn't lost entirely. In practice, every move in that category (Helping Hand, Coaching, Howl, ...) turned out to be a Status move with no damage component at all — the view could only ever display 0%, so it carried no information and was removed. The exclusion-from-the-matrix half of this decision stands unchanged; only the "calculated on demand instead" half was reversed.

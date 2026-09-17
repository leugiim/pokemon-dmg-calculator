# TODO

Backlog of small feature notes to pick up later. Not tracked as GitHub
issues yet — move each one to an issue when it's actually being worked on.

## Auto-switch to Mega form when a compatible Mega Stone is selected

We already do this in one direction: picking the Mega form auto-fills its
Mega Stone as the item. We don't do the reverse yet — picking a Mega Stone
item on a slot whose species is compatible with that stone (e.g. Venusaurite
on Venusaur) should auto-switch the slot's form to the Mega form.

## Auto-activate entry-effect abilities

Pokémon that set a field effect on switch-in via ability should apply that
effect automatically when selected, instead of requiring the user to set it
by hand:

- **Terrains**: e.g. Rillaboom (Grassy Surge → Grassy Terrain), Indeedee
  (Psychic Surge → Psychic Terrain).
- **Weather**: e.g. Mega Charizard Y (Drought → Sun), Pelipper (Drizzle →
  Rain).

Likely the same underlying mechanism for both (terrain vs. weather are
already separate condition slots): on selecting a Pokémon/ability, check if
its ability is one of the known field-setting abilities and, if so,
pre-set the corresponding condition — but let the user still override it
manually afterwards.

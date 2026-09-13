import { gen } from './generation';

/** All held items available in this generation, sorted alphabetically. */
export const allItems = [...gen.items].sort((a, b) => a.name.localeCompare(b.name));

export type HeldItem = (typeof allItems)[number];

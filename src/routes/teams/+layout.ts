// The planner's data lives in the browser's localStorage, so these pages
// have nothing to render on the server, and /teams/[id]/... has no fixed
// list of ids to prerender. `adapter-static`'s SPA fallback serves them.
export const ssr = false;
export const prerender = false;

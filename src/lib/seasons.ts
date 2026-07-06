// CFL seasons run a single calendar year (unlike the NHL's split-year ids), so a
// seasonId is just the year, e.g. 2025. RougeQ covers the modern-data era; bump
// CURRENT_SEASON each year and everything below derives from it.
export const FIRST_SEASON = 2010; // earliest season we ingest — extend as older data is added

// SEASON ROLLOVER: to move to a new season, bump this one line (e.g. 2026),
// deploy, then trigger the "Daily data refresh" workflow to ingest it. Every
// season label + SEASONS derives from this, so nothing else needs editing.
export const CURRENT_SEASON = 2025;

/** All season ids we cover, newest first, e.g. [2025, 2024, …]. */
export const SEASONS: number[] = (() => {
  const out: number[] = [];
  for (let y = CURRENT_SEASON; y >= FIRST_SEASON; y--) out.push(y);
  return out;
})();

/** "2025" from 2025 — CFL seasons are labelled by their single year. */
export function formatSeason(seasonId: number): string {
  return String(seasonId);
}

/** Validate a season query param, falling back to the current season. */
export function resolveSeason(raw: string | string[] | undefined): number {
  const n = Number(Array.isArray(raw) ? raw[0] : raw);
  return SEASONS.includes(n) ? n : CURRENT_SEASON;
}

/** A `?gt=` query param → game type: 3 = playoffs (incl. Grey Cup), else 2 = regular season. */
export function resolveGameType(raw: string | string[] | undefined): 2 | 3 {
  return (Array.isArray(raw) ? raw[0] : raw) === "3" ? 3 : 2;
}

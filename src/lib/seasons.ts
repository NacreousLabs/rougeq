// The current Winnipeg Jets franchise has played since 2011-12.
export const FIRST_SEASON_START = 2011;

// SEASON ROLLOVER: to move to a new season, bump this one line (e.g. 20262027),
// deploy, then trigger the "Daily data refresh" workflow to ingest it. Every
// season label + JETS_SEASONS derives from this, so nothing else needs editing.
export const CURRENT_SEASON = 20252026;

/** All Jets-era season ids, newest first, e.g. [20252026, 20242025, ...]. */
export const JETS_SEASONS: number[] = (() => {
  const out: number[] = [];
  const lastStart = Math.floor(CURRENT_SEASON / 10000);
  for (let y = lastStart; y >= FIRST_SEASON_START; y--) {
    out.push(y * 10000 + (y + 1));
  }
  return out;
})();

/** "2011–12" from 20112012. */
export function formatSeason(seasonId: number): string {
  const start = Math.floor(seasonId / 10000);
  const end = seasonId % 10000;
  return `${start}–${String(end).slice(2)}`;
}

/** Validate a season query param, falling back to the current season. */
export function resolveSeason(raw: string | string[] | undefined): number {
  const n = Number(Array.isArray(raw) ? raw[0] : raw);
  return JETS_SEASONS.includes(n) ? n : CURRENT_SEASON;
}

/** A `?gt=` query param → NHL game type: 3 = playoffs, else 2 (regular). */
export function resolveGameType(raw: string | string[] | undefined): 2 | 3 {
  return (Array.isArray(raw) ? raw[0] : raw) === "3" ? 3 : 2;
}

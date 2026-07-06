// Shared player stat-category config + percentile helpers, used by the /players
// leaderboard and the /player/[id] detail page. Column keys match the JSON stored
// in player_season.stats (see scripts/players.ts).

export type Col = { label: string; key: string; fmt?: (v: number) => string; strong?: boolean };
export type Cfg = {
  label: string;
  sortKey: string;
  rateKey: string; // headline rate stat for percentile context
  rateLabel: string;
  qualify: (s: Record<string, number>) => boolean;
  qualifyNote: string;
  cols: Col[];
};

export const int = (v: number) => Math.round(v).toLocaleString("en-US");
export const one = (v: number) => v.toFixed(1);

export const CATEGORY_CONFIG: Record<string, Cfg> = {
  passing: {
    label: "Passing",
    sortKey: "yds",
    rateKey: "rating",
    rateLabel: "Rating",
    qualify: (s) => s.att >= 20,
    qualifyNote: "20+ att",
    cols: [
      { label: "Cmp", key: "comp", fmt: int },
      { label: "Att", key: "att", fmt: int },
      { label: "Cmp%", key: "compPct", fmt: one },
      { label: "Yds", key: "yds", fmt: int, strong: true },
      { label: "TD", key: "td", fmt: int },
      { label: "INT", key: "int", fmt: int },
      { label: "Rating", key: "rating", fmt: one },
      { label: "Y/A", key: "ya", fmt: one },
    ],
  },
  rushing: {
    label: "Rushing",
    sortKey: "yds",
    rateKey: "avg",
    rateLabel: "Y/C",
    qualify: (s) => s.att >= 15,
    qualifyNote: "15+ att",
    cols: [
      { label: "Att", key: "att", fmt: int },
      { label: "Yds", key: "yds", fmt: int, strong: true },
      { label: "Avg", key: "avg", fmt: one },
      { label: "Long", key: "long", fmt: int },
      { label: "TD", key: "td", fmt: int },
    ],
  },
  receiving: {
    label: "Receiving",
    sortKey: "yds",
    rateKey: "avg",
    rateLabel: "Y/R",
    qualify: (s) => s.rec >= 8,
    qualifyNote: "8+ rec",
    cols: [
      { label: "Tgt", key: "targets", fmt: int },
      { label: "Rec", key: "rec", fmt: int },
      { label: "Yds", key: "yds", fmt: int, strong: true },
      { label: "YAC", key: "yac", fmt: int },
      { label: "Avg", key: "avg", fmt: one },
      { label: "Long", key: "long", fmt: int },
      { label: "TD", key: "td", fmt: int },
    ],
  },
};

export const CATEGORY_KEYS = Object.keys(CATEGORY_CONFIG);

/** Empirical percentile (0..100) of `v` within `values` (higher = better). null if too few. */
export function percentileOf(values: number[], v: number): number | null {
  if (values.length < 2) return null;
  const below = values.filter((x) => x < v).length;
  return (below / (values.length - 1)) * 100;
}

export function percentileColor(p: number) {
  return `hsl(${Math.max(0, Math.min(100, p)) * 1.2}, 62%, 45%)`;
}

export type TeamOffense = { passYds: number; rushYds: number; passTd: number; rushTd: number };

/**
 * Aggregate a team's offense from its players' season box scores. Team passing
 * yards = sum of its passers' yards; rushing yards = sum of its rushers'. Total
 * offense = pass + rush (receiving mirrors passing, so it's not added). Defensive
 * yardage isn't derivable from the free season-aggregate data — only points
 * against (from game scores).
 */
export function aggregateTeamOffense(
  rows: Array<{ category: string; teamTricode: string | null; stats: string }>,
): Record<string, TeamOffense> {
  const agg: Record<string, TeamOffense> = {};
  for (const r of rows) {
    const t = r.teamTricode;
    if (!t) continue;
    const s = JSON.parse(r.stats) as Record<string, number>;
    const a = (agg[t] ??= { passYds: 0, rushYds: 0, passTd: 0, rushTd: 0 });
    if (r.category === "passing") { a.passYds += s.yds ?? 0; a.passTd += s.td ?? 0; }
    else if (r.category === "rushing") { a.rushYds += s.yds ?? 0; a.rushTd += s.td ?? 0; }
  }
  return agg;
}

import type { Metadata } from "next";
import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { db, playerSeason, players as playersTable, type Player } from "@/db";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { TeamLogo } from "@/components/TeamLogo";
import { CURRENT_SEASON, formatSeason } from "@/lib/seasons";

export const metadata: Metadata = {
  title: "Player Leaders — RougeQ",
  description: "CFL passing, rushing, and receiving leaders with league-percentile context.",
};
export const dynamic = "force-dynamic";

type Col = { label: string; key: string; fmt?: (v: number) => string; strong?: boolean };
type Cfg = {
  label: string;
  sortKey: string;
  rateKey: string; // headline rate stat for the percentile bar
  rateLabel: string;
  qualify: (s: Record<string, number>) => boolean;
  cols: Col[];
};

const int = (v: number) => Math.round(v).toLocaleString("en-US");
const one = (v: number) => v.toFixed(1);

const CONFIG: Record<string, Cfg> = {
  passing: {
    label: "Passing",
    sortKey: "yds",
    rateKey: "rating",
    rateLabel: "Rating",
    qualify: (s) => s.att >= 20,
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

const CATS = Object.keys(CONFIG);

function percentileColor(p: number) {
  return `hsl(${Math.max(0, Math.min(100, p)) * 1.2}, 62%, 45%)`;
}

export default async function PlayersPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const sp = await searchParams;
  const cat = CATS.includes(sp.cat ?? "") ? (sp.cat as string) : "passing";
  const cfg = CONFIG[cat];
  const season = CURRENT_SEASON;

  const rows = await db
    .select()
    .from(playerSeason)
    .where(and(eq(playerSeason.season, season), eq(playerSeason.category, cat)));
  const playerRows = await db.select().from(playersTable);
  const nameOf: Record<number, string> = Object.fromEntries(
    playerRows.map((p: Player) => [p.id, p.name]),
  );

  const parsed = rows.map((r) => ({
    playerId: r.playerId,
    team: r.teamTricode ?? "",
    gp: r.gamesPlayed ?? 0,
    s: JSON.parse(r.stats) as Record<string, number>,
  }));

  // League percentile for the headline rate stat, among qualified players.
  const qualified = parsed.filter((p) => cfg.qualify(p.s));
  const rateVals = qualified.map((p) => p.s[cfg.rateKey]).sort((a, b) => a - b);
  const pct = (v: number) => {
    if (rateVals.length < 2) return null;
    const below = rateVals.filter((x) => x < v).length;
    return (below / (rateVals.length - 1)) * 100;
  };

  const sorted = [...parsed].sort((a, b) => (b.s[cfg.sortKey] ?? 0) - (a.s[cfg.sortKey] ?? 0)).slice(0, 30);

  return (
    <Container size="lg">
      <PageHeader
        title="Player Leaders"
        subtitle={`${formatSeason(season)} season — box-score leaders with league-percentile context`}
      />

      <div className="mb-4 flex gap-1">
        {CATS.map((c) => (
          <Link
            key={c}
            href={`/players?cat=${c}`}
            className={`rounded-md px-3 py-1.5 text-sm font-display font-semibold uppercase tracking-wide ${
              c === cat
                ? "bg-bombers-navy text-white dark:bg-bombers-gold dark:text-bombers-navy"
                : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            {CONFIG[c].label}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="stat-table">
          <thead>
            <tr>
              <th className="text-right">#</th>
              <th>Player</th>
              <th className="text-right">GP</th>
              {cfg.cols.map((c) => (
                <th key={c.key} className="text-right">{c.label}</th>
              ))}
              <th className="w-40">{cfg.rateLabel} %ile</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p, i) => {
              const isQual = cfg.qualify(p.s);
              const per = isQual ? pct(p.s[cfg.rateKey]) : null;
              const isWpg = p.team === "WPG";
              return (
                <tr key={p.playerId} className={isWpg ? "bg-bombers-gold/10" : ""}>
                  <td className="text-right tabular-nums text-zinc-500">{i + 1}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <TeamLogo tricode={p.team} size="xs" />
                      <span className={`font-medium ${isWpg ? "text-bombers-navy dark:text-bombers-gold" : ""}`}>
                        {nameOf[p.playerId] ?? `#${p.playerId}`}
                      </span>
                    </div>
                  </td>
                  <td className="text-right tabular-nums text-zinc-500">{p.gp}</td>
                  {cfg.cols.map((c) => (
                    <td key={c.key} className={`text-right tabular-nums ${c.strong ? "font-semibold" : ""}`}>
                      {c.fmt ? c.fmt(p.s[c.key] ?? 0) : p.s[c.key] ?? 0}
                    </td>
                  ))}
                  <td>
                    {per == null ? (
                      <span className="text-xs text-zinc-400">—</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="relative h-3 flex-1 overflow-hidden rounded bg-zinc-100 dark:bg-zinc-800">
                          <div
                            className="absolute inset-y-0 left-0 rounded"
                            style={{ width: `${per}%`, backgroundColor: percentileColor(per) }}
                          />
                        </div>
                        <span className="w-7 shrink-0 text-right text-xs tabular-nums text-zinc-500">
                          {Math.round(per)}
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-zinc-400">
        Top 30 by {cfg.cols.find((c) => c.strong)?.label ?? "total"}. Percentile ranks the{" "}
        {cfg.rateLabel} of qualified players ({cat === "passing" ? "20+ att" : cat === "rushing" ? "15+ att" : "8+ rec"})
        against the league. Winnipeg players highlighted.
      </p>
    </Container>
  );
}

import { eq } from "drizzle-orm";
import { db, teamRatings, projections, playerSeason, players } from "@/db";
import { BarChart, RankBar } from "@/components/charts";
import { CURRENT_SEASON } from "@/lib/seasons";
import { aggregateTeamOffense } from "@/lib/stats";

// Charts referenced from "The Numbers" article bodies via `:::chart <id>:::`.
// Each id is an async server component that queries live data and renders a
// dependency-free SVG chart. Keep ids stable — they're embedded in post bodies.
export const CHART_IDS = ["scoring", "total-offense", "playoff-odds", "passing-leaders", "wpg-ranks"] as const;
export type ChartId = (typeof CHART_IDS)[number];

const WPG = "WPG";
const lastName = (n: string) => n.split(",")[0];

function Wrap({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <figure className="not-prose my-6 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <figcaption className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">{title}</figcaption>
      {children}
      {note && <p className="mt-2 text-xs text-zinc-400">{note}</p>}
    </figure>
  );
}

async function teamRows() {
  return (await db.select().from(teamRatings).where(eq(teamRatings.season, CURRENT_SEASON))) as any[];
}

export async function NumbersChart({ id }: { id: string }) {
  const gp = (r: any) => r.gamesPlayed || 1;

  if (id === "scoring") {
    const rows = (await teamRows()).map((r) => ({ tri: r.tricode, v: r.pointsFor / gp(r) })).sort((a, b) => b.v - a.v);
    return (
      <Wrap title="Points per game" note="Winnipeg highlighted.">
        <BarChart data={rows.map((r) => ({ value: r.v, highlight: r.tri === WPG }))} labels={rows.map((r) => r.tri)} format={(n) => n.toFixed(1)} />
        <TriLabels tris={rows.map((r) => r.tri)} />
      </Wrap>
    );
  }

  if (id === "total-offense") {
    const rats = await teamRows();
    const off = aggregateTeamOffense((await db.select().from(playerSeason).where(eq(playerSeason.season, CURRENT_SEASON))) as any[]);
    const rows = rats
      .map((r) => ({ tri: r.tricode, v: ((off[r.tricode]?.passYds ?? 0) + (off[r.tricode]?.rushYds ?? 0)) / gp(r) }))
      .sort((a, b) => b.v - a.v);
    return (
      <Wrap title="Total offensive yards per game" note="Passing + rushing. Winnipeg highlighted.">
        <BarChart data={rows.map((r) => ({ value: r.v, highlight: r.tri === WPG }))} labels={rows.map((r) => r.tri)} format={(n) => `${Math.round(n)}`} />
        <TriLabels tris={rows.map((r) => r.tri)} />
      </Wrap>
    );
  }

  if (id === "playoff-odds") {
    const rows = ((await db.select().from(projections).where(eq(projections.season, CURRENT_SEASON))) as any[])
      .map((p) => ({ tri: p.tricode, v: p.playoffPct }))
      .sort((a, b) => b.v - a.v);
    return (
      <Wrap title="Playoff odds" note="Share of 10,000 simulated seasons making the playoffs.">
        <BarChart data={rows.map((r) => ({ value: r.v, highlight: r.tri === WPG }))} labels={rows.map((r) => r.tri)} format={(n) => `${Math.round(n)}%`} />
        <TriLabels tris={rows.map((r) => r.tri)} />
      </Wrap>
    );
  }

  if (id === "passing-leaders") {
    const rows = ((await db.select().from(playerSeason).where(eq(playerSeason.season, CURRENT_SEASON))) as any[])
      .filter((r) => r.category === "passing")
      .map((r) => ({ tri: r.teamTricode as string, name: r.playerId as number, s: JSON.parse(r.stats) as Record<string, number> }))
      .filter((r) => r.s.att >= 20)
      .sort((a, b) => b.s.rating - a.s.rating)
      .slice(0, 8);
    const pl = (await db.select().from(players)) as any[];
    const nm: Record<number, string> = Object.fromEntries(pl.map((p) => [p.id, p.name]));
    return (
      <Wrap title="Passer rating — qualified leaders (20+ att)">
        <BarChart data={rows.map((r) => ({ value: r.s.rating, highlight: r.tri === WPG }))} labels={rows.map((r) => lastName(nm[r.name] ?? ""))} format={(n) => n.toFixed(1)} />
        <TriLabels tris={rows.map((r) => lastName(nm[r.name] ?? ""))} />
      </Wrap>
    );
  }

  if (id === "wpg-ranks") {
    const rats = await teamRows();
    const off = aggregateTeamOffense((await db.select().from(playerSeason).where(eq(playerSeason.season, CURRENT_SEASON))) as any[]);
    const total = rats.length;
    const metric = (fn: (r: any) => number, higherBetter = true) => {
      const arr = rats.map((r) => ({ tri: r.tricode, v: fn(r) })).sort((a, b) => (higherBetter ? b.v - a.v : a.v - b.v));
      const idx = arr.findIndex((x) => x.tri === WPG);
      const pctile = ((total - 1 - idx) / (total - 1)) * 100;
      return { rank: idx + 1, v: arr[idx].v, pctile };
    };
    const offv = metric((r) => ((off[r.tricode]?.passYds ?? 0) + (off[r.tricode]?.rushYds ?? 0)) / gp(r), true);
    const scv = metric((r) => r.pointsFor / gp(r), true);
    const defv = metric((r) => r.pointsAgainst / gp(r), false); // fewer allowed = better
    return (
      <Wrap title="Where Winnipeg ranks" note="Percentile = share of the 9-team league Winnipeg beats.">
        <RankBar label="Total offense / game" value={`${Math.round(offv.v)}`} rank={offv.rank} total={total} percentile={offv.pctile} />
        <RankBar label="Points / game" value={scv.v.toFixed(1)} rank={scv.rank} total={total} percentile={scv.pctile} />
        <RankBar label="Points allowed / game" value={defv.v.toFixed(1)} rank={defv.rank} total={total} percentile={defv.pctile} />
      </Wrap>
    );
  }

  return <p className="text-sm text-zinc-400">[unknown chart: {id}]</p>;
}

// Small tricode/label strip under a BarChart (BarChart itself only draws bars).
function TriLabels({ tris }: { tris: string[] }) {
  return (
    <div className="mt-1 flex justify-between px-[30px] text-[10px] text-zinc-400">
      {tris.map((t, i) => (
        <span key={i} className="flex-1 text-center">{t}</span>
      ))}
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db, teams, teamRatings, projections, type Team } from "@/db";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { TeamLogo } from "@/components/TeamLogo";
import { InfoTip } from "@/components/InfoTip";
import { CURRENT_SEASON, formatSeason } from "@/lib/seasons";

export const metadata: Metadata = {
  title: "Standings — RougeQ",
  description: "CFL division standings with Monte-Carlo projected wins and playoff odds.",
};
export const dynamic = "force-dynamic";

const signed = (x: number) => (x >= 0 ? "+" : "") + x;

type Row = {
  tricode: string;
  name: string;
  w: number; l: number; t: number;
  pf: number; pa: number;
  projW: number | null; projL: number | null;
  playoff: number | null; divWin: number | null;
};

function pctCell(p: number | null) {
  if (p == null) return <span className="text-zinc-400">—</span>;
  const cls =
    p >= 75 ? "text-emerald-600 dark:text-emerald-400 font-semibold"
    : p >= 40 ? "text-zinc-700 dark:text-zinc-200"
    : "text-zinc-400";
  return <span className={`tabular-nums ${cls}`}>{p.toFixed(0)}%</span>;
}

function DivTable({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <section className="mb-8">
      <h2 className="mb-2 font-display text-lg font-bold uppercase tracking-wide text-rouge dark:text-bombers-gold">
        {title} Division
      </h2>
      <div className="overflow-x-auto">
        <table className="stat-table">
          <thead>
            <tr>
              <th className="text-right">#</th>
              <th>Team</th>
              <th className="text-right">W</th>
              <th className="text-right">L</th>
              <th className="text-right">T</th>
              <th className="text-right">PF</th>
              <th className="text-right">PA</th>
              <th className="text-right">Diff</th>
              <th className="text-right">
                <InfoTip label="Proj" text="Projected final record from simulating the rest of the season 10,000× off Elo ratings.">Proj</InfoTip>
              </th>
              <th className="text-right">
                <InfoTip label="Playoff%" text="Share of 10,000 simulated seasons in which the team makes the playoffs (top 3 in division, or crossover).">Playoff%</InfoTip>
              </th>
              <th className="text-right">
                <InfoTip label="Div%" text="Share of simulations in which the team finishes first in its division.">Div%</InfoTip>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const wpg = r.tricode === "WPG";
              return (
                <tr key={r.tricode} className={wpg ? "bg-bombers-gold/10" : ""}>
                  <td className="text-right tabular-nums text-zinc-500">{i + 1}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <TeamLogo tricode={r.tricode} size="sm" />
                      <Link href={`/team/${r.tricode}`} className={`font-medium hover:underline ${wpg ? "text-rouge dark:text-bombers-gold" : ""}`}>{r.name}</Link>
                    </div>
                  </td>
                  <td className="text-right tabular-nums font-semibold">{r.w}</td>
                  <td className="text-right tabular-nums">{r.l}</td>
                  <td className="text-right tabular-nums">{r.t}</td>
                  <td className="text-right tabular-nums text-zinc-500">{r.pf}</td>
                  <td className="text-right tabular-nums text-zinc-500">{r.pa}</td>
                  <td className="text-right tabular-nums">{signed(r.pf - r.pa)}</td>
                  <td className="text-right tabular-nums whitespace-nowrap text-zinc-600 dark:text-zinc-300">
                    {r.projW == null ? "—" : `${r.projW.toFixed(1)}-${(r.projL ?? 0).toFixed(1)}`}
                  </td>
                  <td className="text-right">{pctCell(r.playoff)}</td>
                  <td className="text-right">{pctCell(r.divWin)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default async function StandingsPage() {
  const season = CURRENT_SEASON;
  const teamRows = (await db.select().from(teams)) as Team[];
  const ratings = (await db.select().from(teamRatings).where(eq(teamRatings.season, season))) as any[];
  const projRows = (await db.select().from(projections).where(eq(projections.season, season))) as any[];

  const proj = Object.fromEntries(projRows.map((p) => [p.tricode, p]));
  const rating = Object.fromEntries(ratings.map((r) => [r.tricode, r]));

  const rows: Row[] = teamRows.map((t) => {
    const r = rating[t.tricode] ?? {};
    const p = proj[t.tricode];
    return {
      tricode: t.tricode,
      name: t.fullName,
      w: r.wins ?? 0, l: r.losses ?? 0, t: r.ties ?? 0,
      pf: r.pointsFor ?? 0, pa: r.pointsAgainst ?? 0,
      projW: p?.projWins ?? null, projL: p?.projLosses ?? null,
      playoff: p?.playoffPct ?? null, divWin: p?.divWinPct ?? null,
    };
  });

  const order = (a: Row, b: Row) => b.w * 2 + b.t - (a.w * 2 + a.t) || b.pf - b.pa - (a.pf - a.pa);
  const west = rows.filter((r) => teamRows.find((t) => t.tricode === r.tricode)?.division === "West").sort(order);
  const east = rows.filter((r) => teamRows.find((t) => t.tricode === r.tricode)?.division === "East").sort(order);

  return (
    <Container size="lg">
      <PageHeader
        title="Standings"
        subtitle={`${formatSeason(season)} — records with Monte-Carlo projections`}
      />
      <DivTable title="West" rows={west} />
      <DivTable title="East" rows={east} />
      <p className="text-xs text-zinc-400">
        Projections simulate every remaining game 10,000× using current Elo ratings (incl. home-field).
        Playoff odds use the CFL format (top 3 per division plus crossover).
      </p>
    </Container>
  );
}

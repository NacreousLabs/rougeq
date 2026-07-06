import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db, players as playersTable, playerSeason, teams, type Team } from "@/db";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { TeamLogo } from "@/components/TeamLogo";
import { PercentileBar } from "@/components/charts";
import { CURRENT_SEASON, formatSeason } from "@/lib/seasons";
import { CATEGORY_CONFIG, percentileOf, int, one } from "@/lib/stats";

export const dynamic = "force-dynamic";

// Which metrics get a league-percentile bar, per category.
const BARS: Record<string, Array<[string, string, (v: number) => string]>> = {
  passing: [["yds", "Passing Yds", int], ["td", "Pass TD", int], ["rating", "Passer Rating", one], ["ya", "Yards / Att", one]],
  rushing: [["yds", "Rushing Yds", int], ["td", "Rush TD", int], ["avg", "Yards / Carry", one]],
  receiving: [["yds", "Receiving Yds", int], ["rec", "Receptions", int], ["td", "Rec TD", int], ["avg", "Yards / Rec", one]],
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = (await db.select().from(playersTable).where(eq(playersTable.id, Number(id))))[0] as any;
  return { title: p ? `${p.name} — RougeQ` : "Player — RougeQ" };
}

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const season = CURRENT_SEASON;

  const player = (await db.select().from(playersTable).where(eq(playersTable.id, id)))[0] as any;
  if (!player) notFound();

  const mine = (await db.select().from(playerSeason).where(and(eq(playerSeason.season, season), eq(playerSeason.playerId, id)))) as any[];
  if (!mine.length) notFound();

  // League rows per category (for percentile denominators).
  const league = (await db.select().from(playerSeason).where(eq(playerSeason.season, season))) as any[];
  const byCat: Record<string, Array<Record<string, number>>> = {};
  for (const r of league) (byCat[r.category] ??= []).push(JSON.parse(r.stats));

  const teamRows = (await db.select().from(teams)) as Team[];
  const teamName = Object.fromEntries(teamRows.map((t) => [t.tricode, t.fullName]));
  const tri = player.teamTricode as string | null;

  return (
    <Container size="md">
      <PageHeader
        title={player.name}
        subtitle={
          tri ? (
            <span className="inline-flex items-center gap-2">
              <TeamLogo tricode={tri} size="xs" />
              <Link href={`/team/${tri}`} className="hover:underline">{teamName[tri] ?? tri}</Link>
              <span>· {formatSeason(season)}</span>
            </span>
          ) : (
            formatSeason(season)
          )
        }
      />

      <div className="space-y-8">
        {mine.map((row) => {
          const cat = row.category as string;
          const cfg = CATEGORY_CONFIG[cat];
          if (!cfg) return null;
          const s = JSON.parse(row.stats) as Record<string, number>;
          const qualified = (byCat[cat] ?? []).filter((x) => cfg.qualify(x));

          return (
            <section key={cat}>
              <h2 className="mb-2 font-display text-lg font-bold uppercase tracking-wide text-bombers-navy dark:text-bombers-gold">
                {cfg.label} · {row.gamesPlayed} GP
              </h2>

              {/* Stat line */}
              <div className="mb-4 overflow-x-auto">
                <table className="stat-table">
                  <thead>
                    <tr>{cfg.cols.map((c) => <th key={c.key} className="text-right">{c.label}</th>)}</tr>
                  </thead>
                  <tbody>
                    <tr>
                      {cfg.cols.map((c) => (
                        <td key={c.key} className={`text-right tabular-nums ${c.strong ? "font-semibold" : ""}`}>
                          {c.fmt ? c.fmt(s[c.key] ?? 0) : s[c.key] ?? 0}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* League percentile bars */}
              <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  League percentile ({qualified.length} qualified, {cfg.qualifyNote})
                </div>
                {(BARS[cat] ?? []).map(([key, label, fmt]) => {
                  const per = percentileOf(qualified.map((x) => x[key]), s[key] ?? 0);
                  return (
                    <PercentileBar
                      key={key}
                      label={label}
                      value={fmt(s[key] ?? 0)}
                      percentile={per ?? 0}
                      explain={per == null ? "Not enough qualified players to rank." : `Better than ${Math.round(per)}% of qualified ${cfg.label.toLowerCase()} players.`}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <p className="mt-8 text-sm">
        <Link href="/players" className="text-bombers-blue hover:underline dark:text-bombers-gold">← Player leaders</Link>
      </p>
    </Container>
  );
}

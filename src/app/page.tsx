import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, ne, or } from "drizzle-orm";
import { db, teams, games, teamRatings, projections, type Team } from "@/db";
import { Container } from "@/components/Container";
import { TeamLogo } from "@/components/TeamLogo";
import { TEAM, TEAM_NAME } from "@/lib/team";
import { CURRENT_SEASON, formatSeason } from "@/lib/seasons";

export const metadata: Metadata = { title: "RougeQ — Winnipeg Blue Bombers analytics" };
export const dynamic = "force-dynamic";

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric" });

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">{label}</div>
      <div className="font-display text-2xl font-bold tabular-nums text-bombers-navy dark:text-bombers-gold">{value}</div>
      {sub && <div className="text-xs text-zinc-500">{sub}</div>}
    </div>
  );
}

export default async function Home() {
  const season = CURRENT_SEASON;
  const ratings = (await db.select().from(teamRatings).where(eq(teamRatings.season, season)).orderBy(desc(teamRatings.srs))) as any[];
  const teamRows = (await db.select().from(teams)) as Team[];
  const name = Object.fromEntries(teamRows.map((t) => [t.tricode, t.fullName]));
  const proj = ((await db.select().from(projections).where(eq(projections.season, season))) as any[])
    .find((p) => p.tricode === TEAM);

  const wpg = ratings.find((r) => r.tricode === TEAM);
  const wpgRank = ratings.findIndex((r) => r.tricode === TEAM) + 1;

  const recent = (await db
    .select()
    .from(games)
    .where(and(eq(games.season, season), eq(games.gameType, 2), eq(games.status, "complete")))
    .orderBy(desc(games.date))) as any[];

  const nextWpg = ((await db
    .select()
    .from(games)
    .where(and(eq(games.season, season), ne(games.status, "complete"), or(eq(games.homeTricode, TEAM), eq(games.awayTricode, TEAM))))
    .orderBy(games.date)) as any[])[0];

  const top = ratings.slice(0, 5);

  return (
    <Container size="lg">
      {/* Hero */}
      <div className="py-8 text-center">
        <h1 className="font-display text-5xl font-bold uppercase italic tracking-tight text-bombers-navy dark:text-bombers-gold">
          RougeQ
        </h1>
        <p className="mt-2 text-zinc-500">Advanced analytics for the Winnipeg {TEAM_NAME} — {formatSeason(season)} season</p>
      </div>

      {/* Bombers snapshot */}
      {wpg && (
        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <TeamLogo tricode={TEAM} size="md" />
            <h2 className="font-display text-xl font-bold uppercase tracking-wide">{name[TEAM] ?? TEAM_NAME}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Record" value={`${wpg.wins}-${wpg.losses}${wpg.ties ? `-${wpg.ties}` : ""}`} sub={`${wpg.pointsFor}–${wpg.pointsAgainst} pts`} />
            <Stat label="SRS Rank" value={`#${wpgRank}`} sub={`${wpg.srs >= 0 ? "+" : ""}${wpg.srs?.toFixed(1)} SRS`} />
            <Stat label="Elo" value={`${Math.round(wpg.elo)}`} sub={`OSRS ${wpg.osrs?.toFixed(1)} · DSRS ${wpg.dsrs?.toFixed(1)}`} />
            <Stat label="Playoff Odds" value={proj ? `${proj.playoffPct.toFixed(0)}%` : "—"} sub={proj ? `proj ${proj.projWins.toFixed(1)} wins` : undefined} />
          </div>
          {nextWpg && (
            <p className="mt-3 text-sm text-zinc-500">
              Next: {nextWpg.homeTricode === TEAM ? "vs" : "@"}{" "}
              <span className="font-medium text-zinc-700 dark:text-zinc-200">
                {name[nextWpg.homeTricode === TEAM ? nextWpg.awayTricode : nextWpg.homeTricode]}
              </span>{" "}
              · {shortDate(nextWpg.date)}
            </p>
          )}
        </section>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        {/* Recent scores */}
        <section>
          <h2 className="mb-2 font-display text-lg font-bold uppercase tracking-wide">Recent Scores</h2>
          <div className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {recent.slice(0, 6).map((g) => {
              const awayWon = (g.awayScore ?? 0) > (g.homeScore ?? 0);
              return (
                <div key={g.id} className="flex items-center justify-between px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <TeamLogo tricode={g.awayTricode} size="xs" />
                    <span className={awayWon ? "font-semibold" : "text-zinc-500"}>{g.awayTricode}</span>
                    <span className="text-zinc-400">@</span>
                    <TeamLogo tricode={g.homeTricode} size="xs" />
                    <span className={!awayWon ? "font-semibold" : "text-zinc-500"}>{g.homeTricode}</span>
                  </div>
                  <div className="flex items-center gap-2 tabular-nums">
                    <span className={awayWon ? "font-semibold" : "text-zinc-500"}>{g.awayScore}</span>
                    <span className="text-zinc-300">–</span>
                    <span className={!awayWon ? "font-semibold" : "text-zinc-500"}>{g.homeScore}</span>
                    <span className="ml-2 text-xs text-zinc-400">{shortDate(g.date)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Power ranking teaser */}
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold uppercase tracking-wide">Power Ranking</h2>
            <Link href="/power" className="text-xs text-bombers-blue hover:underline dark:text-bombers-gold">Full table →</Link>
          </div>
          <div className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {top.map((r, i) => (
              <div key={r.tricode} className={`flex items-center justify-between px-3 py-2 text-sm ${r.tricode === TEAM ? "bg-bombers-gold/10" : ""}`}>
                <div className="flex items-center gap-2">
                  <span className="w-4 text-right text-zinc-400 tabular-nums">{i + 1}</span>
                  <TeamLogo tricode={r.tricode} size="xs" />
                  <span className="font-medium">{name[r.tricode] ?? r.tricode}</span>
                </div>
                <span className="tabular-nums font-semibold">{r.srs >= 0 ? "+" : ""}{r.srs?.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link href="/standings" className="rounded-md bg-bombers-navy px-4 py-2 font-medium text-white hover:opacity-90 dark:bg-bombers-gold dark:text-bombers-navy">Standings & Projections</Link>
        <Link href="/players" className="rounded-md border border-zinc-300 px-4 py-2 font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">Player Leaders</Link>
      </div>
    </Container>
  );
}

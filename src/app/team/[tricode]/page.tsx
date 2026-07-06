import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq, or } from "drizzle-orm";
import { db, teams, games, teamRatings, projections, playerSeason, players as playersTable, type Team } from "@/db";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { TeamLogo } from "@/components/TeamLogo";
import { CURRENT_SEASON, formatSeason } from "@/lib/seasons";
import { CATEGORY_CONFIG, aggregateTeamOffense } from "@/lib/stats";

export const dynamic = "force-dynamic";

const signed = (x: number | null | undefined, d = 1) =>
  x == null ? "—" : (x >= 0 ? "+" : "") + x.toFixed(d);
const shortDate = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric" });

export async function generateMetadata({ params }: { params: Promise<{ tricode: string }> }): Promise<Metadata> {
  const { tricode } = await params;
  const t = (await db.select().from(teams).where(eq(teams.tricode, tricode.toUpperCase())))[0] as Team | undefined;
  return { title: t ? `${t.fullName} — RougeQ` : "Team — RougeQ" };
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">{label}</div>
      <div className="font-display text-2xl font-bold tabular-nums text-rouge dark:text-bombers-gold">{value}</div>
      {sub && <div className="text-xs text-zinc-500">{sub}</div>}
    </div>
  );
}

export default async function TeamPage({ params }: { params: Promise<{ tricode: string }> }) {
  const tricode = (await params).tricode.toUpperCase();
  const season = CURRENT_SEASON;

  const team = (await db.select().from(teams).where(eq(teams.tricode, tricode)))[0] as Team | undefined;
  if (!team) notFound();

  const allRatings = (await db.select().from(teamRatings).where(eq(teamRatings.season, season)).orderBy(desc(teamRatings.srs))) as any[];
  const rating = allRatings.find((r) => r.tricode === tricode);
  const rank = allRatings.findIndex((r) => r.tricode === tricode) + 1;
  const proj = ((await db.select().from(projections).where(and(eq(projections.season, season), eq(projections.tricode, tricode)))) as any[])[0];

  const teamRows = (await db.select().from(teams)) as Team[];
  const nameOf: Record<string, string> = Object.fromEntries(teamRows.map((t) => [t.tricode, t.fullName]));

  const schedule = (await db
    .select()
    .from(games)
    .where(and(eq(games.season, season), eq(games.gameType, 2), or(eq(games.homeTricode, tricode), eq(games.awayTricode, tricode))))
    .orderBy(games.date)) as any[];

  // Home/away splits over completed games.
  let homeW = 0, homeL = 0, awayW = 0, awayL = 0;
  for (const g of schedule) {
    if (g.status !== "complete" || g.homeScore == null) continue;
    const isHome = g.homeTricode === tricode;
    const won = isHome ? g.homeScore > g.awayScore : g.awayScore > g.homeScore;
    if (isHome) won ? homeW++ : homeL++;
    else won ? awayW++ : awayL++;
  }

  // Team stat leaders per category.
  const ps = (await db.select().from(playerSeason).where(and(eq(playerSeason.season, season), eq(playerSeason.teamTricode, tricode)))) as any[];
  const playerRows = (await db.select().from(playersTable)) as any[];
  const pname: Record<number, string> = Object.fromEntries(playerRows.map((p) => [p.id, p.name]));

  const off = aggregateTeamOffense(ps)[tricode] ?? { passYds: 0, rushYds: 0, passTd: 0, rushTd: 0 };
  const gp = rating?.gamesPlayed || 0;
  const perGame = (v: number) => (gp > 0 ? Math.round(v / gp) : 0);

  return (
    <Container size="lg">
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <TeamLogo tricode={tricode} size="lg" />
            {team.fullName}
          </span>
        }
        subtitle={`${team.division} Division · ${formatSeason(season)}`}
      />

      {rating && (
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Record" value={`${rating.wins}-${rating.losses}${rating.ties ? `-${rating.ties}` : ""}`} sub={`${rating.pointsFor}–${rating.pointsAgainst} pts`} />
          <Stat label="SRS Rank" value={`#${rank}`} sub={`${signed(rating.srs)} SRS`} />
          <Stat label="Elo" value={`${Math.round(rating.elo)}`} sub={`OSRS ${signed(rating.osrs)} · DSRS ${signed(rating.dsrs)}`} />
          <Stat label="Playoff Odds" value={proj ? `${proj.playoffPct.toFixed(0)}%` : "—"} sub={proj ? `proj ${proj.projWins.toFixed(1)}-${proj.projLosses.toFixed(1)}` : undefined} />
        </div>
      )}

      {/* Offense per game */}
      <div className="mb-8">
        <h2 className="mb-2 font-display text-lg font-bold uppercase tracking-wide">Offense · per game</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Total Yds" value={`${perGame(off.passYds + off.rushYds)}`} sub={`${off.passTd + off.rushTd} off TD`} />
          <Stat label="Pass Yds" value={`${perGame(off.passYds)}`} sub={`${off.passTd} pass TD`} />
          <Stat label="Rush Yds" value={`${perGame(off.rushYds)}`} sub={`${off.rushTd} rush TD`} />
          <Stat label="Points" value={rating ? `${(rating.pointsFor / (gp || 1)).toFixed(1)}` : "—"} sub={rating ? `${(rating.pointsAgainst / (gp || 1)).toFixed(1)} allowed` : undefined} />
        </div>
        <p className="mt-1 text-xs text-zinc-400">
          <Link href="/stats" className="hover:underline">League team stats →</Link>
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Schedule / results */}
        <section>
          <h2 className="mb-2 font-display text-lg font-bold uppercase tracking-wide">Schedule</h2>
          <div className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {schedule.map((g) => {
              const isHome = g.homeTricode === tricode;
              const opp = isHome ? g.awayTricode : g.homeTricode;
              const done = g.status === "complete" && g.homeScore != null;
              const my = isHome ? g.homeScore : g.awayScore;
              const their = isHome ? g.awayScore : g.homeScore;
              const won = done && my > their;
              return (
                <div key={g.id} className="flex items-center justify-between px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-xs text-zinc-400">{isHome ? "vs" : "@"}</span>
                    <TeamLogo tricode={opp} size="xs" />
                    <Link href={`/team/${opp}`} className="font-medium hover:underline">{opp}</Link>
                  </div>
                  <div className="flex items-center gap-2 tabular-nums">
                    {done ? (
                      <>
                        <span className={`font-semibold ${won ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>{won ? "W" : "L"}</span>
                        <span>{my}–{their}</span>
                      </>
                    ) : (
                      <span className="text-xs text-zinc-400">{shortDate(g.date)}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-zinc-400">Home {homeW}-{homeL} · Away {awayW}-{awayL}</p>
        </section>

        {/* Stat leaders */}
        <section>
          <h2 className="mb-2 font-display text-lg font-bold uppercase tracking-wide">Team Leaders</h2>
          <div className="space-y-3">
            {Object.entries(CATEGORY_CONFIG).map(([cat, cfg]) => {
              const rows = ps
                .filter((r) => r.category === cat)
                .map((r) => ({ id: r.playerId, s: JSON.parse(r.stats) as Record<string, number> }))
                .sort((a, b) => (b.s[cfg.sortKey] ?? 0) - (a.s[cfg.sortKey] ?? 0))
                .slice(0, 3);
              if (!rows.length) return null;
              const headline = cfg.cols.find((c) => c.strong)!;
              return (
                <div key={cat} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">{cfg.label}</div>
                  {rows.map((r) => (
                    <div key={r.id} className="flex items-center justify-between py-0.5 text-sm">
                      <Link href={`/player/${r.id}`} className="font-medium hover:underline">{pname[r.id] ?? `#${r.id}`}</Link>
                      <span className="tabular-nums text-zinc-600 dark:text-zinc-300">
                        {headline.fmt ? headline.fmt(r.s[headline.key] ?? 0) : r.s[headline.key]} {headline.label.toLowerCase()}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <p className="mt-8 text-sm">
        <Link href="/standings" className="text-rouge hover:underline dark:text-bombers-gold">← All standings</Link>
      </p>
    </Container>
  );
}

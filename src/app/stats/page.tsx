import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db, teams, teamRatings, playerSeason, type Team } from "@/db";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { TeamLogo } from "@/components/TeamLogo";
import { InfoTip } from "@/components/InfoTip";
import { CURRENT_SEASON, formatSeason } from "@/lib/seasons";
import { aggregateTeamOffense } from "@/lib/stats";

export const metadata: Metadata = {
  title: "Team Stats — RougeQ",
  description: "CFL team offense and scoring — yards and points per game.",
};
export const dynamic = "force-dynamic";

const per = (v: number, gp: number) => (gp > 0 ? v / gp : 0);
const one = (v: number) => v.toFixed(1);
const signed = (v: number) => (v >= 0 ? "+" : "") + v.toFixed(1);

export default async function StatsPage() {
  const season = CURRENT_SEASON;
  const ratings = (await db.select().from(teamRatings).where(eq(teamRatings.season, season))) as any[];
  const teamRows = (await db.select().from(teams)) as Team[];
  const psRows = (await db.select().from(playerSeason).where(eq(playerSeason.season, season))) as any[];
  const off = aggregateTeamOffense(psRows);
  const nameOf = Object.fromEntries(teamRows.map((t) => [t.tricode, t.fullName]));

  const rows = ratings
    .map((r) => {
      const o = off[r.tricode] ?? { passYds: 0, rushYds: 0, passTd: 0, rushTd: 0 };
      const total = o.passYds + o.rushYds;
      return {
        tricode: r.tricode,
        gp: r.gamesPlayed,
        ptsFor: per(r.pointsFor, r.gamesPlayed),
        ptsAgainst: per(r.pointsAgainst, r.gamesPlayed),
        passYpg: per(o.passYds, r.gamesPlayed),
        rushYpg: per(o.rushYds, r.gamesPlayed),
        totalYpg: per(total, r.gamesPlayed),
        td: o.passTd + o.rushTd,
      };
    })
    .sort((a, b) => b.totalYpg - a.totalYpg);

  return (
    <Container size="lg">
      <PageHeader title="Team Stats" subtitle={`${formatSeason(season)} — offense & scoring, per game`} />
      <div className="overflow-x-auto">
        <table className="stat-table">
          <thead>
            <tr>
              <th className="text-right">#</th>
              <th>Team</th>
              <th className="text-right">GP</th>
              <th className="text-right">PF/G</th>
              <th className="text-right">PA/G</th>
              <th className="text-right">Diff</th>
              <th className="text-right">Pass Y/G</th>
              <th className="text-right">Rush Y/G</th>
              <th className="text-right">
                <InfoTip label="Total Y/G" text="Total offensive yards per game (passing + rushing). Defensive yardage isn't available from the free data.">Tot Y/G</InfoTip>
              </th>
              <th className="text-right">Off TD</th>
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
                      <Link href={`/team/${r.tricode}`} className={`font-medium hover:underline ${wpg ? "text-rouge dark:text-bombers-gold" : ""}`}>
                        {nameOf[r.tricode] ?? r.tricode}
                      </Link>
                    </div>
                  </td>
                  <td className="text-right tabular-nums text-zinc-500">{r.gp}</td>
                  <td className="text-right tabular-nums font-semibold">{one(r.ptsFor)}</td>
                  <td className="text-right tabular-nums">{one(r.ptsAgainst)}</td>
                  <td className="text-right tabular-nums">{signed(r.ptsFor - r.ptsAgainst)}</td>
                  <td className="text-right tabular-nums">{Math.round(r.passYpg)}</td>
                  <td className="text-right tabular-nums">{Math.round(r.rushYpg)}</td>
                  <td className="text-right tabular-nums font-semibold">{Math.round(r.totalYpg)}</td>
                  <td className="text-right tabular-nums">{r.td}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-zinc-400">
        Offense aggregated from player box scores (team passing + rushing yards); scoring from game
        results. Sorted by total yards per game. Defensive yardage isn’t available from the free
        season-aggregate data — only points against.
      </p>
    </Container>
  );
}

import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { db, teams, teamRatings, type Team } from "@/db";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { TeamLogo } from "@/components/TeamLogo";
import { InfoTip } from "@/components/InfoTip";
import { CURRENT_SEASON, formatSeason } from "@/lib/seasons";

export const metadata: Metadata = {
  title: "Power Rankings — RougeQ",
  description: "Opponent-adjusted CFL team ratings (SRS, Elo, Pythagorean) for the current season.",
};
export const dynamic = "force-dynamic";

const signed = (x: number | null, d = 1) =>
  x == null ? "—" : (x >= 0 ? "+" : "") + x.toFixed(d);

export default async function PowerRankingsPage() {
  const season = CURRENT_SEASON;
  const ratings = await db
    .select()
    .from(teamRatings)
    .where(eq(teamRatings.season, season))
    .orderBy(desc(teamRatings.srs));
  const teamRows = await db.select().from(teams);
  const nameOf: Record<string, string> = Object.fromEntries(
    teamRows.map((t: Team) => [t.tricode, t.fullName]),
  );

  return (
    <Container size="lg">
      <PageHeader
        title="Power Rankings"
        subtitle={`Opponent-adjusted team strength — ${formatSeason(season)} regular season`}
      />

      {ratings.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No rated games yet this season. Run <code>npm run refresh</code> once games are played.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="stat-table">
            <thead>
              <tr>
                <th className="text-right">#</th>
                <th>Team</th>
                <th className="text-right">Rec</th>
                <th className="text-right">
                  <InfoTip label="SRS" text="Simple Rating System — points better than average, adjusted for opponent strength. 0 = league average.">SRS</InfoTip>
                </th>
                <th className="text-right">OSRS</th>
                <th className="text-right">DSRS</th>
                <th className="text-right">
                  <InfoTip label="Elo" text="Live power rating updated each game (start 1500), with home-field and margin-of-victory adjustments.">Elo</InfoTip>
                </th>
                <th className="text-right">
                  <InfoTip label="Pyth W" text="Pythagorean expected wins from points for/against — how many wins the scoring deserved.">Pyth W</InfoTip>
                </th>
                <th className="text-right">
                  <InfoTip label="Luck" text="Actual wins minus Pythagorean expected wins. Positive = winning close games; negative = unlucky.">Luck</InfoTip>
                </th>
                <th className="text-right">
                  <InfoTip label="SoS" text="Strength of schedule — average opponent rating faced, in points.">SoS</InfoTip>
                </th>
              </tr>
            </thead>
            <tbody>
              {ratings.map((r, i) => (
                <tr key={r.tricode}>
                  <td className="text-right tabular-nums font-semibold text-zinc-500">{i + 1}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <TeamLogo tricode={r.tricode} size="sm" />
                      <span className="font-medium">{nameOf[r.tricode] ?? r.tricode}</span>
                    </div>
                  </td>
                  <td className="text-right tabular-nums whitespace-nowrap">
                    {r.wins}-{r.losses}{r.ties ? `-${r.ties}` : ""}
                  </td>
                  <td className="text-right tabular-nums font-semibold">{signed(r.srs)}</td>
                  <td className="text-right tabular-nums text-zinc-500">{signed(r.osrs)}</td>
                  <td className="text-right tabular-nums text-zinc-500">{signed(r.dsrs)}</td>
                  <td className="text-right tabular-nums">{r.elo == null ? "—" : Math.round(r.elo)}</td>
                  <td className="text-right tabular-nums">{r.pythWins == null ? "—" : r.pythWins.toFixed(1)}</td>
                  <td
                    className={`text-right tabular-nums ${
                      (r.luck ?? 0) > 0.5 ? "text-emerald-600 dark:text-emerald-400" : (r.luck ?? 0) < -0.5 ? "text-rose-600 dark:text-rose-400" : "text-zinc-500"
                    }`}
                  >
                    {signed(r.luck)}
                  </td>
                  <td className="text-right tabular-nums text-zinc-500">{signed(r.sos)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-zinc-400">
        Ratings are computed from final scores only (no play-by-play). Sorted by SRS. Early in the
        season, small samples make ratings noisy. See the methodology in{" "}
        <a href="https://github.com/NacreousLabs/rougeq/blob/master/ANALYTICS-SPEC.md" className="underline">
          ANALYTICS-SPEC.md
        </a>
        .
      </p>
    </Container>
  );
}

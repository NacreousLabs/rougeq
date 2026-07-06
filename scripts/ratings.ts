// Compute team ratings (SRS / OSRS / DSRS / Elo / Pythagorean / SoS) from
// completed regular-season games and write them to team_ratings.
// Pure function of game scores — see ANALYTICS-SPEC.md §2.
//   npm run ratings           # current season
//   npx tsx scripts/ratings.ts 2025
import { db, games, teamRatings } from "../src/db";
import { CURRENT_SEASON } from "../src/lib/seasons";
import { and, eq } from "drizzle-orm";

const PYTH_EXP = 2.37; // football-tuned Pythagorean exponent
const ELO_START = 1500;
const ELO_K = 20;
const ELO_HFA = 65; // home-field advantage in Elo points (~2.6 pts)

type G = {
  date: string;
  homeTricode: string;
  awayTricode: string;
  homeScore: number;
  awayScore: number;
};

function solveSRS(teamsList: string[], gs: G[]) {
  // Per-team schedule + raw margins.
  const gp: Record<string, number> = {};
  const pf: Record<string, number> = {};
  const pa: Record<string, number> = {};
  const opps: Record<string, string[]> = {};
  for (const t of teamsList) { gp[t] = 0; pf[t] = 0; pa[t] = 0; opps[t] = []; }
  for (const g of gs) {
    gp[g.homeTricode]++; gp[g.awayTricode]++;
    pf[g.homeTricode] += g.homeScore; pa[g.homeTricode] += g.awayScore;
    pf[g.awayTricode] += g.awayScore; pa[g.awayTricode] += g.homeScore;
    opps[g.homeTricode].push(g.awayTricode);
    opps[g.awayTricode].push(g.homeTricode);
  }
  const played = teamsList.filter((t) => gp[t] > 0);
  const totalTeamGames = played.reduce((s, t) => s + gp[t], 0);
  const leagueAvg = played.reduce((s, t) => s + pf[t], 0) / totalTeamGames; // avg points/team-game

  const mov: Record<string, number> = {};
  const rawOff: Record<string, number> = {};
  const rawDef: Record<string, number> = {};
  const osrs: Record<string, number> = {};
  const dsrs: Record<string, number> = {};
  for (const t of played) {
    mov[t] = (pf[t] - pa[t]) / gp[t];
    rawOff[t] = pf[t] / gp[t] - leagueAvg;
    rawDef[t] = leagueAvg - pa[t] / gp[t];
    osrs[t] = rawOff[t];
    dsrs[t] = rawDef[t];
  }
  // Coupled fixed-point: credit offense vs opponent defense and vice-versa.
  for (let iter = 0; iter < 2000; iter++) {
    const nO: Record<string, number> = {};
    const nD: Record<string, number> = {};
    for (const t of played) {
      const oppD = opps[t].reduce((s, o) => s + (dsrs[o] ?? 0), 0) / gp[t];
      const oppO = opps[t].reduce((s, o) => s + (osrs[o] ?? 0), 0) / gp[t];
      nO[t] = rawOff[t] + oppD;
      nD[t] = rawDef[t] + oppO;
    }
    for (const t of played) { osrs[t] = nO[t]; dsrs[t] = nD[t]; }
  }
  const srs: Record<string, number> = {};
  for (const t of played) srs[t] = osrs[t] + dsrs[t];
  return { played, gp, pf, pa, mov, srs, osrs, dsrs };
}

function computeElo(teamsList: string[], gs: G[]) {
  const elo: Record<string, number> = {};
  for (const t of teamsList) elo[t] = ELO_START;
  const byDate = [...gs].sort((a, b) => a.date.localeCompare(b.date));
  for (const g of byDate) {
    const eh = elo[g.homeTricode];
    const ea = elo[g.awayTricode];
    const Eh = 1 / (1 + 10 ** ((ea - eh - ELO_HFA) / 400));
    const margin = g.homeScore - g.awayScore;
    const Sh = margin > 0 ? 1 : margin < 0 ? 0 : 0.5;
    // 538-style margin-of-victory multiplier (winner's pre-game Elo diff, incl HFA).
    const winnerDiff = margin > 0 ? eh + ELO_HFA - ea : ea - (eh + ELO_HFA);
    const mult = margin === 0 ? 1 : Math.log(Math.abs(margin) + 1) * (2.2 / (winnerDiff * 0.001 + 2.2));
    const delta = ELO_K * mult * (Sh - Eh);
    elo[g.homeTricode] = eh + delta;
    elo[g.awayTricode] = ea - delta;
  }
  return elo;
}

async function main() {
  const season = Number(process.argv[2]) || CURRENT_SEASON;
  const rows = (await db
    .select()
    .from(games)
    .where(and(eq(games.season, season), eq(games.gameType, 2), eq(games.status, "complete")))) as any[];
  const gs: G[] = rows
    .filter((r) => r.homeScore != null && r.awayScore != null)
    .map((r) => ({
      date: r.date,
      homeTricode: r.homeTricode,
      awayTricode: r.awayTricode,
      homeScore: r.homeScore,
      awayScore: r.awayScore,
    }));
  console.log(`Rating ${gs.length} completed regular-season games for ${season}…`);
  if (!gs.length) { console.log("No completed games yet — nothing to rate."); return; }

  const teamSet = Array.from(new Set(gs.flatMap((g) => [g.homeTricode, g.awayTricode])));
  const { played, gp, pf, pa, mov, srs, osrs, dsrs } = solveSRS(teamSet, gs);
  const elo = computeElo(teamSet, gs);

  // Records (W/L/T) from the same game set.
  const w: Record<string, number> = {}, l: Record<string, number> = {}, ti: Record<string, number> = {};
  for (const t of played) { w[t] = 0; l[t] = 0; ti[t] = 0; }
  for (const g of gs) {
    if (g.homeScore > g.awayScore) { w[g.homeTricode]++; l[g.awayTricode]++; }
    else if (g.homeScore < g.awayScore) { w[g.awayTricode]++; l[g.homeTricode]++; }
    else { ti[g.homeTricode]++; ti[g.awayTricode]++; }
  }

  const now = new Date().toISOString();
  for (const t of played) {
    const pyth = pf[t] + pa[t] > 0
      ? pf[t] ** PYTH_EXP / (pf[t] ** PYTH_EXP + pa[t] ** PYTH_EXP)
      : 0.5;
    const pythWins = pyth * gp[t];
    const row = {
      tricode: t, season,
      gamesPlayed: gp[t], wins: w[t], losses: l[t], ties: ti[t],
      pointsFor: pf[t], pointsAgainst: pa[t],
      mov: round(mov[t]), srs: round(srs[t]), osrs: round(osrs[t]), dsrs: round(dsrs[t]),
      sos: round(srs[t] - mov[t]),
      elo: round(elo[t]), pythWins: round(pythWins), luck: round(w[t] - pythWins),
      updatedAt: now,
    };
    await db.insert(teamRatings).values(row).onConflictDoUpdate({
      target: [teamRatings.tricode, teamRatings.season], set: row,
    });
  }

  console.log("Power ranking (by SRS):");
  const ranked = [...played].sort((a, b) => srs[b] - srs[a]);
  ranked.forEach((t, i) =>
    console.log(`  ${String(i + 1).padStart(2)}. ${t.padEnd(4)} ${w[t]}-${l[t]}-${ti[t]}  SRS ${fmt(srs[t])}  Elo ${Math.round(elo[t])}  pythW ${pythWins(pf[t], pa[t], gp[t]).toFixed(1)}`),
  );
}

const round = (x: number) => Math.round(x * 1000) / 1000;
const fmt = (x: number) => (x >= 0 ? "+" : "") + x.toFixed(1);
const pythWins = (pf: number, pa: number, gp: number) =>
  pf + pa > 0 ? (pf ** PYTH_EXP / (pf ** PYTH_EXP + pa ** PYTH_EXP)) * gp : 0.5 * gp;

main().catch((e) => { console.error(e); process.exit(1); });

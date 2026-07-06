// Monte-Carlo season projections: simulate every remaining regular-season game
// off current Elo ratings, N times, and tally projected wins + playoff/division
// odds. Writes to `projections`. See ANALYTICS-SPEC.md §2.4.
//   npm run projections
import { db, games, teams, teamRatings, projections } from "../src/db";
import { CURRENT_SEASON } from "../src/lib/seasons";
import { and, eq, ne } from "drizzle-orm";

const N = 10000;
const ELO_HFA = 65;

function pHome(eloHome: number, eloAway: number): number {
  return 1 / (1 + 10 ** ((eloAway - eloHome - ELO_HFA) / 400));
}

// CFL playoffs: top 3 in each division, plus a single crossover — the 4th-place
// team in one division takes the other division's 3rd seed if it has more wins.
function playoffTeams(
  wins: Record<string, number>,
  division: Record<string, string>,
): { made: Set<string>; divWinner: Record<string, string> } {
  const byDiv: Record<string, string[]> = { West: [], East: [] };
  for (const t of Object.keys(wins)) (byDiv[division[t]] ?? (byDiv[division[t]] = [])).push(t);
  for (const d of Object.keys(byDiv)) byDiv[d].sort((a, b) => wins[b] - wins[a]);

  const west = byDiv.West ?? [], east = byDiv.East ?? [];
  const made = new Set<string>([...west.slice(0, 3), ...east.slice(0, 3)]);

  const west4 = west[3], east4 = east[3];
  if (west4 != null && east[2] != null && wins[west4] > wins[east[2]]) {
    made.delete(east[2]); made.add(west4);
  } else if (east4 != null && west[2] != null && wins[east4] > wins[west[2]]) {
    made.delete(west[2]); made.add(east4);
  }
  return { made, divWinner: { West: west[0], East: east[0] } };
}

async function main() {
  const season = CURRENT_SEASON;
  const ratings = (await db.select().from(teamRatings).where(eq(teamRatings.season, season))) as any[];
  if (!ratings.length) { console.log("No ratings — run npm run ratings first."); return; }

  const elo: Record<string, number> = {};
  const curWins: Record<string, number> = {};
  const totalGames: Record<string, number> = {};
  for (const r of ratings) {
    elo[r.tricode] = r.elo ?? 1500;
    curWins[r.tricode] = r.wins;
    totalGames[r.tricode] = r.gamesPlayed;
  }

  const teamRows = (await db.select().from(teams)) as any[];
  const division: Record<string, string> = Object.fromEntries(
    teamRows.map((t) => [t.tricode, t.division ?? "West"]),
  );

  const remaining = (await db
    .select()
    .from(games)
    .where(and(eq(games.season, season), eq(games.gameType, 2), ne(games.status, "complete")))) as any[];
  for (const g of remaining) {
    totalGames[g.homeTricode] = (totalGames[g.homeTricode] ?? 0) + 1;
    totalGames[g.awayTricode] = (totalGames[g.awayTricode] ?? 0) + 1;
  }
  console.log(`Simulating ${remaining.length} remaining games ${N}× for ${season}…`);

  const teamList = Object.keys(elo);
  const sumWins: Record<string, number> = {};
  const madeCount: Record<string, number> = {};
  const divWinCount: Record<string, number> = {};
  for (const t of teamList) { sumWins[t] = 0; madeCount[t] = 0; divWinCount[t] = 0; }

  for (let s = 0; s < N; s++) {
    const wins: Record<string, number> = { ...curWins };
    for (const g of remaining) {
      const p = pHome(elo[g.homeTricode] ?? 1500, elo[g.awayTricode] ?? 1500);
      if (Math.random() < p) wins[g.homeTricode]++; else wins[g.awayTricode]++;
    }
    for (const t of teamList) sumWins[t] += wins[t];
    const { made, divWinner } = playoffTeams(wins, division);
    for (const t of made) madeCount[t]++;
    for (const d of Object.keys(divWinner)) if (divWinner[d]) divWinCount[divWinner[d]]++;
  }

  const now = new Date().toISOString();
  const out: Array<{ t: string; pw: number; pl: number; po: number; dw: number }> = [];
  for (const t of teamList) {
    const projWins = sumWins[t] / N;
    const projLosses = (totalGames[t] ?? 0) - projWins;
    const playoffPct = (madeCount[t] / N) * 100;
    const divWinPct = (divWinCount[t] / N) * 100;
    const row = {
      tricode: t, season, sims: N,
      projWins: round(projWins), projLosses: round(projLosses),
      playoffPct: round(playoffPct), divWinPct: round(divWinPct), updatedAt: now,
    };
    await db.insert(projections).values(row).onConflictDoUpdate({
      target: [projections.tricode, projections.season], set: row,
    });
    out.push({ t, pw: projWins, pl: projLosses, po: playoffPct, dw: divWinPct });
  }

  out.sort((a, b) => b.po - a.po);
  console.log("Projected wins / playoff% / div-win%:");
  for (const r of out)
    console.log(`  ${r.t.padEnd(4)} ${r.pw.toFixed(1).padStart(4)}-${r.pl.toFixed(1).padStart(4)}  playoff ${r.po.toFixed(0).padStart(3)}%  div ${r.dw.toFixed(0).padStart(3)}%`);
}

const round = (x: number) => Math.round(x * 100) / 100;

main().catch((e) => { console.error(e); process.exit(1); });

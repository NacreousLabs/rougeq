// Ingest CFL teams + games from the public scoreboard JSON feeds into rougeq.db.
// No API key, no browser — the feeds are static JSON (see ANALYTICS-SPEC.md §1).
//   npm run ingest            # current season (from src/lib/seasons)
//   npx tsx scripts/ingest.ts 2025
import { db, teams, games } from "../src/db";
import { CURRENT_SEASON } from "../src/lib/seasons";

const SCOREBOARD = "https://cflscoreboard.cfl.ca/json/scoreboard";

// squads.json carries no division, so map it here (2026 alignment).
const DIVISION: Record<string, "West" | "East"> = {
  BC: "West", CGY: "West", EDM: "West", SSK: "West", WPG: "West",
  HAM: "East", MTL: "East", OTT: "East", TOR: "East",
};

// round.type → our gameType: 2 regular, 3 playoffs, 1 preseason.
function gameType(roundType: string): number {
  const t = (roundType || "").toUpperCase();
  if (t === "PRE") return 1;
  if (t === "PO" || t.includes("PLAYOFF") || t.includes("GREY")) return 3;
  return 2; // REG
}

async function getJson(url: string) {
  const res = await fetch(url, { headers: { "User-Agent": "RougeQ/0.1 (+https://rougeq.ca)" } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function ingestTeams() {
  const squads: Array<{ id: number; name: string; abbreviation: string }> = await getJson(
    `${SCOREBOARD}/squads.json`,
  );
  let n = 0;
  for (const s of squads) {
    if (!s.abbreviation || s.abbreviation === "TBD") continue;
    const tricode = s.abbreviation.toUpperCase();
    await db
      .insert(teams)
      .values({ tricode, fullName: s.name, division: DIVISION[tricode] ?? null })
      .onConflictDoUpdate({
        target: teams.tricode,
        set: { fullName: s.name, division: DIVISION[tricode] ?? null },
      });
    n++;
  }
  console.log(`  teams: upserted ${n}`);
}

type Squad = { id: number; name: string; shortName: string; score: number | null };
type Match = {
  id: number;
  cflId: number | null;
  date: string;
  status: string;
  homeSquad: Squad;
  awaySquad: Squad;
};
type Round = { id: number; type: string; number: number; tournaments: Match[] };

async function ingestGames(season: number) {
  const rounds: Round[] = await getJson(`${SCOREBOARD}/rounds.json`);
  let n = 0;
  for (const r of rounds) {
    const gt = gameType(r.type);
    for (const m of r.tournaments ?? []) {
      const home = m.homeSquad?.shortName?.toUpperCase();
      const away = m.awaySquad?.shortName?.toUpperCase();
      if (!home || !away) continue;
      const row = {
        id: m.id,
        cflId: m.cflId ?? null,
        season,
        week: r.number ?? null,
        gameType: gt,
        date: m.date,
        homeTricode: home,
        awayTricode: away,
        homeScore: m.homeSquad?.score ?? null,
        awayScore: m.awaySquad?.score ?? null,
        status: m.status,
        venue: null,
      };
      await db
        .insert(games)
        .values(row)
        .onConflictDoUpdate({ target: games.id, set: row });
      n++;
    }
  }
  console.log(`  games: upserted ${n}`);
}

async function main() {
  const season = Number(process.argv[2]) || CURRENT_SEASON;
  console.log(`Ingesting CFL data for season ${season}…`);
  await ingestTeams();
  await ingestGames(season);
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

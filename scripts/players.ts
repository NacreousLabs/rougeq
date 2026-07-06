// Ingest CFL player season stats from the public get_league_stats endpoint into
// players + player_season. Rate stats + percentiles are derived at read time.
// See ANALYTICS-SPEC.md §3.
//   npm run players            # current season
//   npx tsx scripts/players.ts 2025
import { db, players, playerSeason } from "../src/db";
import { CURRENT_SEASON } from "../src/lib/seasons";

const AJAX = "https://www.cfl.ca/wp-content/themes/cfl.ca/inc/admin-ajax.php";

// Column index → field name, per stat_category (verified against the live feed).
// Common prefix: [0]season [1]name [2]url [3]team [4]gp.
const CATS: Record<string, Record<string, number>> = {
  passing: { comp: 5, att: 6, compPct: 7, yds: 8, td: 9, int: 10, rating: 11, intPct: 12, ya: 13 },
  rushing: { att: 5, yds: 6, avg: 7, long: 8, td: 9 },
  receiving: { targets: 5, rec: 6, yds: 7, yac: 8, avg: 9, long: 10, td: 11 },
};

const num = (v: unknown): number => {
  if (typeof v === "number") return v;
  const n = parseFloat(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};

function playerIdFromUrl(url: string): number | null {
  const m = String(url).match(/\/(\d+)\/?$/);
  return m ? Number(m[1]) : null;
}

async function getRows(category: string, season: number): Promise<any[][]> {
  const url = `${AJAX}?action=get_league_stats&stat_category=${category}&season=${season}`;
  const res = await fetch(url, { headers: { "User-Agent": "RougeQ/0.1 (+https://rougeq.ca)" } });
  if (!res.ok) throw new Error(`${res.status} ${category}`);
  const json = await res.json();
  return Array.isArray(json?.data) ? json.data : [];
}

async function main() {
  const season = Number(process.argv[2]) || CURRENT_SEASON;
  const now = new Date().toISOString();
  console.log(`Ingesting player stats for ${season}…`);

  for (const [category, map] of Object.entries(CATS)) {
    const rows = await getRows(category, season);
    let n = 0;
    for (const r of rows) {
      const id = playerIdFromUrl(r[2]);
      if (!id) continue;
      const name = String(r[1]);
      const team = r[3] ? String(r[3]).toUpperCase() : null;
      const gp = num(r[4]);
      const stats: Record<string, number> = {};
      for (const [key, idx] of Object.entries(map)) stats[key] = num(r[idx]);

      await db
        .insert(players)
        .values({ id, name, teamTricode: team })
        .onConflictDoUpdate({ target: players.id, set: { name, teamTricode: team } });

      const row = {
        playerId: id, season, category, teamTricode: team, gamesPlayed: gp,
        stats: JSON.stringify(stats), updatedAt: now,
      };
      await db
        .insert(playerSeason)
        .values(row)
        .onConflictDoUpdate({
          target: [playerSeason.playerId, playerSeason.season, playerSeason.category],
          set: row,
        });
      n++;
    }
    console.log(`  ${category}: ${n} players`);
  }
  console.log("Done.");
}

main().catch((e) => { console.error(e); process.exit(1); });

import { db, teams, type Team } from "@/db";

/** Map of tricode -> team row, for resolving opponents in schedule/standings views. */
export async function getTeamMap(): Promise<Record<string, Team>> {
  const rows = await db.select().from(teams);
  return Object.fromEntries(rows.map((t) => [t.tricode, t]));
}

/** Display name for a tricode, falling back to the tricode itself if unknown. */
export function teamName(map: Record<string, Team>, tricode: string): string {
  return map[tricode]?.fullName ?? tricode;
}

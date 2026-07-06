import type { Metadata } from "next";
import Link from "next/link";
import { like, or } from "drizzle-orm";
import { db, players as playersTable, teams, type Team } from "@/db";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { TeamLogo } from "@/components/TeamLogo";

export const metadata: Metadata = { title: "Search — RougeQ" };
export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim();

  const teamHits = q
    ? ((await db.select().from(teams).where(or(like(teams.fullName, `%${q}%`), like(teams.tricode, `%${q}%`)))) as Team[])
    : [];
  const playerHits = q
    ? ((await db.select().from(playersTable).where(like(playersTable.name, `%${q}%`))) as any[]).slice(0, 40)
    : [];

  return (
    <Container size="sm">
      <PageHeader title="Search" subtitle={q ? `Results for “${q}”` : "Search players and teams"} />

      {!q ? (
        <p className="text-sm text-zinc-500">Type a player or team name in the search box above.</p>
      ) : teamHits.length === 0 && playerHits.length === 0 ? (
        <p className="text-sm text-zinc-500">No players or teams matched “{q}”.</p>
      ) : (
        <div className="space-y-6">
          {teamHits.length > 0 && (
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">Teams</h2>
              <div className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
                {teamHits.map((t) => (
                  <Link key={t.tricode} href={`/team/${t.tricode}`} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <TeamLogo tricode={t.tricode} size="xs" />
                    <span className="font-medium">{t.fullName}</span>
                    <span className="text-xs text-zinc-400">{t.division} Division</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {playerHits.length > 0 && (
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">Players</h2>
              <div className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
                {playerHits.map((p) => (
                  <Link key={p.id} href={`/player/${p.id}`} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    {p.teamTricode && <TeamLogo tricode={p.teamTricode} size="xs" />}
                    <span className="font-medium">{p.name}</span>
                    {p.teamTricode && <span className="text-xs text-zinc-400">{p.teamTricode}</span>}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </Container>
  );
}

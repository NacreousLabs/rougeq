import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db, posts, type Post } from "@/db";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "The Numbers — RougeQ",
  description: "Data-driven analysis of the Winnipeg Blue Bombers and the CFL.",
};
export const dynamic = "force-dynamic";

const fmtDate = (d: string | null) =>
  d ? new Date(`${d}T00:00:00`).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" }) : "";

export default async function NumbersIndex() {
  const published = (await db
    .select()
    .from(posts)
    .where(eq(posts.status, "published"))
    .orderBy(desc(posts.publishedDate))) as Post[];

  return (
    <Container size="sm">
      <PageHeader title="The Numbers" subtitle="Data-driven analysis, grounded in the ratings and projections." />

      {published.length === 0 ? (
        <p className="text-sm text-zinc-500">No articles published yet.</p>
      ) : (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {published.map((p) => (
            <article key={p.slug} className="py-5">
              <Link href={`/numbers/${p.slug}`} className="group">
                <h2 className="font-display text-xl font-bold uppercase tracking-tight text-rouge group-hover:underline dark:text-bombers-gold">
                  {p.title}
                </h2>
              </Link>
              {p.publishedDate && <div className="mt-0.5 text-xs text-zinc-400">{fmtDate(p.publishedDate)}</div>}
              {p.excerpt && <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{p.excerpt}</p>}
              <Link href={`/numbers/${p.slug}`} className="mt-2 inline-block text-xs text-rouge hover:underline dark:text-bombers-gold">
                Read →
              </Link>
            </article>
          ))}
        </div>
      )}
    </Container>
  );
}

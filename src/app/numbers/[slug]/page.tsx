import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db, posts, type Post } from "@/db";
import { Container } from "@/components/Container";
import { Markdown } from "@/components/Markdown";
import { NumbersChart } from "@/components/NumbersChart";

export const dynamic = "force-dynamic";

async function getPost(slug: string) {
  return (await db.select().from(posts).where(and(eq(posts.slug, slug), eq(posts.status, "published"))))[0] as
    | Post
    | undefined;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await getPost((await params).slug);
  return p ? { title: `${p.title} — The Numbers`, description: p.excerpt } : { title: "The Numbers — RougeQ" };
}

// Split an article body into Markdown text runs and `:::chart <id>:::` blocks.
function parseBody(body: string): Array<{ type: "md"; text: string } | { type: "chart"; id: string }> {
  const out: Array<{ type: "md"; text: string } | { type: "chart"; id: string }> = [];
  const re = /:::chart\s+([\w-]+)\s*:::/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) {
    if (m.index > last) out.push({ type: "md", text: body.slice(last, m.index) });
    out.push({ type: "chart", id: m[1] });
    last = m.index + m[0].length;
  }
  if (last < body.length) out.push({ type: "md", text: body.slice(last) });
  return out;
}

const fmtDate = (d: string | null) =>
  d ? new Date(`${d}T00:00:00`).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" }) : "";

export default async function NumbersArticle({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getPost((await params).slug);
  if (!post) notFound();

  const segments = parseBody(post.body);

  return (
    <Container size="sm">
      <article>
        <header className="mb-6 border-b border-zinc-200 pb-5 dark:border-zinc-800">
          <h1 className="font-display text-3xl font-bold uppercase italic tracking-tight text-rouge dark:text-bombers-gold">
            {post.title}
          </h1>
          {post.publishedDate && <div className="mt-1 text-xs text-zinc-400">{fmtDate(post.publishedDate)}</div>}
          {post.excerpt && <p className="mt-3 text-zinc-600 dark:text-zinc-300">{post.excerpt}</p>}
        </header>

        {segments.map((seg, i) =>
          seg.type === "chart" ? (
            <NumbersChart key={i} id={seg.id} />
          ) : (
            <Markdown key={i}>{seg.text}</Markdown>
          ),
        )}
      </article>

      <p className="mt-8 text-sm">
        <Link href="/numbers" className="text-rouge hover:underline dark:text-bombers-gold">← The Numbers</Link>
      </p>
    </Container>
  );
}

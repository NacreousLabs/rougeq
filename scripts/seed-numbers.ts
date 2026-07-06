// Seed a "The Numbers" article directly into the posts table. Stands in for the
// auth-gated /admin/numbers editor (which needs GitHub OAuth configured). The
// prose is human-written and grounded in the live ratings; charts are pulled in
// via `:::chart <id>:::` shortcodes resolved by src/components/NumbersChart.tsx.
//   npx tsx scripts/seed-numbers.ts
import { db, posts } from "../src/db";

const body = `Four games into 2026, the Blue Bombers sit at 2-2 — the definition of average. But average records can hide lopsided teams, and Winnipeg is one of them. Our Simple Rating System actually has them near the top of the league, yet that number papers over a stark split.

## An offense near the bottom

Winnipeg is scoring just over 22 points a game — last in the CFL — and ranks 8th of nine in total offensive yards.

:::chart scoring:::

:::chart total-offense:::

The passing game is the culprit. The Bombers' passers rank near the bottom of the qualified leaders by efficiency rating.

:::chart passing-leaders:::

## A defense keeping them afloat

What keeps the Bombers at .500 is the other side of the ball. Their defensive rating (DSRS) is among the best in the league — they are allowing far fewer points than a team with this offense has any right to.

:::chart wpg-ranks:::

The result is a profile that is entirely defense-first. That is a fragile way to win — it leaves no margin on an off night — but it has kept a struggling offense in every game so far.

## The projection

Even with the offense sputtering, the model still likes Winnipeg's odds to reach the playoffs, largely on the strength of that defense and a manageable schedule.

:::chart playoff-odds:::

If the passing game finds another gear, this is a contender. If it doesn't, the Bombers will live and die with their defense — and 2-2 might be about what a season of that looks like.`;

async function main() {
  const now = new Date();
  const iso = now.toISOString();
  const row = {
    slug: "defense-carrying-offense",
    title: "Winnipeg's defense is dragging a bottom-tier offense to .500",
    excerpt:
      "At 2-2, the Blue Bombers look average. The split underneath is anything but: a top-tier defense propping up one of the league's worst offenses.",
    body,
    subjectType: "team",
    subjectId: null,
    status: "published",
    publishedDate: iso.slice(0, 10),
    aiNotes: "",
    aiModel: "",
    updatedAt: iso,
  };
  await db.insert(posts).values(row).onConflictDoUpdate({ target: posts.slug, set: row });
  console.log(`Seeded article: /numbers/${row.slug}`);
}

main().catch((e) => { console.error(e); process.exit(1); });

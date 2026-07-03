import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "About — RougeQ",
  description: "About RougeQ, its data sources, and legal disclaimers.",
};

export default function AboutPage() {
  return (
    <Container size="sm">
      <PageHeader title="About RougeQ" />

      <div className="mt-6 space-y-5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
        <p>
          RougeQ is an independent, non-commercial fan project: a stats, analytics, and results
          hub for the Winnipeg Jets, covering the current franchise era (2011-12 to present).
          It&apos;s built for fans, free, and not monetized.
        </p>

        <section>
          <SectionHeading className="mb-1">Where the data comes from</SectionHeading>
          <p>
            Stats, schedules, standings, rosters, and play-by-play are drawn from the NHL&apos;s
            publicly accessible web endpoints and stored locally so pages load quickly. Game
            recaps and video links point to NHL.com. Numbers are unofficial — for official stats,
            see{" "}
            <a
              href="https://www.nhl.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-bombers-blue hover:underline dark:text-bombers-gold"
            >
              NHL.com
            </a>
            .
          </p>
        </section>

        <section>
          <SectionHeading className="mb-1">Disclaimer</SectionHeading>
          <p>
            RougeQ is <strong>not affiliated with, endorsed by, or sponsored by</strong> the
            National Hockey League, the Winnipeg Jets, or any NHL team. All NHL and team names,
            marks, logos, and related content are the property of their respective owners and are
            used here for identification and informational, non-commercial purposes only.
          </p>
        </section>

        <section>
          <SectionHeading className="mb-1">No expected-goals model</SectionHeading>
          <p>
            Advanced metrics here (Corsi/SAT%, PDO, per-60 rates, percentiles) are derived from
            public counting and rate stats. RougeQ does not include expected-goals (xG) or other
            proprietary model stats, which come from third-party sources.
          </p>
        </section>

        <section>
          <SectionHeading className="mb-1">Takedown requests</SectionHeading>
          <p>
            If you are a rights holder and would like content removed, please get in touch and
            it will be addressed promptly.
          </p>
        </section>
      </div>
    </Container>
  );
}

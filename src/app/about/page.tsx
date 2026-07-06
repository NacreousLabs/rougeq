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
          hub for the Winnipeg Blue Bombers, covering the modern CFL era. It&apos;s built for fans,
          free, and not monetized.
        </p>

        <section>
          <SectionHeading className="mb-1">Where the data comes from</SectionHeading>
          <p>
            Stats, schedules, standings, rosters, and play-by-play are drawn from publicly
            accessible CFL sources and stored locally so pages load quickly. Game recaps and video
            links point to CFL.ca. Numbers are unofficial — for official stats, see{" "}
            <a
              href="https://www.cfl.ca"
              target="_blank"
              rel="noopener noreferrer"
              className="text-rouge hover:underline dark:text-bombers-gold"
            >
              CFL.ca
            </a>
            .
          </p>
        </section>

        <section>
          <SectionHeading className="mb-1">Disclaimer</SectionHeading>
          <p>
            RougeQ is <strong>not affiliated with, endorsed by, or sponsored by</strong> the
            Canadian Football League, the Winnipeg Blue Bombers, or any CFL team. All CFL and team
            names, marks, logos, and related content are the property of their respective owners and
            are used here for identification and informational, non-commercial purposes only.
          </p>
        </section>

        <section>
          <SectionHeading className="mb-1">No proprietary models</SectionHeading>
          <p>
            Advanced metrics here (per-game and per-play rates, efficiency splits, percentiles) are
            derived from public counting and rate stats. RougeQ does not include proprietary model
            stats (e.g. EPA or win-probability figures), which come from third-party sources.
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

"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";

// Internal colour-study page (not linked in the nav). Clicking a swatch overrides
// the live --color-rouge token on the document root, so the real nav bar and every
// rouge surface recolor in place. "Reset" restores the shipped default.
const DEFAULT = "#8a2830";

type Candidate = { name: string; hex: string; note: string; tag?: string };
const CANDIDATES: Candidate[] = [
  { name: "Crimson", hex: "#C8102E", note: "Bright, vivid — the first pass." },
  { name: "Cardinal", hex: "#B11226", note: "Classic athletic red, still punchy." },
  { name: "Signal", hex: "#A51C30", note: "Rich red with a little restraint." },
  { name: "Brick Rouge", hex: "#9E3D42", note: "Muted, dusty brick — softer, warmer.", tag: "Brick" },
  { name: "Deep Rouge", hex: "#8A2830", note: "Deep, slightly muted — the current pick.", tag: "Current" },
  { name: "Dark Brick", hex: "#7E3035", note: "Brick, taken a shade deeper.", tag: "Brick" },
  { name: "Claret", hex: "#72232E", note: "Wine-leaning, understated and premium." },
  { name: "Bordeaux", hex: "#5E1F27", note: "Very deep — reads almost maroon." },
  { name: "Oxblood", hex: "#4A171C", note: "Near-black rouge for a severe look." },
];

export default function MockupPage() {
  const [sel, setSel] = useState<Candidate>(CANDIDATES.find((c) => c.hex.toLowerCase() === DEFAULT)!);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    document.title = "Rouge Colour Study — RougeQ";
  }, []);

  function apply(c: Candidate) {
    setSel(c);
    setApplied(c.hex.toLowerCase() !== DEFAULT);
    document.documentElement.style.setProperty("--color-rouge", c.hex);
  }
  function reset() {
    const d = CANDIDATES.find((c) => c.hex.toLowerCase() === DEFAULT)!;
    setSel(d);
    setApplied(false);
    document.documentElement.style.removeProperty("--color-rouge");
  }

  return (
    <Container size="lg">
      <PageHeader
        title="Rouge Colour Study"
        subtitle="Click a swatch to recolor the live site. Gold stays the accent. Nothing here is saved — tell me which to ship."
      />

      {/* Read-out */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <span className="font-display text-2xl font-bold italic text-rouge">{sel.name}</span>
        <code className="rounded-md border border-zinc-200 bg-zinc-100 px-3 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800">
          {sel.hex.toUpperCase()}
        </code>
        <span className="text-sm text-zinc-500">{sel.note}</span>
        {applied && (
          <button onClick={reset} className="rounded-md border border-zinc-300 px-3 py-1 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
            Reset to default
          </button>
        )}
      </div>

      {/* Swatch grid */}
      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {CANDIDATES.map((c) => {
          const active = c.hex === sel.hex;
          return (
            <button
              key={c.hex}
              onClick={() => apply(c)}
              aria-pressed={active}
              className={`overflow-hidden rounded-xl border text-left shadow-sm transition hover:-translate-y-0.5 ${
                active ? "border-bombers-gold ring-2 ring-bombers-gold" : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <div className="flex h-16 items-center justify-between px-4" style={{ backgroundColor: c.hex }}>
                <span className="text-xl font-extrabold italic text-white">Aa</span>
                <span className="text-2xl font-extrabold text-bombers-gold">Q</span>
              </div>
              <div className="bg-white px-3 py-2 dark:bg-zinc-900">
                <div className="flex items-center gap-1.5 text-sm font-semibold">
                  {c.name}
                  {c.tag && (
                    <span className="rounded bg-bombers-gold px-1.5 text-[9px] font-bold uppercase tracking-wide text-bombers-navy">
                      {c.tag}
                    </span>
                  )}
                </div>
                <div className="font-mono text-[11px] text-zinc-500">{c.hex.toUpperCase()}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Live sample of real chrome */}
      <h2 className="mb-3 font-display text-lg font-bold uppercase tracking-wide">Live sample</h2>
      <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
        <div className="text-center">
          <div className="font-display text-5xl font-bold uppercase italic tracking-tight text-rouge">RougeQ</div>
          <p className="mt-1 text-sm text-zinc-500">Advanced analytics for the Winnipeg Blue Bombers — 2026 season</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Record", "2-2", "89–101 pts"],
            ["SRS Rank", "#3", "+0.8 SRS"],
            ["Elo", "1473", "DSRS +9.2"],
            ["Playoff Odds", "60%", "proj 8.6 wins"],
          ].map(([l, v, s]) => (
            <div key={l} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">{l}</div>
              <div className="font-display text-2xl font-bold tabular-nums text-rouge">{v}</div>
              <div className="text-xs text-zinc-500">{s}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <table className="stat-table">
              <thead>
                <tr><th className="text-right">#</th><th>Team</th><th className="text-right">SRS</th></tr>
              </thead>
              <tbody>
                <tr><td className="text-right text-zinc-500">1</td><td>Calgary Stampeders</td><td className="text-right font-semibold tabular-nums">+5.9</td></tr>
                <tr><td className="text-right text-zinc-500">2</td><td>Hamilton Tiger-Cats</td><td className="text-right font-semibold tabular-nums">+5.3</td></tr>
                <tr className="bg-bombers-gold/10"><td className="text-right text-zinc-500">3</td><td className="font-medium text-rouge">Winnipeg Blue Bombers</td><td className="text-right font-semibold tabular-nums">+0.8</td></tr>
                <tr><td className="text-right text-zinc-500">4</td><td>Montreal Alouettes</td><td className="text-right font-semibold tabular-nums">+0.6</td></tr>
              </tbody>
            </table>
          </div>
          <div className="flex flex-col items-start gap-3">
            <div className="flex gap-3">
              <button className="rounded-md bg-rouge px-4 py-2 text-sm font-medium text-white hover:opacity-90">Standings &amp; Projections</button>
              <button className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-700">Player Leaders</button>
            </div>
            <a className="text-sm font-medium text-rouge hover:underline">Full table →</a>
            <p className="text-sm text-zinc-500">
              The primary drives the nav bar, headings, stat values, buttons and links. The{" "}
              <span className="font-semibold text-bombers-gold">gold</span> accent (the Q, the pill, the Winnipeg
              highlight) is held constant.
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
}

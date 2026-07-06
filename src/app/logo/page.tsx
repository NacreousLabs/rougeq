import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = { title: "Logo Study — RougeQ" };

const GOLD = "#ffc72c";
const INK = "#4a171c"; // deep rouge — outline + detail
const ROUGE = "#7e3035";
const CREAM = "#fff3d6"; // warm off-white for laces/stripes on gold

const sc = (s: number) => `translate(16 16) scale(${s}) translate(-16 -16)`;

/** A proper football: pointed gold spheroid with seam, laces and end stripes. */
function Football({ transform, stripe = INK }: { transform?: string; stripe?: string }) {
  return (
    <g transform={transform}>
      <path d="M3.5 16 C 9 9.5, 23 9.5, 28.5 16 C 23 22.5, 9 22.5, 3.5 16 Z" fill={GOLD} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      {/* end stripes */}
      <path d="M7.4 12.7 C 6.5 14.8 6.5 17.2 7.4 19.3" fill="none" stroke={stripe} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M24.6 12.7 C 25.5 14.8 25.5 17.2 24.6 19.3" fill="none" stroke={stripe} strokeWidth="1.5" strokeLinecap="round" />
      {/* seam */}
      <path d="M11 16 H21" stroke={stripe} strokeWidth="1.6" strokeLinecap="round" />
      {/* laces */}
      {[12.6, 15.2, 17.8, 20.4].map((x) => (
        <line key={x} x1={x} y1="14.3" x2={x} y2="17.7" stroke={stripe} strokeWidth="1.4" strokeLinecap="round" />
      ))}
    </g>
  );
}

// A — Roundel: gold-ringed dark disc with a gold football (badge).
function MarkRoundel({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="15.2" fill={INK} />
      <circle cx="16" cy="16" r="15.2" fill="none" stroke={GOLD} strokeWidth="1.4" />
      <Football transform={sc(0.64)} stripe={INK} />
    </svg>
  );
}

// B — Football-Q: the ball is the bowl of a Q; a bold tail flicks from its base.
function MarkQ({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <Football transform={sc(0.92)} />
      <path d="M20.5 19.5 Q 26 23, 29.5 29" stroke={INK} strokeWidth="3.6" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// C — Vertical: football stood on end — a distinctive upright silhouette.
function MarkVertical({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <Football transform={`rotate(90 16 16) ${sc(0.98)}`} stripe={CREAM} />
    </svg>
  );
}

// D — Uptrend bars: a football crowning three rising bars (football + analytics).
function MarkBars({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <g fill={INK}>
        <rect x="3.5" y="21" width="6" height="8" rx="1" />
        <rect x="11.5" y="17" width="6" height="12" rx="1" />
        <rect x="19.5" y="12.5" width="6" height="16.5" rx="1" />
      </g>
      <Football transform={`translate(6.5 -9) ${sc(0.5)}`} />
    </svg>
  );
}

// E — Crest: a shield badge carrying the football (team-crest feel).
function MarkCrest({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M16 1.5 L29 5.5 V16 C29 24, 22.5 28.5, 16 30.5 C9.5 28.5, 3 24, 3 16 V5.5 Z" fill={ROUGE} stroke={GOLD} strokeWidth="1.5" strokeLinejoin="round" />
      <Football transform={`translate(0 -1) ${sc(0.62)}`} stripe={INK} />
    </svg>
  );
}

// F — Momentum: football with a bold forward chevron (speed / rising).
function MarkMomentum({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <g stroke={ROUGE} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.55">
        <path d="M2 22 L7 16 L2 10" />
      </g>
      <Football transform={`translate(3 0) ${sc(0.86)}`} />
    </svg>
  );
}

const CONCEPTS = [
  { key: "A", name: "Roundel", second: "a badge ring", Mark: MarkRoundel, note: "Gold-ringed disc with a gold ball — the cleanest at favicon size." },
  { key: "B", name: "Football-Q", second: "the Q letterform", Mark: MarkQ, note: "The ball is the bowl of a Q — keeps the RougeQ wordmark tie." },
  { key: "C", name: "Upright", second: "a vertical stance", Mark: MarkVertical, note: "Ball stood on end — a bolder, more distinctive silhouette." },
  { key: "D", name: "Uptrend", second: "rising bars", Mark: MarkBars, note: "Ball crowning a bar chart — reads “football analytics”." },
  { key: "E", name: "Crest", second: "a shield", Mark: MarkCrest, note: "Shield badge — the most premium / team-crest feel." },
  { key: "F", name: "Momentum", second: "a speed chevron", Mark: MarkMomentum, note: "Ball with a forward chevron — motion and momentum." },
];

function Tile({ dark, children }: { dark?: boolean; children: React.ReactNode }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-lg"
      style={{ background: dark ? ROUGE : "#ffffff", width: 84, height: 84, border: "1px solid rgba(0,0,0,.08)" }}
    >
      {children}
    </div>
  );
}

export default function LogoStudy() {
  return (
    <Container size="lg">
      <PageHeader
        title="Logo Study — v2"
        subtitle="Bolder football marks with a proper silhouette. Each shown large / nav / favicon on rouge and white, plus in the wordmark lockup."
      />

      <div className="space-y-5">
        {CONCEPTS.map(({ key, name, second, Mark, note }) => (
          <div key={key} className="flex flex-col gap-4 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <Tile dark><Mark size={52} /></Tile>
              <Tile><Mark size={52} /></Tile>
              <Tile dark><Mark size={28} /></Tile>
              <Tile dark><Mark size={16} /></Tile>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="rounded bg-rouge px-2 py-0.5 text-xs font-bold text-white">{key}</span>
                <span className="font-display text-lg font-bold uppercase tracking-wide">{name}</span>
              </div>
              <div className="mt-0.5 text-sm text-zinc-500">
                Football <span className="text-zinc-400">+</span>{" "}
                <span className="font-medium text-rouge dark:text-bombers-gold">{second}</span>
              </div>
              <p className="mt-1 text-sm text-zinc-500">{note}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-10 mb-3 font-display text-lg font-bold uppercase tracking-wide">In the wordmark lockup</h2>
      <div className="space-y-2">
        {CONCEPTS.map(({ key, Mark }) => (
          <div key={key} className="flex items-center gap-2 rounded-lg bg-rouge px-4 py-3 text-white">
            <Mark size={28} />
            <span className="text-lg font-bold tracking-tight">
              Rouge<span className="text-bombers-gold">Q</span>
            </span>
            <span className="ml-1 inline-flex items-center rounded-md bg-bombers-gold px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-bombers-navy">
              Blue Bombers
            </span>
            <span className="ml-auto text-xs text-white/60">{key}</span>
          </div>
        ))}
      </div>

      <p className="mt-8 text-sm text-zinc-500">
        Tell me a letter (A–F) — or a mix — and I’ll wire it into the real logo, favicon, apple icon, and OG card and refine it.
      </p>
    </Container>
  );
}

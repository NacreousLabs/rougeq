import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = { title: "Logo Study — RougeQ" };

const GOLD = "#ffc72c";
const INK = "#4a171c"; // deep rouge — outline + detail (reads on gold + on the rouge nav)
const ROUGE = "#7e3035";

/** Shared football body (tilted gold spheroid + seam + laces). */
function Football() {
  return (
    <g transform="rotate(-18 16 16)">
      <ellipse cx="16" cy="16" rx="12" ry="7" fill={GOLD} stroke={INK} strokeWidth="1.5" />
      <line x1="10.5" y1="16" x2="21.5" y2="16" stroke={INK} strokeWidth="1.2" strokeLinecap="round" />
      {[12.5, 15, 17.5, 20].map((x) => (
        <line key={x} x1={x} y1="14.2" x2={x} y2="17.8" stroke={INK} strokeWidth="1.1" strokeLinecap="round" />
      ))}
    </g>
  );
}

// Concept A — Football-Q: the football's lower-right tip flicks into the tail of a Q.
function MarkQ({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <Football />
      <path d="M22 21 L29 28.5" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// Concept B — Analytics football: a rising trend line lifts off the football (football + stats).
function MarkChart({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <Football />
      <polyline points="4,27 11,23 16,25 22,17 29,8" fill="none" stroke={INK} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="29" cy="8" r="2.4" fill={ROUGE} stroke="#fff" strokeWidth="1" />
    </svg>
  );
}

// Concept C — Goalpost football: the football sits above the uprights (football + the kick / the rouge).
function MarkGoal({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <g stroke={INK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <line x1="16" y1="30" x2="16" y2="23" />
        <line x1="9" y1="23" x2="23" y2="23" />
        <line x1="10.5" y1="23" x2="10.5" y2="16" />
        <line x1="21.5" y1="23" x2="21.5" y2="16" />
      </g>
      <g transform="translate(0 -8)">
        <Football />
      </g>
    </svg>
  );
}

const CONCEPTS = [
  { key: "A", name: "Football-Q", second: "the Q letterform", Mark: MarkQ, note: "The football's tip flicks into the tail of a Q — keeps the RougeQ wordmark tie." },
  { key: "B", name: "Analytics football", second: "a rising stat line", Mark: MarkChart, note: "A trend line lifts off the ball — says “football analytics” directly." },
  { key: "C", name: "Goalpost football", second: "the goalposts", Mark: MarkGoal, note: "Ball above the uprights — evokes the kick (and the rouge itself)." },
];

function Tile({ dark, children }: { dark?: boolean; children: React.ReactNode }) {
  return (
    <div
      className="flex items-center justify-center rounded-lg"
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
        title="Logo Study"
        subtitle="Football-based marks for RougeQ. Each pairs the football with a second element. Shown at large, nav, and favicon sizes on the rouge tile and on white."
      />

      <div className="space-y-5">
        {CONCEPTS.map(({ key, name, second, Mark, note }) => (
          <div key={key} className="flex flex-col gap-4 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <Tile dark>
                <Mark size={52} />
              </Tile>
              <Tile>
                <Mark size={52} />
              </Tile>
              <Tile dark>
                <Mark size={28} />
              </Tile>
              <Tile dark>
                <Mark size={16} />
              </Tile>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="rounded bg-rouge px-2 py-0.5 text-xs font-bold text-white">{key}</span>
                <span className="font-display text-lg font-bold uppercase tracking-wide">{name}</span>
              </div>
              <div className="mt-0.5 text-sm text-zinc-500">
                Football <span className="text-zinc-400">+</span> <span className="font-medium text-rouge dark:text-bombers-gold">{second}</span>
              </div>
              <p className="mt-1 text-sm text-zinc-500">{note}</p>
            </div>
          </div>
        ))}
      </div>

      {/* In the lockup (nav-style) */}
      <h2 className="mt-10 mb-3 font-display text-lg font-bold uppercase tracking-wide">In the wordmark lockup</h2>
      <div className="space-y-2">
        {CONCEPTS.map(({ key, Mark }) => (
          <div key={key} className="flex items-center gap-2 rounded-lg bg-rouge px-4 py-3 text-white">
            <Mark size={26} />
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
        Tell me which concept (A / B / C) and I’ll wire it into the real logo, favicon, apple icon, and OG card.
      </p>
    </Container>
  );
}

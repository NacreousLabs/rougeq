// RougeQ brand logo. A gold disc with a deep-rouge rim whose lower-right edge flicks out
// into the tail of a Q — the "Q" of RougeQ. Brand hexes are inlined so the mark reads on
// the rouge nav bar, on white, and on dark pages without theme variants. The `Mark` is
// exported so the favicon / OG / apple-icon routes reuse the exact same geometry.

const GOLD = "#ffc72c"; // disc fill — the Q body (pops on the rouge nav, holds on white)
const ROUGE = "#8a2830"; // inner ring accent
const INK = "#8a1420"; // deep rouge — rim + Q tail; dark enough to read on any background

/** The logomark only — a square puck-Q glyph. */
export function Mark({ size = 28, title }: { size?: number; title?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : "presentation"}
      aria-label={title}
    >
      {/* disc body */}
      <circle cx="14" cy="16" r="10" fill={GOLD} />
      {/* inner analytics ring (depth) */}
      <circle cx="14" cy="16" r="5.5" fill="none" stroke={ROUGE} strokeWidth="1.5" opacity="0.7" />
      {/* rim — the Q bowl */}
      <circle cx="14" cy="16" r="10" fill="none" stroke={INK} strokeWidth="2.5" />
      {/* Q tail */}
      <path d="M19.5 21.5 L27.5 29" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

type Variant = "full" | "mark" | "wordmark";

/** Brand lockup. `full` = mark + wordmark (nav), `mark` = glyph only, `wordmark` = text only. */
export function Logo({
  variant = "full",
  className,
  team,
}: {
  variant?: Variant;
  className?: string;
  team?: string; // optional team name shown after a divider, e.g. "Blue Bombers"
}) {
  const wordmark = (
    <span className="text-lg font-bold tracking-tight">
      Rouge<span className="text-bombers-gold">Q</span>
    </span>
  );
  // Team name reads as a distinct sub-brand badge: a solid ice pill with the team
  // in navy uppercase. It's self-contained — ice fill + navy text — so it stays
  // punchy and legible on the navy nav bar and the light/dark footer alike.
  const teamLabel = team ? (
    <span className="inline-flex items-center rounded-md bg-bombers-gold px-2 py-0.5">
      <span className="text-xs font-bold uppercase tracking-wider text-rouge">{team}</span>
    </span>
  ) : null;

  if (variant === "wordmark")
    return (
      <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
        {wordmark}
        {teamLabel}
      </span>
    );
  if (variant === "mark")
    return (
      <span className={className}>
        <Mark title="RougeQ" />
      </span>
    );
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <Mark size={26} />
      <span className="inline-flex items-center gap-2">
        {wordmark}
        {teamLabel}
      </span>
    </span>
  );
}

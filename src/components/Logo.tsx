// RougeQ brand logo. "Puck = Q": a hockey puck (navy disc + ice rim) whose lower-right
// edge flicks out into the tail of a Q. Brand hexes are inlined so the mark reads on the
// navy nav bar and on light/dark pages without theme variants. The `Mark` is exported so
// the favicon / OG / apple-icon routes reuse the exact same geometry.

const NAVY = "#072a52"; // a touch lighter than --bombers-navy so the disc reads on the navy nav
const ICE = "#55abc9";
const BLUE = "#0b63a3";

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
      {/* puck body */}
      <circle cx="14" cy="16" r="10" fill={NAVY} />
      {/* inner analytics ring (depth) */}
      <circle cx="14" cy="16" r="5.5" fill="none" stroke={BLUE} strokeWidth="1.5" opacity="0.65" />
      {/* puck rim — the Q bowl */}
      <circle cx="14" cy="16" r="10" fill="none" stroke={ICE} strokeWidth="2.5" />
      {/* Q tail */}
      <path d="M19.5 21.5 L27.5 29" stroke={ICE} strokeWidth="3.2" strokeLinecap="round" />
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
  team?: string; // optional team name shown after a divider, e.g. "Jets" → RougeQ / Jets
}) {
  const wordmark = (
    <span className="text-lg font-bold tracking-tight">
      Puck<span className="text-bombers-gold">Q</span>
    </span>
  );
  // Team name reads as a distinct sub-brand badge: a solid ice pill with the team
  // in navy uppercase. It's self-contained — ice fill + navy text — so it stays
  // punchy and legible on the navy nav bar and the light/dark footer alike.
  const teamLabel = team ? (
    <span className="inline-flex items-center rounded-md bg-bombers-gold px-2 py-0.5">
      <span className="text-xs font-bold uppercase tracking-wider text-bombers-navy">{team}</span>
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

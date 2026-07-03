/**
 * Broadcast-style section heading: condensed display type, uppercase italic,
 * bombers-blue (light) / bombers-gold (dark) with a short accent bar. `suffix` is an
 * optional muted clarifier rendered in the body font (e.g. "(our model)").
 */
export function SectionHeading({
  className = "",
  suffix,
  children,
}: {
  className?: string;
  suffix?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <h2
      className={`flex items-center gap-2 font-display text-base font-bold uppercase italic tracking-wider text-bombers-blue dark:text-bombers-gold ${className}`}
    >
      <span className="h-4 w-1 shrink-0 bg-bombers-blue dark:bg-bombers-gold" aria-hidden />
      <span>{children}</span>
      {suffix && (
        <span className="font-sans text-xs font-medium normal-case not-italic text-zinc-400">
          {suffix}
        </span>
      )}
    </h2>
  );
}

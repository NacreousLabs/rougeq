// Initials avatar — a privacy/rights-friendly placeholder used instead of club headshots.

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ name, className = "" }: { name: string; className?: string }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-bombers-navy font-semibold text-white dark:bg-zinc-700 ${className}`}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}

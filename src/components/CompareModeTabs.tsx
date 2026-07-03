import Link from "next/link";

export function CompareModeTabs({ active }: { active: "players" | "teams" }) {
  const tabs = [
    { href: "/compare", label: "Players", key: "players" },
    { href: "/compare/teams", label: "Teams", key: "teams" },
  ];
  return (
    <div className="mt-4 flex gap-1 border-b border-zinc-200 dark:border-zinc-800">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className={`-mb-px border-b-2 px-4 py-2 font-display text-sm font-semibold uppercase italic tracking-wider transition-colors ${
            active === t.key
              ? "border-bombers-blue text-bombers-blue dark:border-bombers-gold dark:text-bombers-gold"
              : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}

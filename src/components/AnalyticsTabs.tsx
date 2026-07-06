"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/analytics", label: "Team" },
  { href: "/analytics/players", label: "Players" },
  { href: "/analytics/lines", label: "Lines & Pairs" },
  { href: "/analytics/trends", label: "Trends" },
];

export function AnalyticsTabs() {
  const pathname = usePathname();
  return (
    <div className="mt-4 flex gap-1 border-b border-zinc-200 dark:border-zinc-800">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`-mb-px border-b-2 px-4 py-2 font-display text-sm font-semibold uppercase italic tracking-wider transition-colors ${
              active
                ? "border-rouge text-rouge dark:border-bombers-gold dark:text-bombers-gold"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}

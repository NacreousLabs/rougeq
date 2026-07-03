"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "./actions";

const TABS: { href: string; label: string; match: (p: string) => boolean }[] = [
  { href: "/admin", label: "Overview", match: (p) => p === "/admin" },
  { href: "/admin/recaps", label: "Recaps", match: (p) => p.startsWith("/admin/recaps") },
  { href: "/admin/numbers", label: "The Numbers", match: (p) => p.startsWith("/admin/numbers") },
  { href: "/admin/contracts", label: "Contracts", match: (p) => p.startsWith("/admin/contracts") },
  { href: "/admin/prospects", label: "Prospects", match: (p) => p.startsWith("/admin/prospects") },
  { href: "/admin/users", label: "Admins", match: (p) => p.startsWith("/admin/users") },
];

export function AdminNav() {
  const pathname = usePathname() ?? "/admin";

  return (
    <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-6">
        <Link
          href="/admin"
          className="shrink-0 py-3 font-display text-sm font-bold uppercase italic tracking-widest text-bombers-blue dark:text-bombers-gold"
        >
          RougeQ Admin
        </Link>
        <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
          {TABS.map((t) => {
            const active = t.match(pathname);
            return (
              <Link
                key={t.href}
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap border-b-2 px-3 py-3 font-display text-xs font-semibold uppercase tracking-wide transition-colors ${
                  active
                    ? "border-bombers-blue text-bombers-blue dark:border-bombers-gold dark:text-bombers-gold"
                    : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
        <form action={logoutAction} className="shrink-0">
          <button className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

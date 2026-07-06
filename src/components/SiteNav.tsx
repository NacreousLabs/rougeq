"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NavSearch } from "@/components/NavSearch";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NavDropdown, type NavChild } from "@/components/NavDropdown";
import { Logo } from "@/components/Logo";
import { TEAM_NAME } from "@/lib/team";

type NavItem = { href: string; label: string } | { label: string; children: NavChild[] };

// Nav is rebuilt as CFL pages come online.
const NAV: NavItem[] = [{ href: "/power", label: "Power Rankings" }];

const isActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(href + "/");

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <nav className="sticky top-0 z-20 border-b border-black/10 bg-bombers-navy text-white">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-3">
        <Link href="/" aria-label="RougeQ home" className="shrink-0">
          <Logo variant="full" team={TEAM_NAME} />
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-5 text-sm md:flex">
          {NAV.map((item) =>
            "children" in item ? (
              <NavDropdown key={item.label} label={item.label} items={item.children} />
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={`border-b-2 pb-0.5 font-display font-semibold uppercase tracking-wide ${
                  isActive(pathname, item.href)
                    ? "border-bombers-gold text-white"
                    : "border-transparent text-zinc-300 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ),
          )}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <div className="hidden sm:block">
            <NavSearch />
          </div>
          <ThemeToggle />
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            aria-expanded={open}
            className="rounded-md p-1.5 text-zinc-300 hover:bg-white/10 hover:text-white md:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu — direct links + labeled groups */}
      {open && (
        <div className="border-t border-white/10 px-6 py-4 md:hidden">
          <div className="mb-3 sm:hidden">
            <NavSearch />
          </div>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {NAV.filter((i): i is { href: string; label: string } => "href" in i).map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={isActive(pathname, l.href) ? "font-semibold text-white" : "text-zinc-300"}
                >
                  {l.label}
                </Link>
              ))}
            </div>
            {NAV.filter((i): i is { label: string; children: NavChild[] } => "children" in i).map(
              (group) => (
                <div key={group.label}>
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                    {group.label}
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    {group.children.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className={isActive(pathname, c.href) ? "font-semibold text-white" : "text-zinc-300"}
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

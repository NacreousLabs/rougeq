"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export type NavChild = { href: string; label: string };

const isActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(href + "/");

/** Desktop nav dropdown: opens on hover and on click/keyboard; closes on
 *  outside-click, Escape, or navigation. */
export function NavDropdown({ label, items }: { label: string; items: NavChild[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const groupActive = items.some((i) => isActive(pathname, i.href));

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1 border-b-2 pb-0.5 font-display font-semibold uppercase tracking-wide ${groupActive ? "border-bombers-gold text-white" : "border-transparent text-zinc-300 hover:text-white"}`}
      >
        {label}
        <svg width="10" height="10" viewBox="0 0 12 12" className="opacity-70" aria-hidden>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-30 min-w-40 rounded-lg border border-zinc-200 bg-white py-1 text-zinc-700 shadow-lg dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
        >
          {items.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              role="menuitem"
              className={`block px-3 py-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                isActive(pathname, i.href) ? "font-semibold text-bombers-blue dark:text-bombers-gold" : ""
              }`}
            >
              {i.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

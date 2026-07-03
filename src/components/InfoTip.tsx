"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

/**
 * Accessible inline definition. Unlike a bare `title=` attribute it works on
 * tap (mobile), hover (mouse), and keyboard focus, and can be dismissed with
 * Escape, an outside tap, or scrolling.
 *
 * - variant="icon" (default): renders `children` as plain text followed by a
 *   small ⓘ button — the trigger. Good for chart labels where underlining the
 *   whole label would be noisy.
 * - variant="text": renders `children` as the trigger with a dotted underline.
 *   Good for an inline term inside running text.
 *
 * The popover is positioned with `position: fixed`, measured against the
 * viewport so it never clips inside a card and flips above the trigger when
 * there isn't room below.
 */
export function InfoTip({
  children,
  text,
  variant = "icon",
  className = "",
  label,
}: {
  children: ReactNode;
  text: string;
  variant?: "icon" | "text";
  className?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const id = useId();

  // Dismiss on outside pointer, Escape, scroll, or resize.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: Event) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const close = () => setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  // Position the popover within the viewport once it's mounted and measurable.
  useEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    if (!triggerRef.current || !tipRef.current) return;
    const margin = 8;
    const t = triggerRef.current.getBoundingClientRect();
    const tip = tipRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const left = Math.max(margin, Math.min(t.left, vw - margin - tip.width));
    const below = t.bottom + 6;
    const above = t.top - 6 - tip.height;
    const top = below + tip.height > vh - margin && above >= margin ? above : below;
    setPos({ top, left });
  }, [open, text]);

  const handlers = {
    onClick: () => setOpen((o) => !o),
    onPointerEnter: (e: React.PointerEvent) => {
      if (e.pointerType === "mouse") setOpen(true);
    },
    onPointerLeave: (e: React.PointerEvent) => {
      if (e.pointerType === "mouse") setOpen(false);
    },
    onFocus: () => setOpen(true),
    onBlur: () => setOpen(false),
    "aria-expanded": open,
    "aria-describedby": open ? id : undefined,
  };

  return (
    <span ref={wrapRef} className="relative inline-flex items-center gap-1">
      {variant === "icon" ? (
        <>
          {className ? <span className={className}>{children}</span> : children}
          <button
            ref={triggerRef}
            type="button"
            aria-label={label ? `Definition of ${label}` : "Show definition"}
            {...handlers}
            className="inline-flex h-3.5 w-3.5 shrink-0 cursor-help items-center justify-center rounded-full border border-zinc-300 text-[9px] font-semibold italic leading-none text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-bombers-blue/50 dark:border-zinc-600 dark:text-zinc-500 dark:hover:border-zinc-400 dark:hover:text-zinc-300"
          >
            i
          </button>
        </>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          {...handlers}
          className={`cursor-help border-b border-dotted border-zinc-400 text-left underline-offset-2 hover:border-zinc-600 focus:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-bombers-blue/50 dark:border-zinc-500 dark:hover:border-zinc-300 ${className}`}
        >
          {children}
        </button>
      )}
      {open && (
        <span
          role="tooltip"
          id={id}
          ref={tipRef}
          style={{
            position: "fixed",
            top: pos?.top ?? -9999,
            left: pos?.left ?? -9999,
            visibility: pos ? "visible" : "hidden",
          }}
          className="z-50 w-60 max-w-[calc(100vw-1rem)] rounded-lg border border-zinc-200 bg-white p-2.5 text-xs font-normal normal-case leading-snug tracking-normal text-zinc-600 shadow-lg dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
        >
          {text}
        </span>
      )}
    </span>
  );
}

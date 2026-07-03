"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NavSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (term) router.push(`/search?q=${encodeURIComponent(term)}`);
  }

  return (
    <form onSubmit={onSubmit} className="ml-auto">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search players…"
        className="w-36 rounded-md border border-white/20 bg-white/10 px-2 py-1 text-sm text-white placeholder:text-zinc-400 focus:w-48 focus:outline-none focus:ring-1 focus:ring-white/40"
      />
    </form>
  );
}

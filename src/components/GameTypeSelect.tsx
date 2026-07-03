"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

/** Regular / Playoffs toggle that updates the `?gt=` query param in place. */
export function GameTypeSelect({ selected }: { selected: 2 | 3 }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("gt", e.target.value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-zinc-500">Type</span>
      <select
        value={selected}
        onChange={onChange}
        className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm font-medium dark:border-zinc-700 dark:bg-zinc-900"
      >
        <option value={2}>Regular season</option>
        <option value={3}>Playoffs</option>
      </select>
    </label>
  );
}

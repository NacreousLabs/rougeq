"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SEASONS, formatSeason } from "@/lib/seasons";

/** Season dropdown that updates the `?season=` query param in place.
 *  Optionally restrict to a subset of seasons (e.g. those a player actually played). */
export function SeasonSelect({
  selected,
  seasons = SEASONS,
}: {
  selected: number;
  seasons?: number[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("season", e.target.value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-zinc-500">Season</span>
      <select
        value={selected}
        onChange={onChange}
        className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm font-medium dark:border-zinc-700 dark:bg-zinc-900"
      >
        {seasons.map((s) => (
          <option key={s} value={s}>
            {formatSeason(s)}
          </option>
        ))}
      </select>
    </label>
  );
}

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type CompareOption = { id: string | number; name: string; position?: string };

function Picker({
  param,
  value,
  options,
  label,
}: {
  param: string;
  value: string | number | null;
  options: CompareOption[];
  label: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(param, e.target.value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <label className="flex flex-1 flex-col gap-1 text-sm">
      <span className="text-xs uppercase tracking-wide text-zinc-400">{label}</span>
      <select
        value={value ?? ""}
        onChange={onChange}
        className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm font-medium dark:border-zinc-700 dark:bg-zinc-900"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
            {o.position ? ` (${o.position})` : ""}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CompareControls({
  options,
  a,
  b,
}: {
  options: CompareOption[];
  a: string | number | null;
  b: string | number | null;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <Picker param="a" value={a} options={options} label="Player A" />
      <span className="hidden self-center pb-2 text-sm text-zinc-400 sm:block">vs</span>
      <Picker param="b" value={b} options={options} label="Player B" />
    </div>
  );
}

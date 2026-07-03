// Shared "tale of the tape" — two columns of percentile chips aligned by metric.
// Used by both player and team comparison.

export type TaleSide = { display: string; percentile: number };
export type TaleItem = { group: string; label: string; a: TaleSide; b: TaleSide };

function pctColor(p: number): string {
  return `hsl(${Math.max(0, Math.min(100, p)) * 1.2}, 62%, 45%)`;
}

function Chip({ side, win }: { side: TaleSide; win: boolean }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className={`tabular-nums ${win ? "font-bold" : ""}`}>{side.display}</span>
      <span
        className="rounded px-1.5 py-0.5 text-xs font-bold tabular-nums text-white"
        style={{ background: pctColor(side.percentile) }}
        title={`${side.percentile}th percentile`}
      >
        {side.percentile}
      </span>
    </div>
  );
}

export function CompareTale({ rows }: { rows: TaleItem[] }) {
  const groups = [...new Set(rows.map((r) => r.group))];
  return (
    <div className="mt-8 space-y-6">
      {groups.map((g) => (
        <section key={g}>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">{g}</h2>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {rows
              .filter((r) => r.group === g)
              .map((r) => (
                <div
                  key={r.label}
                  className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-2 text-sm"
                >
                  <div className="flex justify-end">
                    <Chip side={r.a} win={r.a.percentile > r.b.percentile} />
                  </div>
                  <div className="w-28 text-center text-xs text-zinc-400">{r.label}</div>
                  <div className="flex justify-start">
                    <Chip side={r.b} win={r.b.percentile > r.a.percentile} />
                  </div>
                </div>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}

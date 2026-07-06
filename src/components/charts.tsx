// Dependency-free, server-rendered SVG charts.

import { InfoTip } from "@/components/InfoTip";

/** Ordinal suffix: 1 -> "1st", 22 -> "22nd", 13 -> "13th". */
function ordinal(n: number): string {
  const v = Math.abs(n) % 100;
  const suffix = v >= 11 && v <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] ?? "th";
  return `${n}${suffix}`;
}

/** A labelled percentile bar: length, colour, and the league-average marker all share one
 *  0..100 percentile scale (further right / greener = better than more of the league). */
export function RankBar({
  label,
  value,
  rank,
  total,
  percentile,
  avgPercentile,
  explain,
  leagueAvg,
}: {
  label: string;
  value: string;
  rank: number;
  total: number;
  percentile: number; // 0..100, share of league this team beats
  avgPercentile?: number; // 0..100 position of the league average
  explain?: string;
  leagueAvg?: string;
}) {
  const p = Math.max(0, Math.min(100, Math.round(percentile)));
  const hue = p * 1.2; // 0 = red, 120 = green
  const color = `hsl(${hue}, 62%, 45%)`;
  const avg = avgPercentile != null ? Math.max(0, Math.min(100, avgPercentile)) : null;

  return (
    <div className="py-2">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        {explain ? (
          <InfoTip text={explain} label={label} className="text-sm font-medium">
            {label}
          </InfoTip>
        ) : (
          <span className="text-sm font-medium">{label}</span>
        )}
        <span className="flex items-baseline gap-2">
          <span className="font-display text-base font-semibold tabular-nums">{value}</span>
          <span className="text-xs text-zinc-400 tabular-nums">
            {ordinal(rank)} of {total}
          </span>
        </span>
      </div>
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div className="h-full rounded-full" style={{ width: `${Math.max(2, p)}%`, background: color }} />
        {avg != null && (
          <div
            className="absolute top-0 h-full w-0.5 -translate-x-1/2 bg-zinc-600/80 dark:bg-zinc-200/80"
            style={{ left: `${avg}%` }}
            title={leagueAvg != null ? `league average (${leagueAvg})` : "league average"}
          />
        )}
      </div>
      <div className="mt-1 flex items-baseline justify-between text-[11px] leading-none">
        <span className="font-display font-semibold tabular-nums" style={{ color }}>
          {ordinal(p)} percentile
        </span>
        {leagueAvg != null && (
          <span className="text-zinc-400 tabular-nums">lg avg {leagueAvg}</span>
        )}
      </div>
    </div>
  );
}

const defaultFmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

/** Evenly spaced y-axis tick values from min..max (inclusive). */
function ticks(min: number, max: number, count = 4): number[] {
  const out: number[] = [];
  for (let i = 0; i < count; i++) out.push(min + ((max - min) * i) / (count - 1));
  return out;
}

/** Line chart with axis gridlines, value labels, point markers (hover for value), and an end label. */
export function LineChart({
  data,
  height = 180,
  color = "#55ABC9",
  fill = "rgba(85,171,201,0.15)",
  format = defaultFmt,
  zeroBaseline = true,
  xLabels,
  xTicks,
}: {
  data: number[];
  height?: number;
  color?: string;
  fill?: string;
  format?: (n: number) => string;
  zeroBaseline?: boolean; // anchor the y-axis at 0 (good for cumulative totals)
  xLabels?: string[]; // optional per-point labels (used in hover tooltips)
  xTicks?: { i: number; label: string }[]; // optional labelled x-axis ticks
}) {
  const width = 640;
  const padL = 40, padR = 16, padT = 12;
  const padB = xTicks && xTicks.length ? 26 : 14;
  if (data.length === 0) return <p className="text-sm text-zinc-400">No data.</p>;
  const rawMax = Math.max(...data);
  const rawMin = Math.min(...data);
  const max = zeroBaseline ? Math.max(rawMax, 1) : rawMax + (rawMax - rawMin) * 0.08;
  const min = zeroBaseline ? Math.min(rawMin, 0) : rawMin - (rawMax - rawMin) * 0.08;
  const range = max - min || 1;
  const stepX = data.length > 1 ? (width - padL - padR) / (data.length - 1) : 0;
  const x = (i: number) => padL + i * stepX;
  const y = (v: number) => padT + (height - padT - padB) * (1 - (v - min) / range);

  const line = data.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${x(0)},${y(min)} ${line} ${x(data.length - 1).toFixed(1)},${y(min)}`;
  const lastX = x(data.length - 1);
  const lastY = y(data[data.length - 1]);
  const showDots = data.length <= 32;
  const yTicks = ticks(min, max, 4);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img">
      {/* gridlines + y-axis labels */}
      {yTicks.map((t, i) => (
        <g key={i}>
          <line
            x1={padL}
            x2={width - padR}
            y1={y(t)}
            y2={y(t)}
            className="stroke-zinc-200 dark:stroke-zinc-800"
            strokeWidth={1}
          />
          <text x={padL - 6} y={y(t) + 3} textAnchor="end" className="fill-zinc-400" fontSize={11}>
            {format(t)}
          </text>
        </g>
      ))}
      {/* x-axis month ticks */}
      {xTicks?.map((t) => (
        <g key={`x${t.i}`}>
          <line
            x1={x(t.i)}
            x2={x(t.i)}
            y1={padT}
            y2={height - padB}
            className="stroke-zinc-200/70 dark:stroke-zinc-800/70"
            strokeWidth={1}
          />
          <text x={x(t.i)} y={height - 2} textAnchor="middle" className="fill-zinc-400" fontSize={10}>
            {t.label}
          </text>
        </g>
      ))}
      <polygon points={area} fill={fill} />
      <polyline points={line} fill="none" stroke={color} strokeWidth={2.5} />
      {showDots &&
        data.map((v, i) => (
          <circle key={i} cx={x(i)} cy={y(v)} r={2.6} fill={color}>
            {!xLabels && <title>{format(v)}</title>}
          </circle>
        ))}
      {/* invisible hover targets so per-game context works all season, not just when dots show */}
      {xLabels &&
        data.map((v, i) => (
          <circle key={`hit${i}`} cx={x(i)} cy={y(v)} r={6} fill="transparent">
            <title>{`${xLabels[i]}: ${format(v)}`}</title>
          </circle>
        ))}
      <circle cx={lastX} cy={lastY} r={4} fill={color} stroke="#fff" strokeWidth={1.2} />
      <text x={lastX - 4} y={lastY - 8} textAnchor="end" className="fill-zinc-600 dark:fill-zinc-300" fontSize={12} fontWeight={700}>
        {format(data[data.length - 1])}
      </text>
    </svg>
  );
}

/** A MoneyPuck-style percentile bar: filled to the percentile, colored red→green. */
export function PercentileBar({
  label,
  value,
  percentile,
  explain,
}: {
  label: string;
  value: string;
  percentile: number; // 0..100
  explain?: string;
}) {
  const p = Math.round(Math.max(0, Math.min(100, percentile)));
  const hue = p * 1.2; // 0 = red, 120 = green
  const color = `hsl(${hue}, 62%, 45%)`;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="w-32 shrink-0 text-sm">
        {explain ? (
          <InfoTip text={explain} label={label}>
            {label}
          </InfoTip>
        ) : (
          label
        )}
      </span>
      <span className="w-12 shrink-0 text-right text-sm font-semibold tabular-nums">{value}</span>
      <div className="relative h-4 flex-1 overflow-hidden rounded bg-zinc-100 dark:bg-zinc-800">
        <div className="h-full rounded" style={{ width: `${p}%`, background: color }} />
      </div>
      <span
        className="w-8 shrink-0 text-right text-sm font-bold tabular-nums"
        style={{ color }}
        title={`${p}th percentile`}
      >
        {p}
      </span>
    </div>
  );
}

/** Multiple overlaid line series sharing one Y scale (e.g. goals for vs against). */
export function MultiLineChart({
  series,
  height = 190,
  format = defaultFmt,
  xTicks,
  pointLabels,
}: {
  series: { data: number[]; color: string; label: string; dashed?: boolean }[];
  height?: number;
  format?: (n: number) => string;
  xTicks?: { i: number; label: string }[]; // optional labelled x-axis ticks
  pointLabels?: string[]; // optional per-point labels (used in hover tooltips)
}) {
  const width = 640;
  const padL = 40, padR = 30, padT = 12;
  const padB = xTicks && xTicks.length ? 26 : 14;
  const all = series.flatMap((s) => s.data);
  if (all.length === 0) return <p className="text-sm text-zinc-400">No data.</p>;
  const max = Math.max(...all, 1);
  const min = Math.min(...all, 0);
  const range = max - min || 1;
  const len = Math.max(...series.map((s) => s.data.length));
  const stepX = len > 1 ? (width - padL - padR) / (len - 1) : 0;
  const x = (i: number) => padL + i * stepX;
  const y = (v: number) => padT + (height - padT - padB) * (1 - (v - min) / range);
  const yTicks = ticks(min, max, 4);
  const showDots = len <= 32;
  const tip = (s: { label: string }, v: number, i: number) =>
    pointLabels?.[i] ? `${pointLabels[i]} — ${s.label}: ${format(v)}` : `${s.label}: ${format(v)}`;

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img">
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={padL} x2={width - padR} y1={y(t)} y2={y(t)} className="stroke-zinc-200 dark:stroke-zinc-800" strokeWidth={1} />
            <text x={padL - 6} y={y(t) + 3} textAnchor="end" className="fill-zinc-400" fontSize={11}>
              {format(t)}
            </text>
          </g>
        ))}
        {xTicks?.map((t) => (
          <g key={`x${t.i}`}>
            <line x1={x(t.i)} x2={x(t.i)} y1={padT} y2={height - padB} className="stroke-zinc-200/70 dark:stroke-zinc-800/70" strokeWidth={1} />
            <text x={x(t.i)} y={height - 2} textAnchor="middle" className="fill-zinc-400" fontSize={10}>
              {t.label}
            </text>
          </g>
        ))}
        {series.map((s, si) => {
          const last = s.data[s.data.length - 1];
          return (
            <g key={si}>
              <polyline
                points={s.data.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ")}
                fill="none"
                stroke={s.color}
                strokeWidth={2.5}
                strokeDasharray={s.dashed ? "5 4" : undefined}
                opacity={s.dashed ? 0.7 : 1}
              />
              {!s.dashed && showDots && s.data.map((v, i) => (
                <circle key={i} cx={x(i)} cy={y(v)} r={2.4} fill={s.color}>
                  {!pointLabels && <title>{`${s.label}: ${format(v)}`}</title>}
                </circle>
              ))}
              {!s.dashed && pointLabels && s.data.map((v, i) => (
                <circle key={`hit${i}`} cx={x(i)} cy={y(v)} r={5} fill="transparent">
                  <title>{tip(s, v, i)}</title>
                </circle>
              ))}
              {!s.dashed && last != null && (
                <>
                  <circle cx={x(s.data.length - 1)} cy={y(last)} r={3.4} fill={s.color} stroke="#fff" strokeWidth={1} />
                  <text x={x(s.data.length - 1) + 5} y={y(last) + 4} className="fill-zinc-600 dark:fill-zinc-300" fontSize={11} fontWeight={700}>
                    {format(last)}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex flex-wrap gap-4 text-xs">
        {series.map((s) => (
          <span key={s.label} className="flex items-center gap-1.5">
            {s.dashed ? (
              <span
                className="inline-block h-0 w-3 border-t-2 border-dashed"
                style={{ borderColor: s.color }}
              />
            ) : (
              <span className="inline-block h-2 w-3 rounded-sm" style={{ background: s.color }} />
            )}
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Vertical bars, e.g. points-per-game over recent games. Shows a max gridline, baseline,
 *  hover values, and per-bar value labels when the series is short enough to fit. */
export function BarChart({
  data,
  height = 150,
  color = "#55ABC9",
  format = defaultFmt,
  labels,
}: {
  data: { value: number; highlight?: boolean }[];
  height?: number;
  color?: string;
  format?: (n: number) => string;
  labels?: string[]; // optional per-bar labels (hover tooltips)
}) {
  const width = 640;
  const padL = 30, padR = 10, padT = 14, padB = 12;
  if (data.length === 0) return <p className="text-sm text-zinc-400">No data.</p>;
  const max = Math.max(...data.map((d) => d.value), 1);
  const plotH = height - padT - padB;
  const slot = (width - padL - padR) / data.length;
  const barW = Math.max(1, slot * 0.68);
  const baseY = height - padB;
  const showValues = data.length <= 16;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img">
      {/* max + midpoint gridlines with labels */}
      {[max, max / 2].map((t, i) => {
        const gy = baseY - (t / max) * plotH;
        return (
          <g key={i}>
            <line x1={padL} x2={width - padR} y1={gy} y2={gy} className="stroke-zinc-200 dark:stroke-zinc-800" strokeWidth={1} />
            <text x={padL - 5} y={gy + 3} textAnchor="end" className="fill-zinc-400" fontSize={11}>
              {format(t)}
            </text>
          </g>
        );
      })}
      <line x1={padL} x2={width - padR} y1={baseY} y2={baseY} className="stroke-zinc-300 dark:stroke-zinc-700" strokeWidth={1} />
      {data.map((d, i) => {
        const h = (d.value / max) * plotH;
        const cx = padL + i * slot + (slot - barW) / 2;
        const topY = baseY - Math.max(0, h);
        return (
          <g key={i}>
            <rect x={cx} y={topY} width={barW} height={Math.max(0, h)} rx={1.5} fill={d.highlight ? "#facc15" : color} opacity={d.highlight ? 1 : 0.85}>
              <title>{labels?.[i] ? `${labels[i]}: ${format(d.value)}` : format(d.value)}</title>
            </rect>
            {showValues && d.value > 0 && (
              <text x={cx + barW / 2} y={topY - 3} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400" fontSize={11} fontWeight={d.highlight ? 700 : 400}>
                {format(d.value)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** A two-sided comparison bar (home vs away) for a single game stat. */
export function SplitBar({
  label,
  left,
  right,
}: {
  label: string;
  left: number;
  right: number;
}) {
  const total = left + right || 1;
  const leftPct = (left / total) * 100;
  const leftWins = left > right;
  const rightWins = right > left;
  return (
    <div className="py-2">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className={`font-bold tabular-nums ${leftWins ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
          {left}
        </span>
        <span className="text-zinc-400 uppercase tracking-wide">{label}</span>
        <span className={`font-bold tabular-nums ${rightWins ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
          {right}
        </span>
      </div>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div className="h-full bg-rouge dark:bg-bombers-gold" style={{ width: `${leftPct}%` }} />
        <div className="h-full bg-zinc-300 dark:bg-zinc-600" style={{ width: `${100 - leftPct}%` }} />
      </div>
    </div>
  );
}

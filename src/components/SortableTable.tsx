"use client";

import { useState } from "react";

export type ColumnDef = {
  label: string;
  numeric?: boolean;
};

export type Cell = {
  /** value used for sorting */
  v: number | string;
  /** rendered cell content (a string or a React element) */
  d: React.ReactNode;
};

export type TableRow = {
  key: string | number;
  cells: Cell[]; // aligned by index with `columns`
};

/** A client-side sortable table. Props are fully serializable (no function props),
 *  so it can be rendered from a server component. */
export function SortableTable({
  columns,
  rows,
  initialSortIndex,
}: {
  columns: ColumnDef[];
  rows: TableRow[];
  initialSortIndex: number;
}) {
  const [sortIndex, setSortIndex] = useState(initialSortIndex);
  const [desc, setDesc] = useState(true);

  const sorted = [...rows].sort((a, b) => {
    const av = a.cells[sortIndex]?.v;
    const bv = b.cells[sortIndex]?.v;
    if (typeof av === "number" && typeof bv === "number") return desc ? bv - av : av - bv;
    return desc ? String(bv).localeCompare(String(av)) : String(av).localeCompare(String(bv));
  });

  function toggle(i: number) {
    if (i === sortIndex) {
      setDesc((d) => !d);
    } else {
      setSortIndex(i);
      setDesc(!!columns[i].numeric); // numbers default high→low, text low→high
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="stat-table">
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th
                key={i}
                onClick={() => toggle(i)}
                className={`cursor-pointer select-none hover:text-rouge dark:hover:text-bombers-gold ${
                  c.numeric ? "text-right" : "text-left"
                } ${i === sortIndex ? "text-rouge dark:text-bombers-gold" : ""}`}
              >
                {c.label}
                {i === sortIndex ? (desc ? " ↓" : " ↑") : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={row.key}>
              {row.cells.map((cell, i) => (
                <td key={i} className={columns[i].numeric ? "text-right tabular-nums" : ""}>
                  {cell.d}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

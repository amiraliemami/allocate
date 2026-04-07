"use client";

import { memo, useState } from "react";

const CELL_WIDTH = 56;

interface Props {
  fraction: number | undefined;
  isMonthStart?: boolean;
  onEdit: (value: number | null) => void;
}

function AllocationCellInner({ fraction, isMonthStart, onEdit }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const displayValue =
    fraction != null
      ? (fraction / 100).toFixed(fraction % 10 === 0 ? 1 : 2)
      : "";

  const borderClass = isMonthStart
    ? "border-l-2 border-l-zinc-300"
    : "border-l border-l-zinc-200";

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed === "" || trimmed === "0") {
      if (fraction != null) onEdit(null);
      return;
    }
    const parsed = parseFloat(trimmed);
    if (isNaN(parsed) || parsed < 0) return;
    const intVal = Math.round(parsed * 100);
    if (intVal !== fraction) onEdit(intVal);
  };

  if (editing) {
    return (
      <div
        style={{ width: CELL_WIDTH, minWidth: CELL_WIDTH }}
        className={`flex items-center justify-center h-full box-border ${borderClass}`}
      >
        <input
          className="w-full h-full text-center text-sm bg-white outline-none border-2 border-violet-400 rounded px-0.5"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") setEditing(false);
          }}
          autoFocus
        />
      </div>
    );
  }

  return (
    <div
      style={{ width: CELL_WIDTH, minWidth: CELL_WIDTH }}
      className={`flex items-center justify-center text-sm cursor-pointer select-none transition-colors hover:bg-violet-100/60 h-full border-b border-b-zinc-200 box-border ${borderClass}`}
      onClick={() => {
        setDraft(displayValue);
        setEditing(true);
      }}
    >
      {displayValue}
    </div>
  );
}

const AllocationCell = memo(AllocationCellInner);
export default AllocationCell;

"use client";

import { useState, useRef } from "react";
import ChunkyCalendar from "./ChunkyCalendar";

interface Props {
  value: string | null;
  onSave: (value: string | null) => void;
  disabled?: boolean;
}

export default function InlineDate({ value, onSave, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const dateStr = value ? value.slice(0, 10) : "";

  // Format for display: "Apr 9, 2026"
  const displayStr = dateStr
    ? new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div ref={anchorRef}>
      <div
        className={`cell-editable flex items-center px-3 py-2 text-sm min-h-[36px] overflow-hidden ${disabled ? "opacity-40 pointer-events-none" : "cursor-pointer"}`}
        onClick={() => !disabled && setOpen(true)}
      >
        <span className="truncate">
          {displayStr || <span className="text-zinc-300 italic">—</span>}
        </span>
      </div>
      {open && (
        <ChunkyCalendar
          value={dateStr}
          onChange={(v) => onSave(v || null)}
          onClose={() => setOpen(false)}
          anchorRef={anchorRef}
        />
      )}
    </div>
  );
}

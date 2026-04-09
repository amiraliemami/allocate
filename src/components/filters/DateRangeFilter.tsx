"use client";

import { useState } from "react";
import ChunkyCalendar from "../ChunkyCalendar";

interface Props {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}

function formatDate(d: string) {
  if (!d) return "";
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function DateRangeFilter({ from, to, onChange }: Props) {
  const [openField, setOpenField] = useState<"from" | "to" | null>(null);
  const hasValue = from || to;

  return (
    <div className="flex flex-col gap-2">
      <label className="flex flex-col gap-1 text-xs font-medium text-zinc-500">
        From
        <div className="relative">
          <button
            type="button"
            className={`w-full text-left rounded-md border-2 bg-white px-2.5 py-1.5 text-sm ${openField === "from" ? "border-violet-500" : "border-zinc-300"}`}
            onClick={() => setOpenField(openField === "from" ? null : "from")}
          >
            {formatDate(from) || <span className="text-zinc-400">Pick date...</span>}
          </button>
          {openField === "from" && (
            <ChunkyCalendar
              value={from}
              onChange={(v) => { onChange(v, to); setOpenField(null); }}
              onClose={() => setOpenField(null)}
            />
          )}
        </div>
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-zinc-500">
        To
        <div className="relative">
          <button
            type="button"
            className={`w-full text-left rounded-md border-2 bg-white px-2.5 py-1.5 text-sm ${openField === "to" ? "border-violet-500" : "border-zinc-300"}`}
            onClick={() => setOpenField(openField === "to" ? null : "to")}
          >
            {formatDate(to) || <span className="text-zinc-400">Pick date...</span>}
          </button>
          {openField === "to" && (
            <ChunkyCalendar
              value={to}
              onChange={(v) => { onChange(from, v); setOpenField(null); }}
              onClose={() => setOpenField(null)}
            />
          )}
        </div>
      </label>
      {hasValue && (
        <button
          onClick={() => onChange("", "")}
          className="self-end text-xs text-violet-600 font-medium hover:underline"
        >
          Clear
        </button>
      )}
    </div>
  );
}

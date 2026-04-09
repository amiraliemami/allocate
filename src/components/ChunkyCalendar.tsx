"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function getMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  // Monday = 0, Sunday = 6
  let startDay = first.getDay() - 1;
  if (startDay < 0) startDay = 6;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  // Pad to complete the last week
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

interface Props {
  value: string; // YYYY-MM-DD or ""
  onChange: (value: string) => void;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLElement | null>;
  allowClear?: boolean;
}

export default function ChunkyCalendar({ value, onChange, onClose, anchorRef, allowClear = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const parsed = value ? new Date(value + "T00:00:00") : null;
  const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? new Date().getMonth());
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  // Measure actual calendar height after render, then position
  useLayoutEffect(() => {
    if (!anchorRef?.current || !ref.current) return;
    const anchorRect = anchorRef.current.getBoundingClientRect();
    const calRect = ref.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - anchorRect.bottom;
    if (spaceBelow < calRect.height + 16 && anchorRect.top > calRect.height + 16) {
      setPos({ top: anchorRect.top - calRect.height - 16, left: anchorRect.left });
    } else {
      setPos({ top: anchorRect.bottom + 4, left: anchorRect.left });
    }
  }, [anchorRef]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  const cells = getMonthGrid(viewYear, viewMonth);
  const todayStr = toDateStr(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const select = (day: number) => {
    onChange(toDateStr(viewYear, viewMonth, day));
    onClose();
  };

  const calendar = (
    <div
      ref={ref}
      className="filter-popover bg-white border-2 border-zinc-900 rounded-lg shadow-[3px_4px_0_#1a1a1a] p-3 select-none"
      style={anchorRef
        ? pos
          ? { position: "fixed", zIndex: 9999, width: 280, top: pos.top, left: pos.left }
          : { position: "fixed", zIndex: 9999, width: 280, visibility: "hidden" as const }
        : { position: "absolute", zIndex: 50, width: 280 }
      }
    >
      {/* Header: nav + month/year */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewYear((y) => y - 1)}
            className="btn-chunky flex items-center justify-center w-6 h-7 rounded-md bg-zinc-100"
          >
            <ChevronsLeft size={14} strokeWidth={3} />
          </button>
          <button
            onClick={prevMonth}
            className="btn-chunky flex items-center justify-center w-7 h-7 rounded-md bg-zinc-100"
          >
            <ChevronLeft size={14} strokeWidth={3} />
          </button>
        </div>
        <span className="text-sm font-bold text-zinc-900">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={nextMonth}
            className="btn-chunky flex items-center justify-center w-7 h-7 rounded-md bg-zinc-100"
          >
            <ChevronRight size={14} strokeWidth={3} />
          </button>
          <button
            onClick={() => setViewYear((y) => y + 1)}
            className="btn-chunky flex items-center justify-center w-6 h-7 rounded-md bg-zinc-100"
          >
            <ChevronsRight size={14} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-xs font-bold text-zinc-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const ds = toDateStr(viewYear, viewMonth, day);
          const isSelected = ds === value;
          const isToday = ds === todayStr;
          return (
            <button
              key={i}
              onClick={() => select(day)}
              className={`relative text-sm font-medium h-8 rounded-md transition-all
                ${isSelected
                  ? "bg-violet-600 text-white border-2 border-zinc-900 shadow-[1px_2px_0_#1a1a1a]"
                  : isToday
                    ? "bg-violet-100 text-violet-800 border border-violet-300 hover:bg-violet-200"
                    : "text-zinc-700 hover:bg-zinc-100 border border-transparent"
                }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      {allowClear && value && (
        <div className="flex items-center justify-end mt-2 pt-2 border-t border-zinc-200">
          <button
            onClick={() => { onChange(""); onClose(); }}
            className="btn-chunky rounded-md px-3 py-1 text-xs font-bold bg-red-500 text-white"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );

  if (anchorRef) {
    return createPortal(calendar, document.body);
  }
  return calendar;
}

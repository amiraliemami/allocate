"use client";

import { MonthGroup } from "@/lib/dateUtils";
import { isCurrentWeek, formatWeekLabel } from "@/lib/dateUtils";

const LEFT_PANEL_WIDTH = 280;
const CELL_WIDTH = 56;

interface Props {
  monthGroups: MonthGroup[];
}

function formatMonthLabel(month: MonthGroup): string {
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  if (month.month === 0) return `${names[month.month]} ${month.year}`;
  return names[month.month];
}

export default function DateHeader({ monthGroups }: Props) {
  return (
    <div className="sticky top-0 z-20 flex bg-white">
      {/* Corner spacer — sticky both top and left */}
      <div
        className="sticky left-0 z-30 bg-white shrink-0 border-r border-zinc-200"
        style={{ width: LEFT_PANEL_WIDTH, minWidth: LEFT_PANEL_WIDTH }}
      />

      {/* Month groupings + week labels */}
      <div className="flex">
        {monthGroups.map((month) => (
          <div key={month.label} className="border-l-2 border-zinc-400">
            {/* Month name — left aligned */}
            <div
              className="text-sm font-bold text-left px-2 py-1.5"
              style={{ width: month.weeks.length * CELL_WIDTH }}
            >
              {formatMonthLabel(month)}
            </div>
            {/* Week day numbers */}
            <div className="flex">
              {month.weeks.map((ws) => (
                <div
                  key={ws}
                  className={`text-sm text-center py-1.5 border-l border-zinc-300 first:border-l-0 ${
                    isCurrentWeek(ws)
                      ? "bg-amber-200 font-bold text-amber-900 rounded-t"
                      : "text-zinc-700"
                  }`}
                  style={{ width: CELL_WIDTH }}
                >
                  {formatWeekLabel(ws)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

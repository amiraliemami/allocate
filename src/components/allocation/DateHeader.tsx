"use client";

import { MonthGroup } from "@/lib/dateUtils";
import { isCurrentWeek, formatWeekLabel } from "@/lib/dateUtils";
import { PROJECT_INFO_WIDTH, TEAMMATE_NAME_WIDTH } from "./ProjectSection";

const LEFT_PANEL_WIDTH = PROJECT_INFO_WIDTH + TEAMMATE_NAME_WIDTH;
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
      {/* Corner spacer — sticky both top and left. This is where the project filter controls will go later. */}
      <div
        className="sticky left-0 z-30 bg-white shrink-0 border-r-2 border-zinc-400"
        style={{ width: LEFT_PANEL_WIDTH, minWidth: LEFT_PANEL_WIDTH }}
      />

      {/* Month groupings + week labels */}
      <div className="flex">
        {monthGroups.map((month) => (
          <div key={month.label}>
            {/* Month name — left aligned, spans all weeks */}
            <div
              className="text-sm font-bold text-left px-2 py-1.5 border-l-2 border-zinc-300"
              style={{ width: month.weeks.length * CELL_WIDTH }}
            >
              {formatMonthLabel(month)}
            </div>
            {/* Week day numbers — matching the exact border pattern of rows */}
            <div className="flex">
              {month.weeks.map((ws, wi) => (
                <div
                  key={ws}
                  className={`text-sm text-center py-1.5 box-border border-b-2 border-b-zinc-400 ${
                    wi === 0 ? "border-l-2 border-l-zinc-300" : "border-l border-l-zinc-200"
                  } ${
                    isCurrentWeek(ws)
                      ? "bg-amber-200 font-bold text-amber-900"
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

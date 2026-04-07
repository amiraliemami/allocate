"use client";

import { useState } from "react";
import { MonthGroup } from "@/lib/dateUtils";
import { isCurrentWeek, formatWeekLabel } from "@/lib/dateUtils";
import { PROJECT_INFO_WIDTH, TEAMMATE_NAME_WIDTH } from "./ProjectSection";
import type { AllocationFilters } from "./AllocationView";
import type { Project } from "@/components/ProjectsSidebar";
import type { Teammate } from "@/components/TeammatesSidebar";
import { STATUS_ORDER } from "@/lib/statusColors";
import { TEAMMATE_STATUS_ORDER } from "@/lib/teammateStatusColors";
import ColumnFilterPopover from "@/components/ColumnFilterPopover";
import MultiSelectFilter from "@/components/filters/MultiSelectFilter";

const LEFT_PANEL_WIDTH = PROJECT_INFO_WIDTH + TEAMMATE_NAME_WIDTH;
const CELL_WIDTH = 56;

interface Props {
  monthGroups: MonthGroup[];
  filters: AllocationFilters;
  onFilterChange: <K extends keyof AllocationFilters>(
    key: K,
    value: AllocationFilters[K]
  ) => void;
  projects: Project[];
  teammates: Teammate[];
}

function formatMonthLabel(month: MonthGroup): string {
  const names = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  if (month.month === 0) return `${names[month.month]} ${month.year}`;
  return names[month.month];
}

type FilterDef = {
  key: keyof AllocationFilters;
  label: string;
  options: { value: string; label: string }[];
  searchable?: boolean;
};

export default function DateHeader({
  monthGroups,
  filters,
  onFilterChange,
  projects,
  teammates,
}: Props) {
  const [openFilter, setOpenFilter] = useState<string | null>(null);

  const filterDefs: FilterDef[] = [
    {
      key: "projectStatus",
      label: "Status",
      options: STATUS_ORDER.map((s) => ({ value: s, label: s })),
    },
    {
      key: "projectLeadId",
      label: "Lead",
      options: Object.values(
        Object.fromEntries(
          projects
            .filter((p) => p.lead)
            .map((p) => [p.lead!.id, { value: p.lead!.id, label: p.lead!.name }])
        )
      ).sort((a, b) => a.label.localeCompare(b.label)),
      searchable: true,
    },
    {
      key: "teammateId",
      label: "Team",
      options: teammates
        .map((t) => ({ value: t.id, label: t.name }))
        .sort((a, b) => a.label.localeCompare(b.label)),
      searchable: true,
    },
    {
      key: "teammateStatus",
      label: "Show Alumni",
      options: TEAMMATE_STATUS_ORDER.map((s) => ({ value: s, label: s })),
    },
  ];

  function getChipLabel(def: FilterDef): string | null {
    const selected = filters[def.key];
    if (selected.size === 0) return null;
    const labels = def.options
      .filter((o) => selected.has(o.value))
      .map((o) => o.label);
    return labels.join(", ");
  }

  return (
    <div className="sticky top-0 z-20 flex bg-white">
      {/* Corner — filter chips */}
      <div
        className="sticky left-0 z-30 bg-white shrink-0 border-r-2 border-zinc-400 px-2 pb-2"
        style={{ width: LEFT_PANEL_WIDTH, minWidth: LEFT_PANEL_WIDTH }}
      >
        <div className="text-sm font-medium text-zinc-500 mb-1">Filters:</div>
        <div className="flex flex-wrap gap-1.5">
          {filterDefs.map((def) => {
            const activeLabel = getChipLabel(def);
            const isOpen = openFilter === def.key;
            return (
              <div key={def.key} className="relative">
                <div
                  className={`flex items-center gap-1 text-xs font-bold text-zinc-800 px-2 py-1 rounded-md cursor-pointer select-none transition-colors border-2 border-zinc-900 ${activeLabel
                      ? "bg-purple-100"
                      : "bg-white hover:bg-purple-100"
                    }`}
                  style={{ boxShadow: "1px 2px 0 #1a1a1a" }}
                  onClick={() => setOpenFilter(isOpen ? null : def.key)}
                >
                  {activeLabel ? (
                    <>
                      <span className="max-w-[100px] truncate">{def.label}: {activeLabel}</span>
                      <button
                        className="hover:text-red-900 ml-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFilterChange(def.key, new Set<string>());
                        }}
                      >
                        ×
                      </button>
                    </>
                  ) : (
                    def.label
                  )}
                </div>
                {isOpen && (
                  <ColumnFilterPopover
                    onClose={() => setOpenFilter(null)}
                    align="left"
                  >
                    <MultiSelectFilter
                      options={def.options}
                      selected={filters[def.key]}
                      onChange={(v) => onFilterChange(def.key, v)}
                      searchable={def.searchable}
                    />
                  </ColumnFilterPopover>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Month groupings + week labels */}
      <div className="flex">
        {monthGroups.map((month) => (
          <div key={month.label}>
            <div
              className="text-sm font-bold text-left px-2 py-1.5 border-l-2 border-zinc-300"
              style={{ width: month.weeks.length * CELL_WIDTH }}
            >
              {formatMonthLabel(month)}
            </div>
            <div className="flex">
              {month.weeks.map((ws, wi) => (
                <div
                  key={ws}
                  className={`text-sm text-center py-1.5 box-border border-b-2 border-b-zinc-400 ${wi === 0
                      ? "border-l-2 border-l-zinc-300"
                      : "border-l border-l-zinc-200"
                    } ${isCurrentWeek(ws)
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

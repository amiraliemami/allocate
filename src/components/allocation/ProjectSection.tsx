"use client";

import type { Project } from "@/components/ProjectsSidebar";
import type { Teammate } from "@/components/TeammatesSidebar";
import AllocationCell from "./AllocationCell";
import { isPastWeek, isCurrentWeek } from "@/lib/dateUtils";
import { STATUS_COLORS } from "@/lib/statusColors";

const PROJECT_INFO_WIDTH = 160;
const TEAMMATE_NAME_WIDTH = 100;
const LEFT_PANEL_WIDTH = PROJECT_INFO_WIDTH + TEAMMATE_NAME_WIDTH;
const ROW_HEIGHT = 34;

export type Allocation = {
  id: string;
  teammateId: string;
  projectId: string;
  weekStart: string;
  fraction: number;
  isHidden: boolean;
};

interface Props {
  project: Project;
  teammates: Teammate[];
  weekStarts: string[];
  allocationMap: Map<string, Allocation>;
  bgColor: string;
  monthBoundaries: Set<string>;
  onCellEdit: (
    projectId: string,
    teammateId: string,
    weekStart: string,
    fraction: number | null,
    existingId: string | undefined
  ) => void;
}

export default function ProjectSection({
  project,
  teammates,
  weekStarts,
  allocationMap,
  bgColor,
  monthBoundaries,
  onCellEdit,
}: Props) {
  const teammateIds = new Set<string>();
  for (const ws of weekStarts) {
    for (const t of teammates) {
      if (allocationMap.has(`${project.id}|${t.id}|${ws}`)) {
        teammateIds.add(t.id);
      }
    }
  }

  const projectTeammates = teammates.filter((t) => teammateIds.has(t.id));
  if (projectTeammates.length === 0) return null;

  const statusColors = STATUS_COLORS[project.status as keyof typeof STATUS_COLORS];

  return (
    <div className="mt-1 border-t border-zinc-200">
      {projectTeammates.map((teammate, rowIdx) => (
        <div key={teammate.id} className="flex" style={{ height: ROW_HEIGHT }}>
          {/* Sticky left panel: project info + teammate name */}
          <div
            className="sticky left-0 z-10 shrink-0 flex"
            style={{ width: LEFT_PANEL_WIDTH, minWidth: LEFT_PANEL_WIDTH }}
          >
            {/* Project info — shown on all rows, vertically top-aligned on first */}
            <div
              className="flex items-start px-3 pt-1 overflow-hidden border-r-2 border-zinc-400"
              style={{ width: PROJECT_INFO_WIDTH, backgroundColor: bgColor }}
            >
              {rowIdx === 0 && (
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-sm text-zinc-900 leading-tight">
                    {project.name}
                  </span>
                  <span className="text-[11px] text-zinc-500 leading-tight">
                    {[project.region, project.billingRate].filter(Boolean).join(", ")}
                  </span>
                  {project.lead && (
                    <span className="text-[11px] font-semibold text-violet-700 leading-tight">
                      {project.lead.name}
                    </span>
                  )}
                  {statusColors && (
                    <span className={`self-start text-[9px] font-bold px-1.5 py-0.5 rounded border mt-0.5 ${statusColors.chip}`}>
                      {project.status}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Teammate name */}
            <div
              className="flex items-center px-2 text-sm font-medium text-zinc-700 truncate border-r border-zinc-200"
              style={{ width: TEAMMATE_NAME_WIDTH, backgroundColor: bgColor }}
            >
              {teammate.name}
            </div>
          </div>

          {/* Allocation cells with month boundary lines */}
          <div className="flex" style={{ backgroundColor: bgColor }}>
            {weekStarts.map((ws) => {
              const key = `${project.id}|${teammate.id}|${ws}`;
              const alloc = allocationMap.get(key);
              const isMonthStart = monthBoundaries.has(ws);
              return (
                <div
                  key={ws}
                  className={isMonthStart ? "border-l-2 border-zinc-400" : "border-l border-zinc-100"}
                >
                  <AllocationCell
                    fraction={alloc?.fraction}
                    isPast={isPastWeek(ws)}
                    isCurrent={isCurrentWeek(ws)}
                    onEdit={(val) =>
                      onCellEdit(project.id, teammate.id, ws, val, alloc?.id)
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

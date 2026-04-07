"use client";

import type { Project } from "@/components/ProjectsSidebar";
import type { Teammate } from "@/components/TeammatesSidebar";
import AllocationCell from "./AllocationCell";
import { isPastWeek, isCurrentWeek } from "@/lib/dateUtils";
import { STATUS_COLORS } from "@/lib/statusColors";

const LEFT_PANEL_WIDTH = 280;
const PROJECT_INFO_WIDTH = 170;
const TEAMMATE_NAME_WIDTH = 110;
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
    <div className="mt-2 border-t border-zinc-200">
      {/* Project info row — top-left aligned, spans full width */}
      <div className="flex">
        <div
          className="sticky left-0 z-10 shrink-0 px-3 pt-2 pb-1"
          style={{ width: LEFT_PANEL_WIDTH, minWidth: LEFT_PANEL_WIDTH, backgroundColor: bgColor }}
        >
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-sm text-zinc-900 leading-tight">{project.name}</span>
            <span className="text-xs text-zinc-500 leading-tight">
              {[project.region, project.billingRate].filter(Boolean).join(", ")}
            </span>
            {project.lead && (
              <span className="text-xs font-semibold text-violet-700 leading-tight">
                Lead: {project.lead.name}
              </span>
            )}
            {statusColors && (
              <span className={`self-start text-[10px] font-bold px-1.5 py-0.5 rounded border mt-0.5 ${statusColors.chip}`}>
                {project.status}
              </span>
            )}
          </div>
        </div>
        {/* Empty space for the date columns area */}
        <div className="flex-1" style={{ backgroundColor: bgColor }} />
      </div>

      {/* Teammate rows */}
      {projectTeammates.map((teammate) => (
        <div key={teammate.id} className="flex" style={{ height: ROW_HEIGHT }}>
          {/* Sticky left: teammate name */}
          <div
            className="sticky left-0 z-10 shrink-0 flex"
            style={{ width: LEFT_PANEL_WIDTH, minWidth: LEFT_PANEL_WIDTH }}
          >
            {/* Project info spacer */}
            <div
              style={{ width: PROJECT_INFO_WIDTH, backgroundColor: bgColor }}
            />
            {/* Teammate name */}
            <div
              className="flex items-center px-2 text-sm font-medium text-zinc-700 truncate border-l border-zinc-200"
              style={{ width: TEAMMATE_NAME_WIDTH, backgroundColor: bgColor }}
            >
              {teammate.name}
            </div>
          </div>

          {/* Allocation cells with vertical guide lines */}
          <div className="flex" style={{ backgroundColor: bgColor }}>
            {weekStarts.map((ws) => {
              const key = `${project.id}|${teammate.id}|${ws}`;
              const alloc = allocationMap.get(key);
              return (
                <div key={ws} className="border-l border-zinc-100">
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

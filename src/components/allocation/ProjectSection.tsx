"use client";

import type { Project } from "@/components/ProjectsSidebar";
import type { Teammate } from "@/components/TeammatesSidebar";
import AllocationCell from "./AllocationCell";
import { STATUS_COLORS } from "@/lib/statusColors";

export const PROJECT_INFO_WIDTH = 200;
export const TEAMMATE_NAME_WIDTH = 90;
const ROW_HEIGHT = 30;

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
  teammateStatusFilter?: Set<string>;
  teammateIdFilter?: Set<string>;
  showProjectDetails?: boolean;
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
  teammateStatusFilter,
  teammateIdFilter,
  showProjectDetails,
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

  let projectTeammates = teammates.filter((t) => teammateIds.has(t.id));
  if (teammateStatusFilter && teammateStatusFilter.size > 0) {
    projectTeammates = projectTeammates.filter((t) => teammateStatusFilter.has(t.status));
  }
  if (teammateIdFilter && teammateIdFilter.size > 0) {
    projectTeammates = projectTeammates.filter((t) => teammateIdFilter.has(t.id));
  }
  if (projectTeammates.length === 0) return null;

  const statusColors = STATUS_COLORS[project.status as keyof typeof STATUS_COLORS];

  return (
    <div className="mt-4 border-t-2 border-zinc-200 flex">
      {/* Project info — sticky left, spans full height of this section */}
      <div
        className="sticky left-0 z-10 shrink-0 border-r border-zinc-200 px-3 py-1"
        style={{ width: PROJECT_INFO_WIDTH, minWidth: PROJECT_INFO_WIDTH, minHeight: ROW_HEIGHT, backgroundColor: "white" }}
      >
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-md text-zinc-900 leading-tight">
            {project.name}
          </span>
          {showProjectDetails && (
            <>
              <span className="text-sm text-zinc-500 leading-tight">
                {[project.region, project.billingRate].filter(Boolean).join(", ")}
              </span>
              {project.lead && (
                <span className="text-sm font-bold text-violet-700 leading-tight">
                  ★ {project.lead.name}
                </span>
              )}
              {statusColors && (
                <span className={`self-start text-sm font-bold px-2 py-0.5 rounded-md border mt-1 ${statusColors.chip}`}>
                  {project.status}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Teammate rows + allocation grid */}
      <div className="flex flex-col flex-1">
        {projectTeammates.map((teammate) => (
          <div key={teammate.id} className="flex" style={{ height: ROW_HEIGHT }}>
            {/* Teammate name — sticky, positioned right after the project info */}
            <div
              className="sticky z-10 shrink-0 flex items-center px-2 text-sm font-medium text-zinc-700 truncate border-b border-zinc-200 border-r-2 border-r-zinc-900"
              style={{ left: PROJECT_INFO_WIDTH, width: TEAMMATE_NAME_WIDTH, minWidth: TEAMMATE_NAME_WIDTH, background: "white" }}
            >
              {teammate.name}
            </div>

            {/* Allocation cells */}
            <div className="flex" style={{ backgroundColor: bgColor }}>
              {weekStarts.map((ws) => {
                const key = `${project.id}|${teammate.id}|${ws}`;
                const alloc = allocationMap.get(key);
                return (
                  <AllocationCell
                    key={ws}
                    fraction={alloc?.fraction}
                    isMonthStart={monthBoundaries.has(ws)}
                    onEdit={(val) =>
                      onCellEdit(project.id, teammate.id, ws, val, alloc?.id)
                    }
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

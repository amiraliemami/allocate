"use client";

import { useMemo, useRef, useEffect, useState, useCallback } from "react";
import type { Project } from "@/components/ProjectsSidebar";
import type { Teammate } from "@/components/TeammatesSidebar";
import type { Allocation } from "./ProjectSection";
import { groupWeeksByMonth, getCurrentMonday } from "@/lib/dateUtils";
import { getProjectBg } from "@/lib/projectColors";
import ViewToggle from "./ViewToggle";
import DateHeader from "./DateHeader";
import ProjectSection from "./ProjectSection";

const LEFT_PANEL_WIDTH = 260;
const CELL_WIDTH = 56;

export type AllocationFilters = {
  projectStatus: Set<string>;
  projectLeadId: Set<string>;
  teammateStatus: Set<string>;
  teammateId: Set<string>;
};

const DEFAULT_FILTERS: AllocationFilters = {
  projectStatus: new Set(["Active"]),
  projectLeadId: new Set(),
  teammateStatus: new Set(["Active"]), // hide alumni by default
  teammateId: new Set(),
};

interface Props {
  projects: Project[];
  teammates: Teammate[];
  allocations: Allocation[];
  weekStarts: string[];
  onCellEdit: (
    projectId: string,
    teammateId: string,
    weekStart: string,
    fraction: number | null,
    existingId: string | undefined
  ) => void;
}

export default function AllocationView({
  projects,
  teammates,
  allocations,
  weekStarts,
  onCellEdit,
}: Props) {
  const [activeView, setActiveView] = useState<"project" | "teammate">("project");
  const [filters, setFilters] = useState<AllocationFilters>({ ...DEFAULT_FILTERS });
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const updateFilter = useCallback(
    <K extends keyof AllocationFilters>(key: K, value: AllocationFilters[K]) => {
      setFilters((prev) => {
        const next = { ...prev, [key]: value };
        // If teammate filter has any alumni selected, auto-show alumni
        if (key === "teammateId" && value instanceof Set && value.size > 0) {
          const hasAlumni = teammates.some(
            (t) => (value as Set<string>).has(t.id) && t.status === "Alumni"
          );
          if (hasAlumni) {
            next.teammateStatus = new Set();
          }
        }
        return next;
      });
    },
    [teammates]
  );

  const allocationMap = useMemo(() => {
    const map = new Map<string, Allocation>();
    for (const a of allocations) {
      if (!a.isHidden) {
        map.set(`${a.projectId}|${a.teammateId}|${a.weekStart}`, a);
      }
    }
    return map;
  }, [allocations]);

  const monthGroups = useMemo(() => groupWeeksByMonth(weekStarts), [weekStarts]);

  // Set of weekStart strings that are the first week of a month (for vertical month lines)
  const monthBoundaries = useMemo(() => {
    const set = new Set<string>();
    for (const mg of monthGroups) {
      if (mg.weeks.length > 0) set.add(mg.weeks[0]);
    }
    return set;
  }, [monthGroups]);

  // Filter to projects that have allocations + match active filters
  const activeProjects = useMemo(() => {
    const projectsWithAllocations = new Set<string>();
    for (const a of allocations) {
      if (!a.isHidden) projectsWithAllocations.add(a.projectId);
    }
    return projects.filter((p) => {
      if (!projectsWithAllocations.has(p.id)) return false;
      if (filters.projectStatus.size > 0 && !filters.projectStatus.has(p.status)) return false;
      if (filters.projectLeadId.size > 0 && !filters.projectLeadId.has(p.leadId ?? "")) return false;
      return true;
    });
  }, [projects, allocations, filters.projectStatus, filters.projectLeadId]);

  const totalWidth = LEFT_PANEL_WIDTH + weekStarts.length * CELL_WIDTH;

  // Scroll to current week on mount
  useEffect(() => {
    if (!scrollRef.current || weekStarts.length === 0) return;
    const currentMonday = getCurrentMonday();
    let targetIndex = weekStarts.indexOf(currentMonday);
    if (targetIndex < 0) {
      targetIndex = weekStarts.findIndex((w) => w > currentMonday) - 1;
    }
    if (targetIndex >= 0) {
      const containerWidth = scrollRef.current.clientWidth;
      scrollRef.current.scrollLeft =
        targetIndex * CELL_WIDTH - containerWidth / 2 + LEFT_PANEL_WIDTH;
    }
  }, [weekStarts]);

  return (
    <div className="flex flex-col h-full max-w-5xl mx-12">
      {/* Toggle */}
      <div className="py-2 mb-5">
        <ViewToggle activeView={activeView} onToggle={setActiveView} />
      </div>

      {/* Scroll container */}
      <div ref={scrollRef} className="flex-1 overflow-auto pb-15">
        {activeView === "project" && (
          <div style={{ minWidth: totalWidth }}>
            <DateHeader
              monthGroups={monthGroups}
              filters={filters}
              onFilterChange={updateFilter}
              projects={projects}
              teammates={teammates}
              showProjectDetails={showProjectDetails}
              onToggleProjectDetails={() => setShowProjectDetails((v) => !v)}
            />
            {activeProjects.map((project, idx) => (
              <ProjectSection
                key={project.id}
                project={project}
                teammates={teammates}
                weekStarts={weekStarts}
                allocationMap={allocationMap}
                bgColor={getProjectBg(idx)}
                monthBoundaries={monthBoundaries}
                teammateStatusFilter={filters.teammateStatus}
                teammateIdFilter={filters.teammateId}
                showProjectDetails={showProjectDetails}
                onCellEdit={onCellEdit}
              />
            ))}
          </div>
        )}

        {activeView === "teammate" && (
          <div className="flex items-center justify-center py-20 text-zinc-600 text-lg font-medium">
            Teammate view coming soon!
          </div>
        )}
      </div>
    </div>
  );
}

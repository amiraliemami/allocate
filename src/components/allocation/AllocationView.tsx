"use client";

import { useMemo, useRef, useEffect, useState, useCallback } from "react";
import type { Project } from "@/components/ProjectsSidebar";
import type { Teammate } from "@/components/TeammatesSidebar";
import type { Allocation } from "./ProjectSection";
import { groupWeeksByMonth } from "@/lib/dateUtils";
import { getProjectBg } from "@/lib/projectColors";
import DateHeader from "./DateHeader";
import ProjectSection from "./ProjectSection";

import { PROJECT_INFO_WIDTH, TEAMMATE_NAME_WIDTH } from "./ProjectSection";

const LEFT_PANEL_WIDTH = PROJECT_INFO_WIDTH + TEAMMATE_NAME_WIDTH;
const CELL_WIDTH = 56;

export type AllocationFilters = {
  projectStatus: Set<string>;
  projectLeadId: Set<string>;
  projectName: string;
  teammateStatus: Set<string>;
  teammateId: Set<string>;
};

const DEFAULT_FILTERS: AllocationFilters = {
  projectStatus: new Set(["Active"]),
  projectLeadId: new Set(),
  projectName: "",
  teammateStatus: new Set(["Active"]),
  teammateId: new Set(),
};

interface Props {
  projects: Project[];
  teammates: Teammate[];
  allocations: Allocation[];
  weekStarts: string[];
  activeView: "project" | "teammate";
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
  activeView,
  onCellEdit,
}: Props) {
  const [filters, setFilters] = useState<AllocationFilters>({ ...DEFAULT_FILTERS });
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [addedPairs, setAddedPairs] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToCurrentMonth = useCallback((smooth = true) => {
    if (!scrollRef.current || weekStarts.length === 0) return;
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${now.getMonth()}`;
    // Find the first week that belongs to the current month
    const targetIndex = weekStarts.findIndex((ws) => {
      const d = new Date(ws + "T00:00:00");
      return `${d.getFullYear()}-${d.getMonth()}` === currentMonthKey;
    });
    if (targetIndex >= 0) {
      scrollRef.current.scrollTo({
        left: targetIndex * CELL_WIDTH,
        behavior: smooth ? "smooth" : "instant",
      });
    }
  }, [weekStarts]);

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
      if (filters.projectName && !p.name.toLowerCase().includes(filters.projectName.toLowerCase())) return false;
      return true;
    });
  }, [projects, allocations, filters]);

  const totalWidth = LEFT_PANEL_WIDTH + weekStarts.length * CELL_WIDTH;

  // Scroll to current month on mount
  useEffect(() => {
    scrollToCurrentMonth(false);
  }, [scrollToCurrentMonth]);

  return (
    <div className="flex flex-col h-full w-full max-w-6xl mx-auto px-12">
      {/* Scroll container */}
      <div ref={scrollRef} className="flex-1 overflow-auto mb-10 border-t-4 border-2 border-zinc-900">
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
                addedPairs={addedPairs}
                onAddTeammate={(projectId, teammateId) => {
                  setAddedPairs((prev) => new Set(prev).add(`${projectId}|${teammateId}`));
                }}
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

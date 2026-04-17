"use client";

import { useMemo, useRef, useEffect, useState, useCallback } from "react";
import type { Project } from "@/components/ProjectsSidebar";
import type { Teammate } from "@/components/TeammatesSidebar";
import type { Allocation } from "./ProjectSection";
import { groupWeeksByMonth, generateWeekStarts, getYearStartMonday } from "@/lib/dateUtils";
import { getProjectBg } from "@/lib/projectColors";
import DateHeader from "./DateHeader";
import ProjectSection from "./ProjectSection";
import TeammateSection from "./TeammateSection";
import { PROJECT_INFO_WIDTH, TEAMMATE_NAME_WIDTH } from "./ProjectSection";
import { TEAMMATE_INFO_WIDTH, PROJECT_NAME_WIDTH } from "./TeammateSection";

const CELL_WIDTH = 56;

export type AllocationFilters = {
  projectStatus: Set<string>;
  projectLeadId: Set<string>;
  projectName: string;
  teammateStatus: Set<string>;
  teammateId: Set<string>;
  teammateLevel: Set<string>;
  teammateRole: Set<string>;
};

const DEFAULT_FILTERS: AllocationFilters = {
  projectStatus: new Set(["Active"]),
  projectLeadId: new Set(),
  projectName: "",
  teammateStatus: new Set(["Active"]),
  teammateId: new Set(),
  teammateRole: new Set(),
  teammateLevel: new Set(),
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
  weekStarts: rawWeekStarts,
  activeView,
  onCellEdit,
}: Props) {
  const weekStarts = useMemo(() => {
    const yearWeeks = generateWeekStarts(getYearStartMonday(), 52);
    const merged = new Set<string>(yearWeeks);
    for (const ws of rawWeekStarts) merged.add(ws);
    return Array.from(merged).sort();
  }, [rawWeekStarts]);
  const [filters, setFilters] = useState<AllocationFilters>({ ...DEFAULT_FILTERS });
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [showTotals, setShowTotals] = useState(true);
  const [showProjectTotals, setShowProjectTotals] = useState(false);
  const [totalsOnly, setTotalsOnly] = useState(false);
  const [projectTotalsOnly, setProjectTotalsOnly] = useState(false);
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

  // Teammate totals: sum of fractions per teammate per week
  const teammateTotals = useMemo(() => {
    const totals = new Map<string, number>();
    for (const a of allocations) {
      if (a.isHidden) continue;
      const key = `${a.teammateId}|${a.weekStart}`;
      totals.set(key, (totals.get(key) ?? 0) + a.fraction);
    }
    return totals;
  }, [allocations]);

  // Project totals: sum of fractions per project per week
  const projectTotals = useMemo(() => {
    const totals = new Map<string, number>();
    for (const a of allocations) {
      if (a.isHidden) continue;
      const key = `${a.projectId}|${a.weekStart}`;
      totals.set(key, (totals.get(key) ?? 0) + a.fraction);
    }
    return totals;
  }, [allocations]);

  // Filter projects matching active filters (includes projects with no allocations)
  const activeProjects = useMemo(() => {
    return projects.filter((p) => {
      if (filters.projectStatus.size > 0 && !filters.projectStatus.has(p.status)) return false;
      if (filters.projectLeadId.size > 0 && !filters.projectLeadId.has(p.leadId ?? "")) return false;
      if (filters.projectName && !p.name.toLowerCase().includes(filters.projectName.toLowerCase())) return false;
      return true;
    });
  }, [projects, filters]);

  // Filter to teammates that have allocations + match active filters
  const activeTeammates = useMemo(() => {
    const teammatesWithAllocations = new Set<string>();
    for (const a of allocations) {
      if (!a.isHidden) teammatesWithAllocations.add(a.teammateId);
    }
    return teammates.filter((t) => {
      if (!teammatesWithAllocations.has(t.id)) return false;
      if (filters.teammateStatus.size > 0 && !filters.teammateStatus.has(t.status)) return false;
      if (filters.teammateId.size > 0 && !filters.teammateId.has(t.id)) return false;
      if (filters.teammateLevel.size > 0 && !filters.teammateLevel.has(t.level ?? "")) return false;
      if (filters.teammateRole.size > 0 && !filters.teammateRole.has(t.role ?? "")) return false;
      return true;
    });
  }, [teammates, allocations, filters]);

  const leftPanelWidth = activeView === "project"
    ? PROJECT_INFO_WIDTH + TEAMMATE_NAME_WIDTH
    : TEAMMATE_INFO_WIDTH + PROJECT_NAME_WIDTH;
  const totalWidth = leftPanelWidth + weekStarts.length * CELL_WIDTH;

  // Scroll to current month on mount
  useEffect(() => {
    scrollToCurrentMonth(false);
  }, [scrollToCurrentMonth]);

  return (
    <div className="flex flex-col h-full w-full max-w-6xl mx-auto px-12">
      {/* Scroll container */}
      <div ref={scrollRef} data-alloc-scroll data-alloc-left-width={leftPanelWidth} className="flex-1 overflow-auto mb-10 border-t-4 border-2 border-zinc-900  bg-white">
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
              activeView={activeView}
              showTotals={showProjectTotals}
              onToggleShowTotals={() => setShowProjectTotals((v) => {
                if (v) setProjectTotalsOnly(false);
                return !v;
              })}
              totalsOnly={projectTotalsOnly}
              onToggleTotalsOnly={() => setProjectTotalsOnly((v) => {
                if (!v) setShowProjectTotals(true);
                return !v;
              })}
            />
            {activeProjects.map((project, idx) => (
              <ProjectSection
                key={project.id}
                project={project}
                teammates={teammates}
                weekStarts={weekStarts}
                allocationMap={allocationMap}
                teammateTotals={teammateTotals}
                bgColor={getProjectBg(idx)}
                monthBoundaries={monthBoundaries}
                teammateStatusFilter={filters.teammateStatus}
                teammateIdFilter={filters.teammateId}
                showProjectDetails={showProjectDetails}
                showTotals={showProjectTotals}
                totalsOnly={projectTotalsOnly}
                projectTotals={projectTotals}
                onCellEdit={onCellEdit}
                addedPairs={addedPairs}
                onAddTeammate={(projectId, teammateId) => {
                  setAddedPairs((prev) => new Set(prev).add(`${projectId}|${teammateId}`));
                }}
                onRemovePair={(projectId, teammateId) => {
                  setAddedPairs((prev) => {
                    const next = new Set(prev);
                    next.delete(`${projectId}|${teammateId}`);
                    return next;
                  });
                }}
              />
            ))}
          </div>
        )}

        {activeView === "teammate" && (
          <div style={{ minWidth: totalWidth }}>
            <DateHeader
              monthGroups={monthGroups}
              filters={filters}
              onFilterChange={updateFilter}
              projects={projects}
              teammates={teammates}
              showProjectDetails={false}
              onToggleProjectDetails={() => {}}
              activeView={activeView}
              showTotals={showTotals}
              onToggleShowTotals={() => setShowTotals((v) => {
                if (v) setTotalsOnly(false); // turning off showTotals also turns off totalsOnly
                return !v;
              })}
              totalsOnly={totalsOnly}
              onToggleTotalsOnly={() => {
                setTotalsOnly((v) => {
                  if (!v) setShowTotals(true); // turning on totalsOnly forces showTotals on
                  return !v;
                });
              }}
            />
            {activeTeammates.map((teammate, idx) => (
              <TeammateSection
                key={teammate.id}
                teammate={teammate}
                projects={projects}
                weekStarts={weekStarts}
                allocationMap={allocationMap}
                teammateTotals={teammateTotals}
                bgColor={getProjectBg(idx)}
                monthBoundaries={monthBoundaries}
                projectStatusFilter={filters.projectStatus}
                projectLeadIdFilter={filters.projectLeadId}
                projectNameFilter={filters.projectName}
                showTotals={showTotals}
                totalsOnly={totalsOnly}
                onCellEdit={onCellEdit}
                addedPairs={addedPairs}
                onAddProject={(teammateId, projectId) => {
                  setAddedPairs((prev) => new Set(prev).add(`${projectId}|${teammateId}`));
                }}
                onRemovePair={(projectId, teammateId) => {
                  setAddedPairs((prev) => {
                    const next = new Set(prev);
                    next.delete(`${projectId}|${teammateId}`);
                    return next;
                  });
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ProjectsSidebar from "@/components/ProjectsSidebar";
import TeammatesSidebar from "@/components/TeammatesSidebar";
import AllocationView from "@/components/allocation/AllocationView";
import type { Project } from "@/components/ProjectsSidebar";
import type { Teammate } from "@/components/TeammatesSidebar";
import type { Allocation } from "@/components/allocation/ProjectSection";

export default function Home() {
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [teammatesOpen, setTeammatesOpen] = useState(false);
  const [activeView, setActiveView] = useState<"project" | "teammate">("project");
  const [projects, setProjects] = useState<Project[]>([]);
  const [teammates, setTeammates] = useState<Teammate[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [weekStarts, setWeekStarts] = useState<string[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const router = useRouter();

  const handleCellEdit = async (
    projectId: string,
    teammateId: string,
    weekStart: string,
    fraction: number | null,
    existingId: string | undefined
  ) => {
    if (fraction === null && existingId) {
      // Delete
      setAllocations((prev) => prev.filter((a) => a.id !== existingId));
      await fetch(`/api/allocations/${existingId}`, { method: "DELETE" });
    } else if (existingId && fraction != null) {
      // Update
      setAllocations((prev) =>
        prev.map((a) => (a.id === existingId ? { ...a, fraction } : a))
      );
      await fetch(`/api/allocations/${existingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fraction }),
      });
    } else if (fraction != null) {
      // Create
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const newAlloc: Allocation = {
        id: tempId,
        projectId,
        teammateId,
        weekStart,
        fraction,
        isHidden: false,
      };
      setAllocations((prev) => [...prev, newAlloc]);
      const res = await fetch("/api/allocations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, teammateId, weekStart, fraction }),
      });
      if (res.ok) {
        const created = await res.json();
        setAllocations((prev) =>
          prev.map((a) => (a.id === tempId ? created : a))
        );
      }
    }
  };

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const fetchAll = useCallback(async () => {
    setDataLoading(true);
    setLoadError(false);
    try {
      const [projRes, teamRes, allocRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/teammates"),
        fetch("/api/allocations"),
      ]);
      if (!projRes.ok || !teamRes.ok || !allocRes.ok) {
        setLoadError(true);
        setDataLoading(false);
        return;
      }
      setProjects(await projRes.json());
      setTeammates(await teamRes.json());
      const data = await allocRes.json();
      setAllocations(data.allocations);
      setWeekStarts(data.weekStarts);
    } catch {
      setLoadError(true);
    }
    setDataLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-white">
      {/* Top bar */}
      <header className="flex items-center justify-center gap-8 bg-white mt-14 mb-10">
        <svg className="flex-1 h-3" preserveAspectRatio="none" viewBox="0 0 100 10">
          <path d="M0 5 Q8.33 0 16.67 5 T33.33 5 T50 5 T66.67 5 T83.33 5 T100 5" fill="none" stroke="#1a1a1a" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="flex items-center justify-center gap-10 bg-white">
          <button
            onClick={() => setActiveView("project")}
            className={`btn-chunky px-5 py-1 text-sm font-bold rounded-lg shrink-0 ${activeView === "project"
              ? "btn-chunky-pressed bg-purple-800 text-zinc-100"
              : "bg-white text-zinc-800"
              }`}
          >
            PROJECT VIEW
          </button>

          <button
            onClick={handleSignOut}
            className="group relative text-xl font-bold tracking-tight text-zinc-900 hover:cursor-pointer shrink-0"
          >
            <span className="inline-block transition-all duration-300 group-hover:scale-0 group-hover:opacity-0">
              A L L O C A T E
            </span>
            <span className="absolute inset-0 flex items-center justify-center scale-0 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 group-hover:animate-[bounce_0.3s_infinite]">
              B Y E B Y E ?
            </span>
          </button>

          <button
            onClick={() => setActiveView("teammate")}
            className={`btn-chunky px-5 py-1 text-sm font-bold rounded-lg shrink-0 ${activeView === "teammate"
              ? "btn-chunky-pressed bg-emerald-800 text-zinc-100"
              : "bg-white text-zinc-800"
              }`}
          >
            TEAM VIEW
          </button>
        </div>
        <svg className="flex-1 h-3" preserveAspectRatio="none" viewBox="0 0 100 10">
          <path d="M0 5 Q8.33 0 16.67 5 T33.33 5 T50 5 T66.67 5 T83.33 5 T100 5" fill="none" stroke="#1a1a1a" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
        </svg>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {loadError ? (
          <div className="flex h-full items-center justify-center">
            <span className="text-xl text-zinc-400 font-semibold">something went wrong... sorry :(</span>
          </div>
        ) : dataLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="wavy-loader flex gap-1.5 text-2xl font-black">
              {["L", "O", "A", "D", "I", "N", "G", "L", "O", "A", "D", "I", "N", "G", "L", "O", "A", "D", "I", "N", "G",
              ].map((ch, i) => (
                <span
                  key={i}
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    color: ["#7e22ce", "#7e22ce", "#1a1a1a", "#1a1a1a", "#1a1a1a", "#059669", "#059669"][i],
                  }}
                >
                  {ch}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <AllocationView
            projects={projects}
            teammates={teammates}
            allocations={allocations}
            weekStarts={weekStarts}
            activeView={activeView}
            onCellEdit={handleCellEdit}
          />
        )}
      </main>

      {/* Ticker footer */}
      <footer className="overflow-hidden text-center">
        <div className="inline whitespace-nowrap text-xs font-mono text-zinc-400">
          {Array(60).fill("v1.0").join(" ")}
        </div>
      </footer>

      {/* Projects sidebar + handle (left) */}
      <ProjectsSidebar
        open={projectsOpen}
        onClose={() => setProjectsOpen(false)}
        onOpen={() => { setTeammatesOpen(false); setProjectsOpen(true); }}
        projects={projects}
        setProjects={setProjects}
        teammates={teammates}
        disabled={dataLoading || loadError}
      />

      {/* Teammates sidebar + handle (right) */}
      <TeammatesSidebar
        open={teammatesOpen}
        onClose={() => setTeammatesOpen(false)}
        onOpen={() => { setProjectsOpen(false); setTeammatesOpen(true); }}
        teammates={teammates}
        setTeammates={setTeammates}
        disabled={dataLoading || loadError}
      />
    </div>
  );
}

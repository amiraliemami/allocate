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
      const tempId = `temp-${Date.now()}`;
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
    try {
      const [projRes, teamRes, allocRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/teammates"),
        fetch("/api/allocations"),
      ]);
      if (projRes.ok) setProjects(await projRes.json());
      if (teamRes.ok) setTeammates(await teamRes.json());
      if (allocRes.ok) {
        const data = await allocRes.json();
        setAllocations(data.allocations);
        setWeekStarts(data.weekStarts);
      }
    } catch {
      // Network error — data stays empty
    }
    setDataLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-white">
      {/* Top bar */}
      <header className="flex items-end justify-center gap-12 bg-white px-12 py-3 mt-4 mb-8">
        <button
          onClick={() => setActiveView("project")}
          className={`btn-chunky px-5 py-1 text-sm font-bold rounded-lg ${
            activeView === "project"
              ? "btn-chunky-pressed bg-purple-800 text-zinc-100"
              : "bg-white text-zinc-800"
          }`}
        >
          PROJECT VIEW
        </button>

        <button
          onClick={handleSignOut}
          className="group relative text-xl font-bold tracking-tight text-zinc-900 hover:cursor-pointer"
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
          className={`btn-chunky px-5 py-1 text-sm font-bold rounded-lg ${
            activeView === "teammate"
              ? "btn-chunky-pressed bg-emerald-800 text-zinc-100"
              : "bg-white text-zinc-800"
          }`}
        >
          TEAM VIEW
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {dataLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-zinc-200 border-t-zinc-900" />
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
      <footer className="overflow-hidden border-y border-zinc-400 bg-white py-1 mb-2">
        <div className="animate-[ticker_15s_linear_infinite] whitespace-nowrap text-sm font-mono text-zinc-400">
          {Array(50).fill("v1.0").join(" ")}
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
      />

      {/* Teammates sidebar + handle (right) */}
      <TeammatesSidebar
        open={teammatesOpen}
        onClose={() => setTeammatesOpen(false)}
        onOpen={() => { setProjectsOpen(false); setTeammatesOpen(true); }}
        teammates={teammates}
        setTeammates={setTeammates}
      />
    </div>
  );
}

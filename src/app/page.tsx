"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ProjectsSidebar from "@/components/ProjectsSidebar";
import TeammatesSidebar from "@/components/TeammatesSidebar";
import type { Project } from "@/components/ProjectsSidebar";
import type { Teammate } from "@/components/TeammatesSidebar";

export default function Home() {
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [teammatesOpen, setTeammatesOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teammates, setTeammates] = useState<Teammate[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const router = useRouter();

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const fetchAll = useCallback(async () => {
    setDataLoading(true);
    try {
      const [projRes, teamRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/teammates"),
      ]);
      if (projRes.ok) setProjects(await projRes.json());
      if (teamRes.ok) setTeammates(await teamRes.json());
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
      <header className="flex items-center justify-center border-b-2 border-zinc-900 bg-white px-6 py-3">
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
      </header>

      {/* Main content area — allocation views will go here */}
      <main className="flex flex-1 items-center justify-center">
        {dataLoading ? (
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-zinc-200 border-t-zinc-900" />
        ) : (
          <p className="text-zinc-300 text-lg">Allocation view coming soon</p>
        )}
      </main>

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

"use client";

import { useState, useEffect, useCallback } from "react";
import ProjectsSidebar from "@/components/ProjectsSidebar";
import TeammatesSidebar from "@/components/TeammatesSidebar";
import type { Project } from "@/components/ProjectsSidebar";
import type { Teammate } from "@/components/TeammatesSidebar";

export default function Home() {
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [teammatesOpen, setTeammatesOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teammates, setTeammates] = useState<Teammate[]>([]);

  const fetchAll = useCallback(async () => {
    const [projRes, teamRes] = await Promise.all([
      fetch("/api/projects"),
      fetch("/api/teammates"),
    ]);
    const [projData, teamData] = await Promise.all([
      projRes.json(),
      teamRes.json(),
    ]);
    setProjects(projData);
    setTeammates(teamData);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-white">
      {/* Top bar */}
      <header className="flex items-center justify-center border-b-2 border-zinc-900 bg-white px-6 py-3">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">
          A L L O C A T E
        </h1>
      </header>

      {/* Main content area — allocation views will go here */}
      <main className="flex flex-1 items-center justify-center">
        <p className="text-zinc-300 text-lg">Allocation view coming soon</p>
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

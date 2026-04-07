"use client";

import { useState } from "react";
import ProjectsSidebar from "@/components/ProjectsSidebar";

export default function Home() {
  const [projectsOpen, setProjectsOpen] = useState(false);

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-white">
      {/* Top bar */}
      <header className="flex items-center justify-center border-b-2 border-zinc-900 bg-white px-6 py-3">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">
          Allocate
        </h1>
      </header>

      {/* Fixed right-edge Team tab */}
      <button className="sidebar-tab sidebar-tab-right fixed right-0 top-1/2 -translate-y-1/2 z-30 bg-emerald-100 text-emerald-700 px-3">
        Team &lt;
      </button>

      {/* Main content area — allocation views will go here */}
      <main className="flex flex-1 items-center justify-center">
        <p className="text-zinc-300 text-lg">Allocation view coming soon</p>
      </main>

      {/* Projects sidebar + handle */}
      <ProjectsSidebar
        open={projectsOpen}
        onClose={() => setProjectsOpen(false)}
        onOpen={() => setProjectsOpen(true)}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import ProjectsSidebar from "@/components/ProjectsSidebar";

export default function Home() {
  const [projectsOpen, setProjectsOpen] = useState(false);

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-white">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b-2 border-zinc-900 bg-white px-6 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setProjectsOpen(true)}
            className="btn-chunky flex px-2 py-0.5 items-center justify-center rounded-xl bg-violet-100 text-lg font-bold text-violet-700"
          >
            &gt; Projects
          </button>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">
            Allocate
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button className="btn-chunky flex px-2 py-0.5 items-center justify-center rounded-xl bg-emerald-100 text-lg font-bold text-emerald-700">
            Team &lt;
          </button>
        </div>
      </header>

      {/* Main content area — allocation views will go here */}
      <main className="flex flex-1 items-center justify-center">
        <p className="text-zinc-300 text-lg">Allocation view coming soon</p>
      </main>

      {/* Projects sidebar */}
      <ProjectsSidebar
        open={projectsOpen}
        onClose={() => setProjectsOpen(false)}
      />
    </div>
  );
}

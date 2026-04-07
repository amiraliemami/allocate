"use client";

import { useEffect, useState, useCallback } from "react";
import ProjectsTable from "./ProjectsTable";

type Teammate = { id: string; name: string };

export type Project = {
  id: string;
  name: string;
  pillar: string | null;
  region: string | null;
  billingRate: string | null;
  status: string;
  conversionProbability: number | null;
  billable: boolean;
  unit4Code: string | null;
  leadId: string | null;
  lead: Teammate | null;
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ProjectsSidebar({ open, onClose }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [teammates, setTeammates] = useState<Teammate[]>([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [filtersActive, setFiltersActive] = useState(false);
  const [clearFilters, setClearFilters] = useState<(() => void) | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [projRes, teamRes] = await Promise.all([
      fetch("/api/projects"),
      fetch("/api/team"),
    ]);
    const [projData, teamData] = await Promise.all([
      projRes.json(),
      teamRes.json(),
    ]);
    setProjects(projData);
    setTeammates(teamData);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open) {
      fetchData();
      setClosing(false);
    }
  }, [open, fetchData]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 250);
  };

  const handleUpdate = async (id: string, field: string, value: unknown) => {
    // If this is a draft row getting its name, create it in the DB first
    if (id.startsWith("temp-") && field === "name" && value) {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: value }),
      });
      if (res.ok) {
        const created = await res.json();
        setProjects((prev) => prev.map((p) => (p.id === id ? created : p)));
      }
      return;
    }

    // Ignore edits on draft rows (shouldn't happen, but just in case)
    if (id.startsWith("temp-")) return;

    // Optimistic update
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
    const res = await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    if (res.ok) {
      const updated = await res.json();
      setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
    }
  };

  const handleCreate = () => {
    const tempId = `temp-${Date.now()}`;
    const draft: Project = {
      id: tempId,
      name: "",
      pillar: null,
      region: null,
      billingRate: null,
      status: "Pipeline",
      conversionProbability: null,
      billable: false,
      unit4Code: null,
      leadId: null,
      lead: null,
    };
    setProjects((prev) => [draft, ...prev]);
  };

  const handleDelete = async (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    // Only call API if it's a real row
    if (!id.startsWith("temp-")) {
      await fetch(`/api/projects/${id}`, { method: "DELETE" });
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 ${closing ? "fade-out" : "fade-in"}`}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-[82%] max-w-[1400px] flex-col border-r-3 border-zinc-900 bg-white shadow-2xl ${closing ? "slide-out-left" : "slide-in-left"}`}
      >
        {/* Header */}
        <div className="grid grid-cols-3 items-center border-b-2 border-zinc-900 px-6 py-4">
          <div className="flex items-center">
            <div className="flex h-9 w-24 items-center justify-center rounded-lg bg-violet-200 text-md font-bold text-violet-800 border-2 border-zinc-900">
              Projects
            </div>
          </div>
          <div className="flex items-center justify-center gap-3">
            {filtersActive && (
              <div className="flex items-center gap-2 rounded-lg border-2 border-violet-300 bg-violet-50 px-3 pt-1 pb-2">
                <span className="text-sm font-medium text-violet-700">Filters active</span>
                <button
                  onClick={() => clearFilters?.()}
                  className="btn-chunky rounded-md bg-white px-2 py-0.5 text-xs font-bold text-violet-700"
                >
                  Clear all
                </button>
              </div>
            )}
            <button
              onClick={handleCreate}
              className="btn-chunky flex h-9 items-center gap-1.5 rounded-lg bg-violet-100 px-3 text-sm font-bold text-violet-800"
            >
              <span className="text-lg leading-none">+</span> New
            </button>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleClose}
              className="btn-chunky flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100 text-rose-700 text-lg font-bold"
            >
              &lt;
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto px-6 py-4">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-violet-200 border-t-violet-600" />
            </div>
          ) : (
            <ProjectsTable
              projects={projects}
              teammates={teammates}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onFilterChange={(active, clearFn) => {
                setFiltersActive(active);
                setClearFilters(() => clearFn);
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}

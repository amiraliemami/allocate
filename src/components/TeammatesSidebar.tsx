"use client";

import { useEffect, useState, useCallback } from "react";
import TeammatesTable from "./TeammatesTable";

export type Teammate = {
  id: string;
  name: string;
  email: string | null;
  role: string | null;
  level: string | null;
  region: string | null;
  status: string;
};

interface Props {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export default function TeammatesSidebar({ open, onClose, onOpen }: Props) {
  const [teammates, setTeammates] = useState<Teammate[]>([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [filtersActive, setFiltersActive] = useState(false);
  const [clearFilters, setClearFilters] = useState<(() => void) | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/teammates");
    const data = await res.json();
    setTeammates(data);
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
    if (id.startsWith("temp-") && field === "name" && value) {
      const res = await fetch("/api/teammates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: value }),
      });
      if (res.ok) {
        const created = await res.json();
        setTeammates((prev) => prev.map((t) => (t.id === id ? created : t)));
      }
      return;
    }

    if (id.startsWith("temp-")) return;

    setTeammates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
    const res = await fetch(`/api/teammates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTeammates((prev) => prev.map((t) => (t.id === id ? updated : t)));
    }
  };

  const handleCreate = () => {
    const tempId = `temp-${Date.now()}`;
    const draft: Teammate = {
      id: tempId,
      name: "",
      email: null,
      role: null,
      level: null,
      region: null,
      status: "Active",
    };
    setTeammates((prev) => [draft, ...prev]);
  };

  const handleDelete = async (id: string) => {
    if (!id.startsWith("temp-")) {
      const res = await fetch(`/api/teammates/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Failed to delete teammate");
        return;
      }
    }
    setTeammates((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <>
      {/* Handle — when sidebar is closed */}
      {!open && (
        <div className="fixed -right-0.5 top-1/2 -translate-y-1/2 z-[51]">
          <button
            onClick={onOpen}
            className="sidebar-tab sidebar-tab-right group bg-emerald-200 text-emerald-700"
          >
            <span className="px-1.5">
              {"\u2039"}
            </span>
            <span className="px-2.5 transition-all w-0 overflow-hidden whitespace-nowrap group-hover:w-16 group-hover:px-2">
              Team
            </span>
          </button>
        </div>
      )}

      {/* Backdrop */}
      {open && (
        <div
          className={`fixed inset-0 z-40 bg-black/20 ${closing ? "fade-out" : "fade-in"}`}
          onClick={handleClose}
        />
      )}

      {/* Panel + attached handle */}
      {open && (
        <div
          className={`fixed inset-y-0 right-0 z-50 flex w-[82%] max-w-[1000px] flex-col border-l-3 border-zinc-900 bg-white shadow-2xl ${closing ? "slide-out-right" : "slide-in-right"}`}
        >
          {/* Handle — attached to left edge of panel */}
          <div className="absolute left-2 top-1/2 -translate-y-1/2 -translate-x-full z-[51]">
            <button
              onClick={handleClose}
              className="sidebar-tab sidebar-tab-right bg-emerald-200 text-emerald-700"
            >
              <span className="px-1.5">
                {"\u203A"}
              </span>
              <span className="px-2.5 whitespace-nowrap">
                Team
              </span>
            </button>
          </div>

          {/* Header */}
          <div className="flex items-start justify-start gap-3 px-6 pt-4 pb-1">
            {filtersActive ? (
              <div className="flex items-center gap-2 rounded-lg border-2 border-emerald-300 bg-emerald-50 px-3 py-1.5">
                <span className="text-sm font-medium text-emerald-700">Filters active</span>
                <button
                  onClick={() => clearFilters?.()}
                  className="btn-chunky rounded-md bg-white px-2 py-0.5 text-xs font-bold text-emerald-700"
                >
                  Clear all
                </button>
              </div>
            ) : (
              <button
                onClick={handleCreate}
                className="btn-chunky flex h-9 items-center gap-1.5 rounded-lg bg-emerald-100 px-3 text-sm font-bold text-emerald-800"
              >
                <span className="text-lg leading-none">+</span> New
              </button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto mx-5 my-3 border-2 border-zinc-900">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-emerald-200 border-t-emerald-600" />
              </div>
            ) : (
              <TeammatesTable
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
      )}
    </>
  );
}

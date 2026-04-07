"use client";

import { useRef, useState } from "react";
import type { Project } from "./ProjectsSidebar";
import InlineSelect from "./InlineSelect";
import InlineText from "./InlineText";

type Teammate = { id: string; name: string };

const STATUS_ORDER: Record<string, { label: string; className: string; rowBg: string; rowBgAlt: string }> = {
  Pipeline: { label: "Pipeline", className: "status-pipeline", rowBg: "bg-amber-100/70", rowBgAlt: "bg-amber-50" },
  Active: { label: "Active", className: "status-active", rowBg: "bg-emerald-100/70", rowBgAlt: "bg-emerald-50" },
  Inactive: { label: "Inactive", className: "status-inactive", rowBg: "bg-rose-100/70", rowBgAlt: "bg-rose-50" },
  Archive: { label: "Archive", className: "status-archive", rowBg: "bg-zinc-100/70", rowBgAlt: "bg-zinc-50" },
  Completed: { label: "Completed", className: "status-completed", rowBg: "bg-blue-100/70", rowBgAlt: "bg-blue-50" },
};

const PILLAR_OPTIONS = [
  { value: "", label: "—" },
  { value: "Products", label: "Products" },
  { value: "Services", label: "Services" },
  { value: "Advisory", label: "Advisory" },
  { value: "Internal", label: "Internal" },
];

const REGION_OPTIONS = [
  { value: "", label: "—" },
  { value: "Global", label: "Global" },
  { value: "IND", label: "IND" },
  { value: "WNA", label: "WNA" },
  { value: "ESA", label: "ESA" },
];

const BILLING_RATE_OPTIONS = [
  { value: "", label: "—" },
  { value: "Internal", label: "Internal" },
  { value: "L1", label: "L1" },
  { value: "Fractional", label: "Fractional" },
  { value: "CoImpact", label: "Co-Impact" },
  { value: "Standard", label: "Standard" },
];

const STATUS_OPTIONS = Object.entries(STATUS_ORDER).map(([value, { label }]) => ({
  value,
  label,
}));

const CONV_PROB_OPTIONS = [
  { value: "", label: "—" },
  { value: "10", label: "10%" },
  { value: "20", label: "20%" },
  { value: "30", label: "30%" },
  { value: "40", label: "40%" },
  { value: "50", label: "50%" },
  { value: "60", label: "60%" },
  { value: "70", label: "70%" },
  { value: "80", label: "80%" },
  { value: "90", label: "90%" },
  { value: "100", label: "100%" },
];

const BILLABLE_OPTIONS = [
  { value: "false", label: "No" },
  { value: "true", label: "Yes" },
];

interface Props {
  projects: Project[];
  teammates: Teammate[];
  onUpdate: (id: string, field: string, value: unknown) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

export default function ProjectsTable({
  projects,
  teammates,
  onUpdate,
  onCreate,
  onDelete,
}: Props) {
  const newRowRef = useRef<HTMLInputElement>(null);

  const grouped = Object.keys(STATUS_ORDER).reduce(
    (acc, status) => {
      acc[status] = projects.filter((p) => p.status === status);
      return acc;
    },
    {} as Record<string, Project[]>
  );

  const leadOptions = [
    { value: "", label: "—" },
    ...teammates.map((t) => ({ value: t.id, label: t.name })),
  ];

  const handleCreate = () => {
    onCreate();
    setTimeout(() => newRowRef.current?.focus(), 100);
  };

  return (
    <div className="space-y-6">
      {/* Add new row */}
      <div className="flex justify-center">
        <button
          onClick={handleCreate}
          className="btn-chunky flex items-center gap-2 rounded-lg bg-violet-100 px-4 py-2 text-sm font-bold text-violet-800"
        >
          <span className="text-lg leading-none">+</span> New
        </button>
      </div>

      {/* Fixed-width table — sidebar handles scrolling */}
      <div className="min-w-[900px]">

      {/* Table header */}
      <div className="sticky top-0 z-20 grid grid-cols-[1fr_100px_80px_100px_100px_70px_70px_120px_40px] gap-px rounded-t-lg border-2 border-zinc-900 bg-zinc-900 text-xs font-bold text-white overflow-hidden">
        <div className="bg-zinc-800 px-3 py-2">Name</div>
        <div className="bg-zinc-800 px-3 py-2">Pillar</div>
        <div className="bg-zinc-800 px-3 py-2">Region</div>
        <div className="bg-zinc-800 px-3 py-2">Rate</div>
        <div className="bg-zinc-800 px-3 py-2">Status</div>
        <div className="bg-zinc-800 px-3 py-2">Conv%</div>
        <div className="bg-zinc-800 px-3 py-2">Bill</div>
        <div className="bg-zinc-800 px-3 py-2">Lead</div>
        <div className="bg-zinc-800 px-3 py-2"></div>
      </div>

      {/* Grouped rows */}
      {Object.entries(grouped).map(([status, items]) => {
        if (items.length === 0) return null;
        const statusInfo = STATUS_ORDER[status];

        return (
          <div key={status} className="relative">
            {/* Group label — floating chip */}
            <div className="sticky top-[37px] z-10 pointer-events-none py-1.5">
              <span
                className={`inline-block rounded-md border-2 px-2.5 py-0.5 text-xs font-bold shadow-sm ${statusInfo.className}`}
              >
                {statusInfo.label}
              </span>
              <span className="text-xs text-zinc-400 ml-1.5">{items.length}</span>
            </div>

            {/* Rows */}
            <div className="rounded-lg border-2 border-zinc-200 overflow-hidden">
              {items.map((project, idx) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  idx={idx}
                  rowBg={statusInfo.rowBg}
                  rowBgAlt={statusInfo.rowBgAlt}
                  newRowRef={newRowRef}
                  leadOptions={leadOptions}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}

function ProjectRow({
  project,
  idx,
  rowBg,
  rowBgAlt,
  newRowRef,
  leadOptions,
  onUpdate,
  onDelete,
}: {
  project: Project;
  idx: number;
  rowBg: string;
  rowBgAlt: string;
  newRowRef: React.RefObject<HTMLInputElement | null>;
  leadOptions: { value: string; label: string }[];
  onUpdate: (id: string, field: string, value: unknown) => void;
  onDelete: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const isDraft = project.id.startsWith("temp-");

  return (
    <div
      className={`grid grid-cols-[1fr_100px_80px_100px_100px_70px_70px_120px_40px] gap-px transition-colors ${
        confirming
          ? "bg-rose-50"
          : isDraft
            ? "bg-amber-50"
            : idx % 2 === 0
              ? rowBg
              : rowBgAlt
      }`}
    >
      {confirming ? (
        <div className="col-span-full flex items-center gap-2 px-3 py-2">
          <span className="text-sm text-rose-700 mr-auto">
            Delete <strong>{project.name || "this project"}</strong>?
            Any allocations to this project will also be deleted. This action cannot be undone.
          </span>
          <button
            onClick={() => onDelete(project.id)}
            className="btn-chunky rounded-md bg-rose-500 px-2.5 py-1 text-xs font-bold text-white"
          >
            Delete
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="btn-chunky rounded-md bg-white px-2.5 py-1 text-xs font-bold text-zinc-600"
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          <InlineText
            ref={isDraft ? newRowRef : undefined}
            value={project.name}
            placeholder="Enter project name..."
            onSave={(v) => {
              if (v.trim()) onUpdate(project.id, "name", v.trim());
            }}
            autoFocus={isDraft}
          />
          <InlineSelect
            value={project.pillar ?? ""}
            options={PILLAR_OPTIONS}
            onSave={(v) => onUpdate(project.id, "pillar", v || null)}
            disabled={isDraft}
          />
          <InlineSelect
            value={project.region ?? ""}
            options={REGION_OPTIONS}
            onSave={(v) => onUpdate(project.id, "region", v || null)}
            disabled={isDraft}
          />
          <InlineSelect
            value={project.billingRate ?? ""}
            options={BILLING_RATE_OPTIONS}
            onSave={(v) => onUpdate(project.id, "billingRate", v || null)}
            disabled={isDraft}
          />
          <InlineSelect
            value={project.status}
            options={STATUS_OPTIONS}
            onSave={(v) => onUpdate(project.id, "status", v)}
            disabled={isDraft}
          />
          <InlineSelect
            value={
              project.conversionProbability != null
                ? String(project.conversionProbability)
                : ""
            }
            options={CONV_PROB_OPTIONS}
            onSave={(v) =>
              onUpdate(
                project.id,
                "conversionProbability",
                v ? parseInt(v) : null
              )
            }
            disabled={isDraft}
          />
          <InlineSelect
            value={String(project.billable)}
            options={BILLABLE_OPTIONS}
            onSave={(v) => onUpdate(project.id, "billable", v === "true")}
            disabled={isDraft}
          />
          <InlineSelect
            value={project.leadId ?? ""}
            options={leadOptions}
            onSave={(v) => onUpdate(project.id, "leadId", v || null)}
            disabled={isDraft}
          />
          <button
            onClick={() => setConfirming(true)}
            className="flex items-center justify-center text-zinc-300 hover:text-rose-500 transition-colors px-2"
            title="Delete project"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}

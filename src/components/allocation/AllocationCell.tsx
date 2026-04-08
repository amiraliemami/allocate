"use client";

import { memo, useState, useRef, useEffect } from "react";

const CELL_WIDTH = 56;

interface Props {
  fraction: number | undefined;
  teammateTotal?: number;
  isMonthStart?: boolean;
  unsaved?: boolean;
  previewFraction?: number | null;
  onEdit: (value: number | null) => void;
}

function AllocationCellInner({ fraction, teammateTotal, isMonthStart, unsaved, previewFraction, onEdit }: Props) {
  const [mode, setMode] = useState<"idle" | "selected" | "editing">("idle");
  const [draft, setDraft] = useState("");
  const [flashRed, setFlashRed] = useState(false);
  const cellRef = useRef<HTMLDivElement>(null);

  const isPreview = previewFraction !== undefined;
  const showFraction = isPreview ? previewFraction : fraction;
  const displayValue =
    showFraction != null && showFraction > 0
      ? (showFraction / 100).toFixed(showFraction % 10 === 0 ? 1 : 2)
      : "";

  const borderClass = isMonthStart
    ? "border-l-2 border-l-zinc-300"
    : "border-l border-l-zinc-200";

  const reject = () => {
    setMode("idle");
    setFlashRed(false);
    requestAnimationFrame(() => setFlashRed(true));
  };

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed === "") {
      setMode("idle");
      if (fraction != null) onEdit(null);
      return;
    }
    const parsed = parseFloat(trimmed);
    if (isNaN(parsed) || parsed <= 0) return reject();
    const intVal = Math.round(parsed * 100);
    setMode("idle");
    if (intVal !== fraction) onEdit(intVal);
  };

  // Deselect when clicking outside
  useEffect(() => {
    if (mode === "idle") return;
    const handleClickOutside = (e: MouseEvent) => {
      if (cellRef.current && !cellRef.current.contains(e.target as Node)) {
        if (mode === "editing") return; // input's onBlur handles this
        setMode("idle");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mode]);

  if (mode === "editing") {
    const draftVal = parseFloat(draft) || 0;
    const baseTotal = (teammateTotal ?? 0) - (fraction ?? 0);
    const remaining = (100 - baseTotal - draftVal * 100) / 100;
    const remainingText = `${remaining.toFixed(1)} remaining`;
    const isOver = remaining <= 0;

    return (
      <div
        ref={cellRef}
        style={{ width: CELL_WIDTH, minWidth: CELL_WIDTH }}
        className={`relative flex items-center justify-center h-full box-border ${borderClass}`}
      >
        <div
          className="tooltip-bubble absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 text-xs font-bold whitespace-nowrap z-50"
          style={{ "--bubble-color": isOver ? "#991b1b" : "#166534" } as React.CSSProperties}
        >
          {remainingText}
        </div>
        <input
          className="w-full h-full text-center text-sm bg-white outline-none border-2 border-zinc-900 rounded px-0.5"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") setMode("idle");
          }}
          autoFocus
        />
      </div>
    );
  }

  return (
    <div
      ref={cellRef}
      tabIndex={0}
      style={{
        width: CELL_WIDTH,
        minWidth: CELL_WIDTH,
        backgroundColor: unsaved ? "rgb(248, 248, 248)" : undefined,
        borderBottomWidth: isPreview ? 2 : undefined,
        borderBottomStyle: isPreview ? "solid" : undefined,
        borderBottomColor: isPreview ? "rgb(117, 117, 117)" : undefined,
        animation: flashRed ? "cellFlashRed 0.4s ease-out" : undefined,
        outline: mode === "selected" ? "2px solid #7c3aed" : undefined,
        outlineOffset: "-2px",
      }}
      onAnimationEnd={() => setFlashRed(false)}
      className={`flex items-center justify-center text-sm cursor-pointer select-none transition-colors hover:bg-violet-100/60 h-full border-b-1 border-zinc-200 box-border ${borderClass}`}
      onClick={() => {
        if (mode !== "selected") setMode("selected");
      }}
      onDoubleClick={() => {
        setDraft(displayValue);
        setMode("editing");
      }}
      onKeyDown={(e) => {
        if (mode !== "selected") return;
        if (e.key === "Delete" || e.key === "Backspace") {
          e.preventDefault();
          if (fraction != null) onEdit(null);
          setMode("idle");
        } else if (e.key === "Escape") {
          setMode("idle");
        } else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey) {
          // Start typing — enter edit mode with the typed character as initial draft
          e.preventDefault();
          setDraft(e.key);
          setMode("editing");
        }
      }}
    >
      {displayValue}
    </div>
  );
}

const AllocationCell = memo(AllocationCellInner);
export default AllocationCell;

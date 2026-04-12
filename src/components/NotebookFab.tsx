"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { NotebookPen } from "lucide-react";

export default function NotebookFab() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [notes, setNotes] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Load from API on mount
  useEffect(() => {
    fetch("/api/notepad")
      .then((r) => r.json())
      .then((data) => {
        setNotes(data.content ?? "");
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  // Persist to API on change (debounced)
  const saveToApi = useCallback((content: string) => {
    setSaving(true);
    fetch("/api/notepad", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    }).finally(() => setSaving(false));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => saveToApi(notes), 600);
    return () => clearTimeout(t);
  }, [notes, loaded, saveToApi]);

  // Focus textarea when opening
  useEffect(() => {
    if (open && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = textareaRef.current.value.length;
    }
  }, [open]);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setOpen(false);
    }, 250);
  }, []);

  // Close on click outside
  useEffect(() => {
    if (!open || closing) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, closing, handleClose]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="btn-chunky fixed bottom-12 right-12 z-10 flex items-center justify-center w-15 h-15 rounded-full bg-amber-100 text-amber-800"
        title="Open notepad"
      >
        <NotebookPen size={22} strokeWidth={2.5} />
      </button>
    );
  }

  return (
    <div ref={panelRef} className={`fixed bottom-12 right-12 z-49 ${closing ? "notepad-close" : "notepad-open"}`}>
      {/* Notepad body */}
      <div className="w-120 h-170 bg-amber-50 border-2 border-zinc-900 rounded-lg shadow-[4px_5px_0_#1a1a1a] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b-2 border-zinc-300 bg-amber-100">
          <span className="text-sm font-bold text-zinc-700 tracking-wide">Public Notepad</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">{saving ? "saving..." : "saved"}</span>
            <button
              onClick={handleClose}
              className="btn-chunky flex items-center justify-center w-6 h-6 rounded bg-white text-zinc-600 hover:text-zinc-900 text-xs font-bold"
            >
              x
            </button>
          </div>
        </div>

        {/* Lined textarea */}
        <div className="flex-1 relative">
          {/* Blue lines background */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "repeating-linear-gradient(to bottom, transparent, transparent 23px, #bfdbfe 23px, #bfdbfe 24px)",
              backgroundPositionY: 8,
            }}
          />
          {/* Red margin line */}
          <div className="absolute top-0 bottom-0 left-8 w-px bg-rose-300 pointer-events-none" />

          <textarea
            ref={textareaRef}
            className="w-full h-full resize-none bg-transparent px-3 pl-10 py-2 text-sm text-zinc-800 outline-none font-mono leading-6"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Jot something down..."
            spellCheck={false}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-3 py-1.5 border-t border-zinc-300 bg-amber-50/80">
          <span className="text-xs text-zinc-400">
            {notes.length > 0 ? `${notes.split("\n").length} lines` : "empty"}
          </span>
        </div>
      </div>
    </div>
  );
}

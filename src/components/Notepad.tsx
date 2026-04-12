"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const WIDTH = 450;
const HEIGHT = 500;
const HEADER = 30;
const MARGIN_BOTTOM = -10;

export default function Notepad() {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hovering, setHovering] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch("/api/notepad")
      .then((r) => r.json())
      .then((d) => { setNotes(d.content ?? ""); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  const save = useCallback((content: string) => {
    setSaving(true);
    fetch("/api/notepad", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    }).finally(() => setSaving(false));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => save(notes), 600);
    return () => clearTimeout(t);
  }, [notes, loaded, save]);

  useEffect(() => {
    if (open && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = textareaRef.current.value.length;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  let translateY: number;
  if (open) translateY = -MARGIN_BOTTOM;
  else if (hovering) translateY = -MARGIN_BOTTOM;
  else translateY = HEIGHT - HEADER;

  return (
    <div
      ref={ref}
      className="fixed z-10"
      style={{
        right: 80,
        bottom: 0,
        width: WIDTH,
        height: HEIGHT,
        transform: `translateY(${translateY}px)`,
        transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        cursor: open ? "default" : "pointer",
      }}
      onMouseEnter={() => { if (!open) setHovering(true); }}
      onMouseLeave={() => setHovering(false)}
      onClick={() => { if (!open) setOpen(true); }}
    >
      <div
        className="w-full h-full bg-white rounded-lg border-2 border-zinc-900 flex flex-col overflow-hidden pb-5"
        style={{ boxShadow: "3px 3px 0 #1a1a1a" }}
      >
        {/* Header tab */}
        <div
          className="flex items-center justify-between px-4 border-b-2 border-zinc-900 bg-amber-50 shrink-0 cursor-pointer"
          style={{ height: HEADER }}
          onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        >
          <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Notepad</span>
          <span className="text-xs text-zinc-400">{saving ? "saving..." : "saved"}</span>
        </div>

        {/* Lined writing area */}
        <div className="flex-1 relative bg-white">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "repeating-linear-gradient(to bottom, transparent, transparent 23px, #dbeafe 23px, #dbeafe 24px)",
              backgroundPositionY: 8,
            }}
          />
          <div className="absolute top-0 bottom-0 left-9 w-px bg-rose-300/50 pointer-events-none" />
          <textarea
            ref={textareaRef}
            className="w-full h-full resize-none bg-transparent px-4 pl-11 py-2 text-sm text-zinc-800 outline-none font-mono leading-6"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Jot something down..."
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}

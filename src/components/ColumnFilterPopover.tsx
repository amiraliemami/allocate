"use client";

import { useEffect, useRef } from "react";

interface Props {
  children: React.ReactNode;
  onClose: () => void;
  align?: "left" | "right";
}

export default function ColumnFilterPopover({
  children,
  onClose,
  align = "left",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className={`filter-popover absolute top-full mt-1 z-30 min-w-[200px] rounded-lg border-2 border-zinc-900 bg-white p-3 shadow-[3px_4px_0_#1a1a1a] ${
        align === "right" ? "right-0" : "left-0"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

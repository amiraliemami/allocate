"use client";

interface Props {
  activeView: "project" | "teammate";
  onToggle: (view: "project" | "teammate") => void;
}

export default function ViewToggle({ activeView, onToggle }: Props) {
  return (
    <div className="flex justify-center">
      <div className="inline-flex border-2 border-zinc-900 rounded-lg overflow-hidden">
        <button
          onClick={() => onToggle("project")}
          className={`px-4 py-1.5 text-sm font-bold transition-colors ${
            activeView === "project"
              ? "bg-zinc-900 text-white"
              : "bg-white text-zinc-600 hover:bg-zinc-100"
          }`}
        >
          PROJECT VIEW
        </button>
        <button
          onClick={() => onToggle("teammate")}
          className={`px-4 py-1.5 text-sm font-bold transition-colors ${
            activeView === "teammate"
              ? "bg-zinc-900 text-white"
              : "bg-white text-zinc-600 hover:bg-zinc-100"
          }`}
        >
          TEAMMATE VIEW
        </button>
      </div>
    </div>
  );
}

"use client";

interface Props {
  value: "all" | "yes" | "no";
  onChange: (value: "all" | "yes" | "no") => void;
}

const OPTIONS: { value: "all" | "yes" | "no"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

export default function ToggleFilter({ value, onChange }: Props) {
  return (
    <div className="flex gap-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 rounded-md border-2 px-3 py-1.5 text-sm font-bold transition-colors ${
            value === opt.value
              ? "border-violet-700 bg-violet-100 text-violet-800"
              : "border-zinc-300 bg-white text-zinc-500 hover:bg-zinc-50"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

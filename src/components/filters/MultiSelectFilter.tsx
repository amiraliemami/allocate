"use client";

import { useState } from "react";

interface Props {
  options: { value: string; label: string }[];
  selected: Set<string>;
  onChange: (selected: Set<string>) => void;
  searchable?: boolean;
}

export default function MultiSelectFilter({
  options,
  selected,
  onChange,
  searchable,
}: Props) {
  const [search, setSearch] = useState("");

  const filtered = searchable && search
    ? options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  const allSelected = filtered.length > 0 && filtered.every((o) => selected.has(o.value));

  const toggle = (value: string) => {
    const next = new Set(selected);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    onChange(next);
  };

  const selectAll = () => {
    const next = new Set(selected);
    filtered.forEach((o) => next.add(o.value));
    onChange(next);
  };

  const clearAll = () => {
    const next = new Set(selected);
    filtered.forEach((o) => next.delete(o.value));
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-2">
      {searchable && (
        <input
          type="text"
          className="w-full rounded-md border-2 border-zinc-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-violet-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          autoFocus
        />
      )}

      <div className="flex gap-2 text-xs font-medium">
        <button
          onClick={allSelected ? clearAll : selectAll}
          className="text-violet-600 hover:underline"
        >
          {allSelected ? "Clear all" : "Select all"}
        </button>
      </div>

      <div className="flex flex-col gap-0.5 max-h-[200px] overflow-y-auto">
        {filtered.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer transition-colors ${
              selected.has(opt.value)
                ? "bg-violet-100 font-medium"
                : "hover:bg-zinc-50"
            }`}
          >
            <input
              type="checkbox"
              checked={selected.has(opt.value)}
              onChange={() => toggle(opt.value)}
              className="accent-violet-600"
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
}

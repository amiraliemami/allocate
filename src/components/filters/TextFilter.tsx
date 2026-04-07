"use client";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function TextFilter({ value, onChange, placeholder }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        className="w-full rounded-md border-2 border-zinc-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-violet-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Search..."}
        autoFocus
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="self-end text-xs text-violet-600 font-medium hover:underline"
        >
          Clear
        </button>
      )}
    </div>
  );
}

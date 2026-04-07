"use client";

interface Props {
  value: string;
  options: { value: string; label: string }[];
  onSave: (value: string) => void;
  disabled?: boolean;
}

export default function InlineSelect({ value, options, onSave, disabled }: Props) {
  const current = options.find((o) => o.value === value);

  return (
    <select
      className={`cell-editable w-full bg-transparent px-2 py-2 text-sm outline-none appearance-none min-h-[36px] truncate ${disabled ? "pointer-events-none opacity-40" : "cursor-pointer"}`}
      value={value}
      onChange={(e) => onSave(e.target.value)}
      disabled={disabled}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
      {/* If current value isn't in options (legacy data), show it */}
      {!current && value && (
        <option value={value} disabled>
          {value}
        </option>
      )}
    </select>
  );
}

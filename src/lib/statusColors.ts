export const STATUS_COLORS = {
  Upcoming: {
    chip: "bg-amber-100 text-amber-800 border-amber-800",
    rowBg: "bg-amber-100/70",
    rowBgAlt: "bg-amber-50",
    border: "border-amber-800",
  },
  Active: {
    chip: "bg-emerald-100 text-emerald-800 border-emerald-800",
    rowBg: "bg-emerald-100/70",
    rowBgAlt: "bg-emerald-50",
    border: "border-emerald-800",
  },
  Paused: {
    chip: "bg-rose-100 text-rose-800 border-rose-800",
    rowBg: "bg-rose-100/70",
    rowBgAlt: "bg-rose-50",
    border: "border-rose-800",
  },
  Archived: {
    chip: "bg-zinc-200 text-zinc-700 border-zinc-700",
    rowBg: "bg-zinc-100/70",
    rowBgAlt: "bg-zinc-50",
    border: "border-zinc-700",
  },
  Completed: {
    chip: "bg-blue-100 text-blue-800 border-blue-800",
    rowBg: "bg-blue-100/70",
    rowBgAlt: "bg-blue-50",
    border: "border-blue-800",
  },
} as const;

export type StatusKey = keyof typeof STATUS_COLORS;

export const STATUS_ORDER: StatusKey[] = [
  "Upcoming",
  "Active",
  "Paused",
  "Archived",
  "Completed",
];

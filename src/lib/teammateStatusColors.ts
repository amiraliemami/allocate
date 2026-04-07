export const TEAMMATE_STATUS_COLORS = {
  Active: {
    chip: "bg-emerald-100 text-emerald-800 border-emerald-800",
    rowBg: "bg-emerald-100/70",
    rowBgAlt: "bg-emerald-50",
    border: "border-emerald-800",
  },
  Alumni: {
    chip: "bg-zinc-200 text-zinc-700 border-zinc-700",
    rowBg: "bg-zinc-100/70",
    rowBgAlt: "bg-zinc-50",
    border: "border-zinc-700",
  },
} as const;

export type TeammateStatusKey = keyof typeof TEAMMATE_STATUS_COLORS;

export const TEAMMATE_STATUS_ORDER: TeammateStatusKey[] = [
  "Active",
  "Alumni",
];

const PALETTE = [
  "#fefce8", // yellow-50
  "#f0fdf4", // green-50
  "#ecfeff", // cyan-50
  "#eff6ff", // blue-50
  "#faf5ff", // purple-50
  "#fdf2f8", // pink-50
  "#fff7ed", // orange-50
  "#f0fdfa", // teal-50
  "#fefbec", // warm amber
  "#eef2ff", // indigo-50
  "#fef2f2", // rose-50
  "#f8fafc", // slate-50
];

export function getProjectBg(index: number): string {
  return PALETTE[index % PALETTE.length];
}

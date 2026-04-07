const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export type MonthGroup = {
  label: string;
  year: number;
  month: number;
  weeks: string[];
};

export function groupWeeksByMonth(weekStarts: string[]): MonthGroup[] {
  const groups = new Map<string, MonthGroup>();

  for (const ws of weekStarts) {
    const date = new Date(ws + "T00:00:00");
    const year = date.getFullYear();
    const month = date.getMonth();
    const key = `${year}-${month}`;

    if (!groups.has(key)) {
      groups.set(key, {
        label: `${MONTH_NAMES[month]} ${year}`,
        year,
        month,
        weeks: [],
      });
    }
    groups.get(key)!.weeks.push(ws);
  }

  return Array.from(groups.values());
}

export function getCurrentMonday(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.getFullYear(), now.getMonth(), diff);
  // Use local date parts to avoid UTC timezone shift
  const y = monday.getFullYear();
  const m = String(monday.getMonth() + 1).padStart(2, "0");
  const d = String(monday.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isCurrentWeek(weekStart: string): boolean {
  return weekStart === getCurrentMonday();
}

export function formatWeekLabel(weekStart: string): string {
  const date = new Date(weekStart + "T00:00:00");
  return String(date.getDate());
}

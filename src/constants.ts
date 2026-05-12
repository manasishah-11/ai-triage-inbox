export const STATUS_STYLES: Record<string, string> = {
  New: "bg-blue-500/12 text-blue-800 ring-blue-500/25 dark:bg-blue-500/15 dark:text-blue-200 dark:ring-blue-500/30",
  "In Progress":
    "bg-amber-500/12 text-amber-900 ring-amber-500/25 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-500/30",
  Done: "bg-emerald-500/12 text-emerald-800 ring-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-500/30",
};

export const PRIORITY_STYLES: Record<string, string> = {
  P1: "bg-rose-500/12 text-rose-800 ring-rose-500/25 dark:bg-rose-500/15 dark:text-rose-200 dark:ring-rose-500/30",
  P2: "bg-violet-500/12 text-violet-800 ring-violet-500/25 dark:bg-violet-500/15 dark:text-violet-200 dark:ring-violet-500/30",
  P3: "bg-slate-500/12 text-slate-700 ring-slate-400/30 dark:bg-slate-500/15 dark:text-slate-200 dark:ring-slate-400/30",
};

export const STATUS_OPTIONS = [
  { value: "New", label: "New" },
  { value: "In Progress", label: "In Progress" },
  { value: "Done", label: "Done" },
];

export const PRIORITY_OPTIONS = [
  { value: "P1", label: "P1" },
  { value: "P2", label: "P2" },
  { value: "P3", label: "P3" },
];

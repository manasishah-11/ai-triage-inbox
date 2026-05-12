function InboxTabItem({
  keyLabel,
  label,
  count,
  Icon,
  selected,
  onSelect,
}: {
  keyLabel: string;
  label: string;
  count: number;
  Icon: React.ElementType;
  selected: boolean;
  onSelect: (key: string) => void;
}) {
  return (
    <button
      type="button"
      aria-current={selected ? "page" : undefined}
      onClick={() => {
        onSelect(keyLabel);
      }}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
        selected
          ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-600/80"
          : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-100"
      }`}
    >
      <Icon className="size-4 shrink-0 opacity-85" aria-hidden />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span
        className={`shrink-0 rounded-md px-1.5 py-0.5 text-xs tabular-nums ${
          selected
            ? "bg-slate-100 text-slate-600 dark:bg-slate-700/80 dark:text-slate-300"
            : "bg-slate-200/70 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

export default InboxTabItem;

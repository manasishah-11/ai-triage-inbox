function ConfidenceIndicator({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, Math.round(score * 100)));
  const tier =
    score >= 0.85
      ? {
          label: "High confidence",
          bar: "bg-emerald-500 dark:bg-emerald-400",
          text: "text-emerald-800 dark:text-emerald-200/90",
        }
      : score >= 0.65
        ? {
            label: "Medium confidence",
            bar: "bg-amber-500 dark:bg-amber-400",
            text: "text-amber-900 dark:text-amber-200/90",
          }
        : {
            label: "Lower confidence",
            bar: "bg-slate-400 dark:bg-slate-500",
            text: "text-slate-700 dark:text-slate-300",
          };

  return (
    <section
      className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-3 dark:border-slate-700 dark:bg-slate-800/40"
      aria-label={`Model confidence ${pct} percent`}
    >
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Confidence
        </span>
        <span className={`tabular-nums font-semibold ${tier.text}`}>
          {pct}%
        </span>
      </div>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${tier.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className={`mt-1.5 text-xs font-medium ${tier.text}`}>{tier.label}</p>
    </section>
  );
}

export default ConfidenceIndicator;

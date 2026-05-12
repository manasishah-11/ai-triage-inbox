import { Loader2, RefreshCw } from "lucide-react";
import type { LoadState } from "./AiAssistPanel";

function DebugView({
  load,
  handleRetryLoad,
}: {
  load: LoadState;
  handleRetryLoad: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5 sm:px-5">
      {load.status === "loading" ? (
        <div className="flex min-h-56 flex-col items-center justify-center gap-3 py-8">
          <Loader2
            className="size-9 animate-spin text-emerald-600 dark:text-emerald-400"
            strokeWidth={2}
            aria-hidden
          />
          <p className="text-center text-sm font-medium text-slate-800 dark:text-slate-100">
            Loading payload…
          </p>
          <p className="max-w-xs text-center text-xs text-slate-500 dark:text-slate-400">
            Simulated delay ~0.2–1.2s (same as inbox).
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Raw JSON
            </p>
            <button
              type="button"
              onClick={handleRetryLoad}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200/90 bg-white/80 px-2 py-1 text-[11px] font-medium text-slate-600 backdrop-blur-sm hover:bg-slate-50 dark:border-slate-600/80 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <RefreshCw className="size-3" strokeWidth={2} aria-hidden />
              Retry
            </button>
          </div>
          {load.errors.length > 0 ? (
            <ul className="mb-3 space-y-1 rounded-md border border-rose-200/60 bg-rose-50/50 px-2.5 py-2 text-[11px] text-rose-900 dark:border-rose-500/25 dark:bg-rose-950/25 dark:text-rose-100">
              {load.errors.map((err, i) => (
                <li key={i}>
                  <span className="font-mono text-[10px] text-rose-700/90 dark:text-rose-300/90">
                    {err.path || "(root)"}
                  </span>
                  <span className="text-rose-800/80 dark:text-rose-200/80">
                    {" "}
                    — {err.message}
                  </span>
                </li>
              ))}
            </ul>
          ) : load.status === "success" ? (
            <p className="mb-3 text-[11px] text-slate-500 dark:text-slate-400">
              Validation passed.
            </p>
          ) : null}
          <pre className="min-h-48 flex-1 overflow-auto rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 font-mono text-[11px] leading-relaxed text-slate-800 tabular-nums dark:border-slate-700/80 dark:bg-slate-950/40 dark:text-slate-200">
            {load.rawJson || "—"}
          </pre>
        </>
      )}
    </div>
  );
}

export default DebugView;

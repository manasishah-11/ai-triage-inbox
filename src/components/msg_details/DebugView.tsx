import { useState } from "react";
import { ClipboardCopy, Loader2, RefreshCw } from "lucide-react";
import type { AiAssistLoadStatus } from "@store/useAiAssistCacheStore";
import {
  aiAssistSchema,
  formatAiAssistSchemaIssues,
} from "@lib/aiAssistSchema";

type DebugViewProps = {
  messageId: string;
  loadStatus: AiAssistLoadStatus;
  loadError: string | null;
  rawJson: string | null;
  onRetry: () => void;
};

function DebugView({
  messageId,
  loadStatus,
  loadError,
  rawJson,
  onRetry,
}: DebugViewProps) {
  const [copyOk, setCopyOk] = useState(false);

  const handleCopy = async () => {
    if (!rawJson) return;
    try {
      await navigator.clipboard.writeText(rawJson);
      setCopyOk(true);
      window.setTimeout(() => setCopyOk(false), 2000);
    } catch {
      setCopyOk(false);
    }
  };

  const loading = loadStatus === "loading";

  const validationIssues = !loadError
    ? []
    : formatAiAssistSchemaIssues(
        aiAssistSchema.safeParse(JSON.parse(loadError)).error,
      );

  console.log(validationIssues);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Message
        </p>
        <p className="mt-1 font-mono text-xs text-slate-700 dark:text-slate-300">
          {messageId}
        </p>

        <section className="mt-6 space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Validation
          </h3>
          {loading ? (
            <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
              Loading…
            </p>
          ) : !loadError === true ? (
            <p className="text-sm text-emerald-800 dark:text-emerald-200">
              Schema valid — payload matches{" "}
              <code className="text-xs">AiAssistData</code>.
            </p>
          ) : (
            <ul className="space-y-2 rounded-lg border border-amber-500/35 bg-amber-500/10 p-3 dark:border-amber-500/25 dark:bg-amber-500/10">
              {validationIssues.length > 0 &&
                validationIssues.map((issue, i) => (
                  <li
                    key={i}
                    className="text-sm text-amber-950 dark:text-amber-100"
                  >
                    <span className="font-mono text-xs text-amber-900/90 dark:text-amber-200/90">
                      {issue.path}
                    </span>
                    <span className="text-amber-800 dark:text-amber-200/90">
                      {" — "}
                      {issue.message}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </section>

        <section className="mt-6 space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Raw JSON
          </h3>
          {loading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Waiting for response…
            </p>
          ) : (
            <pre className="max-h-[min(50vh,24rem)] overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
              {rawJson}
            </pre>
          )}
        </section>
      </div>

      <div className="shrink-0 border-t border-slate-200 px-4 py-4 dark:border-slate-800 sm:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onRetry}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-amber-600 dark:hover:bg-amber-500"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <RefreshCw className="size-4" aria-hidden />
            )}
            Retry load
          </button>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!rawJson || loading}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            <ClipboardCopy className="size-4" aria-hidden />
            {copyOk ? "Copied" : "Copy JSON"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DebugView;

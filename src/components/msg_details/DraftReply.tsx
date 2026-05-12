import { Square, RefreshCw } from "lucide-react";
import type { DraftStreamStatus, LoadState } from "./AiAssistPanel";

/** Ref from `useRef<boolean>(…)` — structural type avoids deprecated `MutableRefObject`. */
type BooleanRef = { current: boolean };

function DraftReply({
  allowAiHydrateRef,
  draftStreamStatus,
  handleStopDraft,
  handleRetryDraft,
  load,
  draftReply,
  setDraftReply,
}: {
  allowAiHydrateRef: BooleanRef;
  draftStreamStatus: DraftStreamStatus;
  handleStopDraft: () => void;
  handleRetryDraft: () => void;
  load: LoadState;
  draftReply: string;
  setDraftReply: (draftReply: string) => void;
}) {
  return (
    <section className="mt-6 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label
          htmlFor="ai-assist-draft-reply"
          className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Draft reply
          {draftStreamStatus === "generating" ? (
            <span className="ml-2 font-normal normal-case text-emerald-600 dark:text-emerald-400">
              Generating…
            </span>
          ) : null}
        </label>
        {draftStreamStatus === "generating" ? (
          <button
            type="button"
            onClick={handleStopDraft}
            className="inline-flex items-center gap-1.5 rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-900 shadow-sm hover:bg-rose-100 dark:border-rose-500/35 dark:bg-rose-950/40 dark:text-rose-100 dark:hover:bg-rose-950/60"
          >
            <Square
              className="size-3.5 fill-current"
              strokeWidth={2}
              aria-hidden
            />
            Stop
          </button>
        ) : (
          <button
            type="button"
            onClick={handleRetryDraft}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            disabled={load.status !== "success"}
          >
            <RefreshCw className="size-3.5" strokeWidth={2} aria-hidden />
            Retry
          </button>
        )}
      </div>
      <textarea
        id="ai-assist-draft-reply"
        rows={10}
        value={draftReply}
        aria-busy={draftStreamStatus === "generating"}
        onChange={(e) => {
          allowAiHydrateRef.current = false;
          setDraftReply(e.target.value);
        }}
        readOnly={
          load.status !== "success" || draftStreamStatus === "generating"
        }
        className="mt-1 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm leading-relaxed text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 read-only:cursor-not-allowed read-only:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-emerald-500/40 dark:focus:ring-emerald-500/15 dark:read-only:bg-slate-900/80"
      />
    </section>
  );
}

export default DraftReply;

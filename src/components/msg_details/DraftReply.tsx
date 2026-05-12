import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { RefreshCw, Square } from "lucide-react";
import { shouldSimulateFailure } from "@mocks/mockNetwork";
import { useAiAssistCacheStore } from "@store/useAiAssistCacheStore";
import { useDebounce } from "@hooks/useDebounce";

const CHARS_PER_STEP = 2;
const STEP_MS = 14;

function DraftReply({
  messageId,
  draftReply,
  draftReplyEdited = false,
}: {
  messageId: string;
  draftReply: string;
  draftReplyEdited?: boolean;
}) {
  const updateDraftReplyUser = useAiAssistCacheStore(
    (s) => s.updateDraftReplyUser,
  );
  const resetDraftReply = useAiAssistCacheStore((s) => s.resetDraftReply);

  const [visible, setVisible] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [replayToken, setReplayToken] = useState(0);

  const stopRequestedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftReplyRef = useRef(draftReply);
  const draftReplyEditedRef = useRef(draftReplyEdited);

  useLayoutEffect(() => {
    draftReplyRef.current = draftReply;
    draftReplyEditedRef.current = draftReplyEdited;
  }, [draftReply, draftReplyEdited]);

  const debouncedDraftReply = useDebounce(visible, 500);

  useEffect(() => {
    if (streaming) return;
    if (debouncedDraftReply !== visible) return;
    if (!debouncedDraftReply && !draftReply) return;
    if (debouncedDraftReply === draftReply) return;
    updateDraftReplyUser(messageId, debouncedDraftReply);
  }, [
    debouncedDraftReply,
    visible,
    draftReply,
    messageId,
    streaming,
    updateDraftReplyUser,
  ]);

  useEffect(() => {
    stopRequestedRef.current = false;
    if (timeoutRef.current != null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const source = draftReplyRef.current;
    const skipStream = draftReplyEditedRef.current;

    const raf = requestAnimationFrame(() => {
      setStreamError(null);
      if (!source) {
        setVisible("");
        setStreaming(false);
        return;
      }

      if (skipStream) {
        setVisible(source);
        setStreaming(false);
        return;
      }

      setVisible("");
      setStreaming(true);
      let index = 0;

      const schedule = (fn: () => void) => {
        timeoutRef.current = window.setTimeout(fn, STEP_MS);
      };

      const step = () => {
        if (stopRequestedRef.current) {
          if (timeoutRef.current != null) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          setStreaming(false);
          return;
        }

        index = Math.min(source.length, index + CHARS_PER_STEP);
        setVisible(source.slice(0, index));

        if (index >= source.length) {
          if (timeoutRef.current != null) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          setStreaming(false);
          return;
        }

        schedule(step);
      };

      schedule(step);
    });

    return () => {
      cancelAnimationFrame(raf);
      stopRequestedRef.current = true;
      if (timeoutRef.current != null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [replayToken, messageId]);

  const handleStop = () => {
    stopRequestedRef.current = true;
    if (timeoutRef.current != null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setStreaming(false);
  };

  const handleRetryStream = () => {
    if (shouldSimulateFailure()) {
      setStreamError(
        "Couldn’t regenerate the draft (simulated ~10–15% failure). Try again.",
      );
      return;
    }
    setStreamError(null);
    stopRequestedRef.current = false;
    resetDraftReply(messageId);
    setReplayToken((t) => t + 1);
  };

  return (
    <section className="mt-6 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label
          htmlFor="ai-assist-draft-reply"
          className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Draft reply
          {streaming ? (
            <span className="ml-2 font-normal normal-case text-emerald-600 dark:text-emerald-400">
              Generating…
            </span>
          ) : null}
        </label>
        {!streamError ? (
          streaming ? (
            <button
              type="button"
              onClick={handleStop}
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
              onClick={handleRetryStream}
              disabled={!draftReply}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <RefreshCw className="size-3.5" strokeWidth={2} aria-hidden />
              Retry
            </button>
          )
        ) : null}
      </div>

      {streamError ? (
        <div
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900 dark:border-rose-500/35 dark:bg-rose-950/40 dark:text-rose-100"
          role="alert"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm">{streamError}</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRetryStream}
                className="inline-flex items-center gap-1.5 rounded-md border border-rose-300 bg-white px-2.5 py-1.5 text-xs font-medium text-rose-900 shadow-sm hover:bg-rose-50 dark:border-rose-500/40 dark:bg-slate-900 dark:text-rose-100 dark:hover:bg-slate-800"
              >
                <RefreshCw className="size-3.5" strokeWidth={2} aria-hidden />
                Try again
              </button>
              <button
                type="button"
                onClick={() => setStreamError(null)}
                className="rounded-md px-2.5 py-1.5 text-xs font-medium text-rose-800/90 hover:bg-rose-100/70 dark:text-rose-200/90 dark:hover:bg-rose-900/30"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <textarea
        id="ai-assist-draft-reply"
        rows={10}
        value={visible}
        aria-busy={streaming}
        readOnly={streaming}
        onChange={(e) => {
          if (streaming) return;
          setVisible(e.target.value);
        }}
        className="mt-1 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm leading-relaxed text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 read-only:cursor-not-allowed read-only:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-emerald-500/40 dark:focus:ring-emerald-500/15 dark:read-only:bg-slate-900/80"
      />
    </section>
  );
}

export default DraftReply;

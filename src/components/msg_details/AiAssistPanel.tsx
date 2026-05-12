import { useEffect, useState, type TransitionEvent } from "react";
import { Sparkles, X } from "lucide-react";
import {
  useAiAssistCacheStore,
  type AiAssistData,
} from "@store/useAiAssistCacheStore";
import LoadingState from "@components/common/LoadingState";
import ErrorState from "@components/common/ErrorState";
import ConfidenceIndicator from "./ConfidenceIndicator";
import DraftReply from "./DraftReply";
import DebugView from "./DebugView";

function categoryStyles(category: AiAssistData["category"]) {
  const map: Record<AiAssistData["category"], string> = {
    Billing:
      "bg-violet-500/12 text-violet-900 ring-violet-500/25 dark:bg-violet-500/15 dark:text-violet-200 dark:ring-violet-500/35",
    Claims:
      "bg-sky-500/12 text-sky-900 ring-sky-500/25 dark:bg-sky-500/15 dark:text-sky-200 dark:ring-sky-500/35",
    Endorsement:
      "bg-amber-500/12 text-amber-900 ring-amber-500/25 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-500/35",
    General:
      "bg-slate-500/12 text-slate-800 ring-slate-400/30 dark:bg-slate-500/15 dark:text-slate-200 dark:ring-slate-500/30",
    Urgent:
      "bg-rose-500/12 text-rose-900 ring-rose-500/25 dark:bg-rose-500/15 dark:text-rose-200 dark:ring-rose-500/35",
    Spam: "bg-orange-500/12 text-orange-900 ring-orange-500/25 dark:bg-orange-500/15 dark:text-orange-200 dark:ring-orange-500/35",
  };
  return map[category] ?? map.General;
}

function AiAssistPanel({
  open,
  onClose,
  messageId,
}: {
  open: boolean;
  onClose: () => void;
  messageId: string;
}) {
  const [debugMode, setDebugMode] = useState(false);
  /** Stays true through close animation until the sheet finishes sliding out. */
  const [keepMounted, setKeepMounted] = useState(false);
  const [enter, setEnter] = useState(false);

  const loadData = useAiAssistCacheStore((s) => s.loadData);
  const data = useAiAssistCacheStore((s) => s.byId[messageId]);
  const loadStatus = useAiAssistCacheStore(
    (s) => s.loadStatusById[messageId] ?? "idle",
  );
  const loadError = useAiAssistCacheStore(
    (s) => s.loadErrorById[messageId] ?? null,
  );

  const showPanel = open || keepMounted;

  useEffect(() => {
    if (!loadError) return;
    const id = requestAnimationFrame(() => {
      setDebugMode(true);
    });
    return () => cancelAnimationFrame(id);
  }, [loadError]);

  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => {
        setKeepMounted(true);
        requestAnimationFrame(() => setEnter(true));
      });
      return () => cancelAnimationFrame(id);
    }
    const id = requestAnimationFrame(() => setEnter(false));
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open || !messageId) return;
    void loadData(messageId);
  }, [open, messageId, loadData]);

  /** `transitionend` may not fire when transitions are disabled (e.g. reduced motion). */
  useEffect(() => {
    if (open || !keepMounted) return;
    const id = window.setTimeout(() => setKeepMounted(false), 320);
    return () => clearTimeout(id);
  }, [open, keepMounted]);

  if (!showPanel) return null;

  const handleRetryLoad = () => {
    if (!messageId) return;
    void loadData(messageId, true);
  };

  const backdropTransition =
    "transition-opacity duration-300 ease-out motion-reduce:transition-none";
  const sheetTransition =
    "transition-transform duration-300 ease-out motion-reduce:transition-none";

  const handleSheetTransitionEnd = (e: TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.propertyName !== "transform") return;
    if (!open) setKeepMounted(false);
  };

  return (
    <div
      className={[
        "fixed inset-0 z-40 flex h-dvh max-h-dvh min-h-0 items-stretch justify-end",
        enter ? "pointer-events-auto" : "pointer-events-none",
      ].join(" ")}
    >
      {/* click-outside-to-dismiss */}
      <button
        type="button"
        aria-label="Close AI assist panel"
        className={[
          "absolute inset-0 z-0 bg-slate-900/40 backdrop-blur-[2px] dark:bg-slate-950/60",
          backdropTransition,
          enter ? "opacity-100" : "opacity-0",
        ].join(" ")}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-hidden={!enter}
        className={[
          "relative z-10 flex min-h-0 w-full max-w-xl flex-col self-stretch border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:max-w-2xl",
          sheetTransition,
          enter ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
        onTransitionEnd={handleSheetTransitionEnd}
      >
        <header className="flex shrink-0 border-b border-slate-200 px-4 py-4 dark:border-slate-800 sm:px-5">
          <div className="flex w-full items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/25 dark:bg-emerald-500/12 dark:text-emerald-300 dark:ring-emerald-500/35">
                <Sparkles className="size-4" strokeWidth={2} aria-hidden />
              </span>
              <div className="min-w-0">
                <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                  {debugMode ? "Debug" : "AI assist"}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {debugMode
                    ? "Raw payload and validation — for development only."
                    : "Suggestions only — review before sending."}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <label
                htmlFor="debug-switch"
                className={[
                  "cursor-pointer select-none text-[10px] font-semibold uppercase tracking-wide transition-colors",
                  debugMode
                    ? "text-amber-800 dark:text-amber-200"
                    : "text-slate-400 dark:text-slate-500",
                ].join(" ")}
              >
                Debug
              </label>
              <button
                id="debug-switch"
                type="button"
                role="switch"
                aria-checked={debugMode}
                aria-label={
                  debugMode
                    ? "Debug mode is on, press to turn off"
                    : "Debug mode is off, press to turn on"
                }
                title={
                  debugMode
                    ? "Back to suggestions"
                    : "Inspect raw JSON and validation"
                }
                onClick={() => setDebugMode((d) => !d)}
                className={[
                  "relative flex h-7 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 ring-1 ring-inset transition-[background-color,box-shadow,ring-color] duration-200 ease-out",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500/35",
                  debugMode
                    ? "bg-amber-500 shadow-inner ring-amber-600/40 dark:bg-amber-600 dark:ring-amber-400/35"
                    : "bg-slate-200 shadow-sm ring-slate-300/80 dark:bg-slate-700 dark:ring-slate-600/80",
                ].join(" ")}
              >
                <span className="sr-only">
                  {debugMode
                    ? "Switch to suggestions view"
                    : "Switch to inspect view"}
                </span>
                <span
                  aria-hidden
                  className={[
                    "pointer-events-none inline-block size-5 rounded-full shadow-sm ring-1 transition-transform duration-200 ease-out will-change-transform",
                    debugMode
                      ? "translate-x-5 bg-white ring-amber-900/10 dark:bg-amber-50 dark:ring-amber-900/20"
                      : "translate-x-0 bg-white ring-slate-900/8 dark:bg-slate-100 dark:ring-white/10",
                  ].join(" ")}
                />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="grid size-9 shrink-0 place-items-center rounded-full text-slate-400 transition-colors hover:bg-slate-100/90 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800/80 dark:hover:text-slate-300"
                aria-label="Close"
              >
                <X className="size-4" strokeWidth={2} aria-hidden />
              </button>
            </div>
          </div>
        </header>

        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <div
            className={
              debugMode
                ? "pointer-events-none invisible absolute inset-0 z-0 flex min-h-0 flex-col overflow-hidden"
                : "flex min-h-0 flex-1 flex-col overflow-hidden"
            }
            aria-hidden={debugMode}
          >
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5">
              {loadStatus === "error" && !data ? (
                <ErrorState
                  errorTitle="Invalid JSON"
                  errorMessage={
                    loadError ??
                    "Something went wrong. You can retry or use Debug to inspect."
                  }
                  onRetry={handleRetryLoad}
                />
              ) : !data && loadStatus === "loading" ? (
                <LoadingState
                  loadingTitle="Loading AI suggestions…"
                  loadingMessage="Simulated network delay (about 0.2–1.2s), same idea as the inbox list."
                />
              ) : data && loadStatus === "ready" ? (
                (() => {
                  const {
                    confidence,
                    summary_bullets,
                    category,
                    suggested_action,
                    draft_reply,
                    draft_reply_edited,
                  } = data;
                  return (
                    <>
                      {confidence != null ? (
                        <ConfidenceIndicator score={confidence} />
                      ) : null}

                      <section
                        className={
                          confidence != null
                            ? "mt-6 space-y-2"
                            : "mt-1 space-y-2"
                        }
                      >
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Summary
                        </h3>
                        <ul className="list-disc space-y-1.5 pl-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                          {summary_bullets.map((line, i) => (
                            <li key={i}>{line}</li>
                          ))}
                        </ul>
                      </section>

                      <section className="mt-6 space-y-2">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Category
                        </h3>
                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                            categoryStyles(category),
                          ].join(" ")}
                        >
                          {category}
                        </span>
                      </section>

                      <section className="mt-6 space-y-2">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Suggested next action
                        </h3>
                        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                          {suggested_action}
                        </p>
                      </section>

                      <DraftReply
                        key={messageId}
                        messageId={messageId}
                        draftReply={draft_reply}
                        draftReplyEdited={draft_reply_edited === true}
                      />
                    </>
                  );
                })()
              ) : null}
            </div>
          </div>
          <div
            className={
              debugMode
                ? "flex min-h-0 flex-1 flex-col overflow-hidden"
                : "pointer-events-none invisible absolute inset-0 z-0 flex min-h-0 flex-col overflow-hidden"
            }
            aria-hidden={!debugMode}
          >
            <DebugView
              messageId={messageId}
              loadStatus={loadStatus}
              loadError={loadError}
              rawJson={!loadError ? JSON.stringify(data, null, 2) : loadError}
              onRetry={handleRetryLoad}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AiAssistPanel;

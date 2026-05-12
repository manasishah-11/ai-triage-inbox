import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Loader2, RefreshCw, Sparkles, X } from "lucide-react";
import { useDebounce } from "@hooks/useDebounce";
import {
  useAiAssistDraftStore,
  type AiAssistData,
} from "@store/useAiAssistDraftStore";
import {
  type AiAssistValidationError,
  validationErrorsFromResult,
} from "@lib/aiAssistValidation";
import { fetchSimulatedAiAssistLoad } from "@lib/mockAiAssistNetwork";
import ConfidenceIndicator from "./ConfidenceIndicator";
import DebugView from "./DebugView";
import DraftReply from "./DraftReply";

export type LoadState = {
  status: "loading" | "success" | "error";
  rawJson: string;
  errors: AiAssistValidationError[];
  data: AiAssistData | null;
};

const initialLoadState: LoadState = {
  status: "loading",
  rawJson: "",
  errors: [],
  data: null,
};

export type DraftStreamStatus = "idle" | "generating" | "stopped" | "complete";

function randomDraftChunk(): number {
  return 2 + Math.floor(Math.random() * 7);
}

const DRAFT_STREAM_TICK_MS = 42;

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
  const titleId = useId();
  const debugSwitchId = useId();
  const openRef = useRef(open);
  const draftReplyRef = useRef("");
  const mockDraftBaselineRef = useRef<Record<string, string>>({});
  const allowAiHydrateRef = useRef(true);
  const draftStreamTokenRef = useRef(0);
  const draftStreamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const draftStreamMessageIdRef = useRef(messageId);
  /** When true, next stream effect run reveals draft progressively (new AI payload or draft Retry). */
  const shouldStreamDraftRef = useRef(false);

  const [load, setLoad] = useState<LoadState>(initialLoadState);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [debugMode, setDebugMode] = useState(false);
  const [draftStreamStatus, setDraftStreamStatus] =
    useState<DraftStreamStatus>("idle");
  const [draftStreamRestartKey, setDraftStreamRestartKey] = useState(0);
  const [panelMounted, setPanelMounted] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);

  const setDraftOverride = useAiAssistDraftStore((s) => s.setDraftOverride);

  const [draftReply, setDraftReply] = useState(() => {
    const stored = useAiAssistDraftStore.getState().draftOverrides[messageId];
    return stored !== undefined ? stored : "";
  });
  const debouncedDraftReply = useDebounce(draftReply, 300);

  useEffect(() => {
    draftReplyRef.current = draftReply;
  }, [draftReply]);

  useEffect(() => {
    const stored = useAiAssistDraftStore.getState().draftOverrides[messageId];
    const id = requestAnimationFrame(() => {
      setDraftReply(stored !== undefined ? stored : "");
    });
    return () => cancelAnimationFrame(id);
  }, [messageId]);

  useEffect(() => {
    allowAiHydrateRef.current = true;
  }, [messageId, retryAttempt]);

  useLayoutEffect(() => {
    draftStreamMessageIdRef.current = messageId;
  }, [messageId]);

  /* Reset as soon as the panel should fetch so we never flash the previous message’s result. */
  useLayoutEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync loading when panel opens / retries
    setLoad(initialLoadState);
  }, [open, messageId, retryAttempt]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    void (async () => {
      try {
        const payload = await fetchSimulatedAiAssistLoad(messageId);
        if (cancelled) return;
        const { result } = payload;
        if (!result.ok) {
          setLoad({
            status: "error",
            rawJson: payload.rawJson,
            errors: validationErrorsFromResult(result),
            data: null,
          });
          return;
        }
        mockDraftBaselineRef.current[messageId] = result.data.draft_reply;
        shouldStreamDraftRef.current = true;
        setLoad({
          status: "success",
          rawJson: payload.rawJson,
          errors: [],
          data: result.data,
        });
      } catch (e) {
        if (cancelled) return;
        setLoad({
          status: "error",
          rawJson: "",
          errors: [
            {
              path: "",
              message:
                e instanceof Error ? e.message : "Failed to load AI assist.",
            },
          ],
          data: null,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, messageId, retryAttempt]);

  const targetDraftReply = load.data?.draft_reply ?? "";

  /* Draft stream: deps use stable `targetDraftReply` + primitives only (not `load.data` / store actions)
   * so toggling Debug view does not remount the assist subtree or restart typing. */
  useEffect(() => {
    if (!open || load.status !== "success" || !load.data) {
      draftStreamTokenRef.current += 1;
      if (draftStreamIntervalRef.current != null) {
        clearInterval(draftStreamIntervalRef.current);
        draftStreamIntervalRef.current = null;
      }
      const idleRaf = requestAnimationFrame(() => {
        setDraftStreamStatus("idle");
      });
      return () => cancelAnimationFrame(idleRaf);
    }

    const target = load.data.draft_reply;
    const wantStream = shouldStreamDraftRef.current;

    if (!wantStream) {
      const stored = useAiAssistDraftStore.getState().draftOverrides[messageId];
      if (stored !== undefined) {
        const raf = requestAnimationFrame(() => {
          setDraftReply(stored);
          setDraftStreamStatus("complete");
        });
        return () => cancelAnimationFrame(raf);
      }
      return;
    }

    shouldStreamDraftRef.current = false;
    const token = ++draftStreamTokenRef.current;
    if (draftStreamIntervalRef.current != null) {
      clearInterval(draftStreamIntervalRef.current);
      draftStreamIntervalRef.current = null;
    }

    let pos = 0;
    setDraftStreamStatus("generating");
    setDraftReply("");
    useAiAssistDraftStore.getState().clearDraftOverride(messageId);
    allowAiHydrateRef.current = false;

    draftStreamIntervalRef.current = window.setInterval(() => {
      if (draftStreamTokenRef.current !== token) return;
      if (draftStreamMessageIdRef.current !== messageId) return;

      if (pos >= target.length) {
        if (draftStreamIntervalRef.current != null) {
          clearInterval(draftStreamIntervalRef.current);
          draftStreamIntervalRef.current = null;
        }
        setDraftStreamStatus("complete");
        return;
      }

      pos = Math.min(target.length, pos + randomDraftChunk());
      setDraftReply(target.slice(0, pos));

      if (pos >= target.length) {
        if (draftStreamIntervalRef.current != null) {
          clearInterval(draftStreamIntervalRef.current);
          draftStreamIntervalRef.current = null;
        }
        setDraftStreamStatus("complete");
      }
    }, DRAFT_STREAM_TICK_MS);

    return () => {
      draftStreamTokenRef.current += 1;
      if (draftStreamIntervalRef.current != null) {
        clearInterval(draftStreamIntervalRef.current);
        draftStreamIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- targetDraftReply encodes payload; omit load.data
  }, [
    open,
    load.status,
    targetDraftReply,
    messageId,
    retryAttempt,
    draftStreamRestartKey,
  ]);

  useLayoutEffect(() => {
    openRef.current = open;
    if (open) {
      const id = requestAnimationFrame(() => {
        if (!openRef.current) return;
        setPanelMounted(true);
        requestAnimationFrame(() => {
          if (!openRef.current) return;
          setPanelVisible(true);
        });
      });
      return () => cancelAnimationFrame(id);
    }
    const id = requestAnimationFrame(() => setPanelVisible(false));
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (open || !panelMounted) return;
    const timer = window.setTimeout(() => setPanelMounted(false), 300);
    return () => window.clearTimeout(timer);
  }, [open, panelMounted]);

  useLayoutEffect(() => {
    if (!panelMounted) return;

    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyPaddingRight = body.style.paddingRight;
    const scrollbarGap = window.innerWidth - html.clientWidth;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (scrollbarGap > 0) {
      body.style.paddingRight = `${scrollbarGap}px`;
    }

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.paddingRight = prevBodyPaddingRight;
    };
  }, [panelMounted]);

  useEffect(() => {
    if (load.status !== "success" || !load.data) return;
    if (draftStreamStatus === "generating") return;
    const mockDraft = load.data.draft_reply;
    const id = requestAnimationFrame(() => {
      if (debouncedDraftReply === mockDraft) {
        useAiAssistDraftStore.getState().clearDraftOverride(messageId);
        return;
      }
      setDraftOverride(messageId, debouncedDraftReply);
    });
    return () => cancelAnimationFrame(id);
  }, [
    messageId,
    debouncedDraftReply,
    load.status,
    load.data,
    draftStreamStatus,
    setDraftOverride,
  ]);

  useEffect(() => {
    const mid = messageId;
    return () => {
      const latest = draftReplyRef.current;
      // Latest validated mock draft for `mid` — read ref at unmount, not when the effect ran.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const baselines = mockDraftBaselineRef.current;
      const mockDraft = baselines[mid] ?? "";
      const store = useAiAssistDraftStore.getState();
      if (latest === mockDraft) store.clearDraftOverride(mid);
      else store.setDraftOverride(mid, latest);
    };
  }, [messageId]);

  useEffect(() => {
    if (!panelMounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panelMounted, onClose]);

  const handleStopDraft = () => {
    draftStreamTokenRef.current += 1;
    if (draftStreamIntervalRef.current != null) {
      clearInterval(draftStreamIntervalRef.current);
      draftStreamIntervalRef.current = null;
    }
    setDraftStreamStatus((s) => (s === "generating" ? "stopped" : s));
  };

  const handleRetryDraft = () => {
    if (load.status !== "success" || !load.data) return;
    shouldStreamDraftRef.current = true;
    setDraftStreamRestartKey((k) => k + 1);
  };

  const handleRetryLoad = () => {
    setRetryAttempt((n) => n + 1);
  };

  if (!panelMounted) return null;

  const data = load.data;

  return (
    <div className="fixed inset-0 z-40 flex h-dvh max-h-dvh min-h-0 items-stretch justify-end">
      <button
        type="button"
        aria-label="Close AI assist panel"
        className={[
          "absolute inset-0 z-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-300 ease-out dark:bg-slate-950/60",
          panelVisible ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={[
          "relative z-10 flex min-h-0 w-full max-w-xl flex-col self-stretch border-l border-slate-200 bg-white shadow-2xl will-change-transform dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:max-w-2xl",
          "transition-transform duration-300 ease-out motion-reduce:transition-none",
          panelVisible ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <header className="flex shrink-0 border-b border-slate-200 px-4 py-4 dark:border-slate-800 sm:px-5">
          <div className="flex w-full items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/25 dark:bg-emerald-500/12 dark:text-emerald-300 dark:ring-emerald-500/35">
                <Sparkles className="size-4" strokeWidth={2} aria-hidden />
              </span>
              <div className="min-w-0">
                <h2
                  id={titleId}
                  className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100"
                >
                  {debugMode ? "Debug" : "AI assist"}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {load.status === "loading"
                    ? "Fetching suggestions (simulated ~0.2–1.2s latency)…"
                    : draftStreamStatus === "generating"
                      ? "Draft reply is generating — you can stop anytime."
                      : debugMode
                        ? "Raw payload and validation — for development only."
                        : "Suggestions only — review before sending."}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <label
                htmlFor={debugSwitchId}
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
                id={debugSwitchId}
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
              {load.status === "loading" ? (
                <div className="flex min-h-56 flex-col items-center justify-center gap-3 py-8 text-sm text-slate-600 dark:text-slate-300">
                  <Loader2
                    className="size-9 animate-spin text-emerald-600 dark:text-emerald-400"
                    strokeWidth={2}
                    aria-hidden
                  />
                  <p className="text-center font-medium text-slate-800 dark:text-slate-100">
                    Loading AI suggestions…
                  </p>
                  <p className="max-w-xs text-center text-xs text-slate-500 dark:text-slate-400">
                    Simulated network delay (about 0.2–1.2s), same idea as the
                    inbox list.
                  </p>
                </div>
              ) : null}

              {load.status === "error" ? (
                <div
                  className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-900 dark:border-rose-500/35 dark:bg-rose-950/40 dark:text-rose-100"
                  role="alert"
                >
                  <p className="font-medium">Could not use this AI response</p>
                  <p className="mt-1 text-rose-800/90 dark:text-rose-200/90">
                    The payload failed validation. Use the{" "}
                    <span className="font-medium">Debug</span> toggle in the
                    header to view raw JSON and details, or retry below.
                  </p>
                  <button
                    type="button"
                    onClick={handleRetryLoad}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-rose-300 bg-white px-2.5 py-1.5 text-xs font-medium text-rose-900 shadow-sm hover:bg-rose-50 dark:border-rose-500/40 dark:bg-slate-900 dark:text-rose-100 dark:hover:bg-slate-800"
                  >
                    <RefreshCw
                      className="size-3.5"
                      strokeWidth={2}
                      aria-hidden
                    />
                    Retry load
                  </button>
                </div>
              ) : null}

              {load.status === "success" && data ? (
                <>
                  {data.confidence != null ? (
                    <ConfidenceIndicator score={data.confidence} />
                  ) : null}

                  <section
                    className={
                      data.confidence != null
                        ? "mt-6 space-y-2"
                        : "mt-1 space-y-2"
                    }
                  >
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Summary
                    </h3>
                    <ul className="list-disc space-y-1.5 pl-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                      {data.summary_bullets.map((line, i) => (
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
                        categoryStyles(data.category),
                      ].join(" ")}
                    >
                      {data.category}
                    </span>
                  </section>

                  <section className="mt-6 space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Suggested next action
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                      {data.suggested_action}
                    </p>
                  </section>

                  <DraftReply
                    allowAiHydrateRef={allowAiHydrateRef}
                    draftStreamStatus={draftStreamStatus}
                    handleStopDraft={handleStopDraft}
                    handleRetryDraft={handleRetryDraft}
                    load={load}
                    draftReply={draftReply}
                    setDraftReply={setDraftReply}
                  />
                </>
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
            <DebugView load={load} handleRetryLoad={handleRetryLoad} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AiAssistPanel;

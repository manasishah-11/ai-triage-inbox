import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { RefreshCw, Sparkles, X } from "lucide-react";
import mockAiAssistData from "@mocks/mockAiAssistData.json";
import { useDebounce } from "@hooks/useDebounce";
import {
  useAiAssistDraftStore,
  type AiAssistData,
} from "@store/useAiAssistDraftStore";
import ConfidenceIndicator from "./ConfidenceIndicator";

const EMPTY_AI_ASSIST: AiAssistData = {
  id: "",
  summary_bullets: [],
  category: "General",
  priority: "",
  suggested_action: "",
  draft_reply: "",
  confidence: undefined,
};

function fetchAiAssistDataForMessage(messageId: string): AiAssistData {
  const rows = mockAiAssistData as AiAssistData[];
  const row = rows.find((r) => r.id === messageId);
  if (!row) return EMPTY_AI_ASSIST;
  return row;
}

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

function readDraftForMessage(messageId: string): string {
  const stored = useAiAssistDraftStore.getState().draftOverrides[messageId];
  if (stored !== undefined) return stored;
  return fetchAiAssistDataForMessage(messageId).draft_reply;
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
  const openRef = useRef(open);

  const data = useMemo(
    () => fetchAiAssistDataForMessage(messageId),
    [messageId],
  );

  const setDraftOverride = useAiAssistDraftStore((s) => s.setDraftOverride);
  const clearDraftOverride = useAiAssistDraftStore((s) => s.clearDraftOverride);

  const [draftReply, setDraftReply] = useState(() =>
    readDraftForMessage(messageId),
  );
  const debouncedDraftReply = useDebounce(draftReply, 300);
  const draftReplyRef = useRef(draftReply);

  useEffect(() => {
    draftReplyRef.current = draftReply;
  }, [draftReply]);

  const [panelMounted, setPanelMounted] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);

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
    const t = window.setTimeout(() => setPanelMounted(false), 300);
    return () => window.clearTimeout(t);
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
    const id = requestAnimationFrame(() => {
      const mockDraft = fetchAiAssistDataForMessage(messageId).draft_reply;
      if (debouncedDraftReply === mockDraft) {
        useAiAssistDraftStore.getState().clearDraftOverride(messageId);
        return;
      }
      setDraftOverride(messageId, debouncedDraftReply);
    });
    return () => cancelAnimationFrame(id);
  }, [messageId, debouncedDraftReply, setDraftOverride]);

  useEffect(() => {
    const mid = messageId;
    return () => {
      const latest = draftReplyRef.current;
      const mockDraft = fetchAiAssistDataForMessage(mid).draft_reply;
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

  const handleRegenerateDraft = () => {
    const mockDraft = fetchAiAssistDataForMessage(messageId).draft_reply;
    clearDraftOverride(messageId);
    setDraftReply(mockDraft);
  };

  if (!panelMounted) return null;

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
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-4 py-4 dark:border-slate-800 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/25 dark:bg-emerald-500/12 dark:text-emerald-300 dark:ring-emerald-500/35">
              <Sparkles className="size-4" strokeWidth={2} aria-hidden />
            </span>
            <div className="min-w-0">
              <h2
                id={titleId}
                className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100"
              >
                AI assist
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Suggestions only — review before sending.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 shrink-0 place-items-center rounded-full text-slate-400 transition-colors hover:bg-slate-100/90 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800/80 dark:hover:text-slate-300"
            aria-label="Close"
          >
            <X className="size-4" strokeWidth={2} aria-hidden />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5">
          {data.confidence != null ? (
            <ConfidenceIndicator score={data.confidence} />
          ) : null}

          <section
            className={data.confidence != null ? "mt-6 space-y-2" : "space-y-2"}
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

          <section className="mt-6 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="ai-assist-draft-reply"
                className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Draft reply
              </label>
              <button
                type="button"
                onClick={handleRegenerateDraft}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <RefreshCw className="size-3.5" strokeWidth={2} aria-hidden />
                Regenerate
              </button>
            </div>
            <textarea
              id="ai-assist-draft-reply"
              rows={10}
              value={draftReply}
              onChange={(e) => setDraftReply(e.target.value)}
              className="mt-1 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm leading-relaxed text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-emerald-500/40 dark:focus:ring-emerald-500/15"
            />
          </section>
        </div>
      </div>
    </div>
  );
}

export default AiAssistPanel;

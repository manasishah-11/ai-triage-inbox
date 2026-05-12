import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useInboxStore } from "@store/useInboxStore";
import MessageDetails from "@components/msg_details/MessageDetails";
import ErrorState from "@components/common/ErrorState";
import LoadingState from "@components/common/LoadingState";

function InboxDetails() {
  const { messageId } = useParams<{ messageId: string }>();

  const items = useInboxStore((s) => s.items);
  const itemsLoadStatus = useInboxStore((s) => s.itemsLoadStatus);
  const itemsLoadError = useInboxStore((s) => s.itemsLoadError);
  const loadInboxItems = useInboxStore((s) => s.loadInboxItems);

  useEffect(() => {
    void useInboxStore.getState().loadInboxItems();
  }, []);

  const message = useMemo(
    () => items.find((m) => m.id === messageId),
    [items, messageId],
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur-md dark:bg-slate-950/90">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:py-4 sm:px-6 lg:px-8">
          <Link
            to="/inbox"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <ArrowLeft className="size-4" strokeWidth={2} aria-hidden />
            Back to inbox
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-8 pt-4 sm:pt-0 sm:px-6 lg:px-8">
        {!messageId ? (
          <div className="rounded-xl border border-slate-200 bg-white/70 p-8 text-center text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-300">
            Missing message id.
          </div>
        ) : itemsLoadStatus === "error" && items.length === 0 ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-8 dark:border-rose-900/40 dark:bg-rose-950/30">
            <ErrorState
              errorTitle="Could not load inbox"
              errorMessage={itemsLoadError ?? "Unknown error."}
              onRetry={() => void loadInboxItems()}
            />
          </div>
        ) : items.length === 0 && itemsLoadStatus !== "ready" ? (
          <div className="rounded-xl border border-slate-200 bg-white/70 p-8 dark:border-slate-800 dark:bg-slate-900/30">
            <LoadingState
              loadingTitle="Loading inbox…"
              loadingMessage="Simulated network latency (about 0.2–1.2s)."
            />
          </div>
        ) : !message ? (
          <div className="rounded-xl border border-slate-200 bg-white/70 p-8 text-center dark:border-slate-800 dark:bg-slate-900/30">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              We couldn&apos;t find a message with id{" "}
              <span className="font-mono text-slate-800 dark:text-slate-200">
                {messageId}
              </span>
              .
            </p>
            <Link
              to="/inbox"
              className="mt-4 inline-block text-sm font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              Return to inbox
            </Link>
          </div>
        ) : (
          <MessageDetails key={message.id} message={message} />
        )}
      </main>
    </div>
  );
}

export default InboxDetails;

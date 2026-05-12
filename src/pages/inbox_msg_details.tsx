import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useInboxStore } from "@store/useInboxStore";
import type { InboxItem } from "@store/useInboxStore";
import MessageDetails from "@components/msg_details/MessageDetails";
import itemsFromJSON from "@mocks/mockInboxData.json";

function InboxDetails() {
  const { messageId } = useParams<{ messageId: string }>();
  const items = useInboxStore((s) => s.items);
  const setItems = useInboxStore((s) => s.setItems);

  useEffect(() => {
    if (items.length === 0) {
      setItems(itemsFromJSON as InboxItem[]);
    }
  }, [items.length, setItems]);

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

import { useMemo } from "react";
import Pagination from "@components/common/Pagination";
import { usePagination } from "@hooks/usePagination";
import InboxItem from "./InboxItem";
import type { InboxItem as InboxItemType } from "../../types";

function InboxList({ items }: { items: InboxItemType[] }) {
  const inbox = useMemo(
    () =>
      (items as InboxItemType[])
        .slice()
        .sort(
          (a, b) =>
            new Date(b.received_at).valueOf() -
            new Date(a.received_at).valueOf(),
        ),
    [items],
  );

  const {
    pageSize,
    totalPages,
    safePage,
    startIndex,
    showingFrom,
    showingTo,
    goPrev,
    goNext,
    changePageSize,
  } = usePagination({ rowCount: inbox.length });

  const pageItems = inbox.slice(startIndex, startIndex + pageSize);
  return (
    <div className="h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex h-full max-w-5xl flex-col px-4 sm:px-6 lg:px-8">
        <div className="sticky top-0 z-20 bg-slate-950/80 py-6 backdrop-blur">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-2xl font-semibold tracking-tight">
                AI Triage Inbox
              </div>
              <div className="mt-1 text-sm text-slate-300">
                {inbox.length} messages
              </div>
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 pb-6">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900/30">
            <div className="min-h-0 flex-1 overflow-auto">
              <ul>
                {pageItems.map((m) => (
                  <InboxItem
                    key={m.id}
                    senderName={m.sender.name}
                    senderEmail={m.sender.email}
                    subject={m.subject}
                    body={m.body}
                    status={m.status}
                    priority={m.priority}
                    receivedAt={m.received_at}
                  />
                ))}
              </ul>
            </div>

            <Pagination
              safePage={safePage}
              totalPages={totalPages}
              pageSize={pageSize}
              rowCount={inbox.length}
              showingFrom={showingFrom}
              showingTo={showingTo}
              onPrev={goPrev}
              onNext={goNext}
              onPageSizeChange={changePageSize}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default InboxList;

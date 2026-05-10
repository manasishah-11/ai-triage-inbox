import { useCallback, useEffect, useMemo, useState } from "react";
import Pagination from "@components/common/Pagination";
import { useDebounce } from "@hooks/useDebounce";
import { usePagination } from "@hooks/usePagination";
import InboxItem from "./InboxItem";
import SearchAndFilter, { type SortOrder } from "./SearchAndFilter";
import type { InboxItem as InboxItemType } from "../../types";

function InboxList({ items }: { items: InboxItemType[] }) {
  const [records, setRecords] = useState<InboxItemType[]>(() =>
    items.map((i) => ({ ...i })),
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const inbox = useMemo(() => {
    const q = debouncedSearchQuery.trim().toLowerCase();
    return records
      .filter((m) => statusFilter === "All" || m.status === statusFilter)
      .filter((m) => priorityFilter === "All" || m.priority === priorityFilter)
      .filter((m) => {
        if (!q) return true;
        return (
          m.subject.toLowerCase().includes(q) ||
          m.body.toLowerCase().includes(q) ||
          m.sender.name.toLowerCase().includes(q) ||
          m.sender.email.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const diff =
          new Date(a.received_at).valueOf() - new Date(b.received_at).valueOf();
        return sortOrder === "newest" ? -diff : diff;
      });
  }, [records, debouncedSearchQuery, statusFilter, priorityFilter, sortOrder]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const markSelectedDone = useCallback(() => {
    setRecords((rows) =>
      rows.map((r) =>
        selectedIds.has(r.id) ? { ...r, status: "Done" } : r,
      ),
    );
    setSelectedIds(new Set());
  }, [selectedIds]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

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
    setPage,
  } = usePagination({ rowCount: inbox.length });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery, statusFilter, priorityFilter, setPage]);

  const pageItems = inbox.slice(startIndex, startIndex + pageSize);
  return (
    <div className="h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex h-full max-w-5xl flex-col px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 bg-slate-50/80 py-6 backdrop-blur dark:bg-slate-950/80">
          <div>
            <div className="text-2xl font-semibold tracking-tight">
              AI Triage Inbox
            </div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {inbox.length} messages
            </div>
          </div>
          <SearchAndFilter
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />
        </div>

        <div className="flex min-h-0 flex-1 pb-6">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white/70 shadow-sm dark:border-slate-800 dark:bg-slate-900/30 dark:shadow-none">
            {selectedIds.size > 0 ? (
              <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-100/90 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/90">
                <span className="text-sm text-slate-700 dark:text-slate-200">
                  {selectedIds.size} selected
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={markSelectedDone}
                    className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                  >
                    Mark as done
                  </button>
                </div>
              </div>
            ) : null}
            <div className="min-h-0 flex-1 overflow-auto">
              {pageItems.length === 0 ? (
                <div className="flex h-full items-center justify-center p-8 text-sm text-slate-600 dark:text-slate-300">
                  No messages match your search or filters.
                </div>
              ) : (
                <ul>
                  {pageItems.map((m) => (
                    <InboxItem
                      key={m.id}
                      id={m.id}
                      senderName={m.sender.name}
                      senderEmail={m.sender.email}
                      subject={m.subject}
                      body={m.body}
                      status={m.status}
                      priority={m.priority}
                      receivedAt={m.received_at}
                      selected={selectedIds.has(m.id)}
                      onToggleSelect={toggleSelect}
                      searchQuery={debouncedSearchQuery}
                    />
                  ))}
                </ul>
              )}
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

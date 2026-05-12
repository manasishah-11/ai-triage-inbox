import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  CircleDot,
  FilterX,
  Flag,
  Search,
  X,
} from "lucide-react";
import FilterSelect from "@components/common/FilterSelect";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "../../constants";

export type SortOrder = "newest" | "oldest";

const STATUS_FILTER_OPTIONS = [
  { value: "All", label: "All" },
  ...STATUS_OPTIONS,
];

const PRIORITY_FILTER_OPTIONS = [
  { value: "All", label: "All" },
  ...PRIORITY_OPTIONS,
];

function SearchAndFilter({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  sortOrder,
  setSortOrder,
  onClearFilters,
}: {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  priorityFilter: string;
  setPriorityFilter: (value: string) => void;
  sortOrder: string;
  setSortOrder: (value: SortOrder) => void;
  onClearFilters: () => void;
}) {
  const hasActiveFilters = statusFilter !== "All" || priorityFilter !== "All";

  return (
    <div className="flex flex-col flex-wrap items-stretch gap-2 sm:flex-row sm:items-center">
      <div className="relative min-w-48 flex-1 sm:max-w-xs">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-400"
          aria-hidden="true"
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search messages..."
          aria-label="Search messages"
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pr-9 pl-9 text-sm text-slate-900 placeholder:text-slate-400 transition-colors hover:bg-slate-50 focus:ring-2 focus:ring-slate-400/40 focus:outline-none dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:bg-slate-900 dark:focus:ring-slate-500/40"
        />
        {searchQuery ? (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            aria-label="Clear search"
            className="absolute top-1/2 right-2 inline-flex -translate-y-1/2 cursor-pointer items-center justify-center rounded-full p-1 text-slate-500 hover:bg-slate-200/70 hover:text-slate-700 focus:ring-2 focus:ring-slate-400/40 focus:outline-none dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 dark:focus:ring-slate-500/40"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div className="flex flex-1 flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FilterSelect
            id="status-filter"
            label="Status"
            icon={CircleDot}
            value={statusFilter}
            options={STATUS_FILTER_OPTIONS}
            onChange={setStatusFilter}
            showValue={statusFilter !== "All"}
          />
          <FilterSelect
            id="priority-filter"
            label="Priority"
            icon={Flag}
            value={priorityFilter}
            options={PRIORITY_FILTER_OPTIONS}
            onChange={setPriorityFilter}
            showValue={priorityFilter !== "All"}
          />
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={onClearFilters}
              title="Clear search and status/priority filters"
              className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-2 text-xs text-slate-500 transition-colors hover:bg-slate-100/90 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/35 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-200 dark:focus-visible:ring-slate-500/40"
            >
              <FilterX className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="whitespace-nowrap">Clear filters</span>
            </button>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() =>
            setSortOrder(sortOrder === "newest" ? "oldest" : "newest")
          }
          aria-label={
            sortOrder === "newest"
              ? "Sorted newest first. Click to sort oldest first."
              : "Sorted oldest first. Click to sort newest first."
          }
          title={
            sortOrder === "newest" ? "Sort: Newest first" : "Sort: Oldest first"
          }
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border-none outline-none ring-none bg-transparent py-0 sm:py-2 px-0 sm:px-4 text-sm text-slate-900 transition-colors hover:bg-slate-50 focus:outline-none dark:bg-slate-950/40 dark:text-slate-100 dark:hover:bg-slate-900"
        >
          {sortOrder === "newest" ? (
            <ArrowDownWideNarrow
              className="h-4 w-4 text-slate-500 dark:text-slate-400"
              aria-hidden="true"
            />
          ) : (
            <ArrowUpWideNarrow
              className="h-4 w-4 text-slate-500 dark:text-slate-400"
              aria-hidden="true"
            />
          )}
          <span className="whitespace-nowrap">
            {sortOrder === "newest" ? "Newest first" : "Oldest first"}
          </span>
        </button>
      </div>
    </div>
  );
}

export default SearchAndFilter;

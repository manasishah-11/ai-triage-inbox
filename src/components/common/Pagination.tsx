import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PageSizeOption } from "@hooks/usePagination";

function Pagination({
  safePage,
  totalPages,
  pageSize,
  rowCount,
  showingFrom,
  showingTo,
  onPrev,
  onNext,
  onPageSizeChange,
}: {
  safePage: number;
  totalPages: number;
  pageSize: PageSizeOption;
  rowCount: number;
  showingFrom: number;
  showingTo: number;
  onPrev: () => void;
  onNext: () => void;
  onPageSizeChange: (pageSize: PageSizeOption) => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/20 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-center text-xs text-slate-600 dark:text-slate-300 sm:text-left">
        Showing{" "}
        <span className="font-medium text-slate-900 dark:text-slate-100">
          {showingFrom}
        </span>
        -
        <span className="font-medium text-slate-900 dark:text-slate-100">
          {showingTo}
        </span>{" "}
        of{" "}
        <span className="font-medium text-slate-900 dark:text-slate-100">
          {rowCount}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <div className="flex items-center gap-2">
          <label
            htmlFor="page-size"
            className="text-xs text-slate-600 dark:text-slate-300"
          >
            Show
          </label>
          <select
            id="page-size"
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value) as PageSizeOption);
            }}
            className="cursor-pointer rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100 dark:hover:bg-slate-900"
          >
            {[5, 10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={onPrev}
          disabled={safePage <= 1}
          aria-label="Previous page"
          className="inline-flex cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-white p-2 text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-transparent dark:bg-slate-950/40 dark:text-slate-100 dark:hover:bg-slate-900"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="text-xs text-slate-600 dark:text-slate-300">
          Page{" "}
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {safePage}
          </span>{" "}
          of{" "}
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {totalPages}
          </span>
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={safePage >= totalPages}
          aria-label="Next page"
          className="inline-flex cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-white p-2 text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-transparent dark:bg-slate-950/40 dark:text-slate-100 dark:hover:bg-slate-900"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export default Pagination;

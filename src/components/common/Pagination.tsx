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
    <div className="flex flex-col gap-3 bg-slate-900/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-xs text-slate-300">
        Showing{" "}
        <span className="font-medium text-slate-100">{showingFrom}</span>-
        <span className="font-medium text-slate-100">{showingTo}</span> of{" "}
        <span className="font-medium text-slate-100">{rowCount}</span>
      </div>

      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <div className="flex items-center gap-2">
          <label htmlFor="page-size" className="text-xs text-slate-300">
            Show
          </label>
          <select
            id="page-size"
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value) as PageSizeOption);
            }}
            className="cursor-pointer rounded-md bg-slate-950/40 px-2 py-1.5 text-sm text-slate-100 hover:bg-slate-900"
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
          className="cursor-pointer inline-flex items-center justify-center rounded-md bg-slate-950/40 p-2 text-slate-100 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="text-xs text-slate-300">
          Page <span className="font-medium text-slate-100">{safePage}</span> of{" "}
          <span className="font-medium text-slate-100">{totalPages}</span>
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={safePage >= totalPages}
          aria-label="Next page"
          className="cursor-pointer inline-flex items-center justify-center rounded-md bg-slate-950/40 p-2 text-slate-100 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export default Pagination;

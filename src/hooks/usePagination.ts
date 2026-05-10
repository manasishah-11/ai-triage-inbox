import { useMemo, useState } from "react";

export type PageSizeOption = 5 | 10 | 20 | 50 | 100;

export function usePagination({
  rowCount,
  initialPage = 1,
  initialPageSize = 10,
}: {
  rowCount: number;
  initialPage?: number;
  initialPageSize?: PageSizeOption;
}) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState<PageSizeOption>(initialPageSize);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(rowCount / pageSize)),
    [rowCount, pageSize],
  );
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const showingFrom = rowCount === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + pageSize, rowCount);

  function goPrev() {
    setPage((p) => Math.max(1, p - 1));
  }

  function goNext() {
    setPage((p) => Math.min(totalPages, p + 1));
  }

  function changePageSize(nextPageSize: PageSizeOption) {
    setPage(1);
    setPageSize(nextPageSize);
  }

  return {
    page,
    pageSize,
    setPage,
    totalPages,
    safePage,
    startIndex,
    showingFrom,
    showingTo,
    goPrev,
    goNext,
    changePageSize,
  };
}

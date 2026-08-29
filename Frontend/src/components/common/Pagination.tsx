import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface PaginationProps { numberOfPages?: number; totalPages?: number; currentPage?: number; controlPage?: (page: number) => void; isPageLoading?: boolean; }

function getPageRange(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  if (currentPage <= 4) return [1, 2, 3, 4, 5, "ellipsis", totalPages];
  if (currentPage >= totalPages - 3) return [1, "ellipsis", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages];
}

export default function PaginationComponent({ numberOfPages, totalPages, currentPage = 1, controlPage, isPageLoading = false }: PaginationProps) {
  const resolvedTotalPages = numberOfPages ?? totalPages ?? 0;
  const [, setSearchParams] = useSearchParams();
  const [pageInput, setPageInput] = useState(String(currentPage));
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), Math.max(resolvedTotalPages, 1));
  const pageRange = useMemo(() => getPageRange(safeCurrentPage, resolvedTotalPages), [resolvedTotalPages, safeCurrentPage]);
  useEffect(() => setPageInput(String(safeCurrentPage)), [safeCurrentPage]);
  if (resolvedTotalPages <= 1) return null;

  const goToPage = (page: number) => {
    const nextPage = Math.min(Math.max(Math.trunc(page), 1), resolvedTotalPages);
    if (controlPage) controlPage(nextPage);
    else setSearchParams((previous) => { const next = new URLSearchParams(previous); next.set("page", String(nextPage)); return next; });
  };
  const submitPageInput = () => { const parsed = Number(pageInput); if (Number.isFinite(parsed)) goToPage(parsed); else setPageInput(String(safeCurrentPage)); };

  return <div className="my-8 flex flex-wrap items-center justify-center gap-3">
    <Pagination><PaginationContent className="flex items-center gap-1">
      <PaginationItem><PaginationPrevious onClick={(event) => { event.preventDefault(); if (!isPageLoading) goToPage(safeCurrentPage - 1); }} aria-disabled={safeCurrentPage === 1 || isPageLoading} className={safeCurrentPage === 1 || isPageLoading ? "pointer-events-none text-muted-foreground/30 opacity-50" : "cursor-pointer"} /></PaginationItem>
      {pageRange.map((page, index) => page === "ellipsis" ? <PaginationItem key={`ellipsis-${index}`}><PaginationEllipsis /></PaginationItem> : <PaginationItem key={page}><PaginationLink href="#" onClick={(event) => { event.preventDefault(); if (!isPageLoading) goToPage(page); }} isActive={page === safeCurrentPage} aria-disabled={isPageLoading} className={isPageLoading ? "pointer-events-none opacity-50" : "cursor-pointer"}>{page}</PaginationLink></PaginationItem>)}
      <PaginationItem><PaginationNext onClick={(event) => { event.preventDefault(); if (!isPageLoading) goToPage(safeCurrentPage + 1); }} aria-disabled={safeCurrentPage === resolvedTotalPages || isPageLoading} className={safeCurrentPage === resolvedTotalPages || isPageLoading ? "pointer-events-none text-muted-foreground/30 opacity-50" : "cursor-pointer"} /></PaginationItem>
    </PaginationContent></Pagination>
    <form className="flex items-center gap-2 text-sm" onSubmit={(event) => { event.preventDefault(); submitPageInput(); }}>
      <label htmlFor="pagination-page-input" className="text-muted-foreground">Go to page</label>
      <input id="pagination-page-input" type="number" min={1} max={resolvedTotalPages} value={pageInput} disabled={isPageLoading} onChange={(event) => setPageInput(event.target.value)} onBlur={submitPageInput} className="h-9 w-16 rounded-md border border-input bg-background px-2 text-center text-sm" aria-label="Page number" />
      <span className="text-muted-foreground">of {resolvedTotalPages}</span>
    </form>
  </div>;
}

'use client';

import { Button } from '@/components/ui/button';

interface SpecimenPaginationProps {
  page: number;
  totalPages: number;
  pageStart: number;
  pageEnd: number;
  totalFiltered: number;
  onPageChange: (page: number) => void;
}

export function SpecimenPagination({
  page,
  totalPages,
  pageStart,
  pageEnd,
  totalFiltered,
  onPageChange,
}: SpecimenPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/60">
      <div className="text-xs text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{pageStart}-{pageEnd}</span> of{' '}
        <span className="font-semibold text-foreground">{totalFiltered}</span> specimens
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          className="rounded-xl text-xs"
        >
          Previous
        </Button>
        <span className="text-xs font-mono px-2 text-muted-foreground">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          className="rounded-xl text-xs"
        >
          Next
        </Button>
      </div>
    </div>
  );
}

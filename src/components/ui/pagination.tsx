'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (items: number) => void;
}

export function CustomPagination({ currentPage, totalPages, onPageChange, itemsPerPage, onItemsPerPageChange }: CustomPaginationProps) {
  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // If total pages is less than or equal to 5, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);

      // Calculate the range of pages to show around current page
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if we're near the start
      if (currentPage <= 3) {
        endPage = 4;
      }
      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
      }

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push('...');
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }

      // Always show last page
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  return (
    <div className="flex flex-col items-center justify-between gap-4 mt-6 md:flex-row">
      {/* Items per page and results info */}
      <div className="flex items-center justify-between w-full gap-4 md:justify-start">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Per halaman:</span>
          <Select value={itemsPerPage.toString()} onValueChange={(value) => onItemsPerPageChange(parseInt(value, 10))}>
            <SelectTrigger className="w-[70px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="75">75</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="inline-flex items-center">
          {/* Previous button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || totalPages <= 1}
            className="rounded-r-none border-r-0 px-3 text-primary-600 hover:text-primary-600 hover:bg-primary-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {getPageNumbers().map((page, index) =>
            page === '...' ? (
              <Button
                key={`ellipsis-${currentPage}-${index}`}
                size="sm"
                className="inline-flex items-center justify-center text-sm rounded-none border border-l-0 border-r-0 bg-background text-muted-foreground hover:bg-background cursor-default"
              >
                ...
              </Button>
            ) : (
              <Button
                key={`page-${page}`}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(page as number)}
                className={`rounded-none border-l-0 border-r-0 px-3 ${currentPage === page ? 'z-10 bg-primary-600 border-primary-600 text-white hover:bg-primary-700' : 'text-primary-600 hover:text-primary-600 hover:bg-primary-50'}`}
                disabled={totalPages === 1 && currentPage === page}
              >
                {page}
              </Button>
            )
          )}

          {/* Next button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages <= 1}
            className="rounded-l-none border-l-0 px-3 text-primary-600 hover:text-primary-600 hover:bg-primary-50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

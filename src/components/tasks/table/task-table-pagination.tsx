import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";
import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";

interface TaskTablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  isLoading?: boolean;
  pageSizeOptions?: number[];
}

export default function TaskTablePagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  pageSizeOptions = [5, 10, 25, 50]
}: TaskTablePaginationProps) {
  const canPreviousPage = currentPage > 1;
  const canNextPage = currentPage < totalPages;

  const handleFirstPage = () => {
    if (canPreviousPage && !isLoading) {
      onPageChange(1);
    }
  };

  const handlePreviousPage = () => {
    if (canPreviousPage && !isLoading) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (canNextPage && !isLoading) {
      onPageChange(currentPage + 1);
    }
  };

  const handleLastPage = () => {
    if (canNextPage && !isLoading) {
      onPageChange(totalPages);
    }
  };

  return (
    <div className="flex w-full flex-col-reverse items-center justify-between gap-4 overflow-auto p-4 sm:flex-row sm:gap-8 border-t border-gray-200 bg-white">
      <div className="flex-1 whitespace-nowrap text-sm text-muted-foreground">
        Nájdených {totalItems} úloh celkom.
      </div>
      
      <div className="flex flex-col-reverse items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
        {onPageSizeChange && (
          <div className="flex items-center space-x-2">
            <p className="whitespace-nowrap text-sm font-medium">Riadkov na stránku</p>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => onPageSizeChange(Number(value))}
              disabled={isLoading}
            >
              <SelectTrigger className="h-8 w-[4.5rem]">
                <SelectValue placeholder={itemsPerPage.toString()} />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div className="flex items-center justify-center text-sm font-medium">
          Stránka {currentPage} z {totalPages || 1}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            aria-label="Prejsť na prvú stránku"
            variant="outline"
            className="hidden size-8 p-0 lg:flex"
            onClick={handleFirstPage}
            disabled={!canPreviousPage || isLoading}
          >
            <ChevronsLeftIcon className="size-4" aria-hidden="true" />
          </Button>
          
          <Button
            aria-label="Prejsť na predchádzajúcu stránku"
            variant="outline"
            size="icon"
            className="size-8"
            onClick={handlePreviousPage}
            disabled={!canPreviousPage || isLoading}
          >
            <ChevronLeftIcon className="size-4" aria-hidden="true" />
          </Button>
          
          <Button
            aria-label="Prejsť na ďalšiu stránku"
            variant="outline"
            size="icon"
            className="size-8"
            onClick={handleNextPage}
            disabled={!canNextPage || isLoading}
          >
            <ChevronRightIcon className="size-4" aria-hidden="true" />
          </Button>
          
          <Button
            aria-label="Prejsť na poslednú stránku"
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={handleLastPage}
            disabled={!canNextPage || isLoading}
          >
            <ChevronsRightIcon className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}

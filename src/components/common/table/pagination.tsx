import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";
import {Table as TableType } from '@tanstack/react-table'
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

export default function TablePagination<TData>({
  table,
}: {table: TableType<TData>}) {

  const [pageSize, setPageSize] = useState(table.getState().pagination.pageSize.toString())

  const showPreviousNext = true
  const currentPage = table.getState().pagination.pageIndex+1
  const totalPages = table?.getPageCount()
  
  const onPageChange = (pageIndex: number) => {
    table.setPageIndex(pageIndex-1)
  }

  useEffect(() => {
    table.setPageSize(Number(pageSize));
  }, [pageSize])

  return (
    <div className="flex justify-between">
      <div className="">
        <Pagination>
          <PaginationContent>
            {showPreviousNext && totalPages ? (
              <PaginationItem>
                <Button
                  onClick={() => onPageChange(currentPage - 1)}
                  variant={'ghost'}
                  disabled={currentPage - 1 < 1}
                ><ChevronLeft/></Button>
              </PaginationItem>
            ) : null}
            {generatePaginationLinks(currentPage, totalPages, onPageChange)}
            {showPreviousNext && totalPages ? (
              <PaginationItem>
                <Button
                  onClick={() => onPageChange(currentPage + 1)}
                  variant={'ghost'}
                  disabled={currentPage > totalPages - 1}
                  ><ChevronRight/></Button>
              </PaginationItem>
            ): null}
          </PaginationContent>
        </Pagination>
      </div>
      <div className="flex gap-4 items-center">
        <span className="text-sm whitespace-nowrap font-semibold">Počet</span>
        <Select
          defaultValue={pageSize}
          onValueChange={(value) => setPageSize(value)}
          >
          <SelectTrigger className="w-16">
            <SelectValue placeholder="Počet položiek" />
          </SelectTrigger>
          <SelectContent>
            {[5, 10, 50].map((size) => (
              <SelectItem key={size.toString()} value={size.toString()}>{size}</SelectItem>
            ))}
          </SelectContent>
        </Select>

      </div>

    </div>

  );
}



const generatePaginationLinks = (
  currentPage: number,
  totalPages: number,
  onPageChange: (page: number) => void
) => {
  const pages: JSX.Element[] = [];
  if (totalPages <= 6) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => onPageChange(i)}
            isActive={i === currentPage}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
  } else {
    for (let i = 1; i <= 2; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => onPageChange(i)}
            isActive={i === currentPage}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    if (2 < currentPage && currentPage < totalPages - 1) {
      pages.push(<PaginationEllipsis />)
      pages.push(
        <PaginationItem key={currentPage}>
          <PaginationLink
            onClick={() => onPageChange(currentPage)}
            isActive={true}
          >
            {currentPage}
          </PaginationLink>
        </PaginationItem>
      );
    }
    pages.push(<PaginationEllipsis />)
    for (let i = totalPages - 1; i <= totalPages; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => onPageChange(i)}
            isActive={i === currentPage}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
  }
  return pages;
};
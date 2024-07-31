"use client"

import { Task, TaskPriority, TaskStatus } from "@prisma/client"
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, Header, PaginationState, SortingState, Table as TableType, useReactTable } from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"


import { format } from "date-fns"
import { DATE_FORMAT } from "@/lib/utils"
import Link from "next/link"
import clsx from "clsx"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { Button } from "../ui/button"
import { ArrowUpDown, ChevronDown, ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon, ChevronUp } from "lucide-react"
import Filter from "../common/table/filter"
import { TASK_PRIORITIES_MAP, TASK_STATUSES_MAP } from "@/lib/models/task.model"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import LoadingSpinner from "../ui/loading-spinner"
import TableComponent, { FilteredHeaderCell } from "../common/table/table"


const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "name",
    header: "Názov",
    cell: (props) => {
      const id = props.row.original.id
      return <Link className="link" href={'/tasks/'+id}>{props.getValue() as string}</Link>
    }
  },
  {
    accessorKey: "createdAt",
    header: "Vznik",
    cell: (props) => format(props.getValue() as Date, DATE_FORMAT),
    enableColumnFilter: false,
  },
  {
    accessorKey: "priority",
    header: "Priorita",
    cell: (props) => TASK_PRIORITIES_MAP[props.getValue() as TaskPriority],
    meta: {
      filterVariant: 'select',
      selectOptions: (Object.keys(TASK_PRIORITIES_MAP) as TaskPriority[]).map((k) => ({title: TASK_PRIORITIES_MAP[k], value: k}))
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: (props) => {
      const val = props.getValue()
      return <span className={clsx("font-bold",{
        'text-green-700': val === 'DONE',
        'text-yellow-600': ['WAITING', 'INPROGRESS'].includes(val as string),
        'text-green-500': val == 'CHECKREQ',
      })}>{TASK_STATUSES_MAP[val as TaskStatus]}</span>
    },
    meta: {
      filterVariant: 'select',
      selectOptions: (Object.keys(TASK_STATUSES_MAP) as TaskStatus[]).map((k) => ({title: TASK_STATUSES_MAP[k], value: k}))
    }
  }, 
  {
    accessorKey: "deadline",
    header: "Termín",
    cell: (props) => format(props.getValue() as Date, DATE_FORMAT),
    enableColumnFilter: false,
    meta: {
      filterVariant: 'range',
    }
  },
  {
    id: 'creator_name',
    accessorKey: "creator.user.name",
    header: "Vytvoril"
  },
  {
    id: 'assignee_name',
    accessorKey: "assignee.user.name",
    header: "Zodpovedný"
  },
  {
    id: 'organization_name',
    accessorKey: "organization.name",
    header: "Organizácia",
  },
  
]


export default function TasksTable({
  data,
  isLoading,
  isError,
  setColumnFilters,
  columnFilters,
  setSorting,
  sorting,
  setPagination,
  pagination
}: {
  data: Task[],
  isLoading: boolean,
  isError: boolean
  setColumnFilters?: Dispatch<SetStateAction<ColumnFiltersState>>
  columnFilters?: ColumnFiltersState,
  setSorting?: Dispatch<SetStateAction<SortingState>>
  sorting?: SortingState
  setPagination?: Dispatch<SetStateAction<PaginationState>>
  pagination?: PaginationState
}) {


  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),

    onColumnFiltersChange: setColumnFilters,
    manualFiltering: true,

    onSortingChange: setSorting,
    manualSorting: true,

    onPaginationChange: setPagination,
    manualPagination: true,

    state: {
      sorting,
      columnFilters,
      pagination
    },
  })


  const customHeader = (header: Header<Task, unknown>) => <FilteredHeaderCell key={header.id} header={header} />

  return (
    <div>
      <TableComponent table={table} isError={isError} isLoading={isLoading}
        templateParts={{
          headerCell: setColumnFilters ? customHeader : undefined
        }}
      
      >
      </TableComponent>
    </div>
    
  )
}


export function DataTablePagination<TData>({
  table,
}: {table: TableType<TData>}) {

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[15, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
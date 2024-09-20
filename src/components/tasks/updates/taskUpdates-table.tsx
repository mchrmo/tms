"use client"

import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, Header, PaginationState, SortingState, Table as TableType, useReactTable } from "@tanstack/react-table"

import Link from "next/link"
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, ChevronDown, ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon, ChevronUp, Pencil, Trash, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import TableComponent, { FilteredHeaderCell } from "@/components/common/table/table"
import TablePagination from "@/components/common/table/pagination"
import { TaskUpdate } from "@prisma/client"
import { format } from "date-fns"
import { useTaskUpdates } from "@/lib/hooks/taskUpdate.hooks"
import { TaskUpdateListItem } from "@/lib/services/taskUpdate.service"
import { formatDateTime } from "@/lib/utils/dates"




const columns: ColumnDef<TaskUpdateListItem>[] = [
  {
    accessorKey: "createdAt",
    header: "Dátum a čas",
    cell: (props) => {
      return props.getValue() ? formatDateTime(props.getValue() as Date) : ''
    },

  },
  {
    accessorKey: "title",
    header: "Názov",
  },
  {
    accessorKey: "description",
    header: "Popis",
  },
  
]
 

export default function TaskUpdatesTable({defaultFilters}: {defaultFilters?: ColumnFiltersState}) {

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(defaultFilters || [])
  const [sorting, setSorting] = useState<SortingState>([{
    id: 'createdAt',
    desc: true
  }])
  const [pagination, setPagination] = useState<PaginationState>({pageIndex: 0, pageSize: 10})

  const query = useTaskUpdates(pagination, columnFilters, sorting[0])
  const { isLoading, isError } = query

  const data = useMemo(() => {
    return query.data ? query.data.items : [];
  }, [query.data]);
  

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
    rowCount: query.data?.totalCount,
    pageCount: Math.ceil((query.data?.totalCount || 0) / (pagination.pageSize || 1)),

    state: {
      columnFilters,
      sorting,
      pagination
    },
  })


  return (
    <div>
      <div className="">
        <TableComponent table={table} isError={isError} isLoading={isLoading}
        >
        </TableComponent>
        <div className="">
          <TablePagination table={table} ></TablePagination>
        </div>
      </div>
    </div>
    
  )
}

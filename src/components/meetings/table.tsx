"use client"

import { Meeting  } from "@prisma/client"
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, Header, PaginationState, SortingState, Table as TableType, useReactTable } from "@tanstack/react-table"

import { format } from "date-fns"
import { DATE_FORMAT } from "@/lib/utils"
import Link from "next/link"
import clsx from "clsx"
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, ChevronDown, ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon, ChevronUp } from "lucide-react"
import Filter from "@/components/common/table/filter"
import LoadingSpinner from "@/components/ui/loading-spinner"
import TableComponent, { FilteredHeaderCell } from "@/components/common/table/table"
import { PaginatedResponse } from "@/lib/services/api.service"
import { useMeetings } from "@/lib/hooks/meeting/meeting.hooks"
import TablePagination from "@/components/common/table/pagination"
import { formatDateTime } from "@/lib/utils/dates"


const columns: ColumnDef<Meeting>[] = [
  {
    accessorKey: "name",
    header: "Názov",
    cell: (props) => {
      const id = props.row.original.id
      return <Link className="link" href={'/meetings/'+id}>{props.getValue() as string}</Link>
    }
  },
  {
    accessorKey: "date",
    header: "Čas a dátum",
    cell: (props) => formatDateTime(props.getValue() as Date),
    enableColumnFilter: false,
  },
  {
    accessorKey: "_count.attendants",
    header: "Počet účastníkov",
    enableColumnFilter: false,
    enableSorting: false
  },
  {
    accessorKey: "_count.items",
    header: "Počet bodov",
    enableColumnFilter: false,
    enableSorting: false
  },

  
]


export default function MeetingsTable({defaultFilters}: {defaultFilters?: ColumnFiltersState}) {

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(defaultFilters || [])
  const [sorting, setSorting] = useState<SortingState>([{
    id: 'date',
    desc: true
  }])
  const [pagination, setPagination] = useState<PaginationState>({pageIndex: 0, pageSize: 10})

  const query = useMeetings(pagination, columnFilters, sorting[0])
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


  const customHeader = (header: Header<Meeting, unknown>) => <FilteredHeaderCell key={header.id} header={header} />

  return (
    <div>
      <div className="">
        <TableComponent table={table} isError={isError} isLoading={isLoading}
          templateParts={{
            headerCell: customHeader
          }}
        >
        </TableComponent>
        <TablePagination table={table}></TablePagination>
      </div>
    </div>
    
  )
}


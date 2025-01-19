"use client"

import { Meeting  } from "@prisma/client"
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, Header, PaginationState, SortingState, Table as TableType, useReactTable } from "@tanstack/react-table"
import Link from "next/link"
import {  useEffect, useMemo, useState } from "react"
import TableComponent, { FilteredHeaderCell } from "@/components/common/table/table"
import { useMeetings } from "@/lib/hooks/meeting/meeting.hooks"
import TablePagination from "@/components/common/table/pagination"
import { formatDateTime } from "@/lib/utils/dates"
import { TableFilter } from "../common/table/filter"
import { meetingColumns } from "@/lib/models/meeting/meeting.model"


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
    header: "Dátum a čas",
    cell: (props) => formatDateTime(props.getValue() as Date),
    enableColumnFilter: false,
  },
  {
    id: "attendantsCount",
    accessorKey: "_count.attendants",
    header: "Počet účastníkov",
    enableColumnFilter: false,
  },
  {
    id: "itemsCount",
    accessorKey: "_count.items",
    header: "Počet bodov porady",
    enableColumnFilter: false,
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

  useEffect(() => {
    setPagination({
      ...pagination,
      pageIndex: 0
    })
  }, [columnFilters])

  const data = useMemo(() => {
    return query.data ? query.data.data : [];
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
    rowCount: query.data?.meta.total,
    pageCount: Math.ceil((query.data?.meta.total || 0) / (pagination.pageSize || 1)),

    state: {
      columnFilters,
      sorting,
      pagination
    },
  })


  const customHeader = (header: Header<Meeting, unknown>) => <FilteredHeaderCell key={header.id} header={header} />

  return (
    <div>
      <div className="mb-4">
        <TableFilter table={table} columns={meetingColumns} primaryFilterColumn="name"></TableFilter>
      </div>

      <div className="">
        <TableComponent table={table} isError={isError} isLoading={isLoading}
        >
        </TableComponent>
        <TablePagination table={table}></TablePagination>
      </div>
    </div>
    
  )
}


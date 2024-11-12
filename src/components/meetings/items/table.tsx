"use client"

import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, Header, PaginationState, SortingState, Table as TableType, useReactTable } from "@tanstack/react-table"
import Link from "next/link"
import {  useMemo, useState } from "react"
import TableComponent from "@/components/common/table/table"
import { useMeetings } from "@/lib/hooks/meeting/meeting.hooks"
import TablePagination from "@/components/common/table/pagination"
import { formatDate, formatDateTime } from "@/lib/utils/dates"
import { meetingColumns } from "@/lib/models/meeting/meeting.model"
import { TableFilter } from "@/components/common/table/filter"
import { meetingItemColumns } from "@/lib/models/meeting/meetingItem.model"
import { useMeetingItems } from "@/lib/hooks/meeting/meetingItem.hooks"
import { MeetingItemListItem } from "@/lib/services/meetings/meetingItem.service"


const columns: ColumnDef<MeetingItemListItem>[] = [
  {
    accessorKey: "title",
    header: "Predmet",
    cell: (props) => {
      const id = props.row.original.meeting_id
      return <Link className="link" href={'/meetings/items/'+id}>{props.getValue() as string}</Link>
    }
  },
  {
    id: "meetingName",
    accessorKey: "meeting.name",
    header: "Porada",
    cell: (props) => {
      const id = props.row.original.meeting_id
      return <Link className="link" href={'/meetings/'+id}>{props.getValue() as string}</Link>
    }
  },  
  {
    id: "date",
    accessorKey: "meeting.date",
    header: "Dátum porady",
    cell: (props) => formatDate(props.getValue() as Date),
    enableColumnFilter: false,
  },
  {
    accessorKey: "description",
    header: "Popis",
  },
  {
    id: 'fulltext'
  }
]


export default function MeetingsItemsTable({defaultFilters}: {defaultFilters?: ColumnFiltersState}) {

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(defaultFilters || [])
  const [sorting, setSorting] = useState<SortingState>([{
    id: 'id',
    desc: true
  }])
  const [pagination, setPagination] = useState<PaginationState>({pageIndex: 0, pageSize: 10})

  const query = useMeetingItems(pagination, columnFilters, sorting[0])
  const { isLoading, isError } = query

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


  return (
    <div>
      <div className="mb-4">
        <TableFilter table={table} columns={meetingItemColumns} primaryFilterColumn="fulltext"></TableFilter>
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


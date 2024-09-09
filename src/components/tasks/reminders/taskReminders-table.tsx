"use client"

import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, Header, PaginationState, SortingState, Table as TableType, useReactTable } from "@tanstack/react-table"

import Link from "next/link"
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, ChevronDown, ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon, ChevronUp, Pencil, Trash, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import TableComponent, { FilteredHeaderCell } from "@/components/common/table/table"
import TablePagination from "@/components/common/table/pagination"
import { TaskReminder } from "@prisma/client"
import { format } from "date-fns"
import { useTaskReminders } from "@/lib/hooks/taskReminder.hooks"
import { TaskReminderListItem } from "@/lib/services/taskReminder.service"
import { DeleteTaskReminder, EditTaskReminder } from "./taskReminder-modal"




const columns: ColumnDef<TaskReminderListItem>[] = [
  // {
  //   accessorKey: "task_id",
  //   enableHiding: true
  // },
  {
    accessorKey: "description",
    header: "Popis",
  },
  {
    accessorKey: "datetime",
    header: "Termín",
    cell: (props) => {
      return props.getValue() ? format(props.getValue() as string, 'dd.MM.yyyy hh:mm') : ''
    },
    enableColumnFilter: false
  },
  {
    id: 'options',
    header: "",
    cell: (props) => {
      return <div className="flex gap-4">
        <EditTaskReminder taskReminder={props.row.original}><Pencil width={16} className="link"/></EditTaskReminder>
        <DeleteTaskReminder task_id={props.row.original.id}></DeleteTaskReminder>
      </div>
    },
  },
]
 

export default function TaskRemindersTable({defaultFilters}: {defaultFilters?: ColumnFiltersState}) {

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(defaultFilters || [])
  const [sorting, setSorting] = useState<SortingState>([{
    id: 'datetime',
    desc: false
  }])
  const [pagination, setPagination] = useState<PaginationState>({pageIndex: 0, pageSize: 10})

  const query = useTaskReminders(pagination, columnFilters, sorting[0])
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


  const customHeader = (header: Header<TaskReminder, unknown>) => <FilteredHeaderCell key={header.id} header={header} />

  return (
    <div>
      <div className="">
        <TableComponent table={table} isError={isError} isLoading={isLoading}
          templateParts={{
            headerCell: customHeader
          }}
        >
        </TableComponent>
        <div className="">
          <TablePagination table={table} ></TablePagination>
        </div>
      </div>
    </div>
    
  )
}

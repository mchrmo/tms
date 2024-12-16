"use client"

import { Task, TaskPriority, TaskStatus } from "@prisma/client"
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, Header, PaginationState, SortingState, Table as TableType, useReactTable } from "@tanstack/react-table"

import { format } from "date-fns"
import { DATE_FORMAT } from "@/lib/utils"
import Link from "next/link"
import clsx from "clsx"
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, ChevronDown, ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon, ChevronUp } from "lucide-react"
import Filter, { TableFilter } from "@/components/common/table/filter"
import { TASK_PRIORITIES_MAP, TASK_STATUSES_MAP, taskColumns } from "@/lib/models/task.model"
import LoadingSpinner from "@/components/ui/loading-spinner"
import TableComponent, { FilteredHeaderCell } from "@/components/common/table/table"
import { PaginatedResponse } from "@/lib/services/api.service"
import { useTasks } from "@/lib/hooks/task/task.hooks"
import TablePagination from "@/components/common/table/pagination"
import { userColumns } from "@/lib/models/user.model"


const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "name",
    header: "Názov",
    cell: (props) => {
      const id = props.row.original.id
      return <Link className="link" href={'/tasks/'+id}>{props.getValue() as string}</Link>
    },
    meta: {
      classList: ["min-w-[300px]"]
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
        'text-red-500': val == 'CHECKREQ',
      })}>{TASK_STATUSES_MAP[val as TaskStatus]}</span>
    },
    meta: {
      filterVariant: 'select',
      selectOptions: (Object.keys(TASK_STATUSES_MAP) as TaskStatus[]).map((k) => ({title: TASK_STATUSES_MAP[k], value: k})),
      classList: ["whitespace-nowrap"]
    }
  }, 
  {
    accessorKey: "deadline",
    header: "Termín dokončenia",
    cell: (props) => {
      const done = props.row.original.status === "DONE"
      const val = new Date(props.getValue() as string)
      return <span className={clsx("font-bold",{
        'text-red-700 font-bold': (new Date() >= val) && !done,
      })}>{format(props.getValue() as Date, DATE_FORMAT)}</span>
    },
    enableColumnFilter: false,
    meta: {
      filterVariant: 'range',
    }
  },
  {
    id: 'creator_name',
    accessorKey: "creator.user.name",
    header: "Vytvárateľ",
    meta: {
      classList: ["whitespace-nowrap"]
    }
  },
  {
    id: 'assignee_name',
    accessorKey: "assignee.user.name",
    header: "Zodpovedná osoba",
    meta: {
      classList: ["whitespace-nowrap"]
    }
  },
  {
    id: 'source',
    accessorKey: "source",
    header: "Zdroj",
  },
  {
    id: 'fulltext',
  },
]


export default function TasksTable({defaultFilters}: {defaultFilters?: ColumnFiltersState}) {

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(defaultFilters || [])
  const [sorting, setSorting] = useState<SortingState>([{
    id: 'deadline',
    desc: false
  }])
  const [pagination, setPagination] = useState<PaginationState>({pageIndex: 0, pageSize: 10})

  useEffect(() => {
    setPagination({
      ...pagination,
      pageIndex: 0
    })
  }, [columnFilters])

  const query = useTasks(pagination, columnFilters, sorting[0])
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
        <TableFilter table={table} columns={taskColumns} primaryFilterColumn="fulltext"></TableFilter>
      </div>

      <div className="">
        <TableComponent table={table} isError={isError} isLoading={isLoading}
          templateParts={{
            // headerCell: customHeader
          }}
        >
        </TableComponent>
        <TablePagination table={table}></TablePagination>
      </div>
    </div>
  )
}


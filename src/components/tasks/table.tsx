"use client"

import { Task, TaskPriority, TaskStatus } from "@prisma/client"
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, Header, PaginationState, SortingState, Table as TableType, useReactTable } from "@tanstack/react-table"

import { format } from "date-fns"
import { DATE_FORMAT } from "@/lib/utils"
import Link from "next/link"
import clsx from "clsx"
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react"
import { Button } from "../ui/button"
import { ArrowUpDown, ChevronDown, ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon, ChevronUp } from "lucide-react"
import Filter from "../common/table/filter"
import { TASK_PRIORITIES_MAP, TASK_STATUSES_MAP } from "@/lib/models/task.model"
import LoadingSpinner from "../ui/loading-spinner"
import TableComponent, { FilteredHeaderCell } from "../common/table/table"
import { PaginatedResponse } from "@/lib/services/api.service"
import { useTasks } from "@/lib/hooks/task.hooks"
import TablePagination from "../common/table/pagination"


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


export default function TasksTable({defaultFilters}: {defaultFilters?: ColumnFiltersState}) {

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(defaultFilters || [])
  const [sorting, setSorting] = useState<SortingState>([{
    id: 'deadline',
    desc: true
  }])
  const [pagination, setPagination] = useState<PaginationState>({pageIndex: 0, pageSize: 10})

  const query = useTasks(pagination, columnFilters, sorting[0])
  const { isLoading, isError } = query

  const data = useMemo(() => {
    return query.data ? query.data.items : [];
  }, [query.data]);
  
  // useEffect(() => {
  //   query.refetch()
  // }, [sorting, pagination])


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


  const customHeader = (header: Header<Task, unknown>) => <FilteredHeaderCell key={header.id} header={header} />

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


"use client"

import { Task, TaskPriority, TaskStatus } from "@prisma/client"
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, SortingState, useReactTable } from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { DATE_FORMAT } from "@/lib/utils"
import Link from "next/link"
import clsx from "clsx"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { Input } from "../ui/input"
import { Query, useQuery, UseQueryResult } from "@tanstack/react-query"
import { useDebounce } from "use-debounce"
import { Button } from "../ui/button"
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react"
import { useTasks } from "@/lib/hooks/task.hooks"
import { Label } from "../ui/label"
import Filter from "../common/table/filter"
import { TASK_PRIORITIES_MAP, TASK_STATUSES_MAP } from "@/lib/models/task.model"


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
  sorting
}: {
  data: Task[],
  isLoading: boolean,
  isError: boolean
  setColumnFilters?: Dispatch<SetStateAction<ColumnFiltersState>>
  columnFilters?: ColumnFiltersState,
  setSorting?: Dispatch<SetStateAction<SortingState>>
  sorting?: SortingState
}) {


  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),

    onColumnFiltersChange: setColumnFilters,
    manualFiltering: true,

    onSortingChange: setSorting,
    manualSorting: true,

    state: {
      sorting,
      columnFilters
    },
  })


  

  return (
    <div>
      <div className="columns-1 md:columns-2 lg:columns-3">
      </div>
      <div className="rounded-md border min-w-[800px]">
        
        <Table>
          <TableHeader className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="align-top">
                      <div className="flex cursor-pointer" onClick={header.column.getToggleSortingHandler()}>
                        <h4 className="text-medium py-1" >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </h4>
                        <span className="pt-1">
                        {{
                            asc: <ChevronUp/>,
                            desc: <ChevronDown/>,
                          }[header.column.getIsSorted() as string] ?? null}

                        </span>
                      </div>

                      {
                        setColumnFilters && <Filter header={header}></Filter>
                      }
                      
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {(table.getRowModel().rows?.length && !isLoading) ? (
              table.getRowModel().rows.map((row) => {
                                
                return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => {
                    
                    return (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    )
                  }
                  )}
                </TableRow>
              )})
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className=" text-center">
                  {
                    (isLoading) ? 
                      "Načítavanie..."
                      :
                      (
                        isError ? "Nepodarilo sa načítať úlohy." : "Žiadne úlohy."
                      )
                  }
                  {
                    // isError && "Nepodarilo sa načítať úlohy"
                  }
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div> 
    </div>
    
  )
}
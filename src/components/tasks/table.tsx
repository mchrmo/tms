"use client"

import { Task, TaskPriority } from "@prisma/client"
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
import { DATE_FORMAT, TASK_PRIORITIES_MAP } from "@/lib/utils"
import Link from "next/link"
import clsx from "clsx"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { Input } from "../ui/input"
import { Query, useQuery, UseQueryResult } from "@tanstack/react-query"
import { useDebounce } from "use-debounce"
import { Button } from "../ui/button"
import { ArrowUpDown } from "lucide-react"
import { useTasks } from "@/lib/hooks/task.hooks"
import { Label } from "../ui/label"
import Filter from "../common/table/filter"


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
    enableColumnFilter: false
  },
  {
    accessorKey: "priority",
    header: "Priorita",
    cell: (props) => TASK_PRIORITIES_MAP[props.getValue() as TaskPriority],
    enableColumnFilter: false
  },
  {
    accessorKey: "status",
    header: "Status",
    enableColumnFilter: false,
    cell: (props) => {
      const val = props.getValue()
      return <span className={clsx("font-bold",{
        'text-green-600': val === 'DONE',
        'text-yellow-600': val !== 'DONE',
      })}>{val as string}</span>
    },
  }, 
  {
    accessorKey: "deadline",
    header: "Termín",
    cell: (props) => format(props.getValue() as Date, DATE_FORMAT),
    enableColumnFilter: false
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
  query,
  setColumnFilters,
  columnFilters
}: {
  query: UseQueryResult<Task[]>
  setColumnFilters?: Dispatch<SetStateAction<ColumnFiltersState>>
  columnFilters: ColumnFiltersState
}) {

  const [sorting, setSorting] = useState<SortingState>([])



  const table = useReactTable({
    data: query.data ? query.data : [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),

    onColumnFiltersChange: setColumnFilters,
    manualFiltering: true,


    state: {
      sorting,
      columnFilters
    },

  })


  return (
    <div>
      <div className="columns-1 md:columns-2 lg:columns-3">
        {/* {table.getHeaderGroups()[0].headers.map(
          (header) =>
            !header.isPlaceholder &&
            header.column.getCanFilter() && (
              <div key={header.id} className="">
                <Label className="block font-semibold text-lg">
                  {`${flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}`}
                  :
                </Label>
                <Input
                  className="w-full"
                  placeholder={`Filter ${flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )} ...`}
                  value={(header.column.getFilterValue() as string) || ""}
                  onChange={(e) => {
                    header.column?.setFilterValue(e.target.value);
                  }}
                />
              </div>
          )
        )} */}
        {/* {table.getHeaderGroups()[0].headers.map(
          (header) => <Filter key={header.column.id} header={header}></Filter>
        )} */}
      </div>
      <div className="rounded-md border min-w-[800px]">
        
        <Table>
          <TableHeader className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="align-top">
                      <h4 className="text-medium py-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </h4>
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
            {table.getRowModel().rows?.length ? (
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
                    query.isLoading ? 
                      "Načítavanie..."
                      :
                      "Žiadne úlohy."
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
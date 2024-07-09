"use client"

import { Task } from "@prisma/client"
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
import { useEffect, useState } from "react"
import { Input } from "../ui/input"
import { useQuery } from "@tanstack/react-query"
import { useDebounce } from "use-debounce"
import { Button } from "../ui/button"
import { ArrowUpDown } from "lucide-react"


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
    // header: "Vznik",
    cell: (props) => format(props.getValue() as Date, DATE_FORMAT),
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Vznik
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "status",
    // header: "Status",
    cell: (props) => {
      const val = props.getValue()
      return <span className={clsx("font-bold",{
        'text-green-600': val === 'DONE',
        'text-yellow-600': val !== 'DONE',
      })}>{val as string}</span>
    },
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  
  {
    accessorKey: "deadline",
    // header: "Termín",
    cell: (props) => format(props.getValue() as Date, DATE_FORMAT),
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Termín
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },

  },
  {
    accessorKey: "creator.user.name",
    header: "Vytvoril"
  },
  {
    accessorKey: "assignee.user.name",
    header: "Zodpovedný"
  },
  {
    accessorKey: "organization.name",
    header: "Organizácia"
  },
  
]


export default function TasksTable({data}: {data: Task[]}) {

  const [filter, setFilter] = useState<string | undefined>()
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [debouncedSearchQuery] = useDebounce(filter, 500);

  const loadTasks = async () => {
    
    const search = debouncedSearchQuery ? debouncedSearchQuery : ''
    const res = await fetch(`/api/tasks?search=${search}`)
    return await res.json();
  }

  const { data: tasks, isLoading, isError, refetch } = useQuery<Task[]>({
    queryKey: ['tasks', debouncedSearchQuery],
    queryFn: () => loadTasks()
  });



  return (
    <div>

      <div className="flex items-center py-4">
        <Input
          placeholder="Filter..."
          // value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            setFilter(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      {isLoading && <p>Loading...</p>}

      {tasks && (
        <TasksTableRender data={tasks} />
      )}
      
    </div>
  )
  
}


function TasksTableRender({data}: {data: Task[]}) {

  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },

  })


  return (
    <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
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
                  Žiadne úlohy.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div> 
  )
}
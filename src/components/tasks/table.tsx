"use client"

import { Task } from "@prisma/client"
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"

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
  },
  {
    accessorKey: "status",
    header: "Status",
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

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
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
"use client"

import { Meeting, MeetingItem  } from "@prisma/client"
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, Header, PaginationState, SortingState, Table as TableType, useReactTable } from "@tanstack/react-table"

import { format } from "date-fns"
import { DATE_FORMAT } from "@/lib/utils"
import Link from "next/link"
import clsx from "clsx"
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react"
import { ArrowUpDown, ChevronDown, ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon, ChevronUp } from "lucide-react"
import { formatDateTime } from "@/lib/utils/dates"
import { meetingItemStatusMap } from "@/lib/models/meeting/meetingItem.model"
import TableComponent from "@/components/common/table/table"
import { MeetingDetail } from "@/lib/services/meetings/meeting.service"


const columns: ColumnDef<any>[] = [
  {
    accessorKey: "description",
    header: "Popis",
    cell: (props) => {
      const id = props.row.original.id
      return <Link className="link" href={'/meetings/item/'+id}>{props.getValue() as string}</Link>
    }
  },
  {
    accessorKey: "creator.name",
    header: "Navrhovateľ",
    enableColumnFilter: false,
  },
  {
    accessorKey: "status",
    header: "Stav",
    cell: (props) => meetingItemStatusMap[props.getValue() as string],
    enableColumnFilter: false,
  },
]


export default function MeetingItemsTable({meeting}: {meeting?: MeetingDetail}) {


  const table = useReactTable({
    data: meeting?.items!,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),

  })

  return (
    <div>
      <div className="">
        <TableComponent table={table} isError={false} isLoading={false}>
        </TableComponent>
      </div>
    </div>
    
  )
}


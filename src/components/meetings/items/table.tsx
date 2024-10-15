"use client"

import { Meeting, MeetingItem  } from "@prisma/client"
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, Header, PaginationState, SortingState, Table as TableType, useReactTable } from "@tanstack/react-table"

import { format } from "date-fns"
import { DATE_FORMAT } from "@/lib/utils"
import Link from "next/link"
import clsx from "clsx"
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react"
import { ArrowUpDown, CheckIcon, ChevronDown, ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon, ChevronUp, XIcon } from "lucide-react"
import { formatDate, formatDateTime } from "@/lib/utils/dates"
import { meetingItemStatusMap } from "@/lib/models/meeting/meetingItem.model"
import TableComponent from "@/components/common/table/table"
import { MeetingDetail } from "@/lib/services/meetings/meeting.service"
import { useResolveMeetingItem } from "@/lib/hooks/meeting/meetingItem.hooks"


export type MeetingDetailItems = NonNullable<MeetingDetail>['items'][number];



const columns: ColumnDef<MeetingDetailItems>[] = [
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
  
  const resolveItemQ = useResolveMeetingItem()
  
  const resolveItem = (itemId: number, status: 'ACCEPTED' | 'DENIED') => {
    resolveItemQ.mutate({id: itemId, status})
  }


  const columnsIndex = columns.findIndex(c => c.id == 'utils')
  if(columnsIndex > -1) columns.splice(columnsIndex, 1)

  if(!columns.find(c => c.id == 'utils')) {
    columns.push({
      id: 'utils',
      cell: (props) => {
        const status = props.row.original.status
        const itemId = props.row.original.id
        if(status == "ACCEPTED") {
          return (
            <a target="_blank" href={`/tasks/create?source=${meeting?.name} ${formatDate(meeting?.date!)}&name=${props.row.original.description}`}><span className="link">Vytvoriť úlohu</span></a>
          )
        } else if(status == "PENDING") {
          return  (
            <div className="">
              <CheckIcon onClick={() => resolveItem(itemId, 'ACCEPTED')}></CheckIcon>
              <XIcon onClick={() => resolveItem(itemId, 'DENIED')}></XIcon>
            </div>
          )
        }
      
      },
      enableColumnFilter: false,
    })
  }


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


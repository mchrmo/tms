"use client"

import { Meeting, MeetingAttendantRole, MeetingItem } from "@prisma/client"
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, Header, PaginationState, RowSelectionState, SortingState, Table as TableType, useReactTable } from "@tanstack/react-table"
import Link from "next/link"
import clsx from "clsx"
import { ArrowUpDown, CheckIcon, ChevronDown, ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon, ChevronUp, LoaderCircle, XIcon } from "lucide-react"
import { formatDate, formatDateTime } from "@/lib/utils/dates"
import { meetingItemStatusMap } from "@/lib/models/meeting/meetingItem.model"
import TableComponent from "@/components/common/table/table"
import { MeetingDetail } from "@/lib/services/meetings/meeting.service"
import { useResolveMeetingItem } from "@/lib/hooks/meeting/meetingItem.hooks"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import MoveMeetingItemsDialog from "./move-items-dialog"
import CreateMeetingItem from "./create"
import { Download01 } from "@untitled-ui/icons-react"


export type MeetingDetailItems = NonNullable<MeetingDetail>['items'][number];

const baseColumns: ColumnDef<MeetingDetailItems>[] = [
  {
    accessorKey: "title",
    header: "Predmet",
    cell: (props) => {
      const id = props.row.original.id
      return <Link className="link" href={'/meetings/items/'+id}>{props.getValue() ? props.getValue() as string : "zobraziť"}</Link>
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

export default function MeetingDetailItemsTable({ meeting, role, onExport }: { meeting?: MeetingDetail, role: string, onExport?: () => void }) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [moveDialogOpen, setMoveDialogOpen] = useState(false)

  const canMove = role === 'CREATOR' || role === 'admin'

  const resolveItemQ = useResolveMeetingItem()
  const resolveItem = (itemId: number, status: 'ACCEPTED' | 'DENIED') => {
    resolveItemQ.mutate({ id: itemId, status })
  }

  const columns: ColumnDef<MeetingDetailItems>[] = [
    ...(canMove ? [{
      id: 'select',
      header: ({ table }: any) => (
        <Checkbox
          checked={table.getIsAllRowsSelected()}
          onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
          aria-label="Vybrať všetko"
        />
      ),
      cell: ({ row }: any) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Vybrať riadok"
        />
      ),
      enableSorting: false,
      enableColumnFilter: false,
    } as ColumnDef<MeetingDetailItems>] : []),
    ...baseColumns,
    {
      id: 'utils',
      cell: (props) => {
        const status = props.row.original.status
        const itemId = props.row.original.id
        if (status == "ACCEPTED") {
          return (
            <a target="_blank" href={`/tasks/create?source=${meeting?.name} ${formatDate(meeting?.date!)}&name=${props.row.original.description}`}><span className="link">Vytvoriť úlohu</span></a>
          )
        } else if (status == "PENDING") {
          if(role !== "CREATOR" && role !== "admin") return
          return (
            <div>
            {
              resolveItemQ.isPending ? 
              <div className="flex justify-center"><LoadingSpinner/></div>
              : 
              (
                <div className="flex space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <CheckIcon className="cursor-pointer text-gray-400 hover:text-black" onClick={() => resolveItem(itemId, 'ACCEPTED')}></CheckIcon>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Schváliť</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
    
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <XIcon className="cursor-pointer text-gray-400 hover:text-black" onClick={() => resolveItem(itemId, 'DENIED')}></XIcon>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Zamietnuť</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )
            }
            </div>
          )
        }
      },
      enableColumnFilter: false,
    }
  ]

  const table = useReactTable({
    data: meeting?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: canMove,
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
  })

  const selectedIds = table
    .getSelectedRowModel()
    .rows.map((r) => r.original.id)

  return (
    <div>
      <div className="flex justify-end gap-1 mb-2">
        {canMove && selectedIds.length > 0 && (
          <Button variant="outline" onClick={() => setMoveDialogOpen(true)}>
            Presunúť vybraté ({selectedIds.length})
          </Button>
        )}
        {onExport && (
          <Button onClick={onExport}>Export <Download01 height={14} /></Button>
        )}
        {meeting && (
          <CreateMeetingItem meeting_id={meeting.id} />
        )}
      </div>
      <TableComponent table={table} isError={false} isLoading={false} />

      {meeting && (
        <MoveMeetingItemsDialog
          open={moveDialogOpen}
          onOpenChange={setMoveDialogOpen}
          itemIds={selectedIds}
          sourceMeetingId={meeting.id}
          onSuccess={() => setRowSelection({})}
        />
      )}
    </div>
  )
}



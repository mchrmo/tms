"use client"

import { ColumnDef, ColumnFilter, ColumnFiltersState, ColumnSort, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, Header, PaginationState, SortingState, Table, useReactTable } from "@tanstack/react-table"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useResetRegistration, useUsers } from "@/lib/hooks/user.hooks"
import TableComponent from "@/components/common/table/table"
import { USER_ROLES_MAP, userColumns } from "@/lib/models/user.model"
import { User } from "@/lib/db/user.repository"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { CalendarIcon, ChevronDownIcon, ChevronUp, ChevronUpIcon, CircleXIcon, CrossIcon, EllipsisVerticalIcon, FilterIcon, HashIcon, PlusIcon, SearchIcon, TextIcon, TrashIcon, XIcon } from "lucide-react"
import { TableHead } from "../ui/table"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/utils/dates"
import { TableFilter } from "../common/table/filter"


export default function UsersTable() {

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([{
    id: 'email',
    desc: true
  }])

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  const empQuery = useUsers(pagination, columnFilters, sorting[0])

  const data = useMemo(() => {
    return empQuery.data ? empQuery.data.data : [];
  }, [empQuery.data]);

  useEffect(() => {
    empQuery.refetch()
  }, [sorting, pagination])



  const columns: ColumnDef<any>[] = [
    {
      id: "name",
      accessorKey: "name",
      header: "Názov",
      cell: (props) => {
        const id = props.row.original.id
        return props.getValue() as string
      },
    },
    {
      accessorKey: "email",
      header: "E-mail"
    },
    {
      id: 'role',
      accessorFn: (orginal) => USER_ROLES_MAP[orginal.role.name],
      header: "Rola",
    },
    {
      accessorKey: "createdAt",
      header: "Dátum",
      cell: (props) => {
        const val = props.getValue()
        if (!val) return ''
        return formatDate(val as Date)
      },
    },
    {
      id: 'organization',
      accessorFn: (orginal) => orginal.OrganizationMember.length ? orginal.OrganizationMember[0].organization.name : '',
      header: "Organizácia",
      enableSorting: false
    },
    {
      accessorKey: "clerk_id",
      header: "Clerk ID"
    },
    {
      // accessorKey: "clerk_id",
      id: "actions",
      // accessorFn: (orginal) => {
      //   return 
      // },
      cell: (props) => <RowActions user={props.row.original}></RowActions>,
      header: "",
    },
    {
      id: "fulltext"
    },
  ]


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
    rowCount: empQuery.data?.meta.total,
    pageCount: Math.ceil((empQuery.data?.meta.total || 0) / (pagination.pageSize || 1)),

    state: {
      columnFilters,
      sorting,
      pagination
    },

  })

  useEffect(() => {
    if (setPagination) {
      setPagination((pagination) => ({
        pageIndex: 0,
        pageSize: pagination.pageSize,
      }));
    }
  }, [columnFilters, setPagination]);


  return (
    <div>
      <div className="mb-4">
        <TableFilter table={table} columns={userColumns} primaryFilterColumn="fulltext"></TableFilter>
      </div>

      <TableComponent table={table} isError={empQuery.isError} isLoading={empQuery.isLoading}
        pagination={true}
        templateParts={{
          headerCell: (header) => <FilteredHeaderCell key={header.id} header={header}></FilteredHeaderCell>
        }}
      >
      </TableComponent>
    </div>

  )

}




export function FilteredHeaderCell({ header }: { header: Header<any, unknown> }) {

  return (
    <TableHead className="align-middle">
      <div className={cn("flex", header.column.getCanSort() && "cursor-pointer")} onClick={header.column.getToggleSortingHandler()}>
        <h4 className="font-medium text-muted-foreground" >
          {header.isPlaceholder
            ? null
            : flexRender(
              header.column.columnDef.header,
              header.getContext()
            )}
        </h4>
        <span className="">
          {{
            asc: <ChevronUpIcon />,
            desc: <ChevronDownIcon />,
          }[header.column.getIsSorted() as string] ?? null}
        </span>
      </div>
    </TableHead>
  )
}


function RowActions({ user }: { user: User }) {

  const { mutate: resetRegistration } = useResetRegistration()

  const handleResetRegistration = () => {
    if (!confirm("Určite chcete resetovať registráciu?")) return
    resetRegistration(user.clerk_id)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost"><EllipsisVerticalIcon></EllipsisVerticalIcon></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleResetRegistration}>
          Resetovať registráciu
        </DropdownMenuItem>
        <Link href={`/users/${user.id}`}>
          <DropdownMenuItem >
            Upraviť
          </DropdownMenuItem>
        </Link>

      </DropdownMenuContent>
    </DropdownMenu>
  )

}
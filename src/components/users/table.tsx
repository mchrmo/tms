"use client"

import { ColumnDef, ColumnFilter, ColumnFiltersState, ColumnSort, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, PaginationState, SortingState, useReactTable } from "@tanstack/react-table"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useResetRegistration, useUsers } from "@/lib/hooks/user.hooks"
import TableComponent, { FilteredHeaderCell } from "../common/table/table"
import { userRolesMap } from "@/lib/models/user.model"
import { User } from "@/lib/db/user.repository"
import {   
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
 } from "../ui/dropdown-menu"
import { Button } from "../ui/button"
import { EllipsisVerticalIcon } from "lucide-react"
import TablePagination from "../common/table/pagination"



export default function UsersTable() {

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([{
    id: 'email',
    desc: true
  }])

  const [pagination, setPagination] = useState<PaginationState>({pageIndex: 0, pageSize: 10})

  const empQuery = useUsers(pagination, columnFilters, sorting[0])

  const data = useMemo(() => {
    return empQuery.data ? empQuery.data.items : [];
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
      accessorFn: (orginal) => userRolesMap[orginal.role.name],
      header: "Rola",
      enableSorting: false
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
      id:"actions",
      // accessorFn: (orginal) => {
      //   return 
      // },
      cell: (props) => <RowActions user={props.row.original}></RowActions>,
      header: "",
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
    rowCount: empQuery.data?.totalCount,
    pageCount: Math.ceil((empQuery.data?.totalCount || 0) / (pagination.pageSize || 1)),

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
      <TableComponent table={table} isError={empQuery.isError} isLoading={empQuery.isLoading}
        pagination={true}
        templateParts={{
          // headerCell: (header) => <FilteredHeaderCell key={header.id} header={header}></FilteredHeaderCell> 
        }}
      
      >
      </TableComponent>
      

    </div>
    
  )

}



function RowActions({user}: {user: User}) {

  const { mutate: resetRegistration  } = useResetRegistration()
  
  const handleDelete = () => {
    if(!confirm("Určite chcete zmazať záznam?")) return
    // deleteEmployeeRecord()
  }

  const handleResetRegistration = () => {
    
    if(!confirm("Určite chcete resetovať registráciu?")) return

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
      </DropdownMenuContent>
    </DropdownMenu>
  )

}
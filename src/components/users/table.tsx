"use client"

import { ColumnDef, ColumnFilter, ColumnFiltersState, ColumnSort, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable } from "@tanstack/react-table"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useResetRegistration, useUsers } from "@/lib/hooks/user.hooks"
import TableComponent, { FilteredHeaderCell } from "../common/table/table"
import { userRolesMap } from "@/models/User"
import { User } from "@/lib/db/user.repository"
import {   
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
 } from "../ui/dropdown-menu"
import { Button } from "../ui/button"
import { EllipsisVerticalIcon } from "lucide-react"



export default function UsersTable() {

  // const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  // const [sorting, setSorting] = useState<SortingState>([])

  const empQuery = useUsers()

  const data = useMemo(() => {
    return Array.isArray(empQuery.data) ? empQuery.data : [];
  }, [empQuery.data]);
  
  // useEffect(() => {
  //   empQuery.refetch()
  // }, [sorting])
  


  const columns: ColumnDef<any>[] = [
    {
      id: "name",
      accessorKey: "name",
      header: "Názov",
      cell: (props) => {
        const id = props.row.original.id
        return props.getValue() as string
      },
      enableSorting: false
    },  
    {
      accessorKey: "email",
      header: "E-mail"
    },
    {
      accessorFn: (orginal) => userRolesMap[orginal.role.name],
      header: "Rola"
    },
    {
      accessorFn: (orginal) => orginal.OrganizationMember.length ? orginal.OrganizationMember[0].organization.name : '',
      header: "Organizácia"
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
    // getPaginationRowModel: getPaginationRowModel(),

    // onColumnFiltersChange: setColumnFilters,
    // manualFiltering: true,

    // onSortingChange: setSorting,
    // manualSorting: true,

    // onPaginationChange: setPagination,
    // manualPagination: true,

    state: {
      // columnFilters,
      // sorting,
      // pagination
    },
  })


  return (
    <div>
      <TableComponent table={table} isError={empQuery.isError} isLoading={empQuery.isLoading}
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
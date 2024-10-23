"use client"

import { Organization  } from "@prisma/client"
import { ColumnDef, ColumnFiltersState, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, Header, PaginationState, SortingState, Table as TableType, useReactTable } from "@tanstack/react-table"
import Link from "next/link"
import {  useMemo, useState } from "react"
import TableComponent, { FilteredHeaderCell } from "@/components/common/table/table"
import { useOrganizations } from "@/lib/hooks/organization/organization.hooks"
import TablePagination from "@/components/common/table/pagination"
import { TableFilter } from "../common/table/filter"
import { organizationColumns } from "@/lib/models/organization/organization.model"


const columns: ColumnDef<Organization>[] = [
  {
    accessorKey: "name",
    header: "Názov",
    cell: (props) => {
      const id = props.row.original.id
      return <Link className="link" href={'/organizations/'+id}>{props.getValue() as string}</Link>
    }
  },
  {
    id: 'parent',
    accessorKey: "parent.name",
    header: "Nadriadená organizácia",
    cell: (props) => {
      const parent_id = props.row.original.parent_id
      if(!parent_id) return <span>-</span>
      return <Link className="link" href={'/organizations/'+parent_id}>{props.getValue() as string}</Link>
    }
  },

  
]


export default function OrganizationsTable({defaultFilters}: {defaultFilters?: ColumnFiltersState}) {

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(defaultFilters || [])
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({pageIndex: 0, pageSize: 10})

  const query = useOrganizations(pagination, columnFilters, sorting[0])
  const { isLoading, isError } = query

  const data = useMemo(() => {
    return query.data ? query.data.data : [];
  }, [query.data]);


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
    rowCount: query.data?.meta.total,
    pageCount: Math.ceil((query.data?.meta.total || 0) / (pagination.pageSize || 1)),

    state: {
      columnFilters,
      sorting,
      pagination
    },
  })



  return (
    <div>
      <div className="mb-4">
        <TableFilter table={table} columns={organizationColumns} primaryFilterColumn="name"></TableFilter>
      </div>

      <div className="">
        <TableComponent table={table} isError={isError} isLoading={isLoading}
        >
        </TableComponent>
        <TablePagination table={table}></TablePagination>
      </div>
    </div>
    
  )
}


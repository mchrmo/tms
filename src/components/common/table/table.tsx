import LoadingSpinner from "@/components/ui/loading-spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { flexRender, Header, Table as TableType } from '@tanstack/react-table'
import { ChevronDown, ChevronUp } from "lucide-react"
import { ReactNode, useEffect, useState } from "react"
import Filter from "./filter"
import { cn } from "@/lib/utils"
import TablePagination from "./pagination"


interface CustomTableParts {
  headerCell?: (header: Header<any, unknown>) => ReactNode
}


export default function TableComponent<TData>({
  table,
  isLoading,
  isError,
  templateParts,
  pagination,
  tableId
}: {
  table: TableType<TData>,
  isLoading: boolean,
  isError: boolean,
  children?: ReactNode,
  templateParts?: CustomTableParts,
  pagination?: boolean
  tableId?: string
}) {

  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (tableId) {
      const sorting = localStorage.getItem('table-' + tableId + '-sorting')
      console.log(sorting);

      table.setSorting(sorting ? JSON.parse(sorting) : [])
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!tableId || !loaded) return
    const sorting = table.getState().sorting
    localStorage.setItem('table-' + tableId + '-sorting', JSON.stringify(sorting))

    console.log(sorting[0]);

  }, [table.getState().sorting])


  return <>
    <div className="">
      <Table className="">
        <TableHeader className="">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {
                headerGroup.headers.map((header) =>
                  templateParts && templateParts.headerCell ?
                    templateParts.headerCell(header) :
                    <DefaultHeaderCell key={header.id} header={header}></DefaultHeaderCell>)
              }
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {(table.getRowModel().rows?.length && !isLoading) ? (
            table.getRowModel().rows.map((row) => {

              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => {

                    const colDef = cell.column.columnDef

                    return (
                      <TableCell key={cell.id} className={colDef.meta && colDef.meta.classList && colDef.meta.classList.join(' ')}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    )
                  }
                  )}
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={table.getAllColumns().length} className=" text-center">
                {
                  (isLoading) ?
                    <span> <LoadingSpinner /></span>
                    :
                    (
                      isError ? "Chyba pri načítaní." : "Žiadne záznamy."
                    )
                }
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {pagination && <TablePagination table={table} ></TablePagination>}
    </div>
  </>
}


export function DefaultHeaderCell({ header }: { header: Header<any, unknown> }) {

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
            asc: <ChevronUp />,
            desc: <ChevronDown />,
          }[header.column.getIsSorted() as string] ?? null}
        </span>
      </div>
    </TableHead>
  )
}

export function FilteredHeaderCell({ header }: { header: Header<any, unknown> }) {

  return (
    <TableHead className="align-top">
      <div className={cn("flex", header.column.getCanSort() && "cursor-pointer")} onClick={header.column.getToggleSortingHandler()}>
        <h4 className="text-medium" >
          {header.isPlaceholder
            ? null
            : flexRender(
              header.column.columnDef.header,
              header.getContext()
            )}
        </h4>
        <span className="">
          {{
            asc: <ChevronUp />,
            desc: <ChevronDown />,
          }[header.column.getIsSorted() as string] ?? null}
        </span>
      </div>

      <Filter header={header}></Filter>
    </TableHead>
  )
}

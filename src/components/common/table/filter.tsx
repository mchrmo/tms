'use client'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label";
import { Column, flexRender, Header } from "@tanstack/react-table"



export default function Filter({ header }: { header: Header<any, unknown>}) {
  const columnFilterValue = header.column.getFilterValue()
  const column = header.column

  let filterVariant = ''
  if(header.column.columnDef.meta) {
  }

  if(!column.getCanFilter()) return null

  return filterVariant === 'range' ? (
    <div>
      <div className="flex space-x-2">
        {/* See faceted column filters example for min max values functionality */}
        <Input
          type="number"
          value={(columnFilterValue as [number, number])?.[0] ?? ''}
          onChange={value =>
            column.setFilterValue((old: [number, number]) => [value, old?.[1]])
          }
          placeholder={`Min`}
          className="w-24 border shadow rounded"
        />
        <Input
          type="number"
          value={(columnFilterValue as [number, number])?.[1] ?? ''}
          onChange={value =>
            column.setFilterValue((old: [number, number]) => [old?.[0], value])
          }
          placeholder={`Max`}
          className="w-24 border shadow rounded"
        />
      </div>
      <div className="h-1" />
    </div>
  ) : filterVariant === 'select' ? (
    <select
      onChange={e => column.setFilterValue(e.target.value)}
      value={columnFilterValue?.toString()}
    >
      {/* See faceted column filters example for dynamic select options */}
      <option value="">All</option>
      <option value="complicated">complicated</option>
      <option value="relationship">relationship</option>
      <option value="single">single</option>
    </select>
  ) : (
    <div className="">
      {/* <Label>
        {flexRender(
          column.columnDef.header,
          header.getContext()
        )}
      </Label> */}
      <Input
      className="p-1 h-auto mb-1 mt-2 border-0 border-b-1 rounded-none"
      placeholder={`filter...`}
      type="text"
      value={(header.column.getFilterValue() as string) || ""}
      onChange={(e) => {
        header.column?.setFilterValue(e.target.value);
      }}    />
    </div>
    
    // See faceted column filters example for datalist search suggestions
  )
}
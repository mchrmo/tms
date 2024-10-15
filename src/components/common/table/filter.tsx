'use client'
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ModelColumns, SingleColumnDef } from "@/lib/utils/api.utils";
import { formatDate } from "@/lib/utils/dates";
import { SelectOptionDef } from "@/types/global";
import { Column, flexRender, Header, Table } from "@tanstack/react-table"
import { addDays, format } from "date-fns";
import { CalendarIcon, ChevronDownIcon,  HashIcon, PlusIcon, SearchIcon, TextIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { useDebouncedCallback } from "use-debounce";



export default function Filter({ header }: { header: Header<any, unknown>}) {
  const columnFilterValue = header.column.getFilterValue()
  const column = header.column

  const debounced = useDebouncedCallback((value) => {
    column.setFilterValue(value)
  }, 1000);
  
  let filterVariant: string | undefined;
  let selectOptions: SelectOptionDef[] = [];
  if(header.column.columnDef.meta) {
    const meta = header.column.columnDef.meta
    filterVariant = meta.filterVariant
    
    if(filterVariant == 'select') {
      selectOptions = meta.selectOptions ? meta.selectOptions : []
    }
  }

  const handleFilterChange = (value: string) => {

    if(filterVariant == 'select') {
      column.setFilterValue(value)
    } else {
      debounced(value)
    }

  }


  if(!column.getCanFilter()) return null

  return filterVariant === 'range' ? 
      <DateRangeFilter></DateRangeFilter> 
      : filterVariant === 'select' ? (
      <Select
        onValueChange={(value) => handleFilterChange(value == 'none' ? '' : value)}
        value={columnFilterValue?.toString() ? columnFilterValue?.toString() : 'none'}
      >
        <SelectTrigger className="h-7 mt-2" >
          <SelectValue placeholder="Všetko" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="none">Všetko</SelectItem>
            {
              selectOptions?.map(o => <SelectItem key={o.value} value={o.value}>{o.title}</SelectItem>)
            }
          </SelectGroup>
        </SelectContent>
      </Select>
    ) : (
    <div className="">
      {/* <Label>
        {flexRender(
          column.columnDef.header,
          header.getContext()
        )}
      </Label> */}
      <Input
      className="p-1 h-auto mb-1 mt-2 border-0 border-b-1 "
      placeholder={`Filter`}
      type="text"
      defaultValue={(header.column.getFilterValue() as string) || ""}
      onChange={(e) => handleFilterChange(e.target.value)}
      />
    </div>
  )
}

interface ActiveFilter {
  colDef: SingleColumnDef,
  id: string,
  value: string
}

type TableFilterProps<TData> = {
  table: Table<TData>,
  columns: ModelColumns,
  primaryFilterColumn: string,
  advanced?: boolean
}
export function TableFilter<TData>(props: TableFilterProps<TData>) {
  const primaryCol = props.table.getColumn(props.primaryFilterColumn)
  if(props.primaryFilterColumn) {
    if (!primaryCol) return <span>Wrong primary filter column name {props.primaryFilterColumn}</span>  
  }

  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])
  const debouncedPrimary = useDebouncedCallback((value) => {
    if(primaryCol) primaryCol.setFilterValue(value)
  }, 1000);

  const getFilterableColumns = () => {
    const resCols: ModelColumns = {}
    Object.entries(props.columns)
      .filter(([colName, colDef]) => colDef.label)
      .filter(([colName, colDef]) => !activeFilters.find(f => f.id === colName))
      .map(([colName, colDef]) => resCols[colName] = colDef)

    return resCols
  }

  const filterableColumns = getFilterableColumns()

  const handleFilterChange = (value: string) => {
    debouncedPrimary(value)
  }

  const addFilter = (key: string) => {

    const index = activeFilters.findIndex(f => key === f.id)
    if (index >= 0) return

    const tableCol = props.table.getColumn(key)
    if (!tableCol) return
    const colDef = props.columns[key]
    console.log(colDef);

    if (!colDef) return

    setActiveFilters([...activeFilters, { colDef, id: key, value: '' }])
  }

  const removeFilter = (id: string) => {
    setActiveFilters(activeFilters.filter(f => f.id !== id))
    const tableCol = props.table.getColumn(id)
    if (!tableCol) return
    tableCol.setFilterValue(null)

  }

  const updateFilter = (id: string, value: string) => {
    const aFilters = [...activeFilters]
    const filter = aFilters.find(f => f.id === id)
    if (!filter) return
    filter!.value = value
    setActiveFilters(aFilters)

  }

  useEffect(() => {
    for (const f of activeFilters) {
      const tableCol = props.table.getColumn(f.id)
      if (!tableCol) continue
      tableCol.setFilterValue(f.value)
    }
  }, [activeFilters])

  return (
    <div className="filter">

      <div className="flex w-full max-w-sm items-center space-x-2">
        {
          primaryCol && <Input startIcon={SearchIcon} onChange={(e) => handleFilterChange(e.target.value)} type="text" placeholder="Vyhladávanie..." />
        }
        <AddFilterCombobox columns={filterableColumns} setSelectedOption={addFilter}></AddFilterCombobox>
      </div>

      <div className="mt-3 space-x-2 flex">
        {
          activeFilters.map(f => (
            <FilterItem key={f.id} filter={f} onFilterRemove={removeFilter} onFilterUpdate={(val) => updateFilter(f.id, val)} defaultOpen={true}></FilterItem>
            // <span onClick={() => removeFilter(f.id)} key={f.id}>{f.id} </span>
          ))
        }
      </div>

    </div>
  )
}

type AddFilterComboboxProps = {
  columns: ModelColumns,
  setSelectedOption: (val: string) => void
}
function AddFilterCombobox({
  columns,
  setSelectedOption
}: AddFilterComboboxProps) {
  const [value, setValue] = useState("")
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          role="combobox"
          onClick={() => setOpen(true)}
          disabled={!Object.keys(columns).length}
        >
          <PlusIcon className="mr-2 size-4 opacity-50" aria-hidden="true" />
          Pridať filter
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[12.5rem] p-0" align="start">
        <Command>
          <CommandInput placeholder="Stĺpec..." />
          <CommandList>
            <CommandGroup>
              {Object.entries(columns)
                .filter(([colName, colDef]) => colDef.label)
                .map(([colName, colDef]) => (
                  <CommandItem
                    key={colName}
                    className=""
                    value={colName}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue)
                      setSelectedOption(currentValue)
                    }}
                  >
                    {
                      colDef.type == 'enum' && <><ChevronDownIcon className="mr-2 size-4" aria-hidden="true" /> {colDef.label}</>
                    }
                    {
                      colDef.type == 'string' && <><TextIcon className="mr-2 size-4" aria-hidden="true" /> {colDef.label}</>
                    }
                    {
                      colDef.type == 'number' && <><HashIcon className="mr-2 size-4" aria-hidden="true" /> {colDef.label}</>
                    }
                    {
                      colDef.type == 'datetime' && <><CalendarIcon className="mr-2 size-4" aria-hidden="true" /> {colDef.label}</>
                    }

                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function FilterItem({ filter, defaultOpen, onFilterRemove, onFilterUpdate }: { filter: ActiveFilter, defaultOpen: boolean, onFilterRemove: (id: string) => void, onFilterUpdate: (value: string) => void }) {
  const [open, setOpen] = useState(defaultOpen)

  const debouncedInput = useDebouncedCallback((value: string) => {
    onFilterUpdate(value)
  }, 500);

  return (
    <div className={cn(
      "px-5 border-1 gap-0 truncate rounded-full flex items-center space-x-3",
      { "bg-black text-white": open }
    )}>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="py-1">
          <div className="flex flex-col justify-start text-left">
            <span className={cn("font-medium text-sm", { 'line-through': !filter.value && !open })}>{filter.colDef.label}</span>
            <span className="text-xs font-light">
              {
                filter.value &&
                filter.colDef.type == 'enum' && filter.colDef.enum![filter.value]
                ||
                filter.colDef.type == 'string' && filter.value
                ||
                filter.colDef.type == 'datetime' && filter.value && formatDate(new Date(filter.value))
              }</span>
          </div>
        </PopoverTrigger>
        <PopoverContent className="space-y-2 p-2 w-auto" align="start">
          <h5 className="text-sm">{filter.colDef.label}</h5>
          <Separator />
          {
            filter.colDef.type === 'string' && (
              <Input className="h-7" placeholder={filter.colDef.label} defaultValue={filter.value} onChange={(e) => debouncedInput(e.target.value)} />
            )
          }
          {
            filter.colDef.type === 'enum' && (
              <Select onValueChange={(value) => { onFilterUpdate(value); setOpen(false) }} defaultValue={filter.value}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder='Výber' />
                </SelectTrigger>
                <SelectContent >
                  {
                    Object.entries(filter.colDef.enum!).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            )
          }
          {
            filter.colDef.type === 'datetime' && <FilterItemDatetime filter={filter} onFilterUpdate={onFilterUpdate} />
          }
        </PopoverContent>
      </Popover>

      <Button onClick={() => onFilterRemove(filter.id)} variant={"ghost"} className="p-0 h-0"><XIcon size={16} /></Button>
    </div>

  )
}

function FilterItemDatetime({ filter, onFilterUpdate }: { filter: ActiveFilter, onFilterUpdate: (val: string) => void }) {
  const defDate =  new Date(filter.value && filter.value)
  const [date, setDate] = useState<Date>(!isNaN(defDate.getTime()) ? defDate : new Date())

  const selectDate = (date?: Date) => {
    if (!date) return
    onFilterUpdate(date.toISOString())
    setDate(date)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={selectDate}
          defaultMonth={date}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}


function DateRangeFilter() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2022, 0, 20),
    to: addDays(new Date(2022, 0, 20), 20),
  })
 
  return (
    <div className={cn("grid gap-2")}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
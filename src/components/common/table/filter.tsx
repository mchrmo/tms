'use client'
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ModelColumns, SingleColumnDef } from "@/lib/utils/api.utils";
import { formatDate } from "@/lib/utils/dates";
import { SelectOptionDef } from "@/types/global";
import { ColumnFiltersState, Header, Table } from "@tanstack/react-table";
import { CommandEmpty } from "cmdk";
import { addDays, format } from "date-fns";
import { CalendarIcon, Check, ChevronDownIcon, HashIcon, PlusIcon, SearchIcon, TextIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { useDebouncedCallback } from "use-debounce";
import { usePathname, useRouter, useSearchParams } from "next/navigation";



export default function Filter({ header }: { header: Header<any, unknown> }) {
  const columnFilterValue = header.column.getFilterValue()
  const column = header.column


  const debounced = useDebouncedCallback((value) => {
    column.setFilterValue(value)
  }, 1000);

  let filterVariant: string | undefined;
  let selectOptions: SelectOptionDef[] = [];
  if (header.column.columnDef.meta) {
    const meta = header.column.columnDef.meta
    filterVariant = meta.filterVariant

    if (filterVariant == 'select') {
      selectOptions = meta.selectOptions ? meta.selectOptions : []
    }
  }

  const handleFilterChange = (value: string) => {

    if (filterVariant == 'select') {
      column.setFilterValue(value)
    } else {
      debounced(value)
    }

  }


  if (!column.getCanFilter()) return null

  return filterVariant === 'range' ?
    (
      <DateRangeFilter></DateRangeFilter>
    )
    :
    filterVariant === 'select' ?
      (
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
      )
      :
      (
        <div className="">
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
  defaultFilters?: ColumnFiltersState,
  advanced?: boolean,
  filterReady?: boolean,
  setFilterReady?: (value: boolean) => void,
  urlFilters?: boolean
}
export function TableFilter<TData>(props: TableFilterProps<TData>) {
  const primaryCol = props.table.getColumn(props.primaryFilterColumn)

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();


  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])
  const debouncedPrimary = useDebouncedCallback((value) => {
    if (primaryCol) primaryCol.setFilterValue(value)
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

  useEffect(() => {

    if(props.urlFilters) {
      searchParams.forEach((v, key) => {
        if (filterableColumns[key]) {
          addFilter(key, v)
        }
      })
    }

    if(props.defaultFilters) props.defaultFilters.forEach((f) => addFilter(f.id, f.value as string))
    
    if(props.setFilterReady) {
      setTimeout(() => props.setFilterReady!(true), 10)
    }
  }, [])

  useEffect(() => {
    if(!props.filterReady || !props.urlFilters) return

    const _filter: { [key: string]: string } = {}
    searchParams.forEach((v, key) => {
      _filter[key] = v
    })

    const toDelete = activeFilters.filter((f, i) => !_filter[f.id])

    Object.entries(_filter).forEach(([key, v]) => {
      const inFilters = activeFilters.find(f => f.id == key)
      if (filterableColumns[key] && !inFilters) {
        addFilter(key, v)
      }
    })

    toDelete.forEach((f) => removeFilter(f.id))

  }, [searchParams])

  useEffect(() => { 
    if(!props.urlFilters) return

    const params = new URLSearchParams()
    for (const f of activeFilters) {
      const tableCol = props.table.getColumn(f.id)
      if (!tableCol) continue
      tableCol.setFilterValue(f.value)

      if (f.value) params.set(f.id, f.value)
    }


    router.push(pathname + '?' + params.toString())
  }, [activeFilters])


  const handleFilterChange = (value: string) => {
    debouncedPrimary(value)
  }

  const addFilter = (key: string, value?: string) => {


    setActiveFilters((_activeFilters) => {
      const val = value || ''
      const index = _activeFilters.findIndex(f => key === f.id)
      if (index >= 0) return [..._activeFilters]

      const tableCol = props.table.getColumn(key)
      if (!tableCol) return [..._activeFilters]
      const colDef = props.columns[key]
      if (!colDef) return [..._activeFilters]

      return [..._activeFilters, { colDef, id: key, value: val }]
    })
  }

  const removeFilter = (id: string) => {
    setActiveFilters(filter => filter.filter(f => f.id !== id))

    const tableCol = props.table.getColumn(id)
    if (!tableCol) return
    tableCol.setFilterValue(null)

  }

  const updateFilter = (id: string, value: string | string[]) => {
    const aFilters = [...activeFilters]
    const filter = aFilters.find(f => f.id === id)
    if (!filter) return

    if (Array.isArray(value)) {
      filter!.value = value.join(',')
    } else filter!.value = value
    setActiveFilters(aFilters)
  }



  if (props.primaryFilterColumn) {
    if (!primaryCol) return <span>Wrong primary filter column name {props.primaryFilterColumn}</span>
  }

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
            <FilterItem key={f.id} filter={f} onFilterRemove={removeFilter} onFilterUpdate={(val) => updateFilter(f.id, val)} defaultOpen={props.filterReady !== undefined ? props.filterReady : true}></FilterItem>
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

function FilterItem({ filter, defaultOpen, onFilterRemove, onFilterUpdate }: { filter: ActiveFilter, defaultOpen: boolean, onFilterRemove: (id: string) => void, onFilterUpdate: (value: string | string[]) => void }) {
  const [open, setOpen] = useState(defaultOpen)

  const debouncedInput = useDebouncedCallback((value: string) => {
    onFilterUpdate(value)
  }, 500);
  
  return (
    <div className={cn(
      "px-5 border-1 border-gray-300 gap-0 truncate rounded-md flex items-center space-x-3",
      { "bg-secondary text-white": open }
    )}>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="py-1">
          <div className="flex flex-col justify-start text-left">
            <span className={cn("font-medium text-sm", { 'line-through': !filter.value && !open })}>{filter.colDef.label}</span>
            <span className="text-xs font-light">
              {
                filter.value &&
                filter.colDef.type == 'enum' && filter.value.split(',').map(v => filter.colDef.enum![v]).join(', ')
                ||
                filter.colDef.type == 'string' && filter.value
                ||
                filter.colDef.type == 'datetime' && filter.value && formatDate(new Date(filter.value))
              }</span>
          </div>
        </PopoverTrigger>
        <PopoverContent className="space-y-3 p-2 min-w-[12rem] w-auto" >
          {/* <h5 className="text-sm">{filter.colDef.label}</h5> */}
          {/* <Separator /> */}
          {
            filter.colDef.type === 'string' && (
              <Input className="h-7" placeholder={filter.colDef.label} defaultValue={filter.value} onChange={(e) => debouncedInput(e.target.value)} />
            )
          }
          {
            filter.colDef.type === 'enum' &&
            <FilterItemSelect filter={filter} onFilterUpdate={onFilterUpdate}></FilterItemSelect>
            // (
            //   <Select onValueChange={(value) => { onFilterUpdate(value); setOpen(false) }} defaultValue={filter.value}>
            //     <SelectTrigger className="h-8">
            //       <SelectValue placeholder='Výber' />
            //     </SelectTrigger>
            //     <SelectContent>
            //       {
            //         Object.entries(filter.colDef.enum!).map(([key, label]) => (
            //           <SelectItem key={key} value={key}>{label}</SelectItem>
            //         ))
            //       }
            //     </SelectContent>
            //   </Select>
            // )
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
  const defDate = new Date(filter.value && filter.value)
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

function FilterItemSelect({ filter, onFilterUpdate }: { filter: ActiveFilter, onFilterUpdate: (val: string[]) => void }) {

  const defSelect = (filter.value && filter.value.split(',')) || []

  const [selectedValues, setSetSelected] = useState<string[]>(defSelect)


  // const selectedValues = new Set(
  //   Array.isArray(unknownValue) ? unknownValue : ['TODO']
  // )

  return (
    <Command>
      <CommandList className="max-h-full">
        <CommandEmpty>Žiadne možnosti.</CommandEmpty>
        <CommandGroup className="max-h-[18.75rem] overflow-y-auto overflow-x-hidden">
          {
            Object.entries(filter.colDef.enum!).map(([key, label]) => {
              const isSelected = selectedValues.find(s => s == key)
              return (
                <CommandItem
                  key={key}
                  onSelect={() => {

                    let oldValues = [...selectedValues]
                    if (isSelected) {
                      oldValues = oldValues.filter(v => v !== key)
                    } else {
                      oldValues.push(key)
                    }

                    setSetSelected(oldValues)
                    onFilterUpdate(oldValues)

                    // column?.setFilterValue(
                    //   filterValues.length ? filterValues : undefined
                    // )
                  }}
                >
                  <div
                    className={cn(
                      "mr-2 flex size-4 items-center justify-center rounded-sm border border-primary",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <Check className="size-4" aria-hidden="true" />
                  </div>
                  <span>{label}</span>
                </CommandItem>
              )
            })
          }
        </CommandGroup>
        {/* {selectedValues && (
          <>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                // onSelect={() => column?.setFilterValue(undefined)}
                className="justify-center text-center"
              >
                Vymazať všetko
              </CommandItem>
            </CommandGroup>
          </>
        )} */}
      </CommandList>
    </Command>
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
'use client'
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { SelectOptionDef } from "@/types/global";
import { Column, flexRender, Header } from "@tanstack/react-table"
import { addDays, format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { useDebouncedCallback } from "use-debounce";



export default function Filter({ header }: { header: Header<any, unknown>}) {
  const columnFilterValue = header.column.getFilterValue()
  const column = header.column

  const [value, setValue] = useState(columnFilterValue);
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
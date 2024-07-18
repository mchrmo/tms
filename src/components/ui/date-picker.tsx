"use client"
 
import { format } from "date-fns"
import { sk } from "date-fns/locale";

import { Calendar as CalendarIcon } from "lucide-react"
 
import { cn, DATE_FORMAT } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "./input"
import { useEffect, useState } from "react"
 


export function DatePicker({date, setDate}: {date: Date, setDate: (date?: Date) => void}) {


  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <div>
            {date ? format(date, DATE_FORMAT) : <span>Vyberte dátum</span>}
          </div>
          
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          locale={sk}
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

"use client"

import { useTasks } from "@/lib/hooks/task.hooks";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import TasksTable from "./table";
import { Input } from "../ui/input";
import { ColumnFiltersState } from "@tanstack/react-table";



export default function FilteredTaskTable() {


  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [debouncedColumnFilters] = useDebounce(
    columnFilters,
    1000
  );

  const query = useTasks(debouncedColumnFilters)

  useEffect(() => {
    console.log('debouncedColumnFilters', debouncedColumnFilters);
    query.refetch()

  }, [debouncedColumnFilters])


  return (
    <div>
      <div className="flex items-center py-4">
        </div>


        <TasksTable 
          query={query}
          setColumnFilters={setColumnFilters}
          columnFilters={columnFilters}
        />

    </div>

  )


}
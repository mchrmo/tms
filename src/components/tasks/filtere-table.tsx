"use client"

import { useTasks } from "@/lib/hooks/task.hooks";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import TasksTable from "./table";
import { ColumnFiltersState, PaginationState, SortingState } from "@tanstack/react-table";



export default function FilteredTaskTable() {

  
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({pageIndex: 0, pageSize: 15});


  const query = useTasks(columnFilters, sorting[0])


  useEffect(() => {
    // console.log(sorting);
    query.refetch()
  }, [sorting])

  return (
    <div>
      <div className="flex items-center py-4">
        </div>
        <TasksTable 
          data={query.data ? query.data : []} 
          isLoading={query.isLoading} isError={query.isError}
          setColumnFilters={setColumnFilters} columnFilters={columnFilters}
          setSorting={setSorting} sorting={sorting}
          // setPagination={setPagination} pagination={pagination}
        />
    </div>

  )


}
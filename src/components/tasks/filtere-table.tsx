"use client"

import { useTasks } from "@/lib/hooks/task.hooks";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import TasksTable from "./table";
import { Input } from "../ui/input";



export default function FilteredTaskTable() {

  const [filter, setFilter] = useState<string | undefined>()
  const [debouncedSearchQuery] = useDebounce(filter, 500);

  const query = useTasks(debouncedSearchQuery)


  useEffect(() => {
    query.refetch()
  }, [debouncedSearchQuery])


  return (
    <div>
      <div className="flex items-center py-4">
          <Input
            placeholder="Filter..."
            onChange={(event) =>
              setFilter(event.target.value)
            }
            className="max-w-sm"
          />
        </div>


        <TasksTable query={query} />

    </div>

  )


}
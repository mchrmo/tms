import { Task } from "@prisma/client";
import TaskUpdatesTable from "./taskUpdates-table";


export default function TaskUpdatesOverview({task}: {task: Task}) {


  return (
    <>
      <div className=" ">
        <h3 className="text-lg">História zmien</h3>
      </div>
      <div className="mt-5">
        <TaskUpdatesTable defaultFilters={[{id: 'task_id', value: task.id}]}></TaskUpdatesTable>
      </div>
    </>

  )


}
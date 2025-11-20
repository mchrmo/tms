import {CreateTaskReminder} from "./taskReminder-modal";
import { Task } from "@prisma/client";
import TaskRemindersTable from "./taskReminders-table";


export default function TaskRemindersOverview({task}: {task: Task}) {


  return (
    <>
      <div className="flex justify-between ">
        <h3 className="text-lg">Pripomienky</h3>
        <CreateTaskReminder task_id={task.id}></CreateTaskReminder>
      </div>
      <div className="mt-5">
        <TaskRemindersTable defaultFilters={[{id: 'task_id', value: task.id}]}></TaskRemindersTable>
      </div>
    </>

  )


}
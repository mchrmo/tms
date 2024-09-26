import { Task } from "@prisma/client";
import TaskCommentsTable from "./taskComments-table";
import TaskCommentForm from "./taskComments-addForm";


export default function TaskCommentsOverview({task}: {task: Task}) {


  return (
    <>
      <div className=" ">
        <h3 className="text-lg">Komentáre</h3>
      </div>
      <div className="mt-5">
        <TaskCommentsTable defaultFilters={[{id: 'task_id', value: task.id}]}></TaskCommentsTable>
      </div>
      <div className="mt-5">
        <TaskCommentForm defaultValues={{task_id: task.id}}></TaskCommentForm>
      </div>
    </>

  )


}
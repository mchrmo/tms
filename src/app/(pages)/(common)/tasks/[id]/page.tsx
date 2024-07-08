import ViewHeadline from "@/components/common/view-haedline"
import Organization from "@/components/organizations/organization"
import TasksTable from "@/components/tasks/table"
import TaskForm from "@/components/tasks/task-form"
import { getMainOrganization } from "@/lib/db/organizations"
import { getTask, getTaskList } from "@/lib/db/task.repository"
import { isRole } from "@/lib/utils"
import { auth } from "@clerk/nextjs/server"


export default async function Task({ params }: {params: {id: string}}) {

  const id = parseInt(params.id);
  const task = await getTask(id)

  if(!task) return <span>Úloha s ID {id} sa nenašla</span> 
  


  return (
    <>
      <ViewHeadline>Úloha &quot;{task.name}&quot;</ViewHeadline>



      <TaskForm defaultValues={task}></TaskForm>
    </>
  )
}


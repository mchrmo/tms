'use client'
import { getApiClient } from "@/lib/api-client";
import { taskQueryKeys, useSubTasks, useTask } from "@/lib/hooks/task.hooks";
import { Task } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import ViewHeadline from "../common/view-haedline";
import TaskForm from "./task-form";
import LoadingSpinner from "../ui/loading-spinner";
import { useParams } from "next/navigation";
import TasksTable from "./table";
import { Button } from "../ui/button";
import Link from "next/link";
import { Label } from "../ui/label";


export default function TaskDetail({ params }: {params: {id: string}}) {

  const taskId = parseInt(params.id)
  const task = useTask(taskId)
  const subTasks = useSubTasks(taskId)

  const parent = useTask((task.data && task.data.parent_id) ? task.data.parent_id : undefined)  


  if(task.isLoading) return <span>Úloha sa načitáva <LoadingSpinner></LoadingSpinner></span> 

  return (
    <>

      {task.error instanceof Error && <div>{task.error.message}</div>}

      {
        task.data && (
          <>
          {
            parent.data && <Label className="text-md">
              Úloha podradená pod úlohu: <Link className="link" href={`/tasks/${parent.data.id}`}>{parent.data.name}</Link>
            </Label>
          }

          <TaskForm defaultValues={task.data} edit={true}></TaskForm>

          <div className="mt-3 space-y-4">
            <div className="flex justify-between items-end ">
              <h2>Podriadené úlohy</h2>
              <Link href={`/tasks/create?parent_id=${task.data.id}`}><Button variant={'secondary'}>Vytvoriť pod úlohu</Button></Link>
            </div>
            <TasksTable data={subTasks.data ? subTasks.data : []} isLoading={subTasks.isLoading} isError={subTasks.isError}></TasksTable>
          </div>
          </>
        )
      }



    </>
  )
}


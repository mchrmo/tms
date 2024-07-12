'use client'
import { getApiClient } from "@/lib/api-client";
import { taskQueryKeys, useTask } from "@/lib/hooks/task.hooks";
import { Task } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import ViewHeadline from "../common/view-haedline";
import TaskForm from "./task-form";


export default function TaskDetail({ params }: {params: {id: string}}) {

  const getTask = useTask()

  

  if(getTask.isLoading) return <span>Úloha sa načitáva</span> 

  return (
    <>

      {getTask.error instanceof Error && <div>{getTask.error.message}</div>}

      {
        getTask.data &&
          <TaskForm defaultValues={getTask.data}></TaskForm>
      }



    </>
  )
}


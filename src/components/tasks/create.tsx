'use client'
import { useSearchParams } from "next/navigation";
import TaskForm from "./task-form";
import { useTask } from "@/lib/hooks/task/task.hooks";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { TaskDetail } from "@/lib/services/tasks/task.service";
import { useUser } from "@clerk/nextjs";


export default function CreateTask() {

  const searchParams = useSearchParams();
  const {toast} = useToast()
  const router = useRouter()
  const parentId = searchParams.get('parent_id')


  const parentQ = useTask(parentId ? parseInt(parentId) : undefined)  
  const parent: TaskDetail | undefined = parentQ.data ? parentQ.data.data : undefined
  const { user } = useUser()
  

  
  useEffect(() => {
    
    if(parent === null && parentId) {

      toast({
        title: "Chyba",
        description: "Nadradená úloha sa nenašla!"
      })
      router.push('/tasks')
    }
  }, [parent])

  return <>
    {
      parent && <Label className="text-md">
        Úloha podradená pod úlohu <Link className="link" href={`/tasks/${parent.id}`}>{parent.name}</Link>
      </Label>
    }

    <div className="max-w-screen-xl mx-auto">
      <TaskForm defaultValues={{ creator: {user: {name: (user && user.fullName) || ''}}, deadline: parent ? parent.deadline : new Date() }}></TaskForm>
    </div>

  </>


}
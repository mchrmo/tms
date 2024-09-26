'use client'
import { useSearchParams } from "next/navigation";
import TaskForm from "./task-form";
import { useTask } from "@/lib/hooks/task/task.hooks";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import Link from "next/link";


export default function CreateTask() {

  const searchParams = useSearchParams();
  const {toast} = useToast()
  const router = useRouter()
  const parentId = searchParams.get('parent_id')


  const parent = useTask(parentId ? parseInt(parentId) : undefined)  

  useEffect(() => {
    
    if(parent.data === null && parentId) {

      toast({
        title: "Chyba",
        description: "Nadradená úloha sa nenašla!"
      })
      router.push('/tasks')
    }
  }, [parent.data])

  return <>
    {
      parent.data && <Label className="text-md">
        Úloha podradená pod úlohu: <Link className="link" href={`/tasks/${parent.data.id}`}>{parent.data.name}</Link>
      </Label>
    }
    <TaskForm></TaskForm>

  </>


}
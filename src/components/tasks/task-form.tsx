"use client"

import { SubmitHandler, useForm } from "react-hook-form"
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { DatePicker } from "../ui/date-picker";
import { Textarea } from "../ui/textarea";
import OrganizationMemberCombobox from "../members/member-combobox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { TaskPriority, TaskStatus } from "@prisma/client";
import { FormField, FormItem } from "../ui/form";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { revalidatePath } from "next/cache";
import { useToast } from "../ui/use-toast";
import { useCreateTask, useTask, useUpdateTask } from "@/lib/hooks/task.hooks";
import LoadingSpinner from "../ui/loading-spinner";
import { useEffect, useState } from "react";

export type TaskFormInputs = {
  id?: number ;
  name: string;
  description: string;
  deadline: Date;
  assignee_id: Number | null,
  priority: TaskPriority,
  status: TaskStatus,
  parent_id: Number | null
}

export default function TaskForm({onUpdate, defaultValues: _def}: {onUpdate?: () => void,defaultValues?: any}) {
  const [parentId, setParentId] = useState<number>()

  const searchParams = useSearchParams();
  const router = useRouter();

  const parent = useTask(parentId)

  const edit = _def ? true : false

  const defaultValues: TaskFormInputs = {...{
    id: undefined,
    name: '',
    description: '',
    deadline: new Date(),
    assignee_id: null,
    priority: 'LOW',
    status: "TODO",
    parent_id: null
  }, ...(_def ? _def : {})}

  

  useEffect(() => {
    const parentId = searchParams.get('parent_id')
    if(parent) setParentId(parseInt(parentId as string))

  }, [])

  // if(!edit) {
  //   if(parent_id && typeof parseInt(parent_id) == 'number') {
  //     defaultValues.parent_id = parseInt(parent_id)
  //   }
  // }

  


  const {register, handleSubmit, watch, reset, setValue, control} = useForm<TaskFormInputs>({defaultValues})
  
  
  const updateTask = useUpdateTask(_def ? _def.id : 0);
  const createTask = useCreateTask();

  const onSubmit: SubmitHandler<TaskFormInputs> = async (data) => {
    
    if(edit) {
      updateTask.mutate(data)
    } else {
      createTask.mutate(data)
    }
}

  const onCancel = () => {
    router.push('/tasks') 

  }
  
  const onDateSelect = (fieldName: keyof TaskFormInputs, date?: Date) => {
    setValue(fieldName, date ? date : '')
  }

  if (createTask.isSuccess || updateTask.isSuccess) { 
    router.push('/tasks')
    updateTask.reset()
    createTask.reset()
  }


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="my-8 flex flex-col lg:grid grid-cols-12  gap-4 ">

      <div className="col-span-8 ">
        <Label htmlFor="task-name" >
          Názov úlohy
        </Label>
        <Input
          id="task-name"
          placeholder="Názov úlohy"
          {...register('name')}
        />
      </div>

      <div className="col-span-4">
        <Label >
          Termín dokončenia
        </Label>
        <DatePicker date={watch('deadline')} setDate={(date) => onDateSelect('deadline', date)}></DatePicker>
      </div>

      <div className="col-span-4">
        <Label>Priorita:</Label>
        <FormField control={control} name="priority" render={({field}) => (
          <FormItem>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger className="">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Nízka</SelectItem>
                <SelectItem value="MEDIUM">Stredná</SelectItem>
                <SelectItem value="HIGH">Vysoká</SelectItem>
                <SelectItem value="CRITICAL">Kritická</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>)}>
        </FormField> 
      </div>

      <div className="col-span-4">
        <Label>Vytvoriť úlohu pre:</Label>
        <OrganizationMemberCombobox defaultValue={_def ? _def.assignee : null} onSelectResult={(member) => setValue('assignee_id' ,member.id)} label="Vybrať osobu"></OrganizationMemberCombobox>
      </div>

      <div className="col-span-4">
        <Label>Status:</Label>
        <FormField control={control} name="status" render={({field}) => (
          <FormItem>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger className="">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODO">Zadaná</SelectItem>
                <SelectItem value="WAITING">Čaká</SelectItem>
                <SelectItem value="INPROGRESS">V procese</SelectItem>
                <SelectItem value="CHECKREQ">Kontrola</SelectItem>
                <SelectItem value="DONE">Hotová</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>)}>
        </FormField> 
      </div>


      <div className="col-span-full ">
        <Label htmlFor="task-description" >
          Popis
        </Label>
        <Textarea 
          id="task-description"
          placeholder="Popis zadania úlohy..."
          {...register('description')}
        />
      </div>

      

      <div className="space-x-3 col-span-full flex">
        <Button variant="secondary" type="button" onClick={() => {onCancel();}}>Zrušiť</Button>
        <Button type="submit" >Uložiť</Button>
      </div>
    </form>
  )

}
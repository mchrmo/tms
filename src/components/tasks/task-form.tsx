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
import { useCreateTask, useTask, useUpdateTask } from "@/lib/hooks/task.hooks";
import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export type TaskFormInputs = {
  id?: number ;
  name: string;
  description: string;
  deadline: Date;
  assignee_id: number | null,
  priority: TaskPriority,
  status: TaskStatus,
  parent_id: number | null,
  source: string
}

const taskSchema = z.object({
  name: z.string().min(1, "Name is required"),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  description: z.string().min(1, "Description is required"),
  parent_id: z.number().optional(),
  organization_id: z.number().optional(),
  creator_id: z.number(),
  assignee_id: z.number().optional(),
  source: z.string().default("Organizačná úloha"),
  createdAt: z.date().optional(),
  updateAt: z.date().optional(),
  deadline: z.date(),
  completition_date: z.date().optional(),
});

export default function TaskForm({onUpdate, defaultValues: _def, edit}: {edit?: boolean, onUpdate?: () => void, defaultValues?: any}) {
  const [parentId, setParentId] = useState<number>()

  const searchParams = useSearchParams();
  const router = useRouter();
  
  const defaultValues: TaskFormInputs = {...{
    id: undefined,
    name: '',
    description: '',
    deadline: new Date(),
    assignee_id: null,
    priority: 'LOW',
    status: "TODO",
    parent_id: null,
    source: ''
  }, ...(_def ? _def : {})}


  const {register, handleSubmit, watch, reset, setValue, control} = useForm<TaskFormInputs>({resolver: zodResolver(taskSchema), defaultValues})
  
  const updateTask = useUpdateTask(_def ? _def.id : 0);
  const createTask = useCreateTask();

  useEffect(() => {
    const parentId = searchParams.get('parent_id')
    if(parentId) setValue("parent_id" ,parseInt(parentId))
  }, [])

  useEffect(() => {
    if (createTask.isSuccess || updateTask.isSuccess) { 
      router.push('/tasks')
      updateTask.reset()
      createTask.reset()
    }
  }, [createTask.isSuccess, updateTask.isSuccess])
  

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
        <Label>Úloha pre:</Label>
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
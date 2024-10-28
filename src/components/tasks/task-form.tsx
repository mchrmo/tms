"use client"

import { SubmitHandler, useForm } from "react-hook-form"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import OrganizationMemberCombobox from "../organizations/members/member-combobox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskPriority, TaskStatus } from "@prisma/client";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCreateTask, useTask, useUpdateTask } from "@/lib/hooks/task/task.hooks";
import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import SubmitButton from "@/components/common/buttons/submit";
import { CreateTaskSchema, TaskUpdateSchema } from "@/lib/models/task.model";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export type TaskFormInputs = {
  id?: number;
  name: string;
  description: string;
  deadline: Date;
  assignee_id: number | null,
  priority: TaskPriority,
  status: TaskStatus,
  parent_id: number | null,
  source: string
}

export default function TaskForm({ onUpdate, defaultValues: _def, edit }: { edit?: boolean, onUpdate?: () => void, defaultValues?: any }) {
  const [parentId, setParentId] = useState<number>()

  const searchParams = useSearchParams();
  const router = useRouter();

  // Parse def values
  if (_def) {
    if (_def.deadline) {
      if (typeof _def.deadline == 'string') _def.deadline = new Date(_def.deadline)
    }
  }

  const defaultValues: TaskFormInputs = {
    ...{
      id: undefined,
      name: '',
      description: '',
      deadline: new Date(),
      assignee_id: null,
      priority: 'LOW',
      status: "TODO",
      parent_id: null,
      source: 'Organizačná úloha'
    }, ...(_def ? _def : {})
  }


  const form = useForm<TaskFormInputs>({
    resolver: zodResolver(defaultValues.id ? TaskUpdateSchema : CreateTaskSchema), defaultValues,
    reValidateMode: "onChange"
  })
  const { handleSubmit, reset, setValue, formState: { errors, isDirty, isValid } } = form

  const updateTask = useUpdateTask(_def ? _def.id : 0);
  const createTask = useCreateTask();

  useEffect(() => {
    const parentId = searchParams.get('parent_id')
    if (parentId) setValue("parent_id", parseInt(parentId))

    const name = searchParams.get('name')
    if (name) setValue("name", name)

    const source = searchParams.get('source')
    if (source) setValue("source", source)

  }, [])

  useEffect(() => {
    if (createTask.isSuccess) {
      const newId = createTask.data.id
      if (newId) router.push('/tasks/' + newId)

      createTask.reset()
    }

    if (updateTask.isSuccess) {
      reset(updateTask.data)

    }
  }, [createTask.isSuccess, updateTask.isSuccess])


  const onSubmit: SubmitHandler<TaskFormInputs> = async (data) => {

    if (edit) {
      updateTask.mutate(data)
    } else {
      createTask.mutate(data)
    }
  }

  const onCancel = () => {
    reset()
    // router.push('/tasks') 

  }


  return (
    <Form {...form}>
      <form id="form" onSubmit={handleSubmit(onSubmit)} className="my-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Názov úlohy</FormLabel>
              <FormControl>
                <Input placeholder="Názov úlohy" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="deadline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Termín dokončenia</FormLabel>
              <FormControl>
                <DatePicker date={field.value} setDate={(date) => field.onChange(date)}></DatePicker>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="assignee_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Zodpovedná osoba</FormLabel>
              <OrganizationMemberCombobox
                defaultValue={_def ? _def.assignee : null} onSelectResult={(member) => field.onChange(member.id)}
                label="Vybrať osobu"></OrganizationMemberCombobox>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priorita</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="">
                  <SelectValue placeholder="Priorita" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Nízka</SelectItem>
                  <SelectItem value="MEDIUM">Stredná</SelectItem>
                  <SelectItem value="HIGH">Vysoká</SelectItem>
                  <SelectItem value="CRITICAL">Kritická</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">Zadaná</SelectItem>
                  <SelectItem value="WAITING">Čaká</SelectItem>
                  <SelectItem value="INPROGRESS">V procese</SelectItem>
                  <SelectItem value="CHECKREQ">Kontrola</SelectItem>
                  <SelectItem value="DONE">Hotová</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />



        <Accordion type="single" className="col-span-full" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Podrobnosti</AccordionTrigger>
            <AccordionContent className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>Popis</FormLabel>
                    <Textarea
                      id="task-description"
                      placeholder="Popis zadania úlohy..."
                      {...field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>Zdroj úlohy</FormLabel>
                    <FormControl>
                      <Input placeholder="Zdroj úlohy" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>




        {isDirty && <div className="space-x-3 col-span-full flex mt-5">
          <Button variant="secondary" type="button" onClick={() => { onCancel(); }}>Zrušiť</Button>
          <SubmitButton isLoading={updateTask.isPending || createTask.isPending} type="submit" >Uložiť</SubmitButton>
        </div>}

      </form>
    </Form>
  )

}
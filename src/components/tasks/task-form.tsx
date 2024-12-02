"use client"

import { SubmitHandler, useForm } from "react-hook-form"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import OrganizationMemberCombobox from "../organizations/members/member-combobox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskPriority, TaskStatus, TaskUserRole } from "@prisma/client";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useRouter, useSearchParams } from "next/navigation";
import { useCreateTask, useTask, useUpdateTask } from "@/lib/hooks/task/task.hooks";
import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import SubmitButton from "@/components/common/buttons/submit";
import { CreateTaskSchema, TASK_STATUSES_MAP, TaskUpdateSchema } from "@/lib/models/task.model";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { GenericMeta, getMetaValue } from "@/lib/utils/api.utils";
import { isTaskRole } from "@/lib/utils/auth";
import { parseBoolean } from "@/lib/utils";
import { format } from "date-fns";

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

interface TaskFormProps {
  defaultValues?: any,
  role?: TaskUserRole
}

export default function TaskForm({ defaultValues: _def, role }: TaskFormProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  let edit = false

  let meta: GenericMeta[] = (_def && _def.meta) || [];

  // Parse def values
  if (_def) {
    if (_def.deadline) {
      if (typeof _def.deadline == 'string') _def.deadline = new Date(_def.deadline)
    }
    if (_def.id) edit = true
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

  let fieldsAccess: { [key: string]: boolean } = {
    name: true,
    status: true,
    priority: true,
    assignee_id: true,
    deadline: true,
    description: true,
    source: true
  }


  const form = useForm<TaskFormInputs>({
    resolver: zodResolver(defaultValues.id ? TaskUpdateSchema : CreateTaskSchema), defaultValues,
    reValidateMode: "onChange"
  })
  const { handleSubmit, reset, setValue, watch, formState: { errors, isDirty, isValid } } = form

  const updateTask = useUpdateTask(_def ? _def.id : 0);
  const createTask = useCreateTask();


  const statusItems = Object.entries(TASK_STATUSES_MAP).map(([key, label]) => ({ key, label, disabled: false }))
  if (role) {
    if (isTaskRole(['PERSONAL', 'OWNER', 'ADMIN'], role)) {
      fieldsAccess = {
        ...fieldsAccess,
        assignee_id: true,
        deadline: true,
        priority: true
      }
    }
    else if (isTaskRole(['VIEWER'], role)) {
      fieldsAccess = {
        name: false,
        status: false,
        priority: false,
        assignee_id: false,
        deadline: false,
        description: false,
        source: false
      }
    }
    else {
      fieldsAccess = {
        ...fieldsAccess,
        assignee_id: false,
        deadline: false,
        priority: false
      }
      if (watch('status') === "DONE") fieldsAccess.status = false
      if (parseBoolean(getMetaValue(meta, 'checkRequired'))) {
        const i = statusItems.findIndex(s => s.key === "DONE")
        statusItems[i].disabled = true
      }

    }
  }


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
                <Input placeholder="Názov úlohy" {...field} disabled={!fieldsAccess['name']} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="deadline"
          render={({ field }) => {
            const { value, onChange, ...rest } = field;
            const formattedDate = format(value!, 'yyyy-MM-dd')

            return (
              <FormItem className="">
                <FormLabel>Termín dokončenia</FormLabel>
                <FormControl>
                  <Input type="date" placeholder=""
                    value={formattedDate}
                    onChange={(e) => {
                      const newDate = e.target.value ? new Date(e.target.value) : undefined;
                      onChange(newDate);
                    }}
                    disabled={!fieldsAccess['deadline']}
                    {...rest}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          }}
        />


        <FormField
          control={form.control}
          name="assignee_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Zodpovedná osoba</FormLabel>
              <OrganizationMemberCombobox
                defaultValue={_def ? _def.assignee : null} onSelectResult={(member) => field.onChange(member.id)}
                disabled={!fieldsAccess['assignee_id']}
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
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!fieldsAccess['priority']}>
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
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!fieldsAccess['status']}>
                <SelectTrigger className="">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {
                    statusItems.map((item) => <SelectItem disabled={item.disabled} key={item.key} value={item.key}>{item.label}</SelectItem>)
                  }
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
                      disabled={fieldsAccess['description']}
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
                      <Input placeholder="Zdroj úlohy" disabled={fieldsAccess['source']} {...field} />
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
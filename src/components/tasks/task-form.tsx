"use client"

import { SubmitHandler, useForm } from "react-hook-form"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import OrganizationMemberCombobox from "../organizations/members/member-combobox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskPriority, TaskStatus, TaskUserRole } from "@prisma/client";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useRouter, useSearchParams } from "next/navigation";
import { useCreateTask, useTask, useUpdateTask } from "@/lib/hooks/task/task.hooks";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import SubmitButton from "@/components/common/buttons/submit";
import { CreateTaskSchema, TASK_STATUSES_MAP, TaskUpdateSchema } from "@/lib/models/task.model";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { GenericMeta, getMetaValue } from "@/lib/utils/api.utils";
import { isTaskRole } from "@/lib/utils/auth";
import { parseBoolean } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";
import { CalendarIcon, CircleUser, FlagIcon, ListMinusIcon, MoveUpLeftIcon, TargetIcon } from "lucide-react";

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
        priority: true,
        description: true,
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
        priority: false,
        description: true
      }
      if (parseBoolean(getMetaValue(meta, 'checkRequired'))) {
        const i = statusItems.findIndex(s => s.key === "DONE")
        statusItems[i].disabled = true
        if (watch('status') === "DONE") fieldsAccess.status = false
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

    console.log("Form values:", errors);
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
      <form id="form" onSubmit={handleSubmit(onSubmit)} className="">

        <div className="flex flex-col gap-3 md:gap-5">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            {
              _def && _def.parent ? (
                <div className="font-semibold text-[#B0B0B0] text-sm flex gap-1">
                  <MoveUpLeftIcon size={'14px'}></MoveUpLeftIcon><Link href={`/tasks/${_def.parent.id}`} aria-label={_def.parent.name}>Nadradená úloha</Link>
                </div>
              ) : <div></div>
            }
            <SubmitButton isLoading={updateTask.isPending || createTask.isPending} type="submit" >Uložiť</SubmitButton>
          </div>


          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field, fieldState: { error } }) => (
              <FormItem className="w-full">
                {/* <FormLabel>Názov úlohy</FormLabel> */}
                <FormControl>
                  <AutoExpandTextarea placeholder="Zadajte názov úlohy" isError={!!error} {...field} disabled={!fieldsAccess['name']} />
                </FormControl>
                {
                  error && <span className="text-sm font-semibold text-red-400">
                    {field.value.length}/80
                  </span>
                }
              </FormItem>
            )}
          />


          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-x-5">

            {/* Creator */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 sm:justify-between">
              <div className="flex items-center text-[#B0B0B0] gap-1">
                <CircleUser size={14} />
                <span className="whitespace-nowrap text-sm font-semibold">Vlastník úlohy</span>
              </div>
              <div className="text-sm">
                {_def && _def.creator &&
                  <span>{_def.creator.user.name}</span>
                }
              </div>
            </div>

            {/* Priority */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 sm:justify-between">
                  <div className="flex items-center text-[#B0B0B0] gap-1">
                    <FlagIcon size={12} />
                    <span className="whitespace-nowrap text-sm font-semibold">Priorita</span>
                  </div>
                  <div className="w-full sm:w-56">
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!fieldsAccess['priority']}>
                      <SelectTrigger className="">
                        <SelectValue placeholder="Priorita" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW" >
                          <div className="flex gap-2">
                            <FlagIcon className="text-green-600" size={20} /><span>Nízka</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="MEDIUM">
                          <div className="flex gap-2">
                            <FlagIcon className="text-yellow-600" size={20} /><span>Stredná</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="HIGH">
                          <div className="flex gap-2">
                            <FlagIcon className="text-red-600" size={20} /><span>Vysoká</span>
                          </div>
                        </SelectItem>
                        {/* <SelectItem value="CRITICAL">
                        <div className="flex gap-2">
                          <FlagIcon className="text-red-800" size={20} /><span>Kritická</span>
                        </div>
                      </SelectItem> */}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* Assignee */}
            <FormField
              control={form.control}
              name="assignee_id"
              render={({ field }) => (
                <FormItem className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 sm:justify-between">
                  <div className="flex items-center text-[#B0B0B0] gap-1">
                    <CircleUser size={14} />
                    <span className="whitespace-nowrap text-sm font-semibold">Zodpovedná osoba</span>
                  </div>
                  <div className="w-full sm:w-auto flex flex-col">
                    <OrganizationMemberCombobox
                      defaultValue={_def ? _def.assignee : null} onSelectResult={(member) => field.onChange(member.id)}
                      disabled={!fieldsAccess['assignee_id']}
                      label="Vybrať osobu"></OrganizationMemberCombobox>
                      <FormMessage />
                  </div>
                </FormItem>
              )}
            />


            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 sm:justify-between">
                  <div className="flex items-center text-[#B0B0B0] gap-1">
                    <TargetIcon size={14} />
                    <span className="whitespace-nowrap text-sm font-semibold">Status</span>
                  </div>
                  <div className="w-full sm:w-56">
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
                  </div>

                </FormItem>
              )}
            />


            {/* Deadline */}
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => {
                const { value, onChange, ...rest } = field;
                const formattedDate = format(value!, 'yyyy-MM-dd')

                return (
                  <FormItem className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 sm:justify-between md:col-start-2">
                    <div className="flex items-center text-[#B0B0B0] gap-1">
                      <CalendarIcon size={14} />
                      <span className="whitespace-nowrap text-sm font-semibold">Termín</span>
                    </div>
                    <div className="w-full sm:w-56">
                      <Input type="date" placeholder=""
                        value={formattedDate}
                        onChange={(e) => {
                          const newDate = e.target.value ? new Date(e.target.value) : undefined;
                          onChange(newDate);
                        }}
                        disabled={!fieldsAccess['deadline']}
                        {...rest}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />

          </div>

          {/* Details */}
          <div className="flex flex-col gap-3">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2">
                  <div className="flex items-center text-[#B0B0B0] gap-1">
                    <ListMinusIcon size={14} />
                    <span className="whitespace-nowrap text-sm font-semibold">Podrobnosti úlohy</span>
                  </div>
                  <Textarea
                    id="task-description"
                    placeholder="Sem napíšte podrobnosti o úlohe"
                    disabled={!fieldsAccess['description']}
                    className="min-h-[100px]"
                    {...field}
                  />
                  <p className="text-[#B0B0B0] text-xs">{field.value.length}/500</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2">
                  <div className="flex items-center text-[#B0B0B0] gap-1">
                    <ListMinusIcon size={14} />
                    <span className="whitespace-nowrap text-sm font-semibold">Zdroj úlohy</span>
                  </div>
                  <FormControl>
                    <Input placeholder="Zdroj úlohy" disabled={!fieldsAccess['source']} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* {isDirty && <div className="space-x-3 col-span-full flex mt-5">
            <Button variant="secondary" type="button" onClick={() => { onCancel(); }}>Zrušiť</Button>
            <SubmitButton isLoading={updateTask.isPending || createTask.isPending} type="submit" >Uložiť</SubmitButton>
          </div>} */}

        </div>
      </form>
    </Form>
  )

}



interface AutoExpandTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  isError?: boolean;
}

export const AutoExpandTextarea = forwardRef<
  HTMLTextAreaElement,
  AutoExpandTextareaProps
>(({ isError = false, ...props }, ref) => {
  const innerRef = useRef<HTMLTextAreaElement>(null);

  // Expose innerRef to parent
  useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement);

  const handleInput = () => {
    const textarea = innerRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // reset height
      textarea.style.height = `${textarea.scrollHeight + 10}px`; // set to content height
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") e.preventDefault(); // block line breaks
  };

  useEffect(() => {
    handleInput(); // adjust height if there's defaultValue
  }, []);

  return (
    <textarea
      {...props}
      ref={innerRef}
      rows={1}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      className={` w-full resize-none overflow-hidden outline-none focus:ring-0 text-2xl font-semibold leading-tight placeholder:text-gray-400 transition-colors duration-200
        ${isError ? "bg-red-100" : "bg-transparent text-gray-900"}`}
    />
  );
});

AutoExpandTextarea.displayName = "AutoExpandTextarea";

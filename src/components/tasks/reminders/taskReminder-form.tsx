'use client'
import { useRouter, useSearchParams } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import SubmitButton from "@/components/common/buttons/submit";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { TaskReminderCreateSchema, TaskReminderUpdateSchema } from "@/lib/models/taskReminder.model";
import { useCreateTaskReminder, useUpdateTaskReminder } from "@/lib/hooks/taskReminder.hooks";
import OrganizationMemberCombobox from "@/components/members/member-combobox";
import { format } from "date-fns";
import { DefaultFormProps } from "@/types/global";



type TaskReminderFormInputs = z.infer<typeof TaskReminderUpdateSchema>

export default function TaskReminderForm({onUpdate, onCancel, defaultValues: _def, edit}: DefaultFormProps) {
  
    const searchParams = useSearchParams();
    const router = useRouter();
  

    const defaultValues: TaskReminderFormInputs = {...{
      id: undefined,
      task_id: undefined,
      member_id: undefined,
      datetime: new Date(),
      description: ''
    }, ...(_def ? _def : {})}
  
  
    const form = useForm<TaskReminderFormInputs>({
      resolver: zodResolver(defaultValues.id ?  TaskReminderUpdateSchema : TaskReminderCreateSchema ), defaultValues,
      reValidateMode: "onChange"
    })
    const { handleSubmit, reset, setValue, formState: { errors, isDirty, isValid } } = form
  
    const updateTaskReminder = useUpdateTaskReminder(_def ? _def.id : 0);
    const createTaskReminder = useCreateTaskReminder();
  

  
    useEffect(() => {
      if (createTaskReminder.isSuccess || updateTaskReminder.isSuccess) { 
        updateTaskReminder.reset()
        createTaskReminder.reset()
        cancel()
      }

      
    }, [createTaskReminder.isSuccess, updateTaskReminder.isSuccess])
    
  
    const onSubmit: SubmitHandler<TaskReminderFormInputs> = async (data) => {
      
      if(edit) {
        updateTaskReminder.mutate(data)
      } else {
        createTaskReminder.mutate(data)
      }

      
    }
  
    const cancel = () => {
      if(onCancel) onCancel()
      reset()
    }
    
  
    return (
      <Form {...form}>
        <form  id="form" onSubmit={handleSubmit(onSubmit)} className="my-8 grid grid-cols-1 md:grid-cols-2 gap-4">    
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>Popis</FormLabel>
                  <FormControl>
                    <Input placeholder="..." {...field} />
                  </FormControl>
                <FormMessage />
              </FormItem>
              )}
            />

          <FormField
              control={form.control}
              name="datetime"
              render={({ field }) => {
                const { value, onChange, ...rest } = field;
                const formattedDate = format(value!, 'yyyy-MM-dd')

                return (
                <FormItem className="">
                  <FormLabel>Termín</FormLabel>
                  <FormControl>
                    <Input type="date" placeholder="" 
                        value={formattedDate}
                        onChange={(e) => {
                          const newDate = e.target.value ? new Date(e.target.value) : undefined;
                          onChange(newDate);
                        }}
                        {...rest}
                    />
                  </FormControl>
                <FormMessage />
              </FormItem>
              )}}
            />

          {/* <FormField
            control={form.control}
            name="member_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Pripomienka len pre mňa?  
                </FormLabel>
            </FormItem>
            )}
          /> */}

          <div className="space-x-3 col-span-full flex mt-5">
            <Button variant="secondary" className="ms-auto" type="button" onClick={() => {cancel();}}>Zrušiť</Button>
            <SubmitButton className="w-32" isLoading={updateTaskReminder.isPending || createTaskReminder.isPending} disabled={!isValid} type="submit" >Uložiť</SubmitButton>
          </div>
  
        </form>
      </Form>
    )
  
  }
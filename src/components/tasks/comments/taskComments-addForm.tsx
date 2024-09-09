"use client"

import { SubmitHandler, useForm } from "react-hook-form"
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCreateTaskComment, useTaskComment, useUpdateTaskComment } from "@/lib/hooks/taskComment.hooks";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import SubmitButton from "@/components/common/buttons/submit";
import { TaskCommentCreateSchema } from "@/lib/models/taksComment.model";

export type TaskCommentFormInputs = {
  message: string,
  task_id: number
}

export default function TaskCommentForm({onUpdate, defaultValues: _def, edit}: {edit?: boolean, onUpdate?: () => void, defaultValues?: any}) {

  const searchParams = useSearchParams();
  const router = useRouter();

  // Parse def values
  if(_def) {
    if(_def.deadline) {
      if(typeof _def.deadline == 'string') _def.deadline = new Date(_def.deadline)
    }
  }

  const defaultValues: TaskCommentFormInputs = {...{
    id: undefined,
    message: '',
    task_id: null,
  }, ...(_def ? _def : {})}


  const form = useForm<TaskCommentFormInputs>({
    resolver: zodResolver(TaskCommentCreateSchema), defaultValues,
    reValidateMode: "onChange"
  })
  const { handleSubmit, reset, setValue, formState: { errors, isDirty, isValid } } = form

  const updateTaskComment = useUpdateTaskComment(_def ? _def.id : 0);
  const createTaskComment = useCreateTaskComment();


  useEffect(() => {
    if (createTaskComment.isSuccess) { 

      createTaskComment.reset()
      reset()
    }
  }, [createTaskComment.isSuccess])
  

  const onSubmit: SubmitHandler<TaskCommentFormInputs> = async (data) => {
    
    createTaskComment.mutate(data)
  }

  const onCancel = () => {
    reset()
  }
  

  return (
    <Form {...form}>
      <form  id="form" onSubmit={handleSubmit(onSubmit)} className="my-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">    
        <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>Komentár</FormLabel>
                <Textarea 
                  id="taskComment-description"
                  placeholder="Nový komentár..."
                  {...field}
                />
                <FormMessage />
            </FormItem>
            )}
          />





        {/* {isDirty && } */}
        <div className="space-x-3 col-span-full flex mt-5 ms-auto">
          <Button variant="secondary" type="button" onClick={() => {onCancel();}}>Zrušiť</Button>
          <SubmitButton className="w-36" isLoading={updateTaskComment.isPending || createTaskComment.isPending} type="submit" >Pridať komentár</SubmitButton>
        </div>

      </form>
    </Form>
  )

}
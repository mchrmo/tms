"use client"

import { SubmitHandler, useForm } from "react-hook-form"
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import SubmitButton from "@/components/common/buttons/submit";
import { MeetingItemCommentCreateSchema, ZMeetingItemComment } from "@/lib/models/meeting/meetingItemComment.model";
import { useCreateMeetingItemComment } from "@/lib/hooks/meeting/meetingItemComment.hooks";


export default function MeetingItemCommentForm({onUpdate, defaultValues: _def, edit}: {edit?: boolean, onUpdate?: () => void, defaultValues?: any}) {

  const searchParams = useSearchParams();
  const router = useRouter();

  // Parse def values
  if(_def) {
    if(_def.deadline) {
      if(typeof _def.deadline == 'string') _def.deadline = new Date(_def.deadline)
    }
  }

  const defaultValues: ZMeetingItemComment = {...{
    id: undefined,
    message: '',
    task_id: null,
  }, ...(_def ? _def : {})}


  const form = useForm<ZMeetingItemComment>({
    resolver: zodResolver(MeetingItemCommentCreateSchema), defaultValues,
    reValidateMode: "onChange"
  })
  const { handleSubmit, reset, setValue, formState: { errors, isDirty, isValid } } = form

  const createMeetingItemComment = useCreateMeetingItemComment();


  useEffect(() => {
    if (createMeetingItemComment.isSuccess) { 

      createMeetingItemComment.reset()
      reset()
    }
  }, [createMeetingItemComment.isSuccess])
  

  const onSubmit: SubmitHandler<ZMeetingItemComment> = async (data) => {
    
    createMeetingItemComment.mutate(data)
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
          <SubmitButton className="w-36" isLoading={createMeetingItemComment.isPending} type="submit" >Pridať komentár</SubmitButton>
        </div>

      </form>
    </Form>
  )

}
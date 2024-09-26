"use client"

import { SubmitHandler, useForm } from "react-hook-form"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCreateMeeting, useMeeting, useUpdateMeeting } from "@/lib/hooks/meeting/meeting.hooks";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import SubmitButton from "@/components/common/buttons/submit";
import { MeetingCreateSchema, MeetingUpdateSchema, ZMeeting } from "@/lib/models/meeting/meeting.model";
import { format } from "date-fns";
import { formatDateTimeHtml } from "@/lib/utils/dates";


export default function MeetingForm({onUpdate, defaultValues: _def, edit}: {edit?: boolean, onUpdate?: () => void, defaultValues?: any}) {
  const router = useRouter();

  // Parse def values
  if(_def) {
    if(_def.deadline) {
      if(typeof _def.deadline == 'string') _def.deadline = new Date(_def.deadline)
    }
  }

  const defaultValues: ZMeeting = {...{
    id: undefined,
    name: '',
    date: new Date(),
  }, ...(_def ? _def : {})}


  const form = useForm<ZMeeting>({
    resolver: zodResolver(defaultValues.id ? MeetingUpdateSchema : MeetingCreateSchema), defaultValues,
    reValidateMode: "onChange"
  })
  const { handleSubmit, reset, setValue, formState: { errors, isDirty, isValid } } = form

  const updateMeeting = useUpdateMeeting(_def ? _def.id : 0);
  const createMeeting = useCreateMeeting();

  useEffect(() => {
    if (createMeeting.isSuccess) { 
      const newId = createMeeting.data.id
      if(newId) router.push('/meetings/'+newId)

      createMeeting.reset()
    }

    if(updateMeeting.isSuccess) {
      reset(updateMeeting.data)

    }
  }, [createMeeting.isSuccess, updateMeeting.isSuccess])
  

  const onSubmit: SubmitHandler<ZMeeting> = async (data) => {
    
    if(edit) {
      updateMeeting.mutate(data)
    } else {
      createMeeting.mutate(data)
    }
  }

  const onCancel = () => {
    reset()
  }
  

  return (
    <Form {...form}>
      <form  id="form" onSubmit={handleSubmit(onSubmit)} className="my-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">    
        <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Názov porady</FormLabel>
                <FormControl>
                  <Input placeholder="Názov úlohy" {...field} />
                </FormControl>
              <FormMessage />
            </FormItem>
            )}
          />

        <FormField
              control={form.control}
              name="date"
              render={({ field }) => {
                const { value, onChange, ...rest } = field;
                const formattedDate = formatDateTimeHtml(value)

                return (
                <FormItem className="">
                  <FormLabel>Dátum a čas</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" placeholder="" 
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



        {isDirty && <div className="space-x-3 col-span-full flex mt-5">
          <Button variant="secondary" type="button" onClick={() => {onCancel();}}>Zrušiť</Button>
          <SubmitButton isLoading={updateMeeting.isPending || createMeeting.isPending} type="submit" >Uložiť</SubmitButton>
        </div>}

      </form>
    </Form>
  )

}
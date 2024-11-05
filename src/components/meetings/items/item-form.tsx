"use client"

import { SubmitHandler, useForm } from "react-hook-form"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import SubmitButton from "@/components/common/buttons/submit";
import { MeetingItemCreateSchema, meetingItemStatusMap, MeetingItemUpdateSchema, ZMeetingItem } from "@/lib/models/meeting/meetingItem.model";
import { useCreateMeetingItem, useUpdateMeetingItem } from "@/lib/hooks/meeting/meetingItem.hooks";
import clsx from "clsx";
import { Textarea } from "@/components/ui/textarea";


export default function MeetingItemForm({onUpdate, onCancel, defaultValues: _def, edit}: {edit?: boolean, onUpdate?: () => void, defaultValues?: any, onCancel?: () => void}) {
  const router = useRouter();

  // Parse def values
  if(_def) {
    if(_def.deadline) {
      if(typeof _def.deadline == 'string') _def.deadline = new Date(_def.deadline)
    }
  }

  const defaultValues: ZMeetingItem = {...{
    id: undefined,
    description: '',
    title: '',
    meeting_id: undefined
  }, ...(_def ? _def : {})}


  const form = useForm<ZMeetingItem>({
    resolver: zodResolver(defaultValues.id ? MeetingItemUpdateSchema : MeetingItemCreateSchema), defaultValues,
    reValidateMode: "onChange"
  })
  const { handleSubmit, reset, setValue, formState: { errors, isDirty, isValid } } = form

  const updateMeetingItem= useUpdateMeetingItem(_def ? _def.id : 0);
  const createMeetingItem = useCreateMeetingItem();
  
  useEffect(() => {
    if (createMeetingItem.isSuccess) { 
      createMeetingItem.reset()
      router.push(`/meetings/items/${createMeetingItem.data.id}`)
      cancel()
    }

    if(updateMeetingItem.isSuccess) {
      reset(updateMeetingItem.data)
      cancel()
    }

  }, [createMeetingItem.isSuccess, updateMeetingItem.isSuccess])
  

  const onSubmit: SubmitHandler<ZMeetingItem> = async (data) => {
    
    if(edit) {
      updateMeetingItem.mutate(data)
    } else {
      createMeetingItem.mutate(data)
    }
    
  }

  const cancel = () => {
    reset()
    if(onCancel) onCancel()
  }
  

  return (
    <Form {...form}>
      <form  id="form" onSubmit={handleSubmit(onSubmit)} className="my-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">    

      <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className={clsx({"col-span-2": edit, "col-span-full": !edit})}>
                <FormLabel>Predmet</FormLabel>
                <FormControl>
                  <Input placeholder="Predmet" {...field}/>
                </FormControl>
              <FormMessage />
            </FormItem>
            )}
          />
        
        {
            edit &&
            <FormField
            control={form.control}
            name="status"
            render={({ field }) => {
              const { value, onChange, ...rest } = field;
              const formatted = meetingItemStatusMap[value]

              return (
                <FormItem className="col">
                  <FormLabel>Stav</FormLabel>
                  <FormControl>
                    {/* <Input {...field} disabled/> */}
                    <Input type="text" placeholder="" 
                        value={formatted}
                        {...rest}
                        disabled
                    />
                  </FormControl>
                <FormMessage />
              </FormItem>
            )}}
          />}
        <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className={'col-span-full'}>
                <FormLabel>Popis</FormLabel>
                <FormControl>
                  <Textarea placeholder="Návrh" {...field}>
                  </Textarea>
                </FormControl>
              <FormMessage />
            </FormItem>
            )}
          />

          



        {(isDirty || !edit) && <div className="space-x-3 col-span-full flex mt-5">
          <Button variant="secondary" type="button" onClick={() => {cancel();}}>Zrušiť</Button>
          <SubmitButton isLoading={updateMeetingItem.isPending || createMeetingItem.isPending} type="submit" >{edit ? "Upraviť" : "Pridať návrh"}</SubmitButton>
        </div>}

      </form>
    </Form>
  )

}
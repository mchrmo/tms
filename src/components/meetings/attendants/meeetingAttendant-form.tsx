"use client"

import { SubmitHandler, useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCreateMeetingAttendant } from "@/lib/hooks/meeting/meetingAttendant.hooks";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import SubmitButton from "@/components/common/buttons/submit";
import { formatDateTimeHtml } from "@/lib/utils/dates";
import { Input } from "@/components/ui/input";
import { MeetingAttendantCreateSchema, ZMeetingAttendant } from "@/lib/models/meeting/meetingAttendant.model";
import { Button } from "@/components/ui/button";
import OrganizationMemberCombobox from "@/components/members/member-combobox";


export default function MeetingAttendantForm({onUpdate, meeting_id}: {onUpdate?: () => void, meeting_id: number}) {
  const router = useRouter();

  const form = useForm<ZMeetingAttendant>({
    resolver: zodResolver(MeetingAttendantCreateSchema),
    defaultValues: {
      meeting_id
    },
    reValidateMode: "onChange"
  })
  const { handleSubmit, reset, setValue, formState: { errors, isDirty, isValid } } = form

  const createMeetingAttendant = useCreateMeetingAttendant();

  useEffect(() => {
    reset()
    if (createMeetingAttendant.isSuccess) { 
      createMeetingAttendant.reset()
    }
  }, [createMeetingAttendant.isSuccess])
  

  const onSubmit: SubmitHandler<ZMeetingAttendant> = async (data) => {
    createMeetingAttendant.mutate(data)
  }

  const onCancel = () => {
    reset()
  }
  
  return (
    <Form {...form}>
      <form  id="form" onSubmit={handleSubmit(onSubmit)} className="my-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">    
        
        <FormField
            control={form.control}
            name="user_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Osoba</FormLabel>
                <OrganizationMemberCombobox 
                onSelectResult={(member) => field.onChange(member.user_id)} 
                label="Vybrať osobu"></OrganizationMemberCombobox>
                <FormMessage />
            </FormItem>
            )}
        />

        {isDirty && <div className="space-x-3 col-span-full flex mt-5">
          <Button variant="secondary" type="button" onClick={() => {onCancel();}}>Zrušiť</Button>
          <SubmitButton isLoading={createMeetingAttendant.isPending} type="submit" >Pridať účastníka</SubmitButton>
        </div>}
      </form>
    </Form>
  )

}
'use client'

import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { OrganizationMemberCreateSchema, OrganizationMemberUpdateSchema, ZOrganizationMember } from "@/lib/models/organization/member.model";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateOrganizationMember, useUpdateOrganizationMember } from "@/lib/hooks/organization/organizationMember.hooks";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import UserCombobox from "@/components/users/user-combobox";
import OrganizationMemberCombobox from "./member-combobox";
import { Button } from "@/components/ui/button";
import SubmitButton from "@/components/common/buttons/submit";


export type MemberFormData = {
  user_id?: number;
  manager_id?: number;
  organization_id?: number;
  position_name?: string
}

export default function MemberForm({ onCancel, defaultValues: _def }: { onCancel?: () => void, defaultValues?: any }) {
  const router = useRouter()

  const defaultValues = {
    ...{
      id: undefined,
    }, ...(_def ? _def : {})
  }


  const form = useForm<ZOrganizationMember>({
    resolver: zodResolver(OrganizationMemberCreateSchema), defaultValues,
    reValidateMode: "onChange"
  })
  const { handleSubmit, reset, setValue, formState: { errors, isDirty, isValid } } = form

  const createOrganizationMember = useCreateOrganizationMember();

  useEffect(() => {
    if (createOrganizationMember.isSuccess) {
      const newId = createOrganizationMember.data.id
      createOrganizationMember.reset()
      if(onCancel) onCancel()
    }
  }, [createOrganizationMember.isSuccess])

  const onSubmit: SubmitHandler<ZOrganizationMember> = async (data) => {
    createOrganizationMember.mutate(data)
  }



  return (
    <Form {...form}>

      <form onSubmit={handleSubmit(onSubmit)} className="flex gap-3 flex-col">

        <FormField
          control={form.control}
          name="user_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Užívateľ</FormLabel>
              <UserCombobox mode="unassigned"
                onSelectResult={(user) => field.onChange(user.id)}
              ></UserCombobox>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="position_name"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>Pozícia</FormLabel>
              <FormControl>
                <Input placeholder="Pozícia" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="manager_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nadriadený</FormLabel>
              <OrganizationMemberCombobox
                onSelectResult={(member) => field.onChange(member.id)}
                label="Vybrať nadriadenú osobu"  managersToOrg={defaultValues && defaultValues.organization && defaultValues.organization.id}></OrganizationMemberCombobox>
              <FormMessage/>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="organization_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organizácia</FormLabel>
              <Input placeholder="" value={defaultValues && defaultValues.organization && defaultValues.organization.name} disabled />
              <FormMessage />
            </FormItem>
          )}
        />
        {<div className="space-x-3 col-span-full flex mt-5">
          <Button variant="secondary" type="button" onClick={() => {onCancel && onCancel();}}>Zrušiť</Button>
          <SubmitButton isLoading={createOrganizationMember.isPending} type="submit" >Pridať</SubmitButton>
        </div>}
      </form>
    </Form>
  )

}
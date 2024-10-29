"use client"

import { SubmitHandler, useForm } from "react-hook-form"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { useCreateOrganization, useUpdateOrganization } from "@/lib/hooks/organization/organization.hooks";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import SubmitButton from "@/components/common/buttons/submit";
import { OrganizationCreateSchema, OrganizationUpdateSchema, ZOrganization } from "@/lib/models/organization/organization.model";
import OrganizationCombobox from "./organization-combobox";


export default function OrganizationForm({onUpdate, defaultValues: _def, edit}: {edit?: boolean, onUpdate?: () => void, defaultValues?: any}) {
  const router = useRouter();

  // Parse def values
  if(_def && _def.id) {
    edit = true
  }

  const defaultValues: ZOrganization = {...{
    id: undefined,
    name: '',
    parent_id: null
  }, ...(_def ? _def : {})}  

  // console.log(defaultValues);
  
  const form = useForm<ZOrganization>({
    resolver: zodResolver(defaultValues.id ? OrganizationUpdateSchema : OrganizationCreateSchema), defaultValues,
    reValidateMode: "onChange"
  })
  const { handleSubmit, reset, setValue, formState: { errors, isDirty, isValid } } = form


  const updateOrganization = useUpdateOrganization(_def ? _def.id : 0);
  const createOrganization = useCreateOrganization();

  useEffect(() => {
    if (_def.parent) setValue("parent_id", _def.parent.id)
  }, [])

  useEffect(() => {
    if (createOrganization.isSuccess) { 
      const newId = createOrganization.data.id
      router.push('/organizations')
      createOrganization.reset()
    }

    if(updateOrganization.isSuccess) {
      router.push('/organizations')
      reset(updateOrganization.data)
    }
  }, [createOrganization.isSuccess, updateOrganization.isSuccess])
  

  const onSubmit: SubmitHandler<ZOrganization> = async (data) => {
    
    if(edit) {
      updateOrganization.mutate(data)
    } else {
      createOrganization.mutate(data)
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
                <FormLabel>Názov organizáice</FormLabel>
                <FormControl>
                  <Input placeholder="Názov porady" {...field} />
                </FormControl>
              <FormMessage />
            </FormItem>
            )}
          />

        {
          ((_def && _def.members && !_def.members.length) || !edit) &&
          <FormField 
          control={form.control}
          name="parent_id"
          render={({ field }) => (
            <FormItem className="">
              <FormLabel>Nadriadená organizácia</FormLabel>
              <FormControl>
                <OrganizationCombobox 
                  onSelectResult={(org) => field.onChange(org.id)}
                  defaultValue={_def && _def.parent}
                  ></OrganizationCombobox>
              </FormControl>
            <FormMessage />
          </FormItem>
          )}
        />
        }
        


        {isDirty && <div className="space-x-3 col-span-full flex mt-5">
          <Button variant="secondary" type="button" onClick={() => {onCancel();}}>Zrušiť</Button>
          <SubmitButton isLoading={updateOrganization.isPending || createOrganization.isPending} type="submit" >{ edit ? 'Uložiť' : 'Vytvoriť'}</SubmitButton>
        </div>}

      </form>
    </Form>
  )

}
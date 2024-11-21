'use client'

import { useEffect } from "react";
import { useFormState } from "react-dom";
import { SubmitHandler, useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { redirect, useRouter } from "next/navigation";
import { UserCreateSchema, UserRegistrationFormInputs, UserUpdateSchema, ZUser, ZUserCreateForm, ZUserUpdateForm } from "@/lib/models/user.model";
import { useCreateUser, useUpdateUser } from "@/lib/hooks/user.hooks";
import SubmitButton from "../common/buttons/submit";




export default function UserRegistrationForm({ onClose, defaultValues: _def }: { onClose?: () => void, defaultValues?: any }) {

  const router = useRouter()
  const createUser = useCreateUser();
  const updateUser = useUpdateUser(_def ? _def.id : 0);

  const defaultValues: ZUserUpdateForm = {
    ...{
      id: undefined,
      name: '',
    }, ...(_def ? _def : {})
  }


  const form = useForm<ZUser>({
    resolver: zodResolver(defaultValues.id ? UserUpdateSchema : UserCreateSchema),
    defaultValues,
    mode: "onSubmit"
  })

  const { handleSubmit, reset, setValue, formState: { errors, isDirty, isValid } } = form

  useEffect(() => {
    if (createUser.isSuccess) {
      const newId = createUser.data.id
      if (newId) router.push('/users')

      if (onClose) onClose()
      createUser.reset()

    } else if(updateUser.isSuccess) {
      router.push('/users')
      createUser.reset()

    }



  }, [createUser.isSuccess, updateUser.isSuccess])


  const onSubmit: SubmitHandler<any> = async (data) => {
    if(data.id) {
      updateUser.mutate(data)
    } else {
      createUser.mutate(data)
    }
  }

  return (
    <>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="">

          <div className="my-8 grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meno a priezvisko</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input placeholder="@" {...field} disabled={!!defaultValues.id} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefón</FormLabel>
                  <FormControl>
                    <Input placeholder="+421" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button variant="secondary" type="button" onClick={() => { if (onClose) onClose(); }}>Zrušiť</Button>
              <SubmitButton isLoading={createUser.isPending || updateUser.isPending} type="submit" className="">
                {
                  defaultValues.id ? "Aktualizovať" : "Registrovať"
                }
              </SubmitButton>
            </div>
          </div>

        </form>
      </Form>

    </>
  )

}
'use client'

import { createUserAction, RegistrationFields, State } from "@/lib/actions/user.actions";
import { useEffect } from "react";
import { useFormState } from "react-dom";
import {  SubmitHandler, useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { revalidatePath } from "next/cache";
import { redirect, useRouter } from "next/navigation";
import { NewUserSchema, UserRegistrationFormInputs } from "@/lib/models/user.model";
import { useCreateUser } from "@/lib/hooks/user.hooks";
import SubmitButton from "../common/buttons/submit";


const formSchema = NewUserSchema


export default function UserRegistrationForm({onClose}: {onClose: () => void}) {

  const router = useRouter()
  const createUser = useCreateUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      name: "",
      phone: ''
    },
    mode: "onChange"
  })
  const { handleSubmit, reset, setValue, formState: { errors, isDirty, isValid } } = form

  useEffect(() => {
    if(!createUser.isSuccess) return
    const newId = createUser.data.id
    if(newId) router.push('/users')

    createUser.reset()
    onClose()
  }, [createUser.isSuccess])


  const onSubmit: SubmitHandler<UserRegistrationFormInputs> = async (data) => {
    createUser.mutate(data)
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
                    <Input placeholder="@" {...field} />
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
              <Button variant="secondary" type="button" onClick={() => {onClose();}}>Zrušiť</Button>
              <SubmitButton isLoading={createUser.isPending || createUser.isPending} type="submit" className="">Registrovať</SubmitButton>
            </div>
          </div>
          
        </form>
      </Form>

    </>
  )

}
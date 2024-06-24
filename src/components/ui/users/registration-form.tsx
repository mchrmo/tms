'use client'

import { RegistrationFields, State, create_user } from "@/lib/actions/user.actions";
import { useEffect } from "react";
import { useFormState } from "react-dom";
import {  SubmitHandler, useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../form";
import { Button } from "../button";
import { Input } from "../input";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";


const formSchema = z.object({
  email: z.string().email("Zadajte správny tvar emailu."),
  name: z.string().regex(new RegExp(/^[A-Z][a-z]*\s[A-Z][a-z]*/), "Zadajte meno a priezvisko")
})


export default function RegistrationForm() {

  const initialState = { message: null, errors: {}};
  const [state, dispatch] = useFormState<State<RegistrationFields>, FormData>(create_user, initialState);

  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      name: "",
    },
    mode: "onChange"
  })

  
  useEffect(() => {
    if(state.message == null) return

    toast({
      title: state.success ? "Správa" : "Chyba",
      description: state.message,
    })  

    if(state.success) {
      redirect('/users')
    }

  }, [state])

  return (
    <>

      <Form {...form}>
        <form action={dispatch} className="space-y-8">

          <div className="flex items-end gap-3 lg:gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meno a priezvisko</FormLabel>
                  <FormControl>
                    <Input placeholder="shadcn" {...field} />
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

            <Button type="submit">Registrovať</Button>

          </div>
          
        </form>
      </Form>

    </>
  )

}
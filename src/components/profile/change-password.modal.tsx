'use client'

import { useEffect, useState } from "react";
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
import { passwordSchema } from "@/lib/models/user.model";
import { useChangeUserPassword, useCreateUser } from "@/lib/hooks/user.hooks";
import SubmitButton from "../common/buttons/submit";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import AddButton from "../common/buttons/add-button";


const formSchema = z.object({
  password: passwordSchema
})


export default function ChangeUserPasswordModal({userId, canEdit}: {userId: number, canEdit?: boolean}) {

  const [open, setOpen] = useState(false)
  const changePasswordQ = useChangeUserPassword();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange"
  })
  const { handleSubmit, reset, setValue, formState: { errors, isDirty, isValid } } = form

  useEffect(() => {
    if(!changePasswordQ.isSuccess) return
    const newId = changePasswordQ.data.id

    changePasswordQ.reset()
    onClose()
  }, [changePasswordQ.isSuccess])


  const onSubmit: SubmitHandler<{password: string}> = async ({password}) => {
    changePasswordQ.mutate({password, user_id: userId})
  }

  const onClose = () => {
    reset()
    setOpen(false)
  }

  return (
    <>

    <Dialog open={open} onOpenChange={setOpen}>
        <Button onClick={() => setOpen(true)} className="">Zmeniť heslo</Button>
        <DialogContent onInteractOutside={(e) => e.preventDefault()} className="w-screen h-screen lg:h-auto lg:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Zmeniť heslo</DialogTitle>
          </DialogHeader>
            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="">

                  <div className="my-8 grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nové heslo</FormLabel>
                          <FormControl>
                            <Input placeholder="" type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-3">
                      <Button variant="secondary" type="button" onClick={() => {onClose();}}>Zrušiť</Button>
                      <SubmitButton isLoading={changePasswordQ.isPending || changePasswordQ.isPending} type="submit" className="">Zmeniť</SubmitButton>
                    </div>
                  </div>
                  
                </form>
              </Form>
          {/* <DialogFooter>
            <Button variant="secondary" type="submit" onClick={() => setOpen(false)}>Zrušiť</Button>
            <Button type="submit" >Uložiť</Button>
          </DialogFooter> */}
        </DialogContent>
      </Dialog>


    </>
  )

}
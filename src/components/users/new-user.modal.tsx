'use client'

import { ReactNode, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import AddButton from "@/components/common/buttons/add-button";
import { Button } from "@/components/ui/button";
import { OrganizationMember } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import UserRegistrationForm from "./registration-form";


type DefaultValues = {
  manager?: OrganizationMember,
  position_name?: string
}


export default function NewUserModal() {

  const [open, setOpen] = useState(false)

  return (    
    <Dialog open={open} onOpenChange={setOpen}>
      <AddButton onClick={() => setOpen(true)} className="">Pridať užívateľa</AddButton>
      <DialogContent onInteractOutside={(e) => e.preventDefault()} className="w-screen h-screen lg:h-auto lg:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Pridať užívateľa</DialogTitle>
          <DialogDescription>
            Pomocou tohto okna môžete pridať nového užíateľa.
          </DialogDescription>
        </DialogHeader>
        <UserRegistrationForm onClose={() => setOpen(false)} />
        {/* <DialogFooter>
          <Button variant="secondary" type="submit" onClick={() => setOpen(false)}>Zrušiť</Button>
          <Button type="submit" >Uložiť</Button>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>

  )

}
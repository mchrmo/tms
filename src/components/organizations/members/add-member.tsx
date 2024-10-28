'use client'

import { ReactNode, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import AddButton from "@/components/common/buttons/add-button";
import { Button } from "@/components/ui/button";
import AddMemberForm, { MemberFormData } from "./form";
import { OrganizationMember } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";


type DefaultValues = {
  manager?: OrganizationMember,
  position_name?: string
}


export default function AddMember({children, defaultValues}: {children?: ReactNode, defaultValues?: DefaultValues}) {

  const trigger = children || <AddButton  className="">Pridať</AddButton>
  const [open, setOpen] = useState(false)
  
  return (    
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent onInteractOutside={(e) => e.preventDefault()} className="w-screen h-screen lg:h-auto lg:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Pridať člena organizácie</DialogTitle>
          <DialogDescription>
            Pomocou tohto okna môžete priradiť užíateľa k organizácií.
          </DialogDescription>
        </DialogHeader>
        {/* <MemberForm /> */}
        <DialogFooter>
          {/* <Button variant="secondary" type="submit" onClick={() => setOpen(false)}>Zrušiť</Button>
          <Button type="submit" onClick={() => addMember()}>Uložiť</Button> */}
        </DialogFooter>
      </DialogContent>
    </Dialog>

  )

}
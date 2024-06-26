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
import { Button } from "../button";
import AddMemberForm, { MemberFormData } from "./add-member-form";
import { OrganizationMember } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { useToast } from "../use-toast";


type DefaultValues = {
  manager?: OrganizationMember,
  position_name?: string
}


export default function AddMember({children, defaultValues}: {children?: ReactNode, defaultValues?: DefaultValues}) {

  const addBtnText = children ? children : "Pridať" 
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<MemberFormData>({})

  const { toast } = useToast()

  useEffect(() => {
    
  }, [])

  const addMember = async () => {
    const res = await fetch('/api/organizations/members', {
      method: 'POST',
      body: JSON.stringify(formData),
    })

    if(res.ok) {
      setOpen(false)


    } else {
      
    }

    // revalidatePath('/')
  }



  
  return (    
    <Dialog open={open} onOpenChange={setOpen}>
      <AddButton onClick={() => setOpen(true)} className="">{addBtnText}</AddButton>
      <DialogContent className="w-screen h-screen lg:h-auto lg:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pridať člena organizácie</DialogTitle>
          <DialogDescription>
            Pomocou tohto okna môžete priradiť užíateľa k organizácií.
          </DialogDescription>
        </DialogHeader>
        <AddMemberForm formData={formData} setFormData={setFormData} />
        <DialogFooter>
          <Button variant="secondary" type="submit" onClick={() => setOpen(false)}>Zrušiť</Button>
          <Button type="submit" onClick={() => addMember()}>Uložiť</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

  )

}
'use client'

import { useState } from "react";
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
import AddMemberForm from "./add-member-form";


export default function AddMember() {

  const [open, setOpen] = useState(false)

  return (

    
    <Dialog open={open} onOpenChange={setOpen}>
      <AddButton onClick={() => setOpen(true)} className="">Pridať podriadeného</AddButton>
      <DialogContent className="w-screen h-screen lg:h-auto lg:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>


        <AddMemberForm />
        <DialogFooter>
          <Button type="submit" onClick={() => setOpen(false)}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

  )

}
'use client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import OrgTree from "./tree"
import { OrgMembersTree, getMainOrganization } from "@/lib/db/organizations"
import { useState } from "react"
import { Button } from "../button"



export default function Organization({orgData}: {orgData: OrgMembersTree[]}) {
  
  const [open, setOpen] = useState(false)

  return (
    <>
      {
        orgData.length &&
        <div>
          <OrgTree data={orgData[0]}></OrgTree>
        </div>
      }
      
      <Button onClick={() => setOpen(true)}>Open UP</Button>



    </>
  )
}
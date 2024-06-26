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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AddMember from "../members/add-member"



export default function Organization({orgData}: {orgData: OrgMembersTree[]}) {
  
  const [open, setOpen] = useState(false)

  return (
    <div className="flex justify-center">

    <Tabs defaultValue="main" className="w-full" >
      <TabsList className="w-full grid grid-cols-2">
        <TabsTrigger value="main">Hlavná organizácia</TabsTrigger>
        <TabsTrigger value="custom">Ostatné</TabsTrigger>
      </TabsList>
      <TabsContent value="main" className="flex justify-center mt-5">
        {
          orgData.length ?
          <div className="w-full">
            <OrgTree data={orgData[0]}></OrgTree>
          </div>
          :
          <div className="flex flex-col gap-5">
            <span className="text-lg">Hlavnú organizáciu začnite pridaním primátora</span>
            <AddMember>Pridať primátora</AddMember>
          </div>
        }      
      </TabsContent>
      <TabsContent value="custom" className="flex justify-center">
        <span className="text-lg">Žiadna organizácia</span>
      </TabsContent>
    </Tabs>

      
      

    </div>
  )
}
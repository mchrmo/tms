'use client'

import ViewHeadline from "@/components/common/view-haedline";
import { OrganizationMemberDetail, OrganizationMemberSubordinate } from "@/lib/db/organizations";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from "next/link";
import AddMember from "./add-member";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

export default function MemberDetail({member, subs, isAdmin}: {member: OrganizationMemberDetail, subs: OrganizationMemberSubordinate, isAdmin?: boolean}) {
  

  const router = useRouter();

  if(!member) return 



  const onMemberRemove = async () => {

    await fetch('/api/organizations/members?id='+member.id , {
      method: "DELETE",
    })

    router.push('/organizations')
    router.refresh()
  }


  return (
    <>
      <div className="">
        <ViewHeadline>{member.user.name}, {member.organization.name}</ViewHeadline>
      </div>
      


      <Table className="w-[400px]">
        <TableBody>
          <TableRow className="hover:bg-white">
            <TableHead>Meno:</TableHead>
            <TableCell className="font-bold">{member.user.name}</TableCell>
          </TableRow>
          <TableRow className="hover:bg-white">
            <TableHead>Organ.:</TableHead>
            <TableCell className="font-medium">{member.organization.name}</TableCell>
          </TableRow>
          <TableRow className="hover:bg-white">
            <TableHead>Pozícia:</TableHead>
            <TableCell className="font-medium">{member.position_name}</TableCell>
          </TableRow>
          <TableRow className="hover:bg-white">
            <TableHead>Nadriadený:</TableHead>
            <TableCell className="font-medium">
              <Link className="link" href={'/organizations/members/'+member.manager_id}>{member.manager?.user.name}</Link>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <div className="flex items-center justify-between mt-10 mb-3">
        <h3 className="text-xl">Podriadení:</h3>
        {
          isAdmin && 

          <div className="flex gap-5">
            <AddMember defaultValues={{manager: member}}/>
            <Button onClick={onMemberRemove} variant={"destructive"} style={{pointerEvents: "auto"}}
              disabled={!!subs.length} title={ subs.length ? "Člen nesmie mať žiadnych podriadených aby ho bolo možné vymazať" : "" }
            >
              Vymazať člena
            </Button>
          </div>
        }
      </div>

      <Table className="">
            <TableHeader>
              <TableRow>
                <TableHead className="">Meno</TableHead>
                <TableHead>Pozícia</TableHead>
                <TableHead>Organizácia</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
                {
                  !subs.length ?
                  <TableRow>
                    <TableCell className="font-medium">
                      Žiadny podriadení.   
                    </TableCell>
                  </TableRow> 
                  
                  :
                  
                  subs.map(sub => 
                    <TableRow  key={sub.id}>
                      <TableCell className="font-medium">
                        <Link className="link" href={'/organizations/members/'+sub.id}>{sub.user.name}</Link>
                      </TableCell>
                      <TableCell className="font-medium">
                        {sub.position_name}
                      </TableCell>
                      <TableCell className="font-medium">
                        {sub.organization.name}
                      </TableCell>
                    </TableRow>
                  )
                }
      </TableBody>
    </Table>

      

    
    </>
  )
}
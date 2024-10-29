'use client'

import ViewHeadline from "@/components/common/view-haedline";
import { OrganizationMemberDetail, OrganizationMemberSubordinate } from "@/lib/db/organizations";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from "next/link";
import AddMember from "./add-member";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useDeleteOrganizationMember, useOrganizationMember } from "@/lib/hooks/organization/organizationMember.hooks";
import LoadingSpinner from "@/components/ui/loading-spinner";

export default function MemberDetail({ params }: { params: { id: string } }) {

  const { toast } = useToast()
  const memberId = parseInt(params.id)

  const memberQ = useOrganizationMember(memberId)
  const member = memberQ.data
  const router = useRouter();
  const deleteMemberQ = useDeleteOrganizationMember(memberId)
  
  const deleteMember = (new_owner: number) => {
    deleteMemberQ.mutate({ new_owner })
  }


  if (memberQ.isLoading) return <span>Člen sa načitáva <LoadingSpinner></LoadingSpinner></span>


  return (
    <>
      {
        member && <>
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
                <TableCell className="font-medium">
                  <Link href={'/organizations/' + member.organization_id}>
                    <Button className="p-0 h-0" variant={'link'}>{member.organization.name}</Button>
                  </Link>
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-white">
                <TableHead>Pozícia:</TableHead>
                <TableCell className="font-medium">{member.position_name}</TableCell>
              </TableRow>
              <TableRow className="hover:bg-white">
                <TableHead>Nadriadený:</TableHead>
                <TableCell className="font-medium">
                  <Link href={'/organizations/members/' + member.manager_id}>
                    <Button className="p-0 h-0" variant={'link'}>{member.manager?.user.name}</Button>
                  </Link>
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-white">
                <TableCell className="font-medium" colSpan={2}>
                  <Button className="p-0 h-0" variant={'linkDestructive'}>Odstrániť člena</Button>

                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="flex items-center justify-between mt-10 mb-3">
            <h3 className="text-xl">Podriadení:</h3>
            {/* {
          isAdmin &&

          <div className="flex gap-5">
            <AddMember defaultValues={{ manager: member }} />
            <Button onClick={onMemberRemove} variant={"destructive"} style={{ pointerEvents: "auto" }}
              disabled={!!subs.length} title={subs.length ? "Člen nesmie mať žiadnych podriadených aby ho bolo možné vymazať" : ""}
            >
              Vymazať člena
            </Button>
          </div>
        } */}

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
                !member.subordinates.length ?
                  <TableRow>
                    <TableCell className="font-medium">
                      Žiadny podriadení.
                    </TableCell>
                  </TableRow>

                  :

                  member.subordinates.map(sub =>
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">
                        <Link className="link" href={'/organizations/members/' + sub.id}>{sub.user.name}</Link>
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
      }

    </>
  )
}
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

export default function MemberDetail({ member, subs, isAdmin }: { member: OrganizationMemberDetail, subs: OrganizationMemberSubordinate, isAdmin?: boolean }) {

  const { toast } = useToast()

  const router = useRouter();

  if (!member) return



  const onMemberRemove = async () => {

    fetch('/api/organizations/members?id=' + member.id, {
      method: "DELETE",
    })
      .then(res => {
        if (!res.ok) throw new Error(res.statusText)

        return res
      })
      .then((res) => {
        router.push('/organizations')
        router.refresh()
      }).catch(err => {
        toast({
          title: "Chyba",
          description: "Člena sa nepodarilo odstrániť"
        })
      })

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
            <TableCell className="font-medium">
              <Link href={'/organizations/' + member.organization_id  }>
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
        </TableBody>
      </Table>

      <div className="flex items-center justify-between mt-10 mb-3">
        <h3 className="text-xl">Podriadení:</h3>
        {
          isAdmin &&

          <div className="flex gap-5">
            <AddMember defaultValues={{ manager: member }} />
            <Button onClick={onMemberRemove} variant={"destructive"} style={{ pointerEvents: "auto" }}
              disabled={!!subs.length} title={subs.length ? "Člen nesmie mať žiadnych podriadených aby ho bolo možné vymazať" : ""}
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
  )
}
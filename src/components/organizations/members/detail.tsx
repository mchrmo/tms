'use client'

import ViewHeadline from "@/components/common/view-haedline";
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
import { useDeleteOrganizationMember, useOrganizationMember, useSwapOrganizationMember } from "@/lib/hooks/organization/organizationMember.hooks";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { OrganizationMemberDetail, OrganizationMemberListItem } from "@/lib/services/organizations/organizationMembers.service";
import OrganizationMemberCombobox from "./member-combobox";
import SubmitButton from "@/components/common/buttons/submit";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import UserCombobox from "@/components/users/user-combobox";
import { UserListItem } from "@/lib/services/user.service";

export default function MemberDetail({ params }: { params: { id: string } }) {

  const { toast } = useToast()
  const memberId = parseInt(params.id)

  const memberQ = useOrganizationMember(memberId)
  const member = memberQ.data
  const router = useRouter();



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
                  <div className="flex justify-evenly">
                    <DeleteMemberDialog member={member}/>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-white">
                <TableCell className="font-medium" colSpan={2}>
                  <div className="flex justify-evenly">
                    <SwapMemberDialog member={member}/>
                  </div>
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


function DeleteMemberDialog({ member }: { member: OrganizationMemberDetail }) {
  const [open, setOpen] = useState(false)
  const [selectedMember, selectMember] = useState<OrganizationMemberListItem | null>(null)

  const deleteMemberQ = useDeleteOrganizationMember(member.id)

  const deleteMember = () => {
    if(!selectedMember) return
    const new_owner = selectedMember.id
    deleteMemberQ.mutate({ new_owner })
  }



  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button size={'link'} variant={'linkDestructive'}>Odstrániť člena</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Odstránenie člena organizácie
          </DialogTitle>
          <DialogDescription>
            Pred odstránením člena vyberte iného člena, ktorý sa stane vlastníkom všetkých úloh, ktoré vytvoril vymazaný člen.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label>Nový vlastník úloh:</Label>
          <OrganizationMemberCombobox onSelectResult={(member) => selectMember(member)}></OrganizationMemberCombobox>
        </div>
        <DialogFooter>
          <Button variant="secondary" type="button" onClick={() => {setOpen(false)}}>Zrušiť</Button>
          <SubmitButton onClick={() => deleteMember()} isLoading={deleteMemberQ.isPending} type="submit" disabled={!selectedMember}>Potvrdiť odstránenie člena</SubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


function SwapMemberDialog({ member }: { member: OrganizationMemberDetail }) {
  const [open, setOpen] = useState(false)
  const [selectedUser, selectUser] = useState<UserListItem | null>(null)

  const swapMemberQ = useSwapOrganizationMember()

  const swapMember = () => {
    if(!selectedUser) return
    swapMemberQ.mutate({memberId: member.id, newUserId: selectedUser.id})
  }

  useEffect(() => {
    if(swapMemberQ.isSuccess) setOpen(false)
  }, [swapMemberQ.isSuccess])


  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button size={'link'} variant={'linkDestructive'}>Vymeniť člena</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Výmena člena organizácie
          </DialogTitle>
          <DialogDescription>
            Vyberte užívateľa, ktorý nahradí člena na pozící '{member.position_name}' v organizácií '{member.organization.name}'.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label>Nový vlastník úloh:</Label>
          <UserCombobox onSelectResult={(user) => selectUser(user)}  mode="unassigned"/>
        </div>
        <DialogFooter>
          <Button variant="secondary" type="button" onClick={() => {setOpen(false)}}>Zrušiť</Button>
          <SubmitButton onClick={() => swapMember()} isLoading={swapMemberQ.isPending } type="submit" disabled={!selectUser}>Potvrdiť výmenu člena</SubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
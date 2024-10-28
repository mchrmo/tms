'use client'

import { useDeleteOrganization, useOrganization } from "@/lib/hooks/organization/organization.hooks"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { useEffect, useState } from "react"
import OrganizationForm from "./form"
import { Button } from "../ui/button"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from "next/link"
import AddButton from "../common/buttons/add-button"
import AddMember from "./members/add-member"



export default function OrganizationDetail({ params }: { params: { id: string } }) {

  const organizationId = parseInt(params.id)
  const organization = useOrganization(organizationId)

  const deleteOrgQ = useDeleteOrganization(organizationId)
  const router = useRouter()
  useEffect(() => {
    if (deleteOrgQ.isSuccess) router.push('/organizations')
  }, [deleteOrgQ.isSuccess])

  if (organization.isLoading) return <span>Organizácia sa načitáva <LoadingSpinner></LoadingSpinner></span>

  return (
    <>

      {organization.error instanceof Error && <div>{organization.error.message}</div>}

      {
        organization.data && (
          <>
            <OrganizationForm defaultValues={organization.data}></OrganizationForm>

            {/* <Button variant={"link"} className="text-red-600" onClick={() => {
              deleteOrgQ.mutate()
            }}>Odstrániť organizáciu</Button> */}

            <div>
              <div className="flex justify-between mb-2">
                <h3 className="text-lg">Členovia orgnazácie:</h3>
                <AddMember><AddButton size={'sm'} className="">Pridať člena</AddButton></AddMember>
                {/* <AddButton size={"sm"}>Pridať člena</AddButton> */}
              </div>

              <Table className="">
                <TableHeader>
                  <TableRow>
                    <TableHead className="">Meno</TableHead>
                    <TableHead>Pozícia</TableHead>
                    {/* <TableHead></TableHead> */}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {
                    !organization.data.members.length ?
                      <TableRow>
                        <TableCell colSpan={2} className="font-medium">
                          Žiadny podriadení.
                        </TableCell>
                      </TableRow>
                      :
                      organization.data.members.map(member =>
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">
                            <Link className="link" href={'/organizations/members/' + member.id}>{member.user.name}</Link>
                          </TableCell>
                          <TableCell className="font-medium">
                            {member.position_name}
                          </TableCell>
                        </TableRow>
                      )
                  }
                </TableBody>
              </Table>
            </div>
          </>
        )
      }
    </>
  )
}


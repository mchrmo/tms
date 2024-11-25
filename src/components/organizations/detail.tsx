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
import { useUser } from "@clerk/nextjs"
import { isRole } from "@/lib/utils"
import { User } from "@clerk/nextjs/server"



export default function OrganizationDetail({ params }: { params: { id: string } }) {

  const organizationId = parseInt(params.id)
  const organization = useOrganization(organizationId)

  const { user } = useUser()
  const isAdmin = isRole((user as unknown) as User, 'admin')

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
          <div className="space-y-7">
            {
              organization.data.parent &&
              <span>Nadriadená organizácia <Link href={'/organizations/' + organization.data.parent_id}><Button className="p-0" variant={'link'}>{organization.data.parent.name}</Button></Link></span>
            }

            <OrganizationForm defaultValues={organization.data}></OrganizationForm>

            {/* <Button variant={"link"} className="text-red-600" onClick={() => {
              deleteOrgQ.mutate()
            }}>Odstrániť organizáciu</Button> */}

            <div>
              <div className="flex justify-between">
                <h3 className="text-lg">Členovia organizácie:</h3>
                {isAdmin &&
                  <AddMember defaultValues={{ organization: organization.data, organization_id: organizationId }}><AddButton size={'sm'} className="">Pridať člena</AddButton></AddMember>
                }
              </div>

              <Table className="">
                <TableHeader>
                  <TableRow>
                    <TableHead className="">Meno</TableHead>
                    <TableHead>Pozícia</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {
                    !organization.data.members.length ?
                      <TableRow>
                        <TableCell colSpan={2} className="font-medium">
                          Žiadny členovia.
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

            <div>
              <div className="flex justify-between mb-2">
                <h3 className="text-lg">Podriadené organizácie:</h3>

                {isAdmin && <Link href={`/organizations/create?parent_id=${organizationId}`}>
                  <AddButton size={"sm"}>Pridať organizáciu</AddButton>
                </Link>
                }              </div>

              <Table className="">
                <TableHeader>
                  <TableRow>
                    <TableHead className="">Názov</TableHead>
                    {/* <TableHead>Pozícia</TableHead> */}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {
                    !organization.data.children.length ?
                      <TableRow>
                        <TableCell colSpan={2} className="font-medium">
                          Žiadne podriadené organizácie.
                        </TableCell>
                      </TableRow>
                      :
                      organization.data.children.map(subOrg =>
                        <TableRow key={subOrg.id}>
                          <TableCell className="font-medium">
                            <Link className="link" href={'/organizations/' + subOrg.id}>{subOrg.name}</Link>
                          </TableCell>
                        </TableRow>
                      )
                  }
                </TableBody>
              </Table>
            </div>
          </div>
        )
      }
    </>
  )
}


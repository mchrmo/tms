'use client'

import { useOrganization } from "@/lib/hooks/organization/organization.hooks"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { useState } from "react"
import OrganizationForm from "./form"
export default function OrganizationDetail({ params }: {params: {id: string}}) {

  const organizationId = parseInt(params.id)
  const organization = useOrganization(organizationId)

  if(organization.isLoading) return <span>Organizácia sa načitáva <LoadingSpinner></LoadingSpinner></span> 
  
  return (
    <>

      {organization.error instanceof Error && <div>{organization.error.message}</div>}

      {
        organization.data && (
          <>  
            <OrganizationForm defaultValues={organization.data}></OrganizationForm>
          </>
        )
      }
    </>
  )
}


'use client'

import { useSearchParams } from "next/navigation";
import OrganizationForm from "./form"
import { useOrganization } from "@/lib/hooks/organization/organization.hooks";


export default function CreateOrganization() {
  const searchParams = useSearchParams();
  const parentId = searchParams.get('parent_id')

  const parentQ = useOrganization(parentId ? parseInt(parentId) : undefined)  
  

  console.log(parentQ.isLoading);
  

  return <>
    {
      !parentQ.isLoading && <OrganizationForm defaultValues={{parent: parentQ.data}}></OrganizationForm>
    }
  </>
}
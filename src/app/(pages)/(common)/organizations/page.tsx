import ViewHeadline from "@/components/common/view-haedline"
import Organization from "@/components/organizations/organization"
import { getMainOrganization } from "@/lib/db/organizations"
import { isRole } from "@/lib/utils"
import { auth } from "@clerk/nextjs/server"


export default async function Users() {

  const orgData = await getMainOrganization()
  
  const { sessionClaims } = auth()
  const isAdmin = isRole(sessionClaims, 'admin')

  return (
    <>
      <ViewHeadline>Organizácie</ViewHeadline>

      <Organization orgData={orgData} isAdmin={isAdmin}></Organization>
    </>
  )
}


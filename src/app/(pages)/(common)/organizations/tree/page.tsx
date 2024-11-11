import AddButton from "@/components/common/buttons/add-button"
import ViewHeadline from "@/components/common/view-haedline"
import OrganizationsTable from "@/components/organizations/table"
import OrgTree from "@/components/organizations/tree"
import { getMainOrganization } from "@/lib/db/organization.repository"
import { isRole } from "@/lib/utils"
import { auth, currentUser } from "@clerk/nextjs/server"
import Link from "next/link"


export default async function Users() {

  const orgData = await getMainOrganization()
  
  const user = await currentUser()
  const isAdmin = isRole(user, 'admin')

  return (
    <div>
      <ViewHeadline>Organizácie</ViewHeadline>
      <OrgTree data={orgData[0]}></OrgTree>
      </div>
  )
}



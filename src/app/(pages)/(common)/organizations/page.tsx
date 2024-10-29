import AddButton from "@/components/common/buttons/add-button"
import ViewHeadline from "@/components/common/view-haedline"
import OrganizationsTable from "@/components/organizations/table"
import { getMainOrganization } from "@/lib/db/organizations"
import { isRole } from "@/lib/utils"
import { auth, currentUser } from "@clerk/nextjs/server"
import Link from "next/link"


export default async function Users() {

  // const orgData = await getMainOrganization()
  
  const user = await currentUser()
  const isAdmin = isRole(user, 'admin')

  return (
    <>
      <div className="flex items-center justify-between">
      <ViewHeadline>Organizácie</ViewHeadline>

        <Link href={'/organizations/create'}>
          <AddButton>Nová organizácia</AddButton>
        </Link>
      </div>


      {/* <Organization orgData={orgData} isAdmin={isAdmin}></Organization> */}
      <OrganizationsTable ></OrganizationsTable>

    </>
  )
}


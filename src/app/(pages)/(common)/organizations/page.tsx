import ViewHeadline from "@/components/common/view-haedline"
import Organization from "@/components/organizations/organization"
import { getMainOrganization } from "@/lib/db/organizations"


export default async function Users() {

  const orgData = await getMainOrganization()

  return (
    <>
      <ViewHeadline>Organizácie</ViewHeadline>

      <Organization orgData={orgData}></Organization>
    </>
  )
}


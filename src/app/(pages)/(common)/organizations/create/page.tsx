import AddButton from "@/components/common/buttons/add-button";
import ViewHeadline from "@/components/common/view-haedline";
import CreateOrganization from "@/components/organizations/create";
import { Button } from "@/components/ui/button";
import Link from "next/link";



export default async function CreateOrganizationPage() {

  return (
    <>
      <div className="flex items-center justify-between">
        <ViewHeadline>Nová organizácia</ViewHeadline>

        <Link href={'/organizations'}>
          <Button variant={'secondary'}>Späť na organizácie</Button>
        </Link>
      </div>

      <div>
        <CreateOrganization></CreateOrganization>
      </div>

    </>
  )
}


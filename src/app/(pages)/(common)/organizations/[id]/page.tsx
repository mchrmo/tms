import ViewHeadline from "@/components/common/view-haedline";
import OrganizationDetail from "@/components/organizations/detail";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function OrganizationPage({ params }: {params: {id: string}}) {

  return (
    <>
      <div className="flex items-center justify-between">
        <ViewHeadline>Detail organizácie</ViewHeadline>
        <Link href={'/organizations'}>
          <Button variant={'secondary'}>Späť na organizácie</Button>
        </Link>
      </div>

      <OrganizationDetail params={params}></OrganizationDetail>
    </>
  )
}


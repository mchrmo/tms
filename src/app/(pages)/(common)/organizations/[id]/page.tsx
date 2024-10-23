import ViewHeadline from "@/components/common/view-haedline";
import OrganizationDetail from "@/components/organizations/detail";

export default async function OrganizationPage({ params }: {params: {id: string}}) {

  return (
    <>
      <ViewHeadline>Detail organizácie</ViewHeadline>
      <OrganizationDetail params={params}></OrganizationDetail>
    </>
  )
}


import MemberDetail from "@/components/organizations/members/detail";
import { isRole } from "@/lib/utils";
import { auth, currentUser } from "@clerk/nextjs/server";


export default async function MemberPage({ params }: {params: {id: string}}) {


  
  return (
    <>
      <MemberDetail params={params}></MemberDetail>
    </>
  )
}
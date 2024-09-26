import MemberDetail from "@/components/members/detail";
import { getMember, getMemberSubordinates } from "@/lib/db/organizations";
import { isRole } from "@/lib/utils";
import { auth, currentUser } from "@clerk/nextjs/server";


export default async function MemberPage({ params }: {params: {memberId: string}}) {

  const user = await currentUser()
  const isAdmin = isRole(user, 'admin')

  const id = parseInt(params.memberId);
  const member = await getMember(id)

  if(!member) return <span>Člen s ID {id} sa nemašiel</span> 

  const subs = await getMemberSubordinates(id)

  
  return (
    <>
      <MemberDetail member={member} subs={subs} isAdmin={isAdmin}></MemberDetail>
    </>
  )
}
import MemberDetail from "@/components/ui/members/detail";
import { getMember, getMemberSubordinates } from "@/lib/db/organizations";


export default async function MemberPage({ params }: {params: {memberId: string}}) {

  const id = parseInt(params.memberId);

  const member = await getMember(id)

  if(!member) return <span>Člen s ID {id} sa nemašiel</span> 

  const subs = await getMemberSubordinates(id)

  
  return (
    <>
      <MemberDetail member={member} subs={subs}></MemberDetail>
    </>
  )
}
import prisma from "../prisma"


const get_current_member = async (user_id: number) => {

  const members = await prisma.organizationMember.findMany({
    where: {
      user_id
    },
  })

  if(!members.length) return null

  return members[0]
}


const memberService = {
  get_current_member
}

export default memberService
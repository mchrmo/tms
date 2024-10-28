import { Prisma, OrganizationMember } from "@prisma/client";
import prisma from "../../prisma";


type CreateOrganizationMemberReqs = {
  user_id: number,
  manager_id: number | null,
  organization_id: number,
  position_name: string
}

export const organizationMemberListItem = Prisma.validator<Prisma.OrganizationMemberDefaultArgs>()({
  include: {
  }
})
export type OrganizationMemberListItem = Prisma.OrganizationMemberGetPayload<typeof organizationMemberListItem>


const get_organizationMember = async (id: number) => {

  const organizationMember = await prisma.organizationMember.findUnique({
    where: {id},
    include: {

    },
  })

  return organizationMember
}
export type OrganizationMemberDetail = Prisma.PromiseReturnType<typeof get_organizationMember>

const create_organizationMember = async (organizationMemberData: CreateOrganizationMemberReqs) => {
  const data: Prisma.OrganizationMemberUncheckedCreateInput = {...organizationMemberData}
  const organizationMember = await prisma.organizationMember.create({data})
  return organizationMember
}

const update_organizationMember = async (organizationMemberData: Partial<OrganizationMember>) => {

  if(!organizationMemberData.id) return null

  const id = organizationMemberData.id
  const organizationMember = await prisma.organizationMember.update({
    where: {id},
    data: organizationMemberData
  })


  return organizationMember
}

const delete_organizationMember = async (organizationMember_id: number) => {

  const organizationMember = await prisma.organizationMember.delete({
      where: {
          id: organizationMember_id
      }
  })

  return organizationMember
}


const organizationMemberService = {
  get_organizationMember,
  create_organizationMember,
  update_organizationMember,
  delete_organizationMember
}

export default organizationMemberService;
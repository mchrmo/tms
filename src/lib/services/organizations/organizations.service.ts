import { Prisma, Organization } from "@prisma/client";
import prisma from "../../prisma";


type CreateOrganizationReqs = {
  name: string,
}

export const organizationListItem = Prisma.validator<Prisma.OrganizationDefaultArgs>()({
  include: {
    parent: {
      select: {
        name: true
      }
    },
    _count: {
      select: {
        members: true
      }
    }
  }
})
export type OrganizationListItem = Prisma.OrganizationGetPayload<typeof organizationListItem>


const get_organization = async (id: number) => {

  const organization = await prisma.organization.findUnique({
    where: {id},
    include: {
      parent: {
        select: {
          name: true
        }
      },
      members: {
        select: {
          user: {
            select: {name: true},
          },
          position_name: true,
          id: true,
        }
      }
    },
  })

  return organization
}
export type OrganizationDetail = Prisma.PromiseReturnType<typeof get_organization>

const create_organization = async (organizationData: CreateOrganizationReqs) => {
  const data: Prisma.OrganizationCreateInput = {...organizationData}
  const organization = await prisma.organization.create({data})
  return organization
}

const update_organization = async (organizationData: Partial<Organization>) => {

  if(!organizationData.id) return null

  const id = organizationData.id
  const organization = await prisma.organization.update({
    where: {id},
    data: organizationData
  })


  return organization
}

const delete_organization = async (organization_id: number) => {

  const organization = await prisma.organization.delete({
      where: {
          id: organization_id
      }
  })

  return organization
}


const organizationService = {
  get_organization,
  create_organization,
  update_organization,
  delete_organization
}

export default organizationService;
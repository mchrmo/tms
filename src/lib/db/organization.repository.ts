import prisma from "../prisma"
import { OrganizationMember, Prisma } from "@prisma/client";

export type OrgMembersTree = {
  name: string,
  attributes: {
    [key: string]: string | number
  }
  children: OrgMembersTree[]
}

export async function getMainOrganization() {

  async function getMembers() {
    const mainOrganizationMembers = await prisma.organizationMember.findMany({
      where: {
        organization: {
          type: "main"
        }
      },
      include: {
        user: {
          select: {name: true}
        },
        organization: {
          select: {name: true}
        }
      }
    })
    
    return mainOrganizationMembers
  }
  

  const buildTree = (members: Prisma.PromiseReturnType<typeof getMembers>, managerId: number | null = null): OrgMembersTree[] => {
    return members
        .filter(member => member.manager_id === managerId)
        .map(member => ({
            name: member.user.name,
            attributes: {
                id: member.id,
                org: member.organization.name,
                pos: member.position_name + " " + member.user_id,
            },
            children: buildTree(members, member.id)
        }));
  };
  
  const tree = buildTree(await getMembers())
  

  return tree
}


export type OrganizationMemberDetail = Prisma.PromiseReturnType<typeof getMember>

export async function getMember(id: number) {

  const member = await prisma.organizationMember.findUnique({
    where: {
      id: id
    },
    include: {
      manager: {
        include: {
          user: {
            select: {name: true}
          }
        }
      },
      user: {
        select: {name: true}
      },
      organization: {
        select: {name: true}
      }
    }
  })


  return member
}

export type OrganizationMemberSubordinate = Prisma.PromiseReturnType<typeof getMemberSubordinates>

export async function getMemberSubordinates(id: number) {

  const member = await prisma.organizationMember.findMany({
    where: {
      manager_id: id
    },
    include: {
      user: {
        select: {name: true}
      },
      organization: {
        select: {name: true}
      }
    }
  })


  return member
}
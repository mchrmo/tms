import prisma from "../prisma";
import { Prisma } from "@prisma/client";


export type User = Prisma.UserGetPayload<any>


export async function getUserList(pagination: {page: number, limit: number} = {page: 1, limit: 5}) {

  const users = await prisma.user.findMany({
    skip: ((pagination.page-1)*pagination.limit),
    take: pagination.limit,
    include: {
      role: true,
      OrganizationMember: {
        where: {
          organization: {
            type: "main"
          }
        },
        include: {
          organization: {
            select: {
              name: true
            }
          }
        }
      }
    }
  });

  return users
}


export async function getUser(user_id: number) {

  const user = await prisma.user.findUnique({
    where: {
      id: user_id
    },
    include: {
      OrganizationMember: true
    }
  });

  return user
}

export async function getUserByClerkId(clerkId: string) {

  const user = await prisma.user.findUnique({
    where: {
      clerk_id: clerkId
    },
    include: {
      OrganizationMember: true
    }
  });

  return user
}



export async function getUserRole(roleId: number) {

  const role = await prisma.userRole.findUnique({
    where: {
      id: roleId
    }
  })

  return role

  
}


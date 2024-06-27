import prisma from "../prisma";
import { Prisma } from "@prisma/client";


const mockDelay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));


export async function getUserList() {

  const users = await prisma.user.findMany({
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

export async function createUser(data: Prisma.UserCreateInput) {

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      clerk_id: data.clerk_id,
      role: {
        connect: {id: 2}
      }
    },
    
  });

  return user
}

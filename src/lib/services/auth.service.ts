import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "../prisma";
import { NextRequest } from "next/server";
import { Prisma, Roles, UserRole } from "@prisma/client";


type GetUserProps = { clerk_id?: string, user_id?: number }
export const getUser = async (props: GetUserProps = { clerk_id: undefined, user_id: undefined }) => {

  let { clerk_id, user_id } = props

  if (!clerk_id && !user_id) {
    clerk_id = auth().userId!
  }


  if (user_id) {
    return await prisma.user.findUnique(
      {
        where: { id: user_id },
        include: {
          role: true
        }
      },
    )
  }

  const user = await prisma.user.findUnique(
    {
      where: { clerk_id },
      include: {
        role: true
      }
    },
  )
  if (!user) throw new Error("User not found!")
  return user;
}
export type AuthUser = Exclude<Prisma.PromiseReturnType<typeof getUser>, null>


export const getMembership = async (user_id: number) => {
  const memberships = await prisma.organizationMember.findMany({
    where: {
      user_id,
      organization: {
        type: "main"
      }
    }
  }
  )

  if (!memberships.length) return null

  return memberships[0]
}


export const isSuperior = async (superiorId: number, subordinateId: number): Promise<boolean> => {
  const result = await prisma.$queryRaw`
        WITH RECURSIVE hierarchy AS (
          SELECT id, manager_id
          FROM OrganizationMember
          WHERE id = ${subordinateId}
          
          UNION ALL
          
          SELECT om.id, om.manager_id
          FROM OrganizationMember om
          INNER JOIN hierarchy h ON om.id = h.manager_id
        )
        SELECT id
        FROM hierarchy
        WHERE id = ${superiorId};
      ` as ({ id: number }[])


  return !!result.length
}

export const getAllSuperierors = async (user_id: number) => {
  const result = await prisma.$queryRaw`
      WITH RECURSIVE superiors AS (
        SELECT id, user_id, manager_id, position_name
        FROM OrganizationMember
        WHERE user_id = ${user_id}

        UNION ALL

        SELECT om.id, om.user_id, om.manager_id, om.position_name
        FROM OrganizationMember om
        INNER JOIN superiors s ON om.id = s.manager_id
      )
      SELECT id, user_id, position_name
      FROM superiors;
      ` as ({ id: number, user_id: number, position_name: string }[])

 
  return result
}


export const isRole = async (role: Roles, user?: AuthUser | null) => {
  if (!user) {
    const fetchedUser = await getUser({})
    if (!fetchedUser) return
    user = fetchedUser
  }

  if (user.role.name === role) return true
  return false
}
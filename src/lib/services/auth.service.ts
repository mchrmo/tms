import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "../prisma";
import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";



export const getUser = async (clerk_id?: string) => {

    if (!clerk_id) {
        clerk_id = auth().userId!
    }

    const user = await prisma.user.findUnique(
        {
            where: { clerk_id },
            include: {
                role: true
            }
        },
    )

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

    if(!memberships.length) return null

    return memberships[0]
}


export const isHierachicalyAbove = async (superiorId: number, subordinateId: number): Promise<boolean>  => {
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
import prisma from "@/lib/prisma";
import { errorHandler } from "@/lib/services/api.service"
import { NextResponse } from "next/server"


async function getOrganizationHierarchy(orgId: number | null = null): Promise<any> {
  // Fetch the organization and its immediate children
  const organizations = await prisma.organization.findMany({
    where: {
      parent_id: orgId, // Start with null for the top-level organizations
    },
    include: {
      children: true, // Include children organizations to process recursively
      _count: {
        select: {
          members: true
        }
      }
    },
  });

  // Recursively format each organization with its children
  return Promise.all(
    organizations.map(async (org) => {
      return {
        id: org.id,
        name: org.name,
        type: org.type,
        members: org._count.members,
        children: await getOrganizationHierarchy(org.id), // Recursive call to get children of this organization
      };
    })
  );
}

export const GET = errorHandler(async (req) => {
  const hierarchy = await getOrganizationHierarchy(); // Start from the root (parent_id = null)


  return NextResponse.json({hierarchy}, { status: 200 })
})


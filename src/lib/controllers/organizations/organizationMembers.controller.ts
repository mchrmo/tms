import { organizationMemberColumns, OrganizationMemberCreateSchema, OrganizationMemberUpdateSchema, ZOrganizationMemberCreateForm } from "@/lib/models/organization/member.model"
import prisma from "@/lib/prisma"
import organizationMemberService, { organizationMemberListItem } from "@/lib/services/organizations/organizationMembers.service"
import { parseGetManyParams } from "@/lib/utils/api.utils"
import { OrganizationMember, Prisma } from "@prisma/client"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { ApiError } from "next/dist/server/api-utils"
import { NextRequest, NextResponse } from "next/server"
import { createPaginator } from "prisma-pagination"
import { z } from "zod"


const getOrganizationMember = async (req: NextRequest, params: any) => {

  const id = parseInt(params.id)
  const organizationMember = await organizationMemberService.get_organizationMember(id)
  if (!organizationMember) throw new ApiError(404, 'Not found')

  return NextResponse.json(organizationMember, { status: 200 })
}

const getOrganizationMembers = async (req: NextRequest) => {

  const params = req.nextUrl.searchParams

  const paramsObj = Object.fromEntries(new URLSearchParams(params));
  const customWhere: Prisma.OrganizationMemberFindManyArgs['where'] = {}
  if (paramsObj.managers_to_org) {
    const orgId = paramsObj.managers_to_org

    let query = Prisma.sql`
        WITH RECURSIVE ParentOrgs AS (
          SELECT id, parent_id
          FROM \`Organization\`
          WHERE id = ${orgId}
          UNION
          SELECT o.id, o.parent_id
          FROM \`Organization\` o
          INNER JOIN ParentOrgs po ON po.parent_id = o.id
        )
        SELECT om.id
        FROM \`OrganizationMember\` om
        JOIN ParentOrgs p ON om.organization_id = p.id
     `;
    const membersRaw = await prisma.$queryRaw(query) as {id: number}[]
    const memberIds = membersRaw.map((m: any) => m.id)
    // if(memberIds.length)
    customWhere.id = {in: memberIds} 
  }


  const { where, orderBy, pagination } = parseGetManyParams(params, organizationMemberColumns)

  const paginate = createPaginator({ page: pagination.page, perPage: pagination.pageSize })
  
  const data = await paginate<OrganizationMember, Prisma.OrganizationMemberFindManyArgs>(
    prisma.organizationMember,
    {
      where:{...where, ...customWhere},
      orderBy,
      include: organizationMemberListItem.include,
    }
  )

  return NextResponse.json(data, { status: 200 })
}

const createOrganizationMember = async (request: NextRequest) => {

  const body = await request.json()
  const parsedSchema = OrganizationMemberCreateSchema.safeParse(body);

  if (!parsedSchema.success) {
    const { errors } = parsedSchema.error;

    return NextResponse.json({
      error: { message: "Invalid request", errors },
    }, { status: 400 });
  }


  const data: ZOrganizationMemberCreateForm = {
    ...parsedSchema.data
  }
  try {
    const organizationMember = await organizationMemberService.create_organizationMember(data)
    return NextResponse.json(organizationMember, { status: 200 })

  }
  catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code == 'P2002') {
        throw new ApiError(400, "Organizácia s rovnakým názvom už existuje")
      }
    }
    throw error
  }


};

const updateOrganizationMember = async (request: NextRequest) => {
  const body = await request.json()
  const parsedSchema = OrganizationMemberUpdateSchema.safeParse(body);

  if (!parsedSchema.success) {
    const { errors } = parsedSchema.error;

    return NextResponse.json({
      error: { message: "Invalid request", errors },
    }, { status: 400 });
  }


  const updateData = { ...parsedSchema.data }

  try {
    const organizationMember = await organizationMemberService.update_organizationMember(updateData)
    return NextResponse.json(organizationMember, { status: 200 })

  }
  catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code == 'P2002') {
        throw new ApiError(400, "Organizácia s rovnakým názvom už existuje")
      }
    }
    throw error
  }
};

const swapOrganizationMember = async (req: NextRequest, params: any) => {
  const body = await req.json()

  const schema = z.object({
    memberId: z.number(),
    newUserId: z.number()
  })

  const parsedSchema = schema.safeParse(body)
  if (!parsedSchema.success) {
    const { errors } = parsedSchema.error;

    return NextResponse.json({
      error: { message: "Invalid request", errors },
    }, { status: 400 });
  }

  const {memberId, newUserId} = parsedSchema.data
  const organizationMember = await organizationMemberService.swap_organizationMember(memberId, newUserId)

  return NextResponse.json(organizationMember, { status: 200 })

}

const deleteOrganizationMember = async (req: NextRequest, params: any) => {
  const id = parseInt(params.id)
  const paramsObj = Object.fromEntries(new URLSearchParams(req.nextUrl.searchParams));
  let {new_owner: new_owner_raw} = paramsObj
  const new_owner = parseInt(new_owner_raw)
  
  if(!new_owner) throw new ApiError(400, "Missing new tasks owner id")
  
  
  const organizationMember = await organizationMemberService.delete_organizationMember(id, new_owner)

  return NextResponse.json(organizationMember, { status: 200 })

}


const organizationMembersController = {
  getOrganizationMember,
  createOrganizationMember,
  getOrganizationMembers,
  updateOrganizationMember,
  swapOrganizationMember,
  deleteOrganizationMember
}

export default organizationMembersController